"""
Comprehensive Medical AI Agent Framework
Multi-specialty medical agent system with specialized expertise across medical domains
"""

import asyncio
import json
import time
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
from enum import Enum
import logging
from abc import ABC, abstractmethod

class MedicalSpecialty(Enum):
    GENERAL_PRACTICE = "general_practice"
    CARDIOLOGY = "cardiology"
    NEUROLOGY = "neurology"
    PEDIATRICS = "pediatrics"
    ONCOLOGY = "oncology"
    ENDOCRINOLOGY = "endocrinology"
    GASTROENTEROLOGY = "gastroenterology"
    DERMATOLOGY = "dermatology"
    PULMONOLOGY = "pulmonology"
    ORTHOPEDICS = "orthopedics"
    PSYCHIATRY = "psychiatry"
    UROLOGY = "urology"
    OPHTHALMOLOGY = "ophthalmology"
    OTOLARYNGOLOGY = "otolaryngology"
    RHEUMATOLOGY = "rheumatology"
    INFECTIOUS_DISEASES = "infectious_diseases"
    EMERGENCY_MEDICINE = "emergency_medicine"
    FAMILY_MEDICINE = "family_medicine"

@dataclass
class MedicalAgentResponse:
    """Response from a medical agent"""
    specialty: MedicalSpecialty
    response: str
    confidence: float
    reasoning_steps: List[str]
    recommendations: List[str]
    required_followup: List[str]
    processing_time: float

@dataclass
class PatientContext:
    """Context about the patient for personalized care"""
    patient_id: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    weight: Optional[float] = None
    height: Optional[float] = None
    medical_history: List[str] = None
    current_medications: List[str] = None
    allergies: List[str] = None
    symptoms_duration: Optional[str] = None
    chief_complaint: Optional[str] = None
    
    def __post_init__(self):
        if self.medical_history is None:
            self.medical_history = []
        if self.current_medications is None:
            self.current_medications = []
        if self.allergies is None:
            self.allergies = []

class MedicalAgent(ABC):
    """Abstract base class for medical agents"""
    
    def __init__(self, specialty: MedicalSpecialty, name: str):
        self.specialty = specialty
        self.name = name
        self.knowledge_base = self._load_knowledge_base()
        self.patient_context = None
        
    @abstractmethod
    def diagnose(self, symptoms: List[str], context: PatientContext) -> MedicalAgentResponse:
        """Diagnose based on symptoms and patient context"""
        pass
    
    @abstractmethod
    def provide_treatment_recommendation(self, diagnosis: str, context: PatientContext) -> MedicalAgentResponse:
        """Provide treatment recommendations"""
        pass
    
    @abstractmethod
    def handle_emergency(self, emergency_signs: List[str], context: PatientContext) -> MedicalAgentResponse:
        """Handle emergency situations"""
        pass
    
    def _load_knowledge_base(self) -> Dict:
        """Load medical knowledge base for this specialty"""
        # This would normally load from a comprehensive medical database
        return {}
    
    def calculate_confidence(self, evidence_strength: int, knowledge_completeness: int) -> float:
        """Calculate confidence based on evidence and knowledge"""
        return min(1.0, (evidence_strength * knowledge_completeness) / 100.0)

