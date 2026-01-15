"""
Advanced AI Module for Medical AI Assistant
Provides enhanced NLP, contextual understanding, and voice-enabled features
"""

import asyncio
import json
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
from transformers import pipeline, AutoTokenizer, AutoModelForQuestionAnswering
import torch
import numpy as np
from scipy import spatial
from datetime import datetime, timedelta
import logging
import requests
import asyncio
from .inference.optimized_medicine_analyzer import OptimizedMedicineAnalyzer, MedicineInfo
from .local_llm_integration import LocalMedicalLLM, LLMResponse
from .medical_agents import MedicalAgentOrchestrator, PatientContext, MedicalAgentResponse
from .caching_system import cache_manager, cache_memoize
from .medical_ai_core import MedicalAICore, MedicalAnalysisResult

@dataclass
class ConversationContext:
    """Maintains conversation context for voice interactions"""
    user_id: str
    current_medicine: Optional[str] = None
    last_action: Optional[str] = None
    session_start: datetime = None
    medical_history: List[Dict] = None
    current_intent: str = "unknown"
    
    def __post_init__(self):
        if self.session_start is None:
            self.session_start = datetime.now()
        if self.medical_history is None:
            self.medical_history = []

class AdvancedMedicalAI:
    """
    Advanced AI system with contextual understanding and voice capabilities
    """
    
    def __init__(self):
        self.medicine_analyzer = OptimizedMedicineAnalyzer()
        
        # Initialize local LLM for enhanced medical knowledge
        self.local_llm = LocalMedicalLLM()
        
        # Initialize the integrated medical AI core system
        self.medical_ai_core = MedicalAICore()
        
        # Get components from the core system
        self.agent_orchestrator = self.medical_ai_core.agent_orchestrator
        self.cache_manager = self.medical_ai_core.cache_manager
        self.local_llm = self.medical_ai_core.local_llm
        
        # Check if LLM is available
        self.llm_available = self.local_llm.check_connection()
        self.contexts = {}  # user_id -> ConversationContext
        self.medical_knowledge_base = {}
        self.qa_pipeline = None
        self.summarizer = None
        self.nlp_pipeline = None
        
        # Initialize advanced NLP models
        self._initialize_models()
        
        # Initialize with local medical knowledge base for faster inference
        self._initialize_local_medical_knowledge()
        
        # Load medical knowledge base
        self._load_medical_knowledge_base()
        
    def _initialize_models(self):
        """
        Initialize advanced NLP models for medical understanding
        """
        try:
            # Question answering pipeline for medical queries
            self.qa_pipeline = pipeline(
                "question-answering",
                model="deepset/roberta-base-squad2",
                tokenizer="deepset/roberta-base-squad2"
            )
            
            # Summarization pipeline for condensing medical information
            self.summarizer = pipeline(
                "summarization",
                model="facebook/bart-large-cnn"
            )
            
            # Named entity recognition for medical terms
            self.nlp_pipeline = pipeline(
                "ner",
                model="dslim/bert-base-NER",
                grouped_entities=True
            )
            
            print("Advanced AI models initialized successfully")
        except Exception as e:
            print(f"Error initializing AI models: {e}")
            # Fallback to simpler models
            self.qa_pipeline = None
            self.summarizer = None
            self.nlp_pipeline = None
    
    def _initialize_local_medical_knowledge(self):
        """
        Initialize with comprehensive local medical knowledge for faster inference
        """
        # Expanded medical knowledge base for common medicines
        self.medical_knowledge_base = {
            "paracetamol": {
                "generic_name": "acetaminophen",
                "uses": ["pain relief", "fever reduction"],
                "side_effects": ["liver damage with overdose", "skin reactions"],
                "interactions": ["alcohol", "blood thinners"],
                "contraindications": ["liver disease", "kidney disease"],
                "pregnancy_category": "B",
                "breastfeeding_safe": True,
                "max_daily_dose": "4000mg",
                "onset": "30-60 minutes",
                "duration": "4-6 hours"
            },
            "ibuprofen": {
                "generic_name": "ibuprofen",
                "uses": ["pain relief", "inflammation", "fever reduction"],
                "side_effects": ["stomach irritation", "kidney problems", "heart issues"],
                "interactions": ["blood thinners", "diuretics", "lithium"],
                "contraindications": ["stomach ulcers", "heart disease", "kidney disease"],
                "pregnancy_category": "D (3rd trimester), B (others)",
                "breastfeeding_safe": True,
                "max_daily_dose": "1200mg (OTC)",
                "onset": "20-30 minutes",
                "duration": "4-6 hours"
            },
            "aspirin": {
                "generic_name": "acetylsalicylic acid",
                "uses": ["pain relief", "anti-inflammatory", "fever reduction", "cardiovascular protection"],
                "side_effects": ["stomach irritation", "bleeding", "allergic reactions"],
                "interactions": ["blood thinners", "other NSAIDs", "methotrexate"],
                "contraindications": ["stomach ulcers", "bleeding disorders", "children under 16"],
                "pregnancy_category": "D",
                "breastfeeding_safe": False,
                "max_daily_dose": "4000mg",
                "onset": "10-20 minutes",
                "duration": "4-6 hours"
            },
            "amoxicillin": {
                "generic_name": "amoxicillin",
                "uses": ["bacterial infections", "respiratory tract infections", "urinary tract infections"],
                "side_effects": ["diarrhea", "nausea", "allergic reactions"],
                "interactions": ["oral contraceptives", "warfarin", "allopurinol"],
                "contraindications": ["penicillin allergy", "mononucleosis"],
                "pregnancy_category": "B",
                "breastfeeding_safe": True,
                "max_daily_dose": "3000mg",
                "onset": "30-60 minutes",
                "duration": "8-12 hours"
            },
            "omeprazole": {
                "generic_name": "omeprazole",
                "uses": ["acid reflux", "peptic ulcer disease", "Zollinger-Ellison syndrome"],
                "side_effects": ["headache", "nausea", "diarrhea"],
                "interactions": ["clopidogrel", "diazepam", "warfarin"],
                "contraindications": ["hypersensitivity"],
                "pregnancy_category": "C",
                "breastfeeding_safe": "Unknown",
                "max_daily_dose": "120mg",
                "onset": "1-4 hours",
                "duration": "24 hours"
            },
            "metformin": {
                "generic_name": "metformin",
                "uses": ["type 2 diabetes", "insulin resistance"],
                "side_effects": ["nausea", "diarrhea", "metallic taste"],
                "interactions": ["contrast media", "alcohol", "carbonic anhydrase inhibitors"],
                "contraindications": ["kidney disease", "liver disease", "heart failure"],
                "pregnancy_category": "B",
                "breastfeeding_safe": True,
                "max_daily_dose": "2550mg",
                "onset": "2-3 hours",
                "duration": "4-8 hours"
            }
        }
    
    def _load_medical_knowledge_base(self):
        """
        Load medical knowledge base with common medications and their properties
        """
        # This is now handled by _initialize_local_medical_knowledge
        pass
    
    def get_conversation_context(self, user_id: str) -> ConversationContext:
        """
        Get or create conversation context for a user
        """
        if user_id not in self.contexts:
            self.contexts[user_id] = ConversationContext(user_id=user_id)
        return self.contexts[user_id]
    
    def process_patient_input_with_agents(self, user_id: str, symptoms: List[str], patient_context: PatientContext) -> Dict[str, Any]:
        """
        Process patient input using the medical agent system
        
        Args:
            user_id: User identifier
            symptoms: List of patient symptoms
            patient_context: Patient context information
            
        Returns:
            Dict containing agent responses and recommendations
        """
        # Process through the agent orchestrator
        result = self.agent_orchestrator.process_patient_input(symptoms, patient_context)
        
        # Check cache first
        cache_key = f"patient_analysis:{user_id}:{hash(str(symptoms) + str(patient_context.__dict__))}"
        cached_result = self.cache_manager.get_cached_agent_response(cache_key)
        if cached_result:
            # Update user context with cached result
            context = self.get_conversation_context(user_id)
            context.last_medical_analysis = cached_result
            return cached_result
        
        # Process through the agent orchestrator
        result = self.agent_orchestrator.process_patient_input(symptoms, patient_context)
        
        # Cache the result
        self.cache_manager.cache_agent_response(cache_key, result)
        
        # Update user context with the latest analysis
        context = self.get_conversation_context(user_id)
        context.last_medical_analysis = result
        
        return result
    
    def process_voice_command(self, user_id: str, command: str) -> Dict[str, Any]:
        """
        Process voice command and return appropriate response
        """
        context = self.get_conversation_context(user_id)
        
        # Analyze the intent of the command
        intent = self._analyze_intent(command)
        context.current_intent = intent
        
        # Process based on intent
        if intent == "medicine_info":
            return self._handle_medicine_info_request(command, context)
        elif intent == "dosage_info":
            return self._handle_dosage_request(command, context)
        elif intent == "side_effects":
            return self._handle_side_effects_request(command, context)
        elif intent == "warnings":
            return self._handle_warnings_request(command, context)
        elif intent == "interaction_check":
            return self._handle_interaction_check(command, context)
        elif intent == "medical_advice":
            return self._handle_medical_advice_request(command, context)
        elif intent == "reminder_set":
            return self._handle_reminder_request(command, context)
        elif intent == "scan_request":
            return self._handle_scan_request(command, context)
        else:
            return self._handle_general_request(command, context)
    
    def _analyze_intent(self, command: str) -> str:
        """
        Analyze the intent of a voice command
        """
        command_lower = command.lower()
        
        # Define intent patterns
        intent_patterns = {
            "medicine_info": [
                "what is", "tell me about", "information about", 
                "describe", "explain", "know about", "medicine name"
            ],
            "dosage_info": [
                "dosage", "how much", "take how", "dose", "amount", 
                "quantity", "take what", "prescribed amount"
            ],
            "side_effects": [
                "side effects", "side-effect", "adverse effects", 
                "bad reactions", "negative effects", "problems with", 
                "harmful effects"
            ],
            "warnings": [
                "warnings", "cautions", "precautions", "contraindications", 
                "should not", "not safe", "dangerous", "unsafe"
            ],
            "interaction_check": [
                "interact with", "combine with", "mix with", 
                "take with", "compatible with", "interaction", 
                "together with"
            ],
            "medical_advice": [
                "should i", "can i", "recommend", "suggest", 
                "advice", "consult", "doctor", "help"
            ],
            "reminder_set": [
                "remind me", "set reminder", "remember", "alarm", 
                "notify", "schedule", "take medicine"
            ],
            "scan_request": [
                "scan", "read", "analyze", "look at", "check medicine", 
                "identify", "recognize", "what is this"
            ]
        }
        
        for intent, patterns in intent_patterns.items():
            for pattern in patterns:
                if pattern in command_lower:
                    return intent
        
        return "general"
    
    def _handle_medicine_info_request(self, command: str, context: ConversationContext) -> Dict[str, Any]:
        """
        Handle requests for medicine information
        """
        # Extract medicine name from command
        medicine_name = self._extract_medicine_name_from_command(command, context)
        
        if not medicine_name:
            return {
                "response": "I couldn't identify the medicine name. Please specify which medicine you want information about.",
                "action": "request_medicine_name",
                "follow_up": True
            }
        
        # Get medicine information
        medicine_info = self._get_medicine_details(medicine_name)
        
        if not medicine_info:
            return {
                "response": f"I don't have information about {medicine_name} in my database. Would you like me to scan the medicine package?",
                "action": "suggest_scan",
                "medicine_name": medicine_name
            }
        
        # Format response for voice
        response = self._format_medicine_info_response(medicine_info)
        
        # Update context
        context.current_medicine = medicine_name
        
        return {
            "response": response,
            "action": "provide_info",
            "medicine_info": medicine_info
        }
    
    def _handle_dosage_request(self, command: str, context: ConversationContext) -> Dict[str, Any]:
        """
        Handle requests for dosage information
        """
        medicine_name = self._extract_medicine_name_from_command(command, context)
        
        if not medicine_name:
            return {
                "response": "I couldn't identify the medicine name. Please specify which medicine you want dosage information for.",
                "action": "request_medicine_name",
                "follow_up": True
            }
        
        # Get dosage information
        dosage_info = self._get_dosage_info(medicine_name)
        
        if not dosage_info:
            return {
                "response": f"I don't have specific dosage information for {medicine_name}. Please consult your healthcare provider or the medication leaflet.",
                "action": "recommend_consultation"
            }
        
        response = self._format_dosage_response(dosage_info, medicine_name)
        
        return {
            "response": response,
            "action": "provide_dosage",
            "dosage_info": dosage_info
        }
    
    def _handle_side_effects_request(self, command: str, context: ConversationContext) -> Dict[str, Any]:
        """
        Handle requests for side effects information
        """
        medicine_name = self._extract_medicine_name_from_command(command, context)
        
        if not medicine_name:
            return {
                "response": "I couldn't identify the medicine name. Please specify which medicine you want side effects information for.",
                "action": "request_medicine_name",
                "follow_up": True
            }
        
        # Get side effects information
        side_effects = self._get_side_effects(medicine_name)
        
        if not side_effects:
            return {
                "response": f"I don't have side effects information for {medicine_name}. Please consult your healthcare provider or the medication leaflet.",
                "action": "recommend_consultation"
            }
        
        response = self._format_side_effects_response(side_effects, medicine_name)
        
        return {
            "response": response,
            "action": "provide_side_effects",
            "side_effects": side_effects
        }
    
    def _handle_warnings_request(self, command: str, context: ConversationContext) -> Dict[str, Any]:
        """
        Handle requests for warnings and contraindications
        """
        medicine_name = self._extract_medicine_name_from_command(command, context)
        
        if not medicine_name:
            return {
                "response": "I couldn't identify the medicine name. Please specify which medicine you want warnings for.",
                "action": "request_medicine_name",
                "follow_up": True
            }
        
        # Get warnings and contraindications
        warnings = self._get_warnings(medicine_name)
        
        if not warnings:
            return {
                "response": f"I don't have warnings information for {medicine_name}. Please consult your healthcare provider or the medication leaflet.",
                "action": "recommend_consultation"
            }
        
        response = self._format_warnings_response(warnings, medicine_name)
        
        return {
            "response": response,
            "action": "provide_warnings",
            "warnings": warnings
        }
    
    def _handle_interaction_check(self, command: str, context: ConversationContext) -> Dict[str, Any]:
        """
        Handle requests for drug interaction checks
        """
        # Extract medicine names from command
        medicines = self._extract_multiple_medicines_from_command(command)
        
        if len(medicines) < 2:
            return {
                "response": "I couldn't identify multiple medicines to check for interactions. Please specify both medicines.",
                "action": "request_multiple_medicines",
                "follow_up": True
            }
        
        # Check for interactions
        interactions = self._check_interactions(medicines[0], medicines[1])
        
        response = self._format_interaction_response(interactions, medicines[0], medicines[1])
        
        return {
            "response": response,
            "action": "provide_interaction_info",
            "interactions": interactions,
            "medicines": medicines
        }
    
    def _handle_general_request(self, command: str, context: ConversationContext) -> Dict[str, Any]:
        """
        Handle general requests that don't match specific intents
        """
        # Try to understand the request using QA model if available
        if self.qa_pipeline:
            try:
                # Create a context for the QA model
                context_text = "Medical assistant for visually impaired users. Provides information about medicines, dosages, side effects, and warnings."
                
                result = self.qa_pipeline(question=command, context=context_text)
                
                if result['score'] > 0.3:  # Confidence threshold
                    return {
                        "response": result['answer'],
                        "action": "provide_answer",
                        "confidence": result['score']
                    }
            except Exception as e:
                print(f"QA pipeline error: {e}")
        
        # Default response
        return {
            "response": f"I understood your command '{command}'. For specific medical information, please mention the medicine name. You can say things like 'Tell me about paracetamol' or 'What are the side effects of ibuprofen'.",
            "action": "request_clarification"
        }
    
    def _extract_medicine_name_from_command(self, command: str, context: ConversationContext) -> Optional[str]:
        """
        Extract medicine name from voice command
        """
        # First, try to use the current medicine in context
        if context.current_medicine:
            return context.current_medicine
        
        # Extract potential medicine names from the command
        # Look for capitalized words that could be medicine names
        import re
        words = command.split()
        potential_medicines = []
        
        for word in words:
            # Remove punctuation
            clean_word = re.sub(r'[^\w\s]', '', word)
            # Check if it's capitalized (likely a proper noun/medicine name)
            if len(clean_word) > 2 and clean_word[0].isupper():
                potential_medicines.append(clean_word.lower())
        
        # Check against known medicine names in knowledge base
        for potential in potential_medicines:
            if potential in self.medical_knowledge_base:
                return potential
        
        # If no match, return the first potential medicine name
        if potential_medicines:
            return potential_medicines[0]
        
        return None
    
    def _extract_multiple_medicines_from_command(self, command: str) -> List[str]:
        """
        Extract multiple medicine names from a command about interactions
        """
        import re
        words = command.lower().split()
        potential_medicines = []
        
        # Look for words between certain phrases that indicate multiple medicines
        medicine_indicators = ['with', 'and', 'or', 'combine', 'mix']
        
        for i, word in enumerate(words):
            if word in self.medical_knowledge_base:
                potential_medicines.append(word)
        
        return potential_medicines
    
    def _get_medicine_details(self, medicine_name: str) -> Optional[Dict]:
        """
        Get detailed information about a medicine
        """
        if medicine_name.lower() in self.medical_knowledge_base:
            return self.medical_knowledge_base[medicine_name.lower()]
        
        return None
    
    def _get_dosage_info(self, medicine_name: str) -> Optional[Dict]:
        """
        Get dosage information for a medicine
        """
        details = self._get_medicine_details(medicine_name)
        if details:
            return {
                "max_daily_dose": details.get("max_daily_dose"),
                "onset": details.get("onset"),
                "duration": details.get("duration"),
                "special_instructions": f"Always follow your healthcare provider's specific instructions for dosage."
            }
        return None
    
    def _get_side_effects(self, medicine_name: str) -> Optional[List[str]]:
        """
        Get side effects for a medicine
        """
        details = self._get_medicine_details(medicine_name)
        if details:
            return details.get("side_effects", [])
        return None
    
    def _get_warnings(self, medicine_name: str) -> Optional[Dict]:
        """
        Get warnings and contraindications for a medicine
        """
        details = self._get_medicine_details(medicine_name)
        if details:
            return {
                "contraindications": details.get("contraindications", []),
                "pregnancy_category": details.get("pregnancy_category"),
                "breastfeeding_safe": details.get("breastfeeding_safe"),
                "special_warnings": ["Always consult your healthcare provider before taking any medication"]
            }
        return None
    
    def _check_interactions(self, medicine1: str, medicine2: str) -> Dict:
        """
        Check for potential interactions between two medicines
        """
        details1 = self._get_medicine_details(medicine1)
        details2 = self._get_medicine_details(medicine2)
        
        interactions = {
            "medicine1": medicine1,
            "medicine2": medicine2,
            "interaction_exists": False,
            "severity": "unknown",
            "description": "No specific interaction data available",
            "recommendation": "Consult your healthcare provider before combining these medications"
        }
        
        if details1 and details2:
            # Simple interaction check based on known interactions
            med1_interactions = details1.get("interactions", [])
            med2_interactions = details2.get("interactions", [])
            
            # Check if either medicine is mentioned in the other's interactions
            if medicine2.lower() in [i.lower() for i in med1_interactions] or \
               medicine1.lower() in [i.lower() for i in med2_interactions]:
                interactions.update({
                    "interaction_exists": True,
                    "severity": "moderate",
                    "description": f"There may be an interaction between {medicine1} and {medicine2}",
                    "recommendation": "Avoid combining these medications without consulting your healthcare provider"
                })
        
        return interactions
    
    def _format_medicine_info_response(self, info: Dict, medicine_name: str = None) -> str:
        """
        Format medicine information for voice response
        """
        if not medicine_name:
            medicine_name = "the medicine"
        
        response = f"Information about {medicine_name}: "
        
        if "generic_name" in info:
            response += f"Its generic name is {info['generic_name']}. "
        
        if "uses" in info and info["uses"]:
            uses = ", ".join(info["uses"])
            response += f"It is used for {uses}. "
        
        if "onset" in info:
            response += f"It typically starts working within {info['onset']} and its effects last about {info.get('duration', 'unknown duration')}. "
        
        return response
    
    def _format_dosage_response(self, dosage_info: Dict, medicine_name: str) -> str:
        """
        Format dosage information for voice response
        """
        response = f"For {medicine_name}: "
        
        if "max_daily_dose" in dosage_info:
            response += f"The maximum daily dose is {dosage_info['max_daily_dose']}. "
        
        if "onset" in dosage_info:
            response += f"It starts working in about {dosage_info['onset']} and lasts for {dosage_info.get('duration', 'unknown duration')}. "
        
        if "special_instructions" in dosage_info:
            response += f"{dosage_info['special_instructions']}. "
        
        return response
    
    def _format_side_effects_response(self, side_effects: List[str], medicine_name: str) -> str:
        """
        Format side effects information for voice response
        """
        if not side_effects:
            return f"No significant side effects reported for {medicine_name}. However, always consult your healthcare provider."
        
        response = f"Potential side effects of {medicine_name} include: "
        response += ", ".join(side_effects) + ". "
        response += "If you experience severe side effects, seek immediate medical attention."
        
        return response
    
    def _format_warnings_response(self, warnings: Dict, medicine_name: str) -> str:
        """
        Format warnings information for voice response
        """
        response = f"Important warnings for {medicine_name}: "
        
        if "contraindications" in warnings and warnings["contraindications"]:
            contraindications = ", ".join(warnings["contraindications"])
            response += f"This medicine should not be used if you have {contraindications}. "
        
        if "pregnancy_category" in warnings:
            response += f"Its pregnancy category is {warnings['pregnancy_category']}, meaning it may not be safe during pregnancy. "
        
        if "breastfeeding_safe" in warnings:
            if not warnings["breastfeeding_safe"]:
                response += "This medicine may not be safe while breastfeeding. "
        
        response += warnings.get("special_warnings", "Always consult your healthcare provider before taking any medication.")
        
        return response
    
    def _format_interaction_response(self, interactions: Dict, med1: str, med2: str) -> str:
        """
        Format interaction information for voice response
        """
        if interactions["interaction_exists"]:
            return f"Warning: There may be an interaction between {med1} and {med2}. {interactions['description']}. {interactions['recommendation']}"
        else:
            return f"No significant interaction is known between {med1} and {med2}. However, it's always best to consult your healthcare provider before combining medications."
    
    async def process_complex_query(self, user_id: str, query: str) -> Dict[str, Any]:
        """
        Process more complex queries that may require external API calls or multiple steps
        """
        context = self.get_conversation_context(user_id)
        
        # For now, implement a simple async wrapper
        # In a real implementation, this would call external medical APIs
        result = self.process_voice_command(user_id, query)
        
        # Add timing information
        result["processing_time"] = 0.1  # Simulated
        
        return result
    
    def update_user_profile(self, user_id: str, medical_conditions: List[str], medications: List[str], allergies: List[str]):
        """
        Update user profile with personal medical information
        """
        context = self.get_conversation_context(user_id)
        
        # Add to medical history
        context.medical_history.append({
            "timestamp": datetime.now(),
            "medical_conditions": medical_conditions,
            "current_medications": medications,
            "allergies": allergies
        })
    
    def get_personalized_response(self, user_id: str, base_response: str) -> str:
        """
        Add personalization to responses based on user profile
        """
        context = self.get_conversation_context(user_id)
        
        if not context.medical_history:
            return base_response
        
        # Get the most recent profile
        latest_profile = context.medical_history[-1]
        
        personalization = []
        
        if latest_profile.get("allergies"):
            allergy_str = ", ".join(latest_profile["allergies"])
            personalization.append(f"As a reminder, you have allergies to {allergy_str}. ")
        
        if latest_profile.get("medical_conditions"):
            condition_str = ", ".join(latest_profile["medical_conditions"])
            personalization.append(f"Given your medical conditions ({condition_str}), please be extra cautious. ")
        
        if personalization:
            return "".join(personalization) + base_response
        
        return base_response

# Example usage
if __name__ == "__main__":
    ai_system = AdvancedMedicalAI()
    
    # Simulate a conversation with a visually impaired user
    user_id = "user_123"
    
    # User asks about a medicine
    response = ai_system.process_voice_command(user_id, "Tell me about paracetamol")
    print("Response:", response["response"])
    
    # User asks about side effects
    response = ai_system.process_voice_command(user_id, "What are the side effects of paracetamol")
    print("Response:", response["response"])
    
    # User asks about interactions
    response = ai_system.process_voice_command(user_id, "Does paracetamol interact with ibuprofen")
    print("Response:", response["response"])