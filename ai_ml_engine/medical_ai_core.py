#!/usr/bin/env python3
"""
Medical AI Core System
Integrated system combining OCR, LLM, and medical expertise for comprehensive medical assistance
"""

import os
import sys
import logging
import time
import json
from datetime import datetime
from dataclasses import dataclass
from typing import List, Dict, Any, Optional
import argparse
from transformers import pipeline, logging as hf_logging
import torch
import warnings

# Configure HF Logging - Set to ERROR to hide massive config JSON dumps now that it works
hf_logging.set_verbosity_error()
warnings.filterwarnings("ignore", category=UserWarning) # Keep actual warnings but suppress minor ones

# Add the current directory to Python path for absolute imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import all components using absolute imports
try:
    from inference.optimized_medicine_analyzer import OptimizedMedicineAnalyzer, MedicineInfo
    from local_llm_integration import LocalMedicalLLM, LLMResponse
    from medical_agents import MedicalAgentOrchestrator, PatientContext, MedicalAgentResponse, MedicalSpecialty
    from caching_system import cache_manager, cache_memoize, LRUCache
except ImportError as e:
    print(f"Import error: {e}")
    print("Attempting alternative import paths...")
    # Fallback imports for development
    from ai_ml_engine.inference.optimized_medicine_analyzer import OptimizedMedicineAnalyzer, MedicineInfo
    from ai_ml_engine.local_llm_integration import LocalMedicalLLM, LLMResponse
    from ai_ml_engine.medical_agents import MedicalAgentOrchestrator, PatientContext, MedicalAgentResponse, MedicalSpecialty
    from ai_ml_engine.caching_system import cache_manager, cache_memoize, LRUCache

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class MedicalAnalysisResult:
    """Complete medical analysis result"""
    patient_id: str
    symptoms: List[str]
    patient_context: PatientContext
    primary_diagnosis: str
    differential_diagnoses: List[str]
    agent_responses: Dict[str, Any]
    treatment_recommendations: List[str]
    urgency_level: str  # emergent, urgent, non_urgent
    confidence_score: float
    processing_time: float
    timestamp: datetime

