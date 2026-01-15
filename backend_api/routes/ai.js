const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect } = require('../middleware/auth');
const { AdvancedMedicalAI } = require('../services/aiService'); // We'll create this service

const router = express.Router();

// Initialize the advanced AI system
const aiSystem = new AdvancedMedicalAI();

// @desc    Process voice command with advanced AI
// @route   POST /api/ai/voice-command
// @access  Private
router.post('/voice-command', protect, [
  body('command', 'Voice command is required').not().isEmpty().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { command } = req.body;
    const userId = req.user.id;

    // Process the voice command with advanced AI
    const result = await aiSystem.processComplexQuery(userId, command);

    // Get personalized response if user has medical profile
    const userProfile = await req.user; // User is already populated by protect middleware
    if (userProfile.medicalConditions || userProfile.medications || userProfile.allergies) {
      // Update user profile in AI system
      aiSystem.updateUserProfile(
        userId, 
        userProfile.medicalConditions || [], 
        userProfile.medications || [], 
        userProfile.allergies || []
      );
      
      // Get personalized response
      result.response = aiSystem.getPersonalizedResponse(userId, result.response);
    }

    res.json({
      success: true,
      message: 'Voice command processed successfully',
      data: result
    });
  } catch (error) {
    console.error('AI voice command error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing voice command'
    });
  }
});

// @desc    Get medicine information with AI analysis
// @route   POST /api/ai/medicine-analysis
// @access  Private
router.post('/medicine-analysis', protect, [
  body('medicineName', 'Medicine name is required').not().isEmpty().trim(),
  body('ocrText').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { medicineName, ocrText } = req.body;
    const userId = req.user.id;

    // Perform detailed medicine analysis
    const analysis = await aiSystem.performMedicineAnalysis(userId, medicineName, ocrText);

    res.json({
      success: true,
      message: 'Medicine analysis completed',
      data: analysis
    });
  } catch (error) {
    console.error('AI medicine analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error performing medicine analysis'
    });
  }
});

// @desc    Check drug interactions
// @route   POST /api/ai/interaction-check
// @access  Private
router.post('/interaction-check', protect, [
  body('medicine1', 'First medicine name is required').not().isEmpty().trim(),
  body('medicine2', 'Second medicine name is required').not().isEmpty().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { medicine1, medicine2 } = req.body;
    const userId = req.user.id;

    // Check for interactions
    const interactionResult = await aiSystem.checkInteractions(userId, medicine1, medicine2);

    res.json({
      success: true,
      message: 'Interaction check completed',
      data: interactionResult
    });
  } catch (error) {
    console.error('AI interaction check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error checking interactions'
    });
  }
});

// @desc    Get medical advice based on symptoms
// @route   POST /api/ai/symptom-checker
// @access  Private
router.post('/symptom-checker', protect, [
  body('symptoms', 'At least one symptom is required').not().isEmpty(),
  body('symptoms').isArray({ min: 1 }),
  body('duration').optional().isInt({ min: 1 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { symptoms, duration } = req.body;
    const userId = req.user.id;

    // Analyze symptoms
    const advice = await aiSystem.analyzeSymptoms(userId, symptoms, duration);

    res.json({
      success: true,
      message: 'Symptom analysis completed',
      data: advice
    });
  } catch (error) {
    console.error('AI symptom checker error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error analyzing symptoms'
    });
  }
});

// @desc    Get personalized medicine recommendations
// @route   GET /api/ai/personalized-medicines
// @access  Private
router.get('/personalized-medicines', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get personalized medicine recommendations based on user profile
    const recommendations = await aiSystem.getPersonalizedMedicineRecommendations(userId);

    res.json({
      success: true,
      message: 'Personalized recommendations retrieved',
      data: recommendations
    });
  } catch (error) {
    console.error('AI personalized medicines error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving recommendations'
    });
  }
});

module.exports = router;