class GeneralPracticeAgent(MedicalAgent):
    """General practice agent for primary care and referrals"""
    
    def __init__(self):
        super().__init__(MedicalSpecialty.GENERAL_PRACTICE, "Dr. GP")
        self.referral_threshold = 0.7  # Confidence threshold for specialist referral
    
    def diagnose(self, symptoms: List[str], context: PatientContext) -> MedicalAgentResponse:
        start_time = time.time()
        
        # Analyze symptoms and determine if specialist referral is needed
        common_conditions = [
            "cold", "flu", "headache", "muscle pain", "minor cuts", 
            "basic hypertension", "mild allergy", "digestive issues"
        ]
        
        urgent_symptoms = [
            "chest pain", "difficulty breathing", "severe headache", 
            "loss of consciousness", "severe abdominal pain", "stroke symptoms"
        ]
        
        # Check for urgent symptoms requiring immediate attention
        urgent_present = any(symptom.lower() in ' '.join(symptoms).lower() for symptom in urgent_symptoms)
        
        if urgent_present:
            response = "⚠️ This appears to be a medical emergency. Please seek immediate medical attention or call emergency services."
            confidence = 1.0
            recommendations = ["Seek emergency care immediately"]
            required_followup = ["Emergency medical evaluation"]
        else:
            # Determine if referral to specialist is needed
            needs_referral = self._assess_referral_needed(symptoms, context)
            
            if needs_referral:
                response = f"Based on the symptoms, I recommend referral to a specialist. Possible specialties: {self._suggest_specialties(symptoms)}"
                confidence = 0.8
                recommendations = [f"Refer to: {self._suggest_specialties(symptoms)}"]
                required_followup = ["Specialist consultation"]
            else:
                response = f"Based on the symptoms {', '.join(symptoms)}, this may be consistent with common conditions. Conservative management may be appropriate."
                confidence = 0.6
                recommendations = ["Monitor symptoms", "Over-the-counter remedies if appropriate", "Follow-up if symptoms persist"]
                required_followup = ["Symptom monitoring"]
        
        reasoning_steps = [
            f"Analyzed {len(symptoms)} symptoms",
            "Assessed for emergency indicators",
            "Evaluated need for specialist referral"
        ]
        
        processing_time = time.time() - start_time
        
        return MedicalAgentResponse(
            specialty=self.specialty,
            response=response,
            confidence=confidence,
            reasoning_steps=reasoning_steps,
            recommendations=recommendations,
            required_followup=required_followup,
            processing_time=processing_time
        )
    
    def _assess_referral_needed(self, symptoms: List[str], context: PatientContext) -> bool:
        """Determine if specialist referral is needed"""
        # Complex conditions requiring specialists
        complex_symptoms = [
            "chronic pain", "persistent fever", "unexplained weight loss",
            "vision changes", "hearing loss", "joint swelling", "skin lesions"
        ]
        
        return any(symptom.lower() in ' '.join(symptoms).lower() for symptom in complex_symptoms)
    
    def _suggest_specialties(self, symptoms: List[str]) -> str:
        """Suggest appropriate specialties based on symptoms"""
        symptom_specialty_map = {
            "chest pain": ["cardiology", "emergency_medicine"],
            "breathing difficulty": ["pulmonology", "emergency_medicine"],
            "vision problems": ["ophthalmology"],
            "ear pain": ["otolaryngology"],
            "skin rash": ["dermatology"],
            "joint pain": ["orthopedics", "rheumatology"],
            "mental health": ["psychiatry"],
            "urinary issues": ["urology"],
            "hormonal issues": ["endocrinology"]
        }
        
        suggested = set()
        for symptom in symptoms:
            for key, specialties in symptom_specialty_map.items():
                if key.lower() in symptom.lower():
                    suggested.update(specialties)
        
        return ", ".join(list(suggested)[:3]) if suggested else "various specialists"
    
    def provide_treatment_recommendation(self, diagnosis: str, context: PatientContext) -> MedicalAgentResponse:
        start_time = time.time()
        
        # General treatment recommendations
        if "infection" in diagnosis.lower():
            response = "Treatment may include antibiotics if bacterial, rest, hydration, and symptom management."
            recommendations = ["Antibiotics if bacterial", "Rest", "Hydration", "Symptom monitoring"]
        elif "hypertension" in diagnosis.lower():
            response = "Treatment includes lifestyle modifications and possibly antihypertensive medications."
            recommendations = ["Blood pressure monitoring", "Diet modification", "Exercise", "Medication if needed"]
        else:
            response = "Treatment depends on specific diagnosis. Conservative management with monitoring initially."
            recommendations = ["Conservative management", "Monitoring", "Follow-up as needed"]
        
        reasoning_steps = ["Assessed diagnosis type", "Selected appropriate treatment approach"]
        
        processing_time = time.time() - start_time
        
        return MedicalAgentResponse(
            specialty=self.specialty,
            response=response,
            confidence=0.7,
            reasoning_steps=reasoning_steps,
            recommendations=recommendations,
            required_followup=["Clinical follow-up"],
            processing_time=processing_time
        )
    
    def handle_emergency(self, emergency_signs: List[str], context: PatientContext) -> MedicalAgentResponse:
        start_time = time.time()
        
        response = "⚠️ EMERGENCY: Immediate medical attention required. Call emergency services or go to nearest emergency room."
        recommendations = ["Call 911 immediately", "Provide supportive care while waiting", "Monitor vital signs"]
        required_followup = ["Emergency medical evaluation"]
        
        processing_time = time.time() - start_time
        
        return MedicalAgentResponse(
            specialty=self.specialty,
            response=response,
            confidence=1.0,
            reasoning_steps=["Identified emergency situation", "Recommended immediate action"],
            recommendations=recommendations,
            required_followup=required_followup,
            processing_time=processing_time
        )

