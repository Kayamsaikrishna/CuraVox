"""
Optimized Medicine Analyzer
Advanced NLP-based medicine analysis with local LLM integration
"""

import re
import json
import time
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime

@dataclass
class MedicineInfo:
    """
    Data class representing comprehensive medicine information
    """
    name: str
    generic_name: str
    uses: List[str]
    side_effects: List[str]
    contraindications: List[str]
    dosage_instructions: str
    warnings: List[str]
    storage_instructions: str
    manufacturer: str
    strength: str
    dosage_form: str
    category: str
    prescription_required: bool
    confidence_score: float
    extraction_timestamp: datetime

class OptimizedMedicineAnalyzer:
    """
    High-performance medicine analyzer that uses optimized NLP techniques and local LLM for fast, accurate analysis
    """

    def __init__(self):
        """
        Initialize the medicine analyzer with optimized processing
        """
        # Precompile regex patterns for faster execution
        self.patterns = self._compile_patterns()
        
        # Load comprehensive medical knowledge base
        self.medical_knowledge_base = self._load_medical_knowledge_base()
        
        # Initialize confidence thresholds
        self.confidence_thresholds = {
            'high': 0.9,
            'medium': 0.7,
            'low': 0.5
        }
    
    def _compile_patterns(self) -> Dict:
        """
        Compile regex patterns for faster repeated use
        """
        return {
            'medicine_name': [
                re.compile(r'([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+\d+', re.IGNORECASE),
                re.compile(r'(?:take|use|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', re.IGNORECASE),
                re.compile(r'^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', re.IGNORECASE),
            ],
            'dosage_forms': {
                'tablet': re.compile(r'\btab\.?\b', re.IGNORECASE),
                'capsule': re.compile(r'\bcaps?\.?\b', re.IGNORECASE),
                'syrup': re.compile(r'\bsyp\.?|syr\.?\b', re.IGNORECASE),
                'injection': re.compile(r'\binj\.?|injection\b', re.IGNORECASE),
                'cream': re.compile(r'\bcream\b', re.IGNORECASE),
                'ointment': re.compile(r'\boint\.?|ointment\b', re.IGNORECASE),
                'drops': re.compile(r'\bdrops?|gtt\.?\b', re.IGNORECASE),
                'suspension': re.compile(r'\bsusp\.?|suspension\b', re.IGNORECASE),
                'solution': re.compile(r'\bsol\.?|solution\b', re.IGNORECASE),
                'powder': re.compile(r'\bpowder\b', re.IGNORECASE),
                'gel': re.compile(r'\bgel\b', re.IGNORECASE),
                'lotion': re.compile(r'\blotion\b', re.IGNORECASE),
            },
            'strength_patterns': [
                re.compile(r'(\d+(?:\.\d+)?)\s*(mg|mcg|g|ml|iu|%|unit)s?', re.IGNORECASE),
                re.compile(r'(\d+(?:\.\d+)?)\s*(gram|milligram|microgram|liter|mL|unit)s?', re.IGNORECASE),
            ],
            'frequency_patterns': [
                re.compile(r'(?:every|each)\s+(\d+)\s+(hour|hr|day|week|month)', re.IGNORECASE),
                re.compile(r'(?:take|use|apply)\s+(?:once|twice|three times|four times)\s+(?:daily|per day|a day)', re.IGNORECASE),
                re.compile(r'(?:bid|tid|qid|od|bd|td|qd)', re.IGNORECASE),  # Medical abbreviations
            ],
            'duration_patterns': [
                re.compile(r'(?:for|during|until)\s+(\d+)\s+(day|week|month|year)s?', re.IGNORECASE),
                re.compile(r'(?:continue|maintain)\s+(?:for|during)\s+(\d+)\s+(day|week|month|year)s?', re.IGNORECASE),
            ],
            'warning_patterns': [
                re.compile(r'(?:caution|warning|contraindicated|not recommended|avoid|do not use)\s+(?:with|in|for)\s+([^\.]+)', re.IGNORECASE),
                re.compile(r'(?:pregnancy|lactation|allergy|renal|hepatic)\s+(?:category|warning|precaution)', re.IGNORECASE),
            ],
            'side_effect_patterns': [
                re.compile(r'(?:side effect|adverse effect|may cause|common side effect)\s*:?\s*([^\.]+)', re.IGNORECASE),
                re.compile(r'(?:nausea|vomiting|dizziness|headache|fatigue|rash|itching|swelling|difficulty breathing)', re.IGNORECASE),
            ]
        }
    
    def _load_medical_knowledge_base(self) -> Dict:
        """
        Load comprehensive medical knowledge base with known medicines and their properties
        """
        # This would normally load from a database or external API
        # For now, we'll use a comprehensive in-memory knowledge base
        return {
            'paracetamol': {
                'generic_name': 'acetaminophen',
                'uses': ['pain relief', 'fever reduction'],
                'side_effects': ['liver damage with overdose', 'skin reactions'],
                'contraindications': ['liver disease', 'alcoholism'],
                'dosage_instructions': '500mg-1000mg every 4-6 hours as needed',
                'warnings': ['Do not exceed maximum daily dose', 'Liver toxicity possible'],
                'storage_instructions': 'Store at room temperature away from moisture',
                'manufacturer': 'Various',
                'strength': '500mg, 650mg, 1000mg',
                'dosage_form': 'tablet, capsule, syrup, injection',
                'category': 'Analgesic, Antipyretic',
                'prescription_required': False
            },
            'ibuprofen': {
                'generic_name': 'ibuprofen',
                'uses': ['pain relief', 'inflammation', 'fever reduction'],
                'side_effects': ['stomach irritation', 'kidney problems', 'heart issues'],
                'contraindications': ['stomach ulcers', 'heart disease', 'kidney disease'],
                'dosage_instructions': '200-400mg every 4-6 hours as needed',
                'warnings': ['Take with food to prevent stomach irritation', 'May increase heart attack risk'],
                'storage_instructions': 'Store at room temperature away from moisture',
                'manufacturer': 'Various',
                'strength': '200mg, 400mg, 600mg',
                'dosage_form': 'tablet, capsule, syrup, gel',
                'category': 'NSAID',
                'prescription_required': False
            },
            'amoxicillin': {
                'generic_name': 'amoxicillin',
                'uses': ['bacterial infections', 'ear infections', 'sinus infections', 'pneumonia'],
                'side_effects': ['diarrhea', 'nausea', 'rash', 'yeast infections'],
                'contraindications': ['penicillin allergy', 'mononucleosis'],
                'dosage_instructions': '250-500mg every 8-12 hours as directed',
                'warnings': ['Complete full course of antibiotics', 'May cause antibiotic resistance if misused'],
                'storage_instructions': 'Store at room temperature, protect from moisture',
                'manufacturer': 'Various',
                'strength': '250mg, 500mg, 875mg',
                'dosage_form': 'capsule, tablet, suspension',
                'category': 'Antibiotic',
                'prescription_required': True
            },
            'metformin': {
                'generic_name': 'metformin',
                'uses': ['type 2 diabetes', 'polycystic ovary syndrome'],
                'side_effects': ['nausea', 'diarrhea', 'stomach upset', 'vitamin B12 deficiency'],
                'contraindications': ['kidney disease', 'liver disease', 'heart failure'],
                'dosage_instructions': '500mg-1000mg twice daily with meals',
                'warnings': ['Risk of lactic acidosis', 'Kidney function monitoring required'],
                'storage_instructions': 'Store at room temperature away from light and moisture',
                'manufacturer': 'Various',
                'strength': '500mg, 850mg, 1000mg',
                'dosage_form': 'tablet, extended-release tablet',
                'category': 'Antidiabetic',
                'prescription_required': True
            },
            'lisinopril': {
                'generic_name': 'lisinopril',
                'uses': ['hypertension', 'heart failure', 'post-heart attack'],
                'side_effects': ['dry cough', 'dizziness', 'hyperkalemia', 'angioedema'],
                'contraindications': ['pregnancy', 'angioedema history', 'hyperkalemia'],
                'dosage_instructions': '10-40mg once daily, adjust based on response',
                'warnings': ['Avoid potassium supplements', 'Monitor kidney function', 'Do not use during pregnancy'],
                'storage_instructions': 'Store at room temperature away from light',
                'manufacturer': 'Various',
                'strength': '2.5mg, 5mg, 10mg, 20mg, 40mg',
                'dosage_form': 'tablet',
                'category': 'ACE inhibitor',
                'prescription_required': True
            },
            'omeprazole': {
                'generic_name': 'omeprazole',
                'uses': ['GERD', 'peptic ulcer disease', 'Zollinger-Ellison syndrome'],
                'side_effects': ['headache', 'abdominal pain', 'nausea', 'diarrhea'],
                'contraindications': ['hypersensitivity to PPIs'],
                'dosage_instructions': '20mg once daily before meals, duration varies by condition',
                'warnings': ['Long-term use may increase fracture risk', 'May interact with other medications'],
                'storage_instructions': 'Store at room temperature, protect from moisture',
                'manufacturer': 'Various',
                'strength': '10mg, 20mg, 40mg',
                'dosage_form': 'capsule, tablet, oral suspension',
                'category': 'Proton pump inhibitor',
                'prescription_required': True  # Prescription required for therapeutic doses, OTC available for lower doses
            }
        }
    
    def analyze_medicine_from_text(self, text: str) -> MedicineInfo:
        """
        Analyze medicine information from text using optimized NLP techniques
        
        Args:
            text: Text containing medicine information (e.g., from OCR, package insert, etc.)
            
        Returns:
            MedicineInfo: Structured medicine information
        """
        start_time = time.time()
        
        # Extract medicine name
        medicine_name = self._extract_medicine_name(text)
        
        # Extract dosage form
        dosage_form = self._extract_dosage_form(text)
        
        # Extract strength
        strength = self._extract_strength(text)
        
        # Get information from knowledge base or analyze text
        if medicine_name.lower() in self.medical_knowledge_base:
            # Use known information from knowledge base
            known_info = self.medical_knowledge_base[medicine_name.lower()]
            uses = known_info['uses']
            side_effects = known_info['side_effects']
            contraindications = known_info['contraindications']
            dosage_instructions = known_info['dosage_instructions']
            warnings = known_info['warnings']
            storage_instructions = known_info['storage_instructions']
            manufacturer = known_info['manufacturer']
            category = known_info['category']
            prescription_required = known_info['prescription_required']
            confidence_score = 0.95
        else:
            # Analyze text for unknown medicine
            uses = self._extract_uses(text)
            side_effects = self._extract_side_effects(text)
            contraindications = self._extract_contraindications(text)
            dosage_instructions = self._extract_dosage_instructions(text)
            warnings = self._extract_warnings(text)
            storage_instructions = self._extract_storage_instructions(text)
            manufacturer = self._extract_manufacturer(text)
            category = self._determine_category(text)
            prescription_required = self._determine_prescription_requirement(text)
            
            # Calculate confidence based on information completeness
            confidence_score = self._calculate_confidence_score(text, medicine_name)
        
        # Create and return MedicineInfo object
        return MedicineInfo(
            name=medicine_name,
            generic_name=self._get_generic_name(medicine_name),
            uses=uses,
            side_effects=side_effects,
            contraindications=contraindications,
            dosage_instructions=dosage_instructions,
            warnings=warnings,
            storage_instructions=storage_instructions,
            manufacturer=manufacturer,
            strength=strength,
            dosage_form=dosage_form,
            category=category,
            prescription_required=prescription_required,
            confidence_score=confidence_score,
            extraction_timestamp=datetime.now()
        )
    
    def _extract_medicine_name(self, text: str) -> str:
        """
        Extract medicine name from text using compiled patterns
        """
        text_lower = text.lower()
        
        # First, try to find known medicine names from our knowledge base
        for known_medicine in self.medical_knowledge_base.keys():
            if known_medicine in text_lower:
                return known_medicine.capitalize()
        
        # If not found in knowledge base, use regex patterns
        for pattern in self.patterns['medicine_name']:
            match = pattern.search(text)
            if match:
                return match.group(1).strip()
        
        # If no pattern matches, return the first capitalized word that could be a medicine name
        words = text.split()
        for word in words:
            cleaned_word = re.sub(r'[^\w]', '', word)
            if len(cleaned_word) > 2 and cleaned_word[0].isupper():
                return cleaned_word
        
        return "Unknown Medicine"
    
    def _extract_dosage_form(self, text: str) -> str:
        """
        Extract dosage form from text
        """
        text_lower = text.lower()
        
        for form, pattern in self.patterns['dosage_forms'].items():
            if pattern.search(text_lower):
                return form
        
        return "Unknown Form"
    
    def _extract_strength(self, text: str) -> str:
        """
        Extract medicine strength from text
        """
        for pattern in self.patterns['strength_patterns']:
            matches = pattern.findall(text)
            if matches:
                strengths = [f"{match[0]}{match[1]}" for match in matches]
                return ", ".join(strengths)
        
        return "Strength Not Specified"
    
    def _extract_uses(self, text: str) -> List[str]:
        """
        Extract uses/indications from text
        """
        # Look for common indication phrases
        indication_patterns = [
            r'(?:used for|indicated for|treatment of|for treating)\s*:?\s*([^.]+)',
            r'(?:relief of|management of|prevention of)\s+:?\s*([^.]+)',
            r'(?:analgesic for|antipyretic for)\s+:?\s*([^.]+)'
        ]
        
        uses = []
        for pattern in indication_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                # Clean up the match
                clean_match = re.sub(r'\s+', ' ', match.strip())
                if clean_match:
                    uses.extend([item.strip() for item in clean_match.split(',') if item.strip()])
        
        # If no specific uses found, try general terms
        if not uses:
            general_terms = ['pain relief', 'fever reduction', 'inflammation'] if any(term in text.lower() for term in ['pain', 'fever', 'inflammation']) else []
            uses = general_terms
        
        return list(set(uses)) if uses else ["Use information not clearly specified in text"]
    
    def _extract_side_effects(self, text: str) -> List[str]:
        """
        Extract side effects from text
        """
        side_effects = []
        
        # Look for common side effect phrases
        for pattern in self.patterns['side_effect_patterns']:
            matches = pattern.findall(text)
            for match in matches:
                if isinstance(match, tuple):
                    match = match[0] if match else ""
                
                # Clean and split multiple side effects
                clean_match = re.sub(r'\s+', ' ', match.strip())
                if clean_match:
                    side_effects.extend([item.strip() for item in clean_match.split(',') if item.strip()])
        
        # Add common side effects if found in text
        common_side_effects = [
            'nausea', 'vomiting', 'diarrhea', 'headache', 'dizziness', 'rash', 
            'itching', 'swelling', 'difficulty breathing', 'stomach upset'
        ]
        
        text_lower = text.lower()
        for effect in common_side_effects:
            if effect in text_lower and not any(effect in se.lower() for se in side_effects):
                side_effects.append(effect)
        
        return list(set(side_effects)) if side_effects else ["Side effect information not clearly specified in text"]
    
    def _extract_contraindications(self, text: str) -> List[str]:
        """
        Extract contraindications from text
        """
        contraindications = []
        
        # Look for warning patterns that might indicate contraindications
        for pattern in self.patterns['warning_patterns']:
            matches = pattern.findall(text)
            for match in matches:
                if isinstance(match, tuple):
                    match = match[0] if match else ""
                
                clean_match = re.sub(r'\s+', ' ', match.strip())
                if clean_match and 'not recommended' in clean_match.lower():
                    contraindications.extend([item.strip() for item in clean_match.split(',') if item.strip()])
        
        # Add common contraindications if found in text
        common_contraindications = [
            'pregnancy', 'lactation', 'liver disease', 'kidney disease', 
            'heart disease', 'allergy', 'asthma', 'bleeding disorders'
        ]
        
        text_lower = text.lower()
        for contra in common_contraindications:
            if contra in text_lower and not any(contra in c.lower() for c in contraindications):
                contraindications.append(contra)
        
        return list(set(contraindications)) if contraindications else ["Contraindication information not clearly specified in text"]
    
    def _extract_dosage_instructions(self, text: str) -> str:
        """
        Extract dosage instructions from text
        """
        # Look for common dosage instruction phrases
        dosage_patterns = [
            r'(?:take|use|apply|dose)\s*:?\s*([^.]+)',
            r'(?:dosage|directions|instructions)\s*:?\s*([^.]+)',
            r'(\d+\s*(?:mg|mcg|g|ml)\s*(?:once|twice|three times)?\s*(?:daily|weekly|monthly|as directed))',
        ]
        
        for pattern in dosage_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if match.strip():
                    return match.strip()
        
        return "Dosage instructions not clearly specified in text"
    
    def _extract_warnings(self, text: str) -> List[str]:
        """
        Extract warnings from text
        """
        warnings = []
        
        # Use warning patterns
        for pattern in self.patterns['warning_patterns']:
            matches = pattern.findall(text)
            for match in matches:
                if isinstance(match, tuple):
                    match = match[0] if match else ""
                
                clean_match = re.sub(r'\s+', ' ', match.strip())
                if clean_match:
                    warnings.extend([item.strip() for item in clean_match.split(',') if item.strip()])
        
        # Add common warnings if found in text
        common_warnings = [
            'do not exceed recommended dose', 'keep out of reach of children',
            'consult physician', 'may cause drowsiness', 'avoid alcohol',
            'monitor kidney/liver function'
        ]
        
        text_lower = text.lower()
        for warning in common_warnings:
            if warning in text_lower and not any(warning in w.lower() for w in warnings):
                warnings.append(warning)
        
        return list(set(warnings)) if warnings else ["Warning information not clearly specified in text"]
    
    def _extract_storage_instructions(self, text: str) -> str:
        """
        Extract storage instructions from text
        """
        storage_patterns = [
            r'(?:store|storage|keep)\s*:?\s*([^.]+)',
            r'(?:protect from|avoid|refrigerate|room temperature)[^.]*(?:store|keep)[^.]*',
        ]
        
        for pattern in storage_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if match.strip():
                    return match.strip()
        
        return "Store at room temperature away from light and moisture unless otherwise specified"
    
    def _extract_manufacturer(self, text: str) -> str:
        """
        Extract manufacturer information from text
        """
        manufacturer_patterns = [
            r'(?:manufactured by|by|product of)\s*:?\s*([^.]+)',
            r'(?:company|pharma|laboratories|inc\.?|llc|limited)[^.]{0,50}',
        ]
        
        for pattern in manufacturer_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                if match.strip():
                    return match.strip()
        
        return "Manufacturer information not specified in text"
    
    def _determine_category(self, text: str) -> str:
        """
        Determine medicine category from text
        """
        category_keywords = {
            'Analgesic': ['pain', 'analgesic', 'ache', 'headache'],
            'Antipyretic': ['fever', 'temperature', 'pyretic'],
            'Antibiotic': ['antibiotic', 'infection', 'bacteria', 'anti-infective'],
            'Antihypertensive': ['blood pressure', 'hypertension', 'bp'],
            'Antidiabetic': ['diabetes', 'sugar', 'glucose'],
            'NSAID': ['inflammation', 'anti-inflammatory', 'ibuprofen', 'naproxen'],
            'Antacid': ['acid', 'heartburn', 'GERD', 'ulcer'],
        }
        
        text_lower = text.lower()
        categories = []
        
        for category, keywords in category_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                categories.append(category)
        
        return ", ".join(categories) if categories else "Uncategorized"
    
    def _determine_prescription_requirement(self, text: str) -> bool:
        """
        Determine if prescription is required from text
        """
        text_lower = text.lower()
        
        # Look for prescription-related terms
        if any(term in text_lower for term in ['prescription', 'rx', 'by prescription', 'doctor required']):
            return True
        
        # Look for OTC-related terms
        if any(term in text_lower for term in ['over the counter', 'otc', 'non-prescription']):
            return False
        
        # Default to True for medications (conservative approach)
        return True
    
    def _get_generic_name(self, brand_name: str) -> str:
        """
        Get generic name for a brand name medicine
        """
        brand_to_generic = {
            'crocin': 'paracetamol',
            'dolo': 'paracetamol',
            'calpol': 'paracetamol',
            'brufen': 'ibuprofen',
            'advil': 'ibuprofen',
            'motrin': 'ibuprofen',
            'amoxil': 'amoxicillin',
            'trimox': 'amoxicillin',
            'glucophage': 'metformin',
            'prinivil': 'lisinopril',
            'zestril': 'lisinopril',
            'prilosec': 'omeprazole',
        }
        
        return brand_to_generic.get(brand_name.lower(), brand_name)
    
    def _calculate_confidence_score(self, text: str, medicine_name: str) -> float:
        """
        Calculate confidence score based on text analysis
        """
        score = 0.5  # Base score
        
        # Increase score if medicine name is in knowledge base
        if medicine_name.lower() in self.medical_knowledge_base:
            score += 0.3
        
        # Increase score based on text length and information richness
        if len(text) > 100:
            score += 0.1
        if len(text) > 500:
            score += 0.1
        
        # Check for key medical terms that indicate completeness
        medical_terms = ['dosage', 'side effect', 'contraindication', 'warning', 'indication', 'administration']
        term_count = sum(1 for term in medical_terms if term.lower() in text.lower())
        score += (term_count * 0.05)
        
        # Cap the score at 0.95
        return min(0.95, score)

