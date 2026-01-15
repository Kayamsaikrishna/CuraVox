"""
AI/ML Engine Entry Point
Main module for the medical AI system
"""

from .medical_ai_core import MedicalAICore, MedicalAnalysisResult
from .inference.optimized_medicine_analyzer import OptimizedMedicineAnalyzer, MedicineInfo
from .local_llm_integration import LocalMedicalLLM, LLMResponse
from .medical_agents import MedicalAgentOrchestrator, PatientContext, MedicalAgentResponse
from .caching_system import cache_manager, cache_memoize

# Create main instances
ai_core = MedicalAICore()

# Export main classes and functions
__all__ = [
    'ai_core',
    'MedicalAICore',
    'OptimizedMedicineAnalyzer', 
    'LocalMedicalLLM',
    'MedicalAgentOrchestrator',
    'PatientContext',
    'MedicalAnalysisResult',
    'MedicineInfo',
    'LLMResponse',
    'cache_manager'
]

def get_ai_core():
    """Get the main AI core instance"""
    return ai_core

def analyze_patient_case(patient_id: str, symptoms: list, patient_context: PatientContext):
    """Convenience function to analyze a patient case"""
    import asyncio
    return asyncio.run(ai_core.analyze_patient_case(patient_id, symptoms, patient_context))

def analyze_medicine_from_text(text: str):
    """Convenience function to analyze medicine from text"""
    return ai_core.analyze_medicine_from_text(text)

def get_medical_advice(query: str, patient_context: PatientContext = None):
    """Convenience function to get medical advice"""
    return ai_core.get_medical_advice(query, patient_context)