class CardiologyAgent(MedicalAgent):
    """Cardiology specialist agent"""
    
    def __init__(self):
        super().__init__(MedicalSpecialty.CARDIOLOGY, "Dr. Cardiologist")
        self.ecg_patterns = {
            "ST elevation": "possible MI",
            "ST depression": "ischemia",
            "Q waves": "prior MI",
            "atrial fibrillation": "AFib",
            "bradycardia": "slow heart rate",
            "tachycardia": "fast heart rate"
        }
    
    def diagnose(self, symptoms: List[str], context: PatientContext) -> MedicalAgentResponse:
        start_time = time.time()
        
        cardiac_symptoms = [
            "chest pain", "shortness of breath", "palpitations", 
            "fatigue", "dizziness", "swelling in legs"
        ]
        
        risk_factors = []
        if context.age and context.age > 45:
            risk_factors.append("age > 45")
        if context.gender and context.gender.lower() == "male":
            risk_factors.append("male gender")
        if "hypertension" in context.medical_history:
            risk_factors.append("hypertension")
        if "diabetes" in context.medical_history:
            risk_factors.append("diabetes")
        if "smoking" in context.medical_history:
            risk_factors.append("smoking history")
        
        # Assess cardiac symptoms
        cardiac_present = any(symptom.lower() in ' '.join([s.lower() for s in symptoms]).lower() 
                             for symptom in cardiac_symptoms)
        
        if cardiac_present:
            response = f"Cardiac evaluation warranted. Symptoms {' and '.join(symptoms)} in presence of risk factors: {', '.join(risk_factors) if risk_factors else 'none reported'}. Consider ECG and cardiac enzymes."
            confidence = 0.85
            recommendations = ["ECG", "Cardiac enzymes", "Echocardiogram if indicated", "Risk factor modification"]
            required_followup = ["Cardiology consultation", "Cardiac monitoring"]
        else:
            response = "Cardiac causes unlikely based on presented symptoms, but routine cardiovascular screening recommended given risk factors."
            confidence = 0.6
            recommendations = ["Routine cardiovascular screening", "Risk factor assessment"]
            required_followup = ["Annual cardiac checkup"]
        
        reasoning_steps = [
            "Assessed cardiac symptoms",
            f"Evaluated risk factors: {', '.join(risk_factors) if risk_factors else 'none'}",
            "Determined appropriate diagnostic approach"
        ]
        
        processing_time = time.time() - start_time
        
        return MedicalAgentResponse(
            specialty=self.specialty,
            response=response,
            confidence=confidence,
            reasoning_steps=reasoning_steps,
            recommendations=recommendations,
            required_followup=required_followup,
            processing_time=processing_time
        )
    
    def provide_treatment_recommendation(self, diagnosis: str, context: PatientContext) -> MedicalAgentResponse:
        start_time = time.time()
        
        if "myocardial infarction" in diagnosis.lower():
            response = "Immediate reperfusion therapy required. Dual antiplatelet therapy, anticoagulation, beta-blockers, ACE inhibitors, and statins."
            recommendations = [
                "Immediate reperfusion (PCI or thrombolysis)",
                "Dual antiplatelet therapy",
                "Anticoagulation",
                "Beta-blockers",
                "ACE inhibitors",
                "Statins"
            ]
            required_followup = ["CCU admission", "Serial cardiac enzymes", "Echocardiogram"]
            confidence = 0.95
        elif "heart failure" in diagnosis.lower():
            response = "Treatment includes diuretics, ACE inhibitors/ARBs, beta-blockers, aldosterone antagonists, and lifestyle modifications."
            recommendations = [
                "Diuretics for fluid management",
                "ACE inhibitors or ARBs",
                "Beta-blockers",
                "Aldosterone antagonists",
                "Sodium restriction",
                "Fluid monitoring"
            ]
            required_followup = ["Heart failure clinic", "Regular monitoring", "Medication titration"]
            confidence = 0.9
        elif "hypertension" in diagnosis.lower():
            response = "Treatment includes lifestyle modifications and pharmacological therapy with ACE inhibitors, ARBs, calcium channel blockers, or thiazide diuretics."
            recommendations = [
                "ACE inhibitors or ARBs",
                "Calcium channel blockers",
                "Thiazide diuretics",
                "Lifestyle modifications",
                "Regular BP monitoring"
            ]
            required_followup = ["BP monitoring", "Medication adherence", "Lifestyle counseling"]
            confidence = 0.85
        else:
            response = "Treatment depends on specific cardiac diagnosis. Standard cardiac rehabilitation and risk factor modification recommended."
            recommendations = ["Risk factor modification", "Cardiac rehabilitation", "Medication management"]
            required_followup = ["Cardiology follow-up", "Monitoring"]
            confidence = 0.7
        
        reasoning_steps = [
            "Identified specific cardiac diagnosis",
            "Selected evidence-based treatment regimen",
            "Considered patient-specific factors"
        ]
        
        processing_time = time.time() - start_time
        
        return MedicalAgentResponse(
            specialty=self.specialty,
            response=response,
            confidence=confidence,
            reasoning_steps=reasoning_steps,
            recommendations=recommendations,
            required_followup=required_followup,
            processing_time=processing_time
        )
    
    def handle_emergency(self, emergency_signs: List[str], context: PatientContext) -> MedicalAgentResponse:
        start_time = time.time()
        
        if any("chest pain" in sign.lower() for sign in emergency_signs):
            response = "⚠️ SUSPECTED ACUTE CORONARY SYNDROME: Administer aspirin 325mg chewed, nitroglycerin if BP permits, oxygen, and immediate transport to cardiac catheterization facility."
            recommendations = [
                "Aspirin 325mg chewed",
                "Nitroglycerin SL (if SBP >90mmHg)",
                "IV access",
                "Continuous ECG monitoring",
                "Oxygen if hypoxic",
                "Immediate cardiac catheterization facility"
            ]
        elif any("shortness of breath" in sign.lower() for sign in emergency_signs):
            response = "⚠️ CARDIAC EMERGENCY: Suspected acute heart failure or pulmonary edema. Administer oxygen, IV furosemide, nitroglycerin, and immediate evaluation."
            recommendations = [
                "High-flow oxygen",
                "IV furosemide",
                "Nitroglycerin",
                "Morphine if indicated",
                "Continuous monitoring",
                "ICU admission"
            ]
        else:
            response = "⚠️ CARDIAC EMERGENCY: Administer oxygen, establish IV access, continuous monitoring, and immediate cardiology consultation."
            recommendations = [
                "Oxygen administration",
                "IV access establishment",
                "Continuous ECG monitoring",
                "Immediate cardiology consultation",
                "Appropriate interventions based on rhythm"
            ]
        
        required_followup = ["Emergency cardiac intervention", "CCU admission", "Cardiology consultation"]
        
        processing_time = time.time() - start_time
        
        return MedicalAgentResponse(
            specialty=self.specialty,
            response=response,
            confidence=0.98,
            reasoning_steps=["Identified cardiac emergency", "Selected appropriate emergency interventions"],
            recommendations=recommendations,
            required_followup=required_followup,
            processing_time=processing_time
        )