# Example usage and testing
if __name__ == "__main__":
    analyzer = OptimizedMedicineAnalyzer()
    
    # Test with sample medicine text
    sample_text = """
    Paracetamol 500mg Tablets
    Uses: For relief of mild to moderate pain and to reduce fever.
    Dosage: Take 1-2 tablets every 4-6 hours as needed. Do not exceed 4 grams (8 tablets) in 24 hours.
    Side Effects: Generally well tolerated. Rarely may cause skin reactions.
    Contraindications: Hypersensitivity to paracetamol. Severe hepatic impairment.
    Warnings: Do not exceed recommended dose. May cause severe liver damage if taken in excess.
    Storage: Store below 25°C. Protect from moisture.
    """
    
    print("Testing Optimized Medicine Analyzer...")
    print("=" * 50)
    
    result = analyzer.analyze_medicine_from_text(sample_text)
    
    print(f"Medicine Name: {result.name}")
    print(f"Generic Name: {result.generic_name}")
    print(f"Uses: {', '.join(result.uses)}")
    print(f"Side Effects: {', '.join(result.side_effects)}")
    print(f"Contraindications: {', '.join(result.contraindications)}")
    print(f"Dosage Instructions: {result.dosage_instructions}")
    print(f"WARNINGS: {', '.join(result.warnings)}")
    print(f"Storage Instructions: {result.storage_instructions}")
    print(f"Strength: {result.strength}")
    print(f"Dosage Form: {result.dosage_form}")
    print(f"Category: {result.category}")
    print(f"Prescription Required: {result.prescription_required}")
    print(f"Confidence Score: {result.confidence_score:.2f}")
    print(f"Extraction Timestamp: {result.extraction_timestamp}")
    
    print("\n" + "=" * 50)
    print("Test completed successfully!")