class MedicalAICore:
    """
    Core medical AI system that integrates all components seamlessly
    """
    
    def __init__(self):
        # Initialize all components
        self.medicine_analyzer = OptimizedMedicineAnalyzer()
        self.local_llm = LocalMedicalLLM()
        self.agent_orchestrator = MedicalAgentOrchestrator()
        self.cache_manager = cache_manager
        
        # Initialize Hugging Face Pipelines (Graceful fallback)
        self.qa_pipeline = None
        self.nlp_pipeline = None
        self.summarizer = None
        self._initialize_transformer_models()
        
        # Check system availability
        self.llm_available = self.local_llm.check_connection()
        self.system_initialized = True
        
        logger.info("Medical AI Core system initialized successfully")

    def _initialize_transformer_models(self):
        """Initialize local Transformer models for NLP tasks"""
        try:
            logger.info("Loading Hugging Face Transformer models...")
            # 1. NER for Entity Extraction (Drugs, Symptoms)
            self.nlp_pipeline = pipeline("ner", model="dslim/bert-base-NER", grouped_entities=True)
            
            # 2. QA for precise answers
            self.qa_pipeline = pipeline("question-answering", model="deepset/roberta-base-squad2")
            
            # 3. Summarization for patient history
            self.summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
            
            logger.info("Transformer models loaded successfully")
        except Exception as e:
            logger.warning(f"Could not load Transformer models: {e}. Falling back to Regex/LLM.")

    def process_voice_command_intent(self, command: str, user_id: str) -> Dict[str, Any]:
        """
        Main entry point for Voice Logic.
        Determines intent (Symptom Check vs Medicine Info vs Chat) and routes accordingly.
        """
        command_lower = command.lower()
        
        # --- Intent 1: Medicine Info/Scanning ---
        if any(w in command_lower for w in ['what is', 'tell me about', 'explain', 'dosage', 'side effects']):
            # Use NER or basic split to find medicine name
            medicine_entity = self._extract_entity(command, 'medicine')
            if medicine_entity:
                # Route to Medicine Analyzer
                return {
                    "action": "medicine_info",
                    "medicine": medicine_entity,
                    "response": self.analyze_medicine_from_text(medicine_entity).basic_summary()
                }
            else:
                 # Fallback to LLM if no entity found
                 pass

        # --- Intent 2: Symptom Checking ---
        if any(w in command_lower for w in ['pain', 'hurt', 'feel', 'symptom', 'headache', 'dizzy']):
            # Route to Agents
            return {
                "action": "symptom_check",
                "response": "I detected a symptom. For a full diagnosis, please describe your symptoms in detail.",
                # In a real app, this would trigger the agent workflow immediately if symptoms are sufficient
            }

        # --- Intent 3: General Chat / Fallback ---
        advice = self.get_medical_advice(command)
        return {
            "action": "chat",
            "response": advice
        }

    def _extract_entity(self, text: str, entity_type: str) -> Optional[str]:
        """Try BERT NER first, then fallback to heuristics"""
        if self.nlp_pipeline:
            try:
                entities = self.nlp_pipeline(text)
                # Filter for something looking like a drug (MISC or ORG often in generic NER)
                # This is a simplification. Real medical NER (BioBERT) would be better.
                for ent in entities:
                    if ent['score'] > 0.8:
                        return ent['word']
            except:
                pass
        
        # Fallback heuristic: Look for capitalized words in middle of sentence
        # (Very basic, but works for "Tell me about Aspirin")
        words = text.split()
        for w in words:
            if w[0].isupper() and len(w) > 3:
                return w
        return None
    
    async def analyze_patient_case(self, 
                                 patient_id: str, 
                                 symptoms: List[str], 
                                 patient_context: PatientContext) -> MedicalAnalysisResult:
        """
        Comprehensive patient case analysis integrating all components
        
        Args:
            patient_id: Unique patient identifier
            symptoms: List of patient symptoms
            patient_context: Detailed patient context information
            
        Returns:
            Comprehensive medical analysis result
        """
        start_time = time.time()
        
        # Check cache first for identical cases
        cache_key = f"case_analysis:{patient_id}:{hash(str(symptoms) + str(patient_context.__dict__))}"
        cached_result = self.cache_manager.get_cached_agent_response(cache_key)
        if cached_result:
            logger.info(f"Retrieved cached analysis for patient {patient_id}")
            return cached_result
        
        # Step 1: Process through agent orchestrator
        agent_results = self.agent_orchestrator.process_patient_input(symptoms, patient_context)
        
        # Step 2: Get primary diagnosis from highest confidence agent
        primary_diagnosis = self._determine_primary_diagnosis(agent_results)
        
        # Step 3: Generate differential diagnoses
        differential_diagnoses = self._generate_differential_diagnoses(agent_results, symptoms)
        
        # Step 4: Get treatment recommendations
        treatment_recommendations = self._generate_treatment_recommendations(
            primary_diagnosis, patient_context, agent_results
        )
        
        # Step 5: Assess urgency level
        urgency_level = self._assess_urgency_level(symptoms, agent_results, patient_context)
        
        # Step 6: Calculate overall confidence
        confidence_score = self._calculate_overall_confidence(agent_results, patient_context)
        
        # Step 7: Compile results
        processing_time = time.time() - start_time
        
        result = MedicalAnalysisResult(
            patient_id=patient_id,
            symptoms=symptoms,
            patient_context=patient_context,
            primary_diagnosis=primary_diagnosis,
            differential_diagnoses=differential_diagnoses,
            agent_responses=agent_results['agent_responses'],
            treatment_recommendations=treatment_recommendations,
            urgency_level=urgency_level,
            confidence_score=confidence_score,
            processing_time=processing_time,
            timestamp=datetime.now()
        )
        
        # Cache the result
        self.cache_manager.cache_agent_response(cache_key, result)
        
        logger.info(f"Completed analysis for patient {patient_id} in {processing_time:.2f}s")
        return result
    
    def analyze_medicine_from_image(self, image_path: str) -> MedicineInfo:
        """
        Analyze medicine from image using OCR and AI
        
        Args:
            image_path: Path to medicine image
            
        Returns:
            Detailed medicine information
        """
        # Check cache first
        cache_key = f"medicine_image:{hash(image_path)}"
        cached_result = self.cache_manager.get_cached_ocr_result(cache_key)
        if cached_result:
            logger.info(f"Retrieved cached medicine analysis for {image_path}")
            return cached_result
        
        # Perform OCR analysis
        with open(image_path, 'r') as f:  # This would be the OCR result
            ocr_text = f.read()  # Placeholder - in real implementation this would be OCR output
        
        # Analyze medicine information
        medicine_info = self.medicine_analyzer.analyze_medicine_from_text(ocr_text)
        
        # Cache the result
        self.cache_manager.cache_ocr_result(cache_key, medicine_info)
        
        return medicine_info
    
    def analyze_medicine_from_text(self, text: str) -> MedicineInfo:
        """
        Analyze medicine information from text
        
        Args:
            text: Text containing medicine information
            
        Returns:
            Detailed medicine information
        """
        # Check cache first
        cache_key = f"medicine_text:{hash(text)}"
        cached_result = self.cache_manager.get_cached_medicine_info(cache_key)
        if cached_result:
            logger.info("Retrieved cached medicine analysis from text")
            return cached_result
        
        # Analyze medicine information
        medicine_info = self.medicine_analyzer.analyze_medicine_from_text(text)
        
        # Cache the result
        self.cache_manager.cache_medicine_info(cache_key, medicine_info)
        
        return medicine_info
    
    def get_medical_advice(self, query: str, patient_context: PatientContext = None) -> str:
        """
        Get medical advice using local LLM
        
        Args:
            query: Medical question or concern
            patient_context: Optional patient context for personalized advice
            
        Returns:
            Medical advice response
        """
        if not self.llm_available:
            return "Local medical AI is not available. Please consult with a healthcare professional."
        
        # Check cache first
        cache_key = f"medical_advice:{hash(query + str(patient_context))}"
        cached_result = self.cache_manager.get_cached_llm_response(cache_key)
        if cached_result:
            logger.info("Retrieved cached medical advice")
            return cached_result
        
        # Generate response using local LLM
        context_str = str(patient_context.__dict__) if patient_context else "No specific patient context provided"
        response = self.local_llm.generate_medical_response(
            prompt=query,
            context=context_str
        )
        
        # Cache the result
        self.cache_manager.cache_llm_response(cache_key, response.response)
        
        return response.response
    
    def _determine_primary_diagnosis(self, agent_results: Dict[str, Any]) -> str:
        """Determine primary diagnosis from agent responses"""
        # Find the agent with highest confidence
        highest_confidence = 0
        primary_diagnosis = "No clear diagnosis"
        
        for specialty, data in agent_results['agent_responses'].items():
            if data['confidence'] > highest_confidence:
                highest_confidence = data['confidence']
                # Extract diagnosis from response (simplified)
                primary_diagnosis = data['response'][:100] + "..."  # Truncate for brevity
        
        return primary_diagnosis
    
    def _generate_differential_diagnoses(self, agent_results: Dict[str, Any], symptoms: List[str]) -> List[str]:
        """Generate list of possible differential diagnoses"""
        differentials = []
        
        # Collect possibilities from all agents
        for specialty, data in agent_results['agent_responses'].items():
            # Extract potential diagnoses from agent response
            if 'response' in data:
                response = data['response'].lower()
                # Look for common medical terms that might indicate diagnoses
                potential_diagnoses = [
                    term for term in ['infection', 'inflammation', 'deficiency', 'disorder', 'disease', 'syndrome']
                    if term in response
                ]
                differentials.extend(potential_diagnoses)
        
        # Remove duplicates and return top possibilities
        return list(set(differentials))[:5]  # Return top 5 possibilities
    
    def _generate_treatment_recommendations(self, 
                                          primary_diagnosis: str, 
                                          patient_context: PatientContext, 
                                          agent_results: Dict[str, Any]) -> List[str]:
        """Generate treatment recommendations based on analysis"""
        recommendations = []
        
        # Get recommendations from primary agent
        primary_specialty = agent_results.get('primary_specialty', 'general_practice')
        primary_agent = self.agent_orchestrator.get_agent_by_specialty(
            MedicalSpecialty[primary_specialty.replace('-', '_').upper()]
        )
        
        if primary_agent:
            try:
                agent_response = primary_agent.provide_treatment_recommendation(
                    primary_diagnosis, patient_context
                )
                recommendations.extend(agent_response.recommendations)
            except Exception as e:
                logger.error(f"Error getting treatment recommendations: {e}")
        
        # Add general recommendations
        if not recommendations:
            recommendations = [
                "Consult with a healthcare professional",
                "Monitor symptoms closely",
                "Maintain adequate hydration",
                "Get sufficient rest",
                "Follow up as needed"
            ]
        
        return recommendations
    
    def _assess_urgency_level(self, 
                             symptoms: List[str], 
                             agent_results: Dict[str, Any], 
                             patient_context: PatientContext) -> str:
        """Assess the urgency level of the case"""
        # Check for emergency symptoms
        emergency_symptoms = [
            'chest pain', 'difficulty breathing', 'severe headache', 'loss of consciousness',
            'severe abdominal pain', 'stroke symptoms', 'seizures', 'severe allergic reaction'
        ]
        
        # Check for emergency indicators in symptoms
        for symptom in symptoms:
            if any(emergency in symptom.lower() for emergency in emergency_symptoms):
                return 'emergent'
        
        # Check agent responses for urgent recommendations
        for specialty, data in agent_results['agent_responses'].items():
            if data['confidence'] > 0.8 and any(
                urgent_term in data['response'].lower() 
                for urgent_term in ['immediate', 'urgent', 'emergency', 'call 911', 'go to er']
            ):
                return 'urgent'
        
        # Check patient context for risk factors
        risk_factors = []
        if patient_context.age and patient_context.age > 65:
            risk_factors.append('elderly')
        if 'diabetes' in patient_context.medical_history:
            risk_factors.append('diabetes')
        if 'heart disease' in patient_context.medical_history:
            risk_factors.append('cardiac history')
        
        if risk_factors and any(symptom.lower() in ' '.join([s.lower() for s in symptoms]) 
                               for symptom in ['fever', 'infection', 'pain']):
            return 'urgent'
        
        return 'non_urgent'
    
    def _calculate_overall_confidence(self, agent_results: Dict[str, Any], patient_context: PatientContext) -> float:
        """Calculate overall confidence in the analysis"""
        # Calculate based on highest agent confidence and number of agreeing agents
        max_confidence = max(
            [data['confidence'] for data in agent_results['agent_responses'].values()],
            default=0.5
        )
        
        # Factor in number of agents that provided high-confidence responses
        high_confidence_agents = sum(
            1 for data in agent_results['agent_responses'].values()
            if data['confidence'] > 0.7
        )
        
        # Calculate weighted confidence
        agent_agreement_factor = min(1.0, high_confidence_agents / 2.0)  # Max 2 agents needed
        overall_confidence = (max_confidence * 0.7) + (agent_agreement_factor * 0.3)
        
        return min(1.0, overall_confidence)  # Cap at 1.0
    
    def get_system_status(self) -> Dict[str, Any]:
        """Get comprehensive system status and statistics"""
        # Get all installed models from Ollama
        installed_models = []
        if hasattr(self.local_llm, 'list_available_models'):
             installed_models = self.local_llm.list_available_models()
        
        return {
            'system_initialized': self.system_initialized,
            'llm_available': self.llm_available,
            'component_health': {
                'medicine_analyzer': True,
                'agent_orchestrator': True
            },
            'model_details': {
                'active_llm': self.local_llm.model_name if hasattr(self.local_llm, 'model_name') else 'medllama2',
                'installed_llms': installed_models,
                'ner': 'dslim/bert-base-NER',
                'qa': 'deepset/roberta-base-squad2',
                'summarizer': 'facebook/bart-large-cnn'
            },
            'cache_statistics': self.cache_manager.get_stats(),
            'timestamp': datetime.now().isoformat()
        }

