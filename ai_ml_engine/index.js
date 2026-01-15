/**
 * AI/ML Engine Index - Entry Point
 * Exports all medical AI functionality for the backend
 */

// Export the main AI service
const { AdvancedMedicalAI } = require('./services/aiService');

// Export Python connector utilities
const { PythonConnector, pythonConnector } = require('./utils/pythonConnector');

// Export specific AI functions
const medicalAIService = new AdvancedMedicalAI();

module.exports = {
  AdvancedMedicalAI,
  medicalAIService,
  PythonConnector,
  pythonConnector,
  
  // Convenience methods
  processQuery: (userId, command) => medicalAIService.processComplexQuery(userId, command),
  analyzeMedicine: (userId, medicineName, ocrText) => medicalAIService.performMedicineAnalysis(userId, medicineName, ocrText),
  analyzeSymptoms: (userId, symptoms, duration) => medicalAIService.analyzeSymptoms(userId, symptoms, duration),
  checkInteractions: (userId, medicine1, medicine2) => medicalAIService.checkInteractions(userId, medicine1, medicine2),
  getPersonalizedRecommendations: (userId) => medicalAIService.getPersonalizedMedicineRecommendations(userId),
  updateUserProfile: (userId, medicalConditions, medications, allergies) => medicalAIService.updateUserProfile(userId, medicalConditions, medications, allergies)
};