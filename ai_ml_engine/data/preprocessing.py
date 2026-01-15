"""
Data preprocessing module for medical AI application
Handles cleaning, normalization, and preparation of medical text data
"""

import re
import string
import pandas as pd
import numpy as np
from typing import List, Dict, Tuple, Union
from sklearn.model_selection import train_test_split
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
import logging

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet')

class MedicalDataPreprocessor:
    """
    Class for preprocessing medical text data
    """
    
    def __init__(self):
        self.stop_words = set(stopwords.words('english'))
        self.lemmatizer = WordNetLemmatizer()
        self.medical_stopwords = self._get_medical_stopwords()
        
    def _get_medical_stopwords(self) -> set:
        """
        Define medical-specific stopwords that should be preserved
        """
        # These are medical terms that might be important to preserve
        medical_terms = {
            'mg', 'ml', 'mcg', 'g', 'iu', '%',  # Units
            'tab', 'caps', 'syr', 'inj', 'sol', 'cre', 'oint',  # Forms
            'bid', 'tid', 'qid', 'qd', 'hs', 'ac', 'pc', 'prn',  # Frequency
            'po', 'iv', 'im', 'sc', 'top',  # Routes
            'ad', 'au', 'od', 'os',  # Eyes/ears
            'yrs', 'yr', 'mo', 'wk', 'day', 'hr', 'min',  # Time
            'pt', 'sig', 'disp', 'refill',  # Prescription terms
        }
        
        # Remove medical terms from general stopwords
        return self.stop_words - medical_terms
    
    def clean_text(self, text: str) -> str:
        """
        Clean medical text by removing noise and standardizing format
        
        Args:
            text (str): Raw medical text
            
        Returns:
            str: Cleaned text
        """
        if not isinstance(text, str):
            return ""
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep important medical symbols
        # Preserve: numbers, letters, spaces, periods, commas, hyphens, parentheses
        text = re.sub(r'[^\w\s.,()%-]', ' ', text)
        
        # Standardize common medical abbreviations
        text = self._standardize_medical_abbreviations(text)
        
        # Remove extra whitespace again after replacements
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def _standardize_medical_abbreviations(self, text: str) -> str:
        """
        Standardize common medical abbreviations
        
        Args:
            text (str): Text to standardize
            
        Returns:
            str: Text with standardized abbreviations
        """
        abbreviations = {
            r'\btab\.?\b': 'tablet',
            r'\bcaps?\.?\b': 'capsule',
            r'\bsyp\.?\b': 'syrup',
            r'\bsyr\.?\b': 'syrup',
            r'\binj\.?\b': 'injection',
            r'\bsol\.?\b': 'solution',
            r'\bcre\.?\b': 'cream',
            r'\boint\.?\b': 'ointment',
            r'\bbid\.?\b': 'twice daily',
            r'\btid\.?\b': 'three times daily',
            r'\bqid\.?\b': 'four times daily',
            r'\bqd\.?\b': 'once daily',
            r'\bhs\.?\b': 'at bedtime',
            r'\bac\.?\b': 'before meals',
            r'\bpc\.?\b': 'after meals',
            r'\bprn\.?\b': 'as needed',
            r'\bpo\.?\b': 'orally',
            r'\biv\.?\b': 'intravenous',
            r'\bim\.?\b': 'intramuscular',
            r'\bsc\.?\b': 'subcutaneous',
            r'\btop\.?\b': 'topical',
            r'\bad\.?\b': 'right ear',
            r'\bau\.?\b': 'both ears',
            r'\bod\.?\b': 'right eye',
            r'\bos\.?\b': 'left eye',
        }
        
        for pattern, replacement in abbreviations.items():
            text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
        
        return text
    
    def tokenize_and_filter(self, text: str) -> List[str]:
        """
        Tokenize text and filter out stopwords
        
        Args:
            text (str): Text to tokenize
            
        Returns:
            List[str]: Filtered tokens
        """
        if not text:
            return []
        
        # Tokenize
        tokens = word_tokenize(text)
        
        # Filter out stopwords and non-alphabetic tokens (except medical terms)
        filtered_tokens = []
        for token in tokens:
            # Keep medical units and forms
            if token in self.medical_stopwords or token in ['mg', 'ml', 'tab', 'caps', 'bid', 'tid', 'qd']:
                filtered_tokens.append(token)
            elif token.isalpha() and token not in self.medical_stopwords:
                # Lemmatize and add
                lemmatized = self.lemmatizer.lemmatize(token)
                filtered_tokens.append(lemmatized)
            elif token.isdigit() or re.match(r'\d+\.?\d*', token):
                # Keep numbers (dosages)
                filtered_tokens.append(token)
        
        return filtered_tokens
    
    def preprocess_medicine_text(self, text: str) -> str:
        """
        Complete preprocessing pipeline for medicine text
        
        Args:
            text (str): Raw medicine text
            
        Returns:
            str: Preprocessed text
        """
        # Clean the text
        cleaned_text = self.clean_text(text)
        
        # Tokenize and filter
        tokens = self.tokenize_and_filter(cleaned_text)
        
        # Join back to string
        processed_text = ' '.join(tokens)
        
        return processed_text
    
    def preprocess_dataset(self, texts: List[str], labels: List[str] = None) -> Union[List[str], Tuple[List[str], List[str]]]:
        """
        Preprocess a list of texts (and optionally labels)
        
        Args:
            texts (List[str]): List of texts to preprocess
            labels (List[str], optional): List of labels to preprocess
            
        Returns:
            Union[List[str], Tuple[List[str], List[str]]]: Preprocessed texts and optionally labels
        """
        processed_texts = [self.preprocess_medicine_text(text) for text in texts]
        
        if labels is not None:
            processed_labels = [self.clean_text(label) for label in labels]
            return processed_texts, processed_labels
        
        return processed_texts
    
    def create_ner_training_data(self, raw_texts: List[str]) -> List[Tuple[str, Dict[str, List[Tuple[int, int, str]]]]]:
        """
        Create training data for Named Entity Recognition
        
        Args:
            raw_texts (List[str]): List of raw medical texts
            
        Returns:
            List[Tuple[str, Dict[str, List[Tuple[int, int, str]]]]]: Training data in spaCy format
        """
        training_data = []
        
        for text in raw_texts:
            # Find entities in the text
            entities = self._find_medical_entities(text)
            training_data.append((text, {"entities": entities}))
        
        return training_data
    
    def _find_medical_entities(self, text: str) -> List[Tuple[int, int, str]]:
        """
        Find medical entities in text (simplified version)
        
        Args:
            text (str): Input text
            
        Returns:
            List[Tuple[int, int, str]]: List of (start, end, label) tuples
        """
        entities = []
        
        # Define patterns for different medical entities
        patterns = {
            'DRUG': [
                r'\b[A-Z][a-z]+\b',  # Capitalized drug names
            ],
            'STRENGTH': [
                r'\b\d+(?:\.\d+)?\s*(?:mg|ml|mcg|g|iu|%)\b',  # Dosages
            ],
            'FORM': [
                r'\b(?:tablet|capsule|syrup|injection|solution|cream|ointment|drops|spray|inhaler|patch|lozenge|powder|gel)\b',
            ],
            'DOSAGE': [
                r'\b(?:once|twice|three times|four times)\s+(?:daily|a day|per day)\b',
                r'\bevery\s+\d+\s+(?:hours|hrs)\b',
            ],
            'ROUTE': [
                r'\b(?:orally|intravenous|intramuscular|subcutaneous|topical|rectal|vaginal)\b',
            ]
        }
        
        for label, regex_list in patterns.items():
            for regex in regex_list:
                for match in re.finditer(regex, text, re.IGNORECASE):
                    entities.append((match.start(), match.end(), label))
        
        # Sort by start position and remove overlaps
        entities = sorted(entities, key=lambda x: x[0])
        non_overlapping = []
        last_end = -1
        
        for start, end, label in entities:
            if start >= last_end:
                non_overlapping.append((start, end, label))
                last_end = end
        
        return non_overlapping