class NeurologyAgent(MedicalAgent):
    """Neurology specialist agent"""
    
    def __init__(self):
        super().__init__(MedicalSpecialty.NEUROLOGY, "Dr. Neurologist")
        self.stroke_assessment_tools = ["FAST", "NIHSS"]
    
    def diagnose(self, symptoms: List[str], context: PatientContext) -> MedicalAgentResponse:
        start_time = time.time()
        
        neurological_symptoms = [
            "headache", "dizziness", "weakness", "numbness", "vision changes",
            "speech difficulties", "confusion", "seizures", "balance problems"
        ]
        
        stroke_symptoms = [
            "facial drooping", "arm weakness", "speech difficulty", 
            "sudden severe headache", "vision loss", "confusion"
        ]
        
        # Check for neurological symptoms
        neuro_present = any(symptom.lower() in ' '.join([s.lower() for s in symptoms]).lower() 
                           for symptom in neurological_symptoms)
        
        stroke_possible = any(symptom.lower() in ' '.join([s.lower() for s in symptoms]).lower() 
                             for symptom in stroke_symptoms)
        
        if stroke_possible:
            response = f"⚠️ POSSIBLE STROKE: Symptoms {' and '.join(symptoms)} warrant immediate evaluation. Time is brain - urgent CT head and neurology consultation needed."
            confidence = 0.95
            recommendations = ["Immediate CT head", "Neurology consultation", "Stroke protocol activation", "Time-sensitive interventions"]
            required_followup = ["Stroke team activation", "Thrombolytic evaluation if eligible", "Neuro ICU monitoring"]
        elif neuro_present:
            response = f"Neurological evaluation needed for symptoms: {', '.join(symptoms)}. Consider neuroimaging and EEG if seizure activity."
            confidence = 0.8
            recommendations = ["Neuroimaging (MRI/CT)", "EEG if seizure activity", "Neurology consultation", "Detailed neurological exam"]
            required_followup = ["Neurology follow-up", "Diagnostic testing", "Treatment based on findings"]
        else:
            response = "Neurological causes unlikely based on presented symptoms, but routine neurological screening may be appropriate."
            confidence = 0.5
            recommendations = ["Routine neurological screening if indicated", "Head injury evaluation if applicable"]
            required_followup = ["Neurological assessment if symptoms persist"]
        
        reasoning_steps = [
            "Assessed for neurological symptoms",
            "Evaluated for stroke indicators",
            "Determined appropriate diagnostic approach"
        ]
        
        processing_time = time.time() - start_time
        
        return MedicalAgentResponse(
            specialty=self.specialty,
            response=response,
            confidence=confidence,
            reasoning_steps=reasoning_steps,
            recommendations=recommendations,
            required_followup=required_followup,
            processing_time=processing_time
        )
    
    def provide_treatment_recommendation(self, diagnosis: str, context: PatientContext) -> MedicalAgentResponse:
        start_time = time.time()
        
        if "stroke" in diagnosis.lower():
            response = "Acute stroke management: IV alteplase if within 4.5 hours and no contraindications, mechanical thrombectomy if large vessel occlusion, antiplatelet therapy, blood pressure management, and stroke unit care."
            recommendations = [
                "IV alteplase (if eligible)",
                "Mechanical thrombectomy (if indicated)",
                "Antiplatelet therapy",
                "Blood pressure management",
                "Stroke unit care",
                "Early mobilization",
                "Swallow evaluation"
            ]
            required_followup = ["Stroke unit monitoring", "Rehabilitation", "Secondary prevention"]
            confidence = 0.95
        elif "epilepsy" in diagnosis.lower() or "seizure" in diagnosis.lower():
            response = "Treatment includes antiepileptic drugs such as levetiracetam, lamotrigine, or carbamazepine depending on seizure type, seizure precautions, and regular monitoring."
            recommendations = [
                "Antiepileptic drug therapy",
                "Seizure precautions",
                "Regular monitoring",
                "EEG follow-up",
                "Medication compliance",
                "Avoid seizure triggers"
            ]
            required_followup = ["Neurology follow-up", "Medication titration", "Seizure monitoring"]
            confidence = 0.9
        elif "migraine" in diagnosis.lower():
            response = "Treatment includes abortive therapy (triptans, NSAIDs), preventive therapy if frequent, lifestyle modifications, and trigger avoidance."
            recommendations = [
                "Abortive therapy (triptans, NSAIDs)",
                "Preventive therapy if >4/mo",
                "Lifestyle modifications",
                "Trigger identification and avoidance",
                "Regular sleep schedule"
            ]
            required_followup = ["Headache diary", "Medication effectiveness", "Prevention strategy"]
            confidence = 0.85
        else:
            response = "Treatment depends on specific neurological diagnosis. Symptom management and underlying cause treatment recommended."
            recommendations = ["Symptom management", "Cause-specific treatment", "Neurological monitoring"]
            required_followup = ["Neurology follow-up", "Monitoring", "Treatment adjustment"]
            confidence = 0.7
        
        reasoning_steps = [
            "Identified specific neurological diagnosis",
            "Selected evidence-based treatment approach",
            "Considered patient-specific factors"
        ]
        
        processing_time = time.time() - start_time
        
        return MedicalAgentResponse(
            specialty=self.specialty,
            response=response,
            confidence=confidence,
            reasoning_steps=reasoning_steps,
            recommendations=recommendations,
            required_followup=required_followup,
            processing_time=processing_time
        )
    
    def handle_emergency(self, emergency_signs: List[str], context: PatientContext) -> MedicalAgentResponse:
        start_time = time.time()
        
        if any("seizure" in sign.lower() for sign in emergency_signs):
            response = "⚠️ STATUS EPILEPTICUS SUSPECTED: Administer benzodiazepines (lorazepam/diazepam), establish IV access, check glucose and electrolytes, and prepare for intubation if needed."
            recommendations = [
                "IV lorazepam 4mg or diazepam 10mg",
                "Establish IV access",
                "Check glucose, electrolytes, AED levels",
                "Prepare for airway management",
                "Continuous EEG monitoring",
                "ICU admission"
            ]
        elif any("weakness" in sign.lower() or "numbness" in sign.lower() for sign in emergency_signs):
            response = "⚠️ ACUTE STROKE PROTOCOL: Activate stroke team, CT head STAT, check glucose, establish IV access, and prepare for thrombolytic therapy if eligible."
            recommendations = [
                "Stroke team activation",
                "STAT CT head",
                "IV access",
                "Glucose check",
                "Coags and CBC",
                "EKG",
                "Time-stamped imaging"
            ]
        elif any("severe headache" in sign.lower() for sign in emergency_signs):
            response = "⚠️ THUNDERCLAP HEADACHE: Suspected subarachnoid hemorrhage. Immediate CT head, neurosurgical consultation, and nimodipine if SAH confirmed."
            recommendations = [
                "STAT CT head without contrast",
                "Neurosurgical consultation",
                "Nimodipine if SAH confirmed",
                "BP management",
                "Monitor for hydrocephalus",
                "Angiography if needed"
            ]
        else:
            response = "⚠️ NEUROLOGICAL EMERGENCY: Establish IV access, check vital signs, ensure airway patency, and obtain immediate neurological consultation."
            recommendations = [
                "IV access establishment",
                "Vital signs monitoring",
                "Airway assessment",
                "Immediate neurology consultation",
                "Neuroimaging planning",
                "Supportive care"
            ]
        
        required_followup = ["Emergency neurological intervention", "ICU monitoring", "Specialist consultation"]
        
        processing_time = time.time() - start_time
        
        return MedicalAgentResponse(
            specialty=self.specialty,
            response=response,
            confidence=0.95,
            reasoning_steps=["Identified neurological emergency", "Selected appropriate emergency protocols"],
            recommendations=recommendations,
            required_followup=required_followup,
            processing_time=processing_time
        )

