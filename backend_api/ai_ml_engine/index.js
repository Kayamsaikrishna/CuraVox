// Mock AI Service Connector for backend API
// This is a temporary solution until proper Python integration is established

class MockMedicalAIService {
  async performMedicineAnalysis(userId, medicineName, text) {
    // Mock response for medicine analysis
    return {
      medicineName: medicineName || 'Unknown Medicine',
      confidence: 0.85,
      analysis: {
        genericName: 'Generic Name Placeholder',
        uses: ['Pain relief', 'Fever reduction'],
        sideEffects: ['May cause drowsiness', 'Stomach upset'],
        contraindications: ['None known'],
        dosageInstructions: 'Take as directed',
        warnings: ['Consult doctor if pregnant']
      },
      processingTime: 0.1
    };
  }

  async analyzeSymptoms(userId, symptoms, duration) {
    return {
      diagnosis: 'General assessment needed',
      confidence: 0.7,
      recommendations: ['Rest and hydration', 'Monitor symptoms'],
      urgency: 'low',
      processingTime: 0.15
    };
  }

  async checkInteractions(userId, medicine1, medicine2) {
    return {
      interactionExists: false,
      severity: 'none',
      description: 'No significant interaction found',
      recommendation: 'Generally safe to combine',
      processingTime: 0.1
    };
  }

  async getPersonalizedRecommendations(userId) {
    return {
      medicines: [],
      lifestyle: ['Regular exercise', 'Balanced diet'],
      followUp: 'Monthly checkup recommended',
      processingTime: 0.1
    };
  }

  async updateUserProfile(userId, medicalConditions, medications, allergies) {
    return {
      success: true,
      message: 'Profile updated successfully',
      processingTime: 0.05
    };
  }
}

// Export the mock service
const medicalAIService = new MockMedicalAIService();

module.exports = {
  medicalAIService
};