def load_medical_corpus(file_path: str) -> List[str]:
    """
    Load medical text corpus from file
    
    Args:
        file_path (str): Path to the corpus file
        
    Returns:
        List[str]: List of medical texts
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            texts = file.readlines()
            # Clean up the texts
            texts = [text.strip() for text in texts if text.strip()]
            return texts
    except FileNotFoundError:
        logging.warning(f"File {file_path} not found. Returning empty list.")
        return []
    except Exception as e:
        logging.error(f"Error loading corpus: {e}")
        return []

def split_medical_data(texts: List[str], labels: List[str] = None, test_size: float = 0.2, random_state: int = 42):
    """
    Split medical data into train and test sets
    
    Args:
        texts (List[str]): List of texts
        labels (List[str], optional): List of labels
        test_size (float): Proportion of test set
        random_state (int): Random state for reproducibility
        
    Returns:
        Tuple: Train and test splits
    """
    if labels is not None:
        return train_test_split(texts, labels, test_size=test_size, random_state=random_state)
    else:
        return train_test_split(texts, test_size=test_size, random_state=random_state)

# Example usage
if __name__ == "__main__":
    preprocessor = MedicalDataPreprocessor()
    
    # Sample medical texts
    sample_texts = [
        "Paracetamol 500mg tablets for pain relief. Take 1-2 tabs every 4-6 hours.",
        "Amoxicillin 250mg capsules. Take 3 times daily for 7 days.",
        "Omeprazole 20mg tablets. Take once daily before meals."
    ]
    
    # Preprocess the texts
    processed_texts = preprocessor.preprocess_dataset(sample_texts)
    
    for original, processed in zip(sample_texts, processed_texts):
        print(f"Original: {original}")
        print(f"Processed: {processed}")
        print("-" * 50)
    
    # Create NER training data
    ner_training_data = preprocessor.create_ner_training_data(sample_texts)
    print(f"Created {len(ner_training_data)} NER training examples")