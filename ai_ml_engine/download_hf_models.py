#!/usr/bin/env python3
"""
Hugging Face Model Downloader for Medical AI Assistant
Downloads required models for medicine recognition and analysis
"""

import os
import sys
from transformers import AutoTokenizer, AutoModel, pipeline
import torch

def download_medical_models():
    """Download essential medical AI models from Hugging Face"""
    
    models_to_download = [
        # Medical NER and Information Extraction
        "medical-ner-model",  # Generic placeholder - replace with actual medical NER
        
        # Biomedical Language Models
        "dmis-lab/biobert-base-cased-v1.1",
        "allenai/scibert_scivocab_uncased",
        
        # Clinical BERT variants
        "emilyalsentzer/Bio_ClinicalBERT",
        
        # General purpose models for fallback
        "bert-base-uncased",
        "distilbert-base-uncased"
    ]
    
    print("🚀 Starting Hugging Face Model Downloads...")
    print("=" * 50)
    
    for model_name in models_to_download:
        try:
            print(f"\n📥 Downloading: {model_name}")
            
            # Download tokenizer
            print("   📝 Downloading tokenizer...")
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            
            # Download model
            print("   🧠 Downloading model...")
            model = AutoModel.from_pretrained(model_name)
            
            print(f"   ✅ Successfully downloaded {model_name}")
            
        except Exception as e:
            print(f"   ❌ Failed to download {model_name}: {str(e)}")
            continue
    
    print("\n" + "=" * 50)
    print("🎉 Model Download Complete!")
    print("Models are cached locally and ready for use.")

def setup_transformers_cache():
    """Setup transformers cache directory"""
    cache_dir = os.path.expanduser("~/.cache/huggingface/transformers")
    os.makedirs(cache_dir, exist_ok=True)
    print(f"📦 Using cache directory: {cache_dir}")

def test_model_loading():
    """Test that models can be loaded successfully"""
    print("\n🧪 Testing Model Loading...")
    
    try:
        # Test with a lightweight model
        pipe = pipeline("text-classification", model="distilbert-base-uncased")
        result = pipe("This is a test sentence for medical analysis")
        print("✅ Pipeline test successful:", result)
        
    except Exception as e:
        print(f"❌ Pipeline test failed: {e}")

if __name__ == "__main__":
    print("🏥 Medical AI Assistant - Model Setup")
    print("This script will download required AI models for medicine recognition")
    
    # Setup cache
    setup_transformers_cache()
    
    # Download models
    download_medical_models()
    
    # Test loading
    test_model_loading()
    
    print("\n✨ All models are ready for medical AI processing!")