class PediatricAgent(MedicalAgent):
    """Pediatric specialist agent"""
    
    def __init__(self):
        super().__init__(MedicalSpecialty.PEDIATRICS, "Dr. Pediatrician")
    
    def diagnose(self, symptoms: List[str], context: PatientContext) -> MedicalAgentResponse:
        start_time = time.time()
        
        if not context.age or context.age > 18:
            response = "Patient appears to be outside pediatric age range (0-18 years). Recommend adult medical evaluation."
            confidence = 0.9
            recommendations = ["Adult medical evaluation"]
            required_followup = ["Appropriate age-specific care"]
        else:
            pediatric_symptoms = [
                "fever", "cough", "runny nose", "ear pain", "sore throat",
                "abdominal pain", "vomiting", "diarrhea", "rash", "irritability"
            ]
            
            serious_pediatric_symptoms = [
                "difficulty breathing", "high fever", "dehydration signs", 
                "lethargy", "severe pain", "rash with fever"
            ]
            
            ped_present = any(symptom.lower() in ' '.join([s.lower() for s in symptoms]).lower() 
                             for symptom in pediatric_symptoms)
            
            serious_present = any(symptom.lower() in ' '.join([s.lower() for s in symptoms]).lower() 
                                 for symptom in serious_pediatric_symptoms)
            
            if serious_present:
                response = f"⚠️ SERIOUS PEDIATRIC CONDITION: Child age {context.age} with concerning symptoms {', '.join(symptoms)}. Immediate pediatric emergency evaluation required."
                confidence = 0.95
                recommendations = ["Immediate pediatric emergency care", "Vital signs assessment", "IV access if dehydrated"]
                required_followup = ["Emergency department", "Pediatric specialist consultation"]
            elif ped_present:
                response = f"Common pediatric symptoms in child age {context.age}: {', '.join(symptoms)}. Usually viral, supportive care appropriate."
                confidence = 0.75
                recommendations = ["Supportive care", "Adequate hydration", "Symptom monitoring", "Follow-up if worsening"]
                required_followup = ["Symptom monitoring", "Follow-up if persistent"]
            else:
                response = f"Unusual presentation for pediatric patient age {context.age}. Consider rare conditions or non-medical cause."
                confidence = 0.6
                recommendations = ["Comprehensive pediatric evaluation", "Consider psychogenic causes", "Family history review"]
                required_followup = ["Pediatric specialist consultation", "Comprehensive workup"]
        
        reasoning_steps = [
            f"Confirmed pediatric patient (age: {context.age})",
            "Assessed symptom seriousness",
            "Determined appropriate care level"
        ]
        
        processing_time = time.time() - start_time
        
        return MedicalAgentResponse(
            specialty=self.specialty,
            response=response,
            confidence=confidence,
            reasoning_steps=reasoning_steps,
            recommendations=recommendations,
            required_followup=required_followup,
            processing_time=processing_time
        )
    
    def provide_treatment_recommendation(self, diagnosis: str, context: PatientContext) -> MedicalAgentResponse:
        start_time = time.time()
        
        if "fever" in diagnosis.lower():
            weight_based_dosing = f"{10 * context.weight}mg" if context.weight else "age-appropriate dose"
            response = f"Treat fever with acetaminophen {weight_based_dosing} every 4-6 hours or ibuprofen if >6 months old. Monitor for concerning signs."
            recommendations = [
                f"Acetaminophen: {weight_based_dosing} PO q4-6h PRN",
                f"Ibuprofen: if child >6 months, appropriate weight-based dosing",
                "Adequate fluid intake",
                "Fever monitoring",
                "Watch for concerning symptoms"
            ]
            required_followup = ["Fever resolution", "Symptom monitoring", "Follow-up if persistent"]
            confidence = 0.85
        elif "otitis media" in diagnosis.lower():
            response = "Treatment depends on age and severity. Antibiotics for severe cases or children <2 years. Pain management with acetaminophen/ibuprofen."
            recommendations = [
                "Antibiotics if severe or age <2 years (amoxicillin)",
                "Pain management with acetaminophen/ibuprofen",
                "Warm compress for comfort",
                "Follow-up in 48-72 hours"
            ]
            required_followup = ["Follow-up visit", "Antibiotic completion", "Hearing assessment if recurrent"]
            confidence = 0.8
        elif "asthma" in diagnosis.lower():
            response = "Asthma management includes bronchodilators, anti-inflammatory therapy, trigger avoidance, and asthma action plan."
            recommendations = [
                "Albuterol MDI or nebulizer PRN",
                "Inhaled corticosteroids for persistent asthma",
                "Asthma action plan",
                "Trigger identification and avoidance",
                "Peak flow monitoring if >5 years old"
            ]
            required_followup = ["Asthma specialist consultation", "Action plan review", "Medication technique"]
            confidence = 0.9
        else:
            response = "Treatment depends on specific pediatric diagnosis. Age and weight-appropriate dosing essential."
            recommendations = ["Age-appropriate care", "Weight-based dosing", "Parental counseling", "Follow-up as needed"]
            required_followup = ["Pediatric follow-up", "Growth monitoring", "Developmental assessment"]
            confidence = 0.7
        
        reasoning_steps = [
            "Considered pediatric-specific factors",
            "Calculated appropriate dosing",
            "Selected age-appropriate interventions"
        ]
        
        processing_time = time.time() - start_time
        
        return MedicalAgentResponse(
            specialty=self.specialty,
            response=response,
            confidence=confidence,
            reasoning_steps=reasoning_steps,
            recommendations=recommendations,
            required_followup=required_followup,
            processing_time=processing_time
        )
    
    def handle_emergency(self, emergency_signs: List[str], context: PatientContext) -> MedicalAgentResponse:
        start_time = time.time()
        
        if any("difficulty breathing" in sign.lower() for sign in emergency_signs):
            response = f"⚠️ PEDIATRIC RESPIRATORY EMERGENCY: Child age {context.age} with respiratory distress. Administer oxygen, bronchodilators, consider intubation if severe."
            recommendations = [
                "Supplemental oxygen",
                "Bronchodilator therapy",
                "Corticosteroids if asthma exacerbation",
                "Consider intubation if severe distress",
                "Pediatric intensive care",
                "Family notification"
            ]
        elif any("fever" in sign.lower() and "seizure" in sign.lower() for sign in emergency_signs):
            response = f"⚠️ PEDIATRIC FEBRILE SEIZURE: Child age {context.age} with fever-induced seizure. Ensure airway, give antipyretics, investigate cause."
            recommendations = [
                "Ensure airway safety",
                "IV access establishment",
                "Antipyretics (acetaminophen/ibuprofen)",
                "Investigate underlying cause",
                "Consider LP if meningitis suspected",
                "Pediatric intensive care if needed"
            ]
        elif any("unconscious" in sign.lower() or "lethargic" in sign.lower() for sign in emergency_signs):
            response = f"⚠️ PEDIATRIC ALTERED MENTAL STATUS: Child age {context.age} with altered consciousness. Check glucose, consider sepsis, meningitis, or toxic ingestion."
            recommendations = [
                "Immediate glucose check",
                "IV access establishment",
                "Consider naloxone if opioid exposure",
                "Evaluate for sepsis/meningitis",
                "Toxicology screening if indicated",
                "Pediatric intensive care"
            ]
        else:
            response = f"⚠️ PEDIATRIC EMERGENCY: Child age {context.age} with concerning signs. Ensure family present, establish IV access, and obtain immediate pediatric consultation."
            recommendations = [
                "Family presence ensured",
                "IV access establishment",
                "Age-appropriate monitoring",
                "Immediate pediatric consultation",
                "Pediatric emergency protocols",
                "Care coordination"
            ]
        
        required_followup = ["Pediatric emergency care", "Intensive monitoring", "Family communication"]
        
        processing_time = time.time() - start_time
        
        return MedicalAgentResponse(
            specialty=self.specialty,
            response=response,
            confidence=0.95,
            reasoning_steps=["Identified pediatric emergency", "Selected age-appropriate interventions"],
            recommendations=recommendations,
            required_followup=required_followup,
            processing_time=processing_time
        )