def main():

    """
    Main function to handle command-line interface for Node.js connector
    """
    
    parser = argparse.ArgumentParser(description='Medical AI Core System')
    parser.add_argument('--input', type=str, help='Input JSON file path')
    
    args = parser.parse_args()
    
    if not args.input:
        print(json.dumps({"error": "Input file path required"}), flush=True)
        return
    
    # Read input parameters from file
    try:
        with open(args.input, 'r') as f:
            input_params = json.load(f)
    except Exception as e:
        print(json.dumps({"error": f"Failed to read input file: {str(e)}"}), flush=True)
        return
    
    # Initialize the system
    ai_core = MedicalAICore()
    
    try:
        action = input_params.get('action', '')
        
        if action == 'analyze_patient_case':
            # Extract parameters
            symptoms = input_params.get('symptoms', [])
            patient_context_data = input_params.get('patient_context', {})
            
            # Create PatientContext object
            patient_ctx = PatientContext(**patient_context_data)
            
            # Perform analysis (synchronously since this is CLI)
            result = asyncio.run(ai_core.analyze_patient_case(
                patient_id=patient_context_data.get('patient_id', 'unknown'),
                symptoms=symptoms,
                patient_context=patient_ctx
            ))
            
            # Format result for output
            output = {
                'success': True,
                'action': 'analyze_patient_case',
                'result': {
                    'patient_id': result.patient_id,
                    'symptoms': result.symptoms,
                    'primary_diagnosis': result.primary_diagnosis,
                    'differential_diagnoses': result.differential_diagnoses,
                    'treatment_recommendations': result.treatment_recommendations,
                    'urgency_level': result.urgency_level,
                    'confidence_score': result.confidence_score,
                    'processing_time': result.processing_time,
                    'timestamp': result.timestamp.isoformat()
                }
            }
            
        elif action == 'analyze_medicine_text':
            text = input_params.get('text', '')
            
            # Perform medicine analysis
            medicine_info = ai_core.analyze_medicine_from_text(text)
            
            output = {
                'success': True,
                'action': 'analyze_medicine_text',
                'result': {
                    'name': medicine_info.name,
                    'generic_name': medicine_info.generic_name,
                    'uses': medicine_info.uses,
                    'side_effects': medicine_info.side_effects,
                    'contraindications': medicine_info.contraindications,
                    'dosage_instructions': medicine_info.dosage_instructions,
                    'warnings': medicine_info.warnings,
                    'storage_instructions': medicine_info.storage_instructions,
                    'confidence_score': medicine_info.confidence_score
                }
            }
            
        elif action == 'get_medical_advice':
            query = input_params.get('query', '')
            patient_context_data = input_params.get('patient_context', None)
            
            # Create PatientContext if provided
            patient_ctx = None
            if patient_context_data:
                patient_ctx = PatientContext(**patient_context_data)
            
            # Get medical advice
            advice = ai_core.get_medical_advice(query, patient_ctx)
            
            output = {
                'success': True,
                'action': 'get_medical_advice',
                'result': {
                    'response': advice,
                    'query': query
                }
            }
            
        elif action == 'get_system_status':
            # Get system status
            status = ai_core.get_system_status()
            
            output = {
                'success': True,
                'action': 'get_system_status',
                'result': status
            }
            
        elif action == 'process_voice_command':
            command = input_params.get('command', '')
            user_id = input_params.get('user_id', 'unknown')
            
            result = ai_core.process_voice_command_intent(command, user_id)
            
            output = {
                'success': True,
                'action': 'process_voice_command',
                'result': result
            }

        else:
            output = {
                'success': False,
                'error': f'Unknown action: {action}',
                'supported_actions': ['analyze_patient_case', 'analyze_medicine_text', 'get_medical_advice', 'get_system_status']
            }
    
    except Exception as e:
        output = {
            'success': False,
            'error': f'Exception occurred: {str(e)}',
            'traceback': str(e.__traceback__) if e.__traceback__ else None
        }
    
    # Output result as JSON
    print(json.dumps(output), flush=True)

if __name__ == "__main__":
    main()