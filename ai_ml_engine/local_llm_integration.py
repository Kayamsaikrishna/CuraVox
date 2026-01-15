"""
Local LLM Integration Module
Integrates with local LLM (Ollama) for medical knowledge processing
"""

import time
import requests
from typing import Dict, List, Optional
from dataclasses import dataclass
import json

@dataclass
class LLMResponse:
    """Data class for LLM response"""
    response: str
    confidence: float
    processing_time: float
    model_used: str
    tokens_used: int

class LocalMedicalLLM:
    """
    Local Large Language Model integration for medical knowledge
    Uses Ollama for privacy-preserving, offline medical information processing
    """
    
    def __init__(self, host: str = "http://localhost:11434"):
        """
        Initialize the local LLM integration
        
        Args:
            host: Host URL for Ollama server (default: http://localhost:11434)
        """
        self.host = host
        self.timeout = 30  # Timeout for LLM requests
        
        # Test connection and select best model
        self.connected = self.check_connection()
        self.model = self._select_best_model() if self.connected else "llama2-medical"
        
    def _select_best_model(self) -> str:
        """Dynamically select the best available model from Ollama"""
        try:
            available_models = self.list_available_models()
            print(f"Found available models: {available_models}")
            
            # Priority list of models to use
            priority_models = [
                "llama2-medical",
                "medllama2",
                "llama3.2:latest",
                "llama3.2",
                "llama3.1:latest",
                "llama3.1",
                "mistral:latest",
                "mistral",
                "llama2:7b",
                "llama2",
                "phi3:latest"
            ]
            
            for model in priority_models:
                if model in available_models:
                    print(f"Selected model: {model}")
                    return model
            
            # If none of the priority models are found, pick the first available one
            if available_models:
                print(f"No priority model found. Defaulting to: {available_models[0]}")
                return available_models[0]
                
        except Exception as e:
            print(f"Error selecting model: {e}")
            
        return "llama2-medical"  # Fallback
        
    def check_connection(self) -> bool:
        """
        Check if the local LLM server is accessible
        
        Returns:
            bool: True if connection successful, False otherwise
        """
        try:
            response = requests.get(f"{self.host}/api/tags", timeout=5)
            return response.status_code == 200
        except Exception:
            return False
    
    def generate_medical_response(self, prompt: str, context: str = "") -> LLMResponse:
        """
        Generate a medical response using the local LLM
        
        Args:
            prompt: The medical question or prompt
            context: Additional context for the query
            
        Returns:
            LLMResponse: Structured response from the LLM
        """
        start_time = time.time()
        
        # Construct the full prompt with medical context
        full_prompt = f"""
        You are an expert medical AI assistant. Provide accurate, evidence-based medical information.
        Be concise but thorough in your responses. If the query involves potential emergencies,
        clearly indicate this and recommend seeking immediate medical attention.
        
        Context: {context}
        
        Question: {prompt}
        
        Response:
        """
        
        if not self.connected:
            # Return a fallback response if LLM is not available
            return LLMResponse(
                response="Local medical AI is not available. Please consult with a healthcare professional for medical advice.",
                confidence=0.0,
                processing_time=time.time() - start_time,
                model_used="offline_fallback",
                tokens_used=0
            )
        
        try:
            # Make request to local Ollama server
            response = requests.post(
                f"{self.host}/api/generate",
                json={
                    "model": self.model,
                    "prompt": full_prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.3,  # Lower temperature for more factual responses
                        "top_p": 0.9,
                        "max_tokens": 500
                    }
                },
                timeout=self.timeout
            )
            
            if response.status_code == 200:
                result = response.json()
                processing_time = time.time() - start_time
                
                # Estimate token count (rough approximation)
                tokens_used = len(result.get("response", "").split())
                
                # Calculate confidence based on response quality metrics
                confidence = self._calculate_confidence(result, processing_time)
                
                return LLMResponse(
                    response=result.get("response", ""),
                    confidence=confidence,
                    processing_time=processing_time,
                    model_used=result.get("model", self.model),
                    tokens_used=tokens_used
                )
            else:
                # Handle error response
                error_msg = f"LLM request failed with status {response.status_code}"
                return LLMResponse(
                    response=f"Error: {error_msg}. Please consult with a healthcare professional.",
                    confidence=0.1,
                    processing_time=time.time() - start_time,
                    model_used=self.model,
                    tokens_used=0
                )
                
        except requests.exceptions.ConnectionError:
            # Handle connection error
            return LLMResponse(
                response="Connection to local medical AI failed. Please ensure Ollama is running and try again.",
                confidence=0.0,
                processing_time=time.time() - start_time,
                model_used="connection_error",
                tokens_used=0
            )
        except Exception as e:
            # Handle other exceptions
            return LLMResponse(
                response=f"An error occurred while processing your request: {str(e)}. Please consult with a healthcare professional.",
                confidence=0.0,
                processing_time=time.time() - start_time,
                model_used="error",
                tokens_used=0
            )
    
    def _calculate_confidence(self, result: Dict, processing_time: float) -> float:
        """
        Calculate confidence score based on response metrics
        
        Args:
            result: Raw response from LLM
            processing_time: Time taken to process the request
            
        Returns:
            float: Confidence score between 0 and 1
        """
        # Base confidence on response length and processing time
        response_length = len(result.get("response", ""))
        
        # Longer, more detailed responses generally indicate higher confidence
        length_factor = min(response_length / 1000, 0.8)  # Cap at 0.8
        
        # Very fast responses might indicate the model didn't think deeply enough
        # Very slow responses might indicate issues
        if processing_time < 1:
            time_factor = 0.5
        elif processing_time > 10:
            time_factor = 0.3
        else:
            # Optimal response time around 3-5 seconds
            time_factor = 0.7 - abs(processing_time - 4) * 0.05
        
        # Combine factors
        confidence = (length_factor * 0.7) + (time_factor * 0.3)
        
        # Ensure confidence is between 0.1 and 0.95
        return max(0.1, min(0.95, confidence))
    
    def check_model_availability(self, model_name: str = None) -> bool:
        """
        Check if a specific model is available on the local server
        
        Args:
            model_name: Name of the model to check (defaults to self.model)
            
        Returns:
            bool: True if model is available, False otherwise
        """
        model_to_check = model_name or self.model
        
        try:
            response = requests.get(f"{self.host}/api/tags", timeout=5)
            if response.status_code == 200:
                models_data = response.json()
                available_models = [model['name'] for model in models_data.get('models', [])]
                return model_to_check in available_models
            return False
        except Exception:
            return False
    
    def list_available_models(self) -> List[str]:
        """
        List all available models on the local server
        
        Returns:
            List[str]: List of available model names
        """
        try:
            response = requests.get(f"{self.host}/api/tags", timeout=5)
            if response.status_code == 200:
                models_data = response.json()
                return [model['name'] for model in models_data.get('models', [])]
            return []
        except Exception:
            return []
    
    def generate_medical_summary(self, medical_text: str) -> LLMResponse:
        """
        Generate a medical summary of provided text
        
        Args:
            medical_text: Text to summarize (symptoms, conditions, etc.)
            
        Returns:
            LLMResponse: Summary of the medical text
        """
        prompt = f"""
        Please provide a clear, concise summary of the following medical information:
        
        {medical_text}
        
        Include key points about symptoms, conditions, treatments, or medications mentioned.
        Focus on the most important medical aspects.
        
        Summary:
        """
        
        return self.generate_medical_response(prompt)
    
    def analyze_drug_interactions(self, drugs: List[str]) -> LLMResponse:
        """
        Analyze potential interactions between multiple drugs
        
        Args:
            drugs: List of drug names to check for interactions
            
        Returns:
            LLMResponse: Analysis of potential drug interactions
        """
        if len(drugs) < 2:
            return LLMResponse(
                response="Need at least two drugs to analyze interactions.",
                confidence=0.0,
                processing_time=0.0,
                model_used="insufficient_data",
                tokens_used=0
            )
        
        prompt = f"""
        Analyze potential interactions between the following medications:
        {', '.join(drugs)}
        
        Describe the nature of the interactions, severity level, and any precautions patients should take.
        If no significant interactions are expected, please state this clearly.
        
        Interaction Analysis:
        """
        
        return self.generate_medical_response(prompt)
    
    def provide_health_advice(self, condition: str, patient_context: str = "") -> LLMResponse:
        """
        Provide health advice for a specific condition
        
        Args:
            condition: Medical condition to provide advice for
            patient_context: Additional context about the patient (age, medical history, etc.)
            
        Returns:
            LLMResponse: Health advice for the condition
        """
        context_part = f"Patient context: {patient_context}" if patient_context else ""
        
        prompt = f"""
        Provide evidence-based health advice for someone with {condition}.
        {context_part}
        
        Include information about management, lifestyle considerations, when to seek medical attention,
        and general care recommendations. Emphasize that this is general information and not a substitute
        for professional medical advice.
        
        Health Advice:
        """
        
        return self.generate_medical_response(prompt)

# Example usage
if __name__ == "__main__":
    # Initialize the local LLM
    llm = LocalMedicalLLM()
    
    print("Local Medical LLM Integration Test")
    print(f"Connected: {llm.connected}")
    
    if llm.connected:
        # Test basic functionality
        response = llm.generate_medical_response("What are the symptoms of diabetes?")
        print(f"\nResponse: {response.response}")
        print(f"Confidence: {response.confidence:.2f}")
        print(f"Processing Time: {response.processing_time:.2f}s")
        
        # Test drug interaction analysis
        interaction_response = llm.analyze_drug_interactions(["Warfarin", "Aspirin"])
        print(f"\nDrug Interaction Analysis: {interaction_response.response}")
        
        # Test health advice
        advice_response = llm.provide_health_advice("hypertension", "50-year-old male")
        print(f"\nHealth Advice: {advice_response.response[:200]}...")
    else:
        print("\nLocal LLM not available. Please ensure Ollama is installed and running.")
        print("Install Ollama from: https://ollama.ai")
        print("Then pull a medical model: ollama pull llama2-medical")