class MedicalAgentOrchestrator:
    """Orchestrates multiple medical agents to provide comprehensive care"""
    
    def __init__(self):
        self.agents = {
            MedicalSpecialty.GENERAL_PRACTICE: GeneralPracticeAgent(),
            MedicalSpecialty.CARDIOLOGY: CardiologyAgent(),
            MedicalSpecialty.NEUROLOGY: NeurologyAgent(),
            MedicalSpecialty.PEDIATRICS: PediatricAgent(),
        }
        
        # Add more agents as needed
        self.emergency_threshold = 0.9
        self.consensus_threshold = 0.7
        
    def process_patient_input(self, symptoms: List[str], context: PatientContext) -> Dict[str, Any]:
        """Process patient input through all relevant agents"""
        start_time = time.time()
        
        results = {}
        
        # Determine which agents are relevant based on symptoms and context
        relevant_agents = self._determine_relevant_agents(symptoms, context)
        
        # Query relevant agents
        for specialty in relevant_agents:
            agent = self.agents[specialty]
            try:
                result = agent.diagnose(symptoms, context)
                results[specialty.value] = {
                    'response': result.response,
                    'confidence': result.confidence,
                    'recommendations': result.recommendations,
                    'required_followup': result.required_followup,
                    'processing_time': result.processing_time
                }
            except Exception as e:
                results[specialty.value] = {
                    'response': f"Agent unavailable: {str(e)}",
                    'confidence': 0.0,
                    'recommendations': [],
                    'required_followup': [],
                    'processing_time': 0.0
                }
        
        # Synthesize results
        synthesis = self._synthesize_results(results, symptoms, context)
        
        total_processing_time = time.time() - start_time
        
        return {
            'agent_responses': results,
            'synthesized_recommendation': synthesis,
            'total_processing_time': total_processing_time,
            'primary_specialty': self._determine_primary_specialty(results),
            'urgent_care_needed': self._assess_urgent_care(results)
        }
    
    def _determine_relevant_agents(self, symptoms: List[str], context: PatientContext) -> List[MedicalSpecialty]:
        """Determine which agents are most relevant to the case"""
        relevant = [MedicalSpecialty.GENERAL_PRACTICE]  # Always include GP
        
        symptom_lower = ' '.join([s.lower() for s in symptoms])
        
        # Map symptoms to specialties
        if any(term in symptom_lower for term in ['chest', 'heart', 'pressure', 'palpitation']):
            relevant.append(MedicalSpecialty.CARDIOLOGY)
        if any(term in symptom_lower for term in ['headache', 'seizure', 'weakness', 'numbness', 'speech']):
            relevant.append(MedicalSpecialty.NEUROLOGY)
        if context.age and context.age <= 18:
            relevant.append(MedicalSpecialty.PEDIATRICS)
        
        return list(set(relevant))  # Remove duplicates
    
    def _synthesize_results(self, results: Dict, symptoms: List[str], context: PatientContext) -> str:
        """Synthesize results from multiple agents into a coherent recommendation"""
        high_confidence_results = {
            specialty: data for specialty, data in results.items() 
            if data['confidence'] > 0.7
        }
        
        if not high_confidence_results:
            return "No agent reached sufficient confidence to provide definitive guidance. Recommend comprehensive medical evaluation."
        
        # Identify the highest confidence result
        primary_result = max(high_confidence_results.items(), key=lambda x: x[1]['confidence'])
        primary_specialty, primary_data = primary_result
        
        synthesis = f"Based on multi-agent analysis:\n"
        synthesis += f"- Primary concern: {primary_data['response'][:200]}...\n"
        synthesis += f"- Specialty focus: {primary_specialty.replace('_', ' ').title()}\n"
        
        all_recommendations = []
        for specialty, data in results.items():
            all_recommendations.extend(data['recommendations'])
        
        unique_recommendations = list(set(all_recommendations))
        synthesis += f"- Key recommendations: {', '.join(unique_recommendations[:5])}\n"
        
        return synthesis
    
    def _determine_primary_specialty(self, results: Dict) -> str:
        """Determine the most relevant specialty based on confidence scores"""
        if not results:
            return "general_practice"
        
        primary = max(results.items(), key=lambda x: x[1]['confidence'])
        return primary[0]
    
    def _assess_urgent_care(self, results: Dict) -> bool:
        """Assess if urgent medical care is needed"""
        for specialty, data in results.items():
            if data['confidence'] > 0.85:
                response_lower = data['response'].lower()
                if any(urgent_term in response_lower for urgent_term in 
                      ['emergency', 'immediate', 'urgent', 'call 911', 'go to er']):
                    return True
        return False
    
    def get_agent_by_specialty(self, specialty: MedicalSpecialty) -> Optional[MedicalAgent]:
        """Get a specific agent by specialty"""
        return self.agents.get(specialty)

# Example usage
if __name__ == "__main__":
    orchestrator = MedicalAgentOrchestrator()
    
    # Example patient context
    patient_ctx = PatientContext(
        age=45,
        gender="male",
        weight=75.0,
        height=175.0,
        medical_history=["hypertension", "diabetes"],
        current_medications=["lisinopril", "metformin"],
        allergies=["penicillin"]
    )
    
    # Example symptoms
    symptoms = ["chest pain", "shortness of breath", "dizziness"]
    
    print("Processing patient case through medical agent system...")
    result = orchestrator.process_patient_input(symptoms, patient_ctx)
    
    print(f"\nPrimary Specialty: {result['primary_specialty']}")
    print(f"Urgent Care Needed: {result['urgent_care_needed']}")
    print(f"Synthesized Recommendation:\n{result['synthesized_recommendation']}")
    
    print(f"\nIndividual Agent Responses:")
    for specialty, data in result['agent_responses'].items():
        print(f"\n{specialty.upper()}:")
        print(f"  Confidence: {data['confidence']:.2f}")
        print(f"  Response: {data['response'][:100]}...")
        print(f"  Recommendations: {data['recommendations'][:3]}")