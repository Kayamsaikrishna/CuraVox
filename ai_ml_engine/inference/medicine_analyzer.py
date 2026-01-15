"""
Medicine Analyzer using AI/LLM for medical information extraction and analysis
This module handles the AI-powered analysis of medicine information
"""

import json
import re
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
import torch
import numpy as np
from datetime import datetime

@dataclass
class MedicineInfo:
    """Data class to hold medicine information"""
    name: str
    generic_name: Optional[str] = None
    dosage_form: Optional[str] = None
    strength: Optional[str] = None
    manufacturer: Optional[str] = None
    uses: List[str] = None
    dosage_instructions: Optional[str] = None
    side_effects: List[str] = None
    contraindications: List[str] = None
    warnings: List[str] = None
    storage_instructions: Optional[str] = None
    prescription_required: bool = False
    confidence_score: float = 0.0

class MedicineAnalyzer:
    """
    AI-powered medicine analyzer that uses NLP and LLM to extract and analyze medicine information
    """
    
    def __init__(self):
        """
        Initialize the medicine analyzer with pre-trained models
        """
        self.medicine_ner_model = None
        self.classification_pipeline = None
        self.qa_pipeline = None
        
        # Initialize models
        self._load_models()
    
    def _load_models(self):
        """
        Load pre-trained models for medicine analysis
        """
        try:
            # Named Entity Recognition model for identifying medicine-related entities
            # Using a pre-trained biomedical NER model
            self.medicine_ner_model = pipeline(
                "ner", 
                model="dmis-lab/biobert-base-cased-v1.1-squad",
                tokenizer="dmis-lab/biobert-base-cased-v1.1-squad",
                aggregation_strategy="simple"
            )
            
            print("Models loaded successfully")
        except Exception as e:
            print(f"Error loading models: {e}")
            # Fallback to simple rule-based extraction
            self.medicine_ner_model = None
    
    def analyze_medicine_from_text(self, text: str) -> MedicineInfo:
        """
        Analyze medicine information from text using AI
        
        Args:
            text (str): Text containing medicine information
            
        Returns:
            MedicineInfo: Extracted medicine information
        """
        # Extract entities using NER or rule-based approach
        if self.medicine_ner_model:
            entities = self._extract_entities_ner(text)
        else:
            entities = self._extract_entities_rule_based(text)
        
        # Extract specific medicine information
        medicine_info = self._extract_medicine_info(text, entities)
        
        # Perform additional analysis
        qa_results = self._perform_qa_analysis(text)
        medicine_info = self._enhance_with_qa(medicine_info, qa_results)
        
        # Calculate confidence score
        medicine_info.confidence_score = self._calculate_confidence_score(entities, text)
        
        return medicine_info
    
    def _extract_entities_ner(self, text: str) -> Dict[str, List[str]]:
        """
        Extract entities using Named Entity Recognition
        
        Args:
            text (str): Input text
            
        Returns:
            Dict[str, List[str]]: Dictionary of extracted entities
        """
        if not self.medicine_ner_model:
            return {}
        
        try:
            # BioBERT NER model doesn't have medicine-specific entities
            # So we'll use a rule-based approach combined with the model
            entities = self.medicine_ner_model(text)
            
            # Group entities by type
            grouped_entities = {}
            for entity in entities:
                entity_type = entity['entity_group']
                if entity_type not in grouped_entities:
                    grouped_entities[entity_type] = []
                grouped_entities[entity_type].append(entity['word'])
            
            return grouped_entities
        except Exception as e:
            print(f"Error in NER extraction: {e}")
            return self._extract_entities_rule_based(text)
    
    def _extract_entities_rule_based(self, text: str) -> Dict[str, List[str]]:
        """
        Extract entities using rule-based approach as fallback
        
        Args:
            text (str): Input text
            
        Returns:
            Dict[str, List[str]]: Dictionary of extracted entities
        """
        entities = {
            'medicine_name': [],
            'dosage': [],
            'frequency': [],
            'duration': [],
            'symptoms': [],
            'conditions': []
        }
        
        # Extract medicine names (capitalized words that look like medicine names)
        medicine_patterns = [
            r'\b[A-Z][a-z]+\b',  # Capitalized words
            r'\b\d+\s*(mg|mcg|g|ml|iu|%)\b',  # Dosages
            r'\b(?:tab\.?|caps?\.?|syp\.?|syr\.?|inj\.?|sol\.?|cre\.?|ointment)\b',  # Forms
        ]
        
        for pattern in medicine_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if 'mg' in pattern or 'mcg' in pattern or 'g' in pattern or 'ml' in pattern:
                entities['dosage'].extend(matches)
            elif 'tab' in pattern or 'cap' in pattern or 'syr' in pattern:
                entities['forms'].extend(matches)
            else:
                entities['medicine_name'].extend(matches)
        
        # Remove duplicates
        for key in entities:
            entities[key] = list(set(entities[key]))
        
        return entities
    
    def _extract_medicine_info(self, text: str, entities: Dict[str, List[str]]) -> MedicineInfo:
        """
        Extract specific medicine information from text and entities
        
        Args:
            text (str): Input text
            entities (Dict[str, List[str]]): Extracted entities
            
        Returns:
            MedicineInfo: Structured medicine information
        """
        # Initialize medicine info
        medicine_info = MedicineInfo(name="", uses=[], side_effects=[], contraindications=[])
        
        # Extract medicine name (first capitalized word that looks like medicine)
        medicine_name = self._extract_medicine_name(text)
        medicine_info.name = medicine_name
        
        # Extract dosage form
        medicine_info.dosage_form = self._extract_dosage_form(text)
        
        # Extract strength
        medicine_info.strength = self._extract_strength(text)
        
        # Extract uses/indications
        medicine_info.uses = self._extract_uses(text)
        
        # Extract side effects
        medicine_info.side_effects = self._extract_side_effects(text)
        
        # Extract contraindications
        medicine_info.contraindications = self._extract_contraindications(text)
        
        # Extract warnings
        medicine_info.warnings = self._extract_warnings(text)
        
        # Extract dosage instructions
        medicine_info.dosage_instructions = self._extract_dosage_instructions(text)
        
        # Extract storage instructions
        medicine_info.storage_instructions = self._extract_storage_instructions(text)
        
        # Determine if prescription is required
        medicine_info.prescription_required = self._determine_prescription_required(text)
        
        return medicine_info
    
    def _extract_medicine_name(self, text: str) -> str:
        """
        Extract medicine name from text
        
        Args:
            text (str): Input text
            
        Returns:
            str: Medicine name
        """
        # Look for capitalized words that appear before dosage information
        patterns = [
            r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+\d+',  # Name followed by number
            r'(?:take|use|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',  # Name after instruction words
            r'^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)',  # Name at beginning
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        
        # Fallback: first capitalized word
        words = text.split()
        for word in words:
            if len(word) > 2 and word[0].isupper():
                return word.strip('.,;:')
        
        return "Unknown Medicine"
    
    def _extract_dosage_form(self, text: str) -> Optional[str]:
        """
        Extract dosage form from text
        
        Args:
            text (str): Input text
            
        Returns:
            Optional[str]: Dosage form
        """
        forms = [
            ('tablet', r'\btab\.?\b'),
            ('capsule', r'\bcaps?\.?\b'),
            ('syrup', r'\bsyp\.?|syr\.?\b'),
            ('injection', r'\binj\.?\b'),
            ('solution', r'\bsol\.?\b'),
            ('cream', r'\bcre\.?|cream\b'),
            ('ointment', r'\bointment\b'),
            ('drops', r'\bdrops\b'),
            ('spray', r'\bspray\b'),
            ('inhaler', r'\binhaler\b'),
            ('patch', r'\bpatch\b'),
            ('lozenge', r'\blozenge\b'),
            ('powder', r'\bpowder\b'),
            ('gel', r'\bgel\b'),
        ]
        
        text_lower = text.lower()
        for form, pattern in forms:
            if re.search(pattern, text_lower):
                return form
        
        return None
    
    def _extract_strength(self, text: str) -> Optional[str]:
        """
        Extract medicine strength from text
        
        Args:
            text (str): Input text
            
        Returns:
            Optional[str]: Strength
        """
        # Pattern for dosage amounts: number followed by unit
        patterns = [
            r'(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|iu|%)\b',
            r'(\d+(?:\.\d+)?)\s*(milligrams|micrograms|grams|milliliters|international units)\b',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                strengths = [f"{amount}{unit}" for amount, unit in matches]
                return ", ".join(strengths)
        
        return None
    
    def _extract_uses(self, text: str) -> List[str]:
        """
        Extract uses/indications from text
        
        Args:
            text (str): Input text
            
        Returns:
            List[str]: List of uses
        """
        # Look for sections indicating uses
        patterns = [
            r'(?:used for|indication|treatment of|for)\s*:?\s*([^.]*?)(?:\.|$)',
            r'(?:indications?|uses?)\s*:?\s*([^.]*?)(?:\.|$)',
            r'(?:treats?|helps? with|relieves?|prevents?)\s+:?\s*([^.]*?)(?:\.|$)',
        ]
        
        uses = []
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            uses.extend([match.strip() for match in matches])
        
        # Filter out very short matches
        uses = [use for use in uses if len(use) > 5]
        
        return list(set(uses))  # Remove duplicates
    
    def _extract_side_effects(self, text: str) -> List[str]:
        """
        Extract side effects from text
        
        Args:
            text (str): Input text
            
        Returns:
            List[str]: List of side effects
        """
        # Look for sections indicating side effects
        patterns = [
            r'(?:side effects?|adverse reactions?|unwanted effects?)\s*:?\s*([^.]*?)(?:\.|$)',
            r'(?:may cause|common side effects? include)\s+:?\s*([^.]*?)(?:\.|$)',
        ]
        
        side_effects = []
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                # Split by common delimiters
                effects = re.split(r',|and|\bor\b', match)
                side_effects.extend([effect.strip() for effect in effects if effect.strip()])
        
        # Filter out very short matches
        side_effects = [effect for effect in side_effects if len(effect) > 3]
        
        return list(set(side_effects))  # Remove duplicates
    
    def _extract_contraindications(self, text: str) -> List[str]:
        """
        Extract contraindications from text
        
        Args:
            text (str): Input text
            
        Returns:
            List[str]: List of contraindications
        """
        patterns = [
            r'(?:contraindications?|not suitable for|avoid if|do not use with)\s*:?\s*([^.]*?)(?:\.|$)',
            r'(?:should not be used|not recommended for)\s+:?\s*([^.]*?)(?:\.|$)',
        ]
        
        contraindications = []
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                conditions = re.split(r',|and|\bor\b', match)
                contraindications.extend([condition.strip() for condition in conditions if condition.strip()])
        
        return list(set(contraindications))
    
    def _extract_warnings(self, text: str) -> List[str]:
        """
        Extract warnings from text
        
        Args:
            text (str): Input text
            
        Returns:
            List[str]: List of warnings
        """
        patterns = [
            r'(?:warning|caution|important|note)\s*:?\s*([^.]*?)(?:\.|$)',
            r'(?:consult doctor|see insert|ask pharmacist|if symptoms persist)\s+:?\s*([^.]*?)(?:\.|$)',
        ]
        
        warnings = []
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                warning_parts = re.split(r',|and|\bor\b', match)
                warnings.extend([part.strip() for part in warning_parts if part.strip()])
        
        return list(set(warnings))
    
    def _extract_dosage_instructions(self, text: str) -> Optional[str]:
        """
        Extract dosage instructions from text
        
        Args:
            text (str): Input text
            
        Returns:
            Optional[str]: Dosage instructions
        """
        patterns = [
            r'(?:dosage|take|use|instructions?)\s*:?\s*([^.]*?)(?:\.|$)',
            r'(?:take|use|consume)\s+([^.]*?)(?:\.|$)',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                # Return the first meaningful match
                for match in matches:
                    if len(match.strip()) > 5:
                        return match.strip()
        
        return None
    
    def _extract_storage_instructions(self, text: str) -> Optional[str]:
        """
        Extract storage instructions from text
        
        Args:
            text (str): Input text
            
        Returns:
            Optional[str]: Storage instructions
        """
        patterns = [
            r'(?:store|storage|keep|preservation)\s*:?\s*([^.]*?)(?:\.|$)',
            r'(?:protect from|refrigerate|keep cool|away from light)\s*:?\s*([^.]*?)(?:\.|$)',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                for match in matches:
                    if len(match.strip()) > 5:
                        return match.strip()
        
        return None
    
    def _determine_prescription_required(self, text: str) -> bool:
        """
        Determine if prescription is required based on text
        
        Args:
            text (str): Input text
            
        Returns:
            bool: True if prescription is required
        """
        prescription_indicators = [
            r'prescription',
            r'rx only',
            r'doctor\'?s order',
            r'physician\'?s authorization',
        ]
        
        text_lower = text.lower()
        for indicator in prescription_indicators:
            if re.search(indicator, text_lower):
                return True
        
        return False
    
    def _perform_qa_analysis(self, text: str) -> Dict[str, str]:
        """
        Perform question-answering analysis to extract specific information
        
        Args:
            text (str): Input text
            
        Returns:
            Dict[str, str]: QA results
        """
        # This is a simplified version - in a real implementation, 
        # we would use a proper QA model like BERT or GPT
        qa_results = {}
        
        # Sample questions we might want to answer
        questions = {
            "what_is_the_medicine_for": [
                r'(?:used for|indication|treatment of|for)\s*:?\s*([^.]*?)(?:\.|$)',
                r'(?:treats?|helps? with|relieves?|prevents?)\s+:?\s*([^.]*?)(?:\.|$)'
            ],
            "what_are_the_side_effects": [
                r'(?:side effects?|adverse reactions?)\s*:?\s*([^.]*?)(?:\.|$)',
                r'(?:may cause|common side effects? include)\s+:?\s*([^.]*?)(?:\.|$)'
            ],
            "how_should_it_be_taken": [
                r'(?:dosage|take|use|instructions?)\s*:?\s*([^.]*?)(?:\.|$)',
                r'(?:take|use|consume)\s+([^.]*?)(?:\.|$)'
            ]
        }
        
        for question, patterns in questions.items():
            for pattern in patterns:
                matches = re.findall(pattern, text, re.IGNORECASE)
                if matches:
                    qa_results[question] = matches[0].strip()
                    break
        
        return qa_results
    
    def _enhance_with_qa(self, medicine_info: MedicineInfo, qa_results: Dict[str, str]) -> MedicineInfo:
        """
        Enhance medicine info with results from QA analysis
        
        Args:
            medicine_info (MedicineInfo): Original medicine info
            qa_results (Dict[str, str]): QA results
            
        Returns:
            MedicineInfo: Enhanced medicine info
        """
        # Add uses from QA if not already present
        if "what_is_the_medicine_for" in qa_results and not medicine_info.uses:
            uses = [qa_results["what_is_the_medicine_for"]]
            medicine_info.uses = uses
        
        # Add side effects from QA if not already present
        if "what_are_the_side_effects" in qa_results and not medicine_info.side_effects:
            side_effects = [qa_results["what_are_the_side_effects"]]
            medicine_info.side_effects = side_effects
        
        # Add dosage instructions from QA if not already present
        if "how_should_it_be_taken" in qa_results and not medicine_info.dosage_instructions:
            medicine_info.dosage_instructions = qa_results["how_should_it_be_taken"]
        
        return medicine_info
    
    def _calculate_confidence_score(self, entities: Dict[str, List[str]], text: str) -> float:
        """
        Calculate confidence score based on extracted entities and text
        
        Args:
            entities (Dict[str, List[str]]): Extracted entities
            text (str): Original text
            
        Returns:
            float: Confidence score (0-1)
        """
        score = 0.0
        
        # Base score based on entity extraction
        total_entities = sum(len(v) for v in entities.values())
        if total_entities > 0:
            score += 0.3  # Base score for finding entities
        
        # Boost score if medicine name is found
        if entities.get('medicine_name'):
            score += 0.2
        
        # Boost score if dosage information is found
        if entities.get('dosage'):
            score += 0.2
        
        # Consider text length and information density
        if len(text) > 100:  # More complete text
            score += 0.15
        
        # Cap at 1.0
        return min(score, 1.0)

# Example usage
if __name__ == "__main__":
    analyzer = MedicineAnalyzer()
    
    # Example medicine text
    sample_text = """
    Paracetamol 500mg tablets. Used for relief of mild to moderate pain and to reduce fever. 
    Take 1-2 tablets every 4-6 hours as needed. Do not exceed 8 tablets in 24 hours. 
    May cause rare side effects such as skin reactions. Consult doctor if symptoms persist.
    Store in a cool, dry place.
    """
    
    result = analyzer.analyze_medicine_from_text(sample_text)
    print(f"Medicine: {result.name}")
    print(f"Dosage Form: {result.dosage_form}")
    print(f"Strength: {result.strength}")
    print(f"Uses: {result.uses}")
    print(f"Side Effects: {result.side_effects}")
    print(f"Confidence Score: {result.confidence_score:.2f}")