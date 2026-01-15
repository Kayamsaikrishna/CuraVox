const express = require('express');
const { body, validationResult } = require('express-validator');
const Medicine = require('../models/Medicine');
const OcrResult = require('../models/OcrResult');
const { protect } = require('../middleware/auth');
const { medicalAIService } = require('../ai_ml_engine');

const router = express.Router();

// @desc    Get all medicines
// @route   GET /api/medicine
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build filter object
    const filter = { approved: true }; // Only return approved medicines
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brandName: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }
    
    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Fetch medicines with pagination
    const medicines = await Medicine.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('approvedBy', 'firstName lastName email');
    
    // Get total count for pagination
    const total = await Medicine.countDocuments(filter);
    
    res.json({
      success: true,
      message: 'Medicines retrieved successfully',
      data: {
        medicines,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          hasNextPage: skip + parseInt(limit) < total,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get medicines error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving medicines'
    });
  }
});

// @desc    Get single medicine by ID
// @route   GET /api/medicine/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id)
      .populate('approvedBy', 'firstName lastName email');
    
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }
    
    // Only return approved medicines unless user is admin
    if (!medicine.approved && (!req.user || req.user.role !== 'admin')) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Medicine retrieved successfully',
      data: {
        medicine
      }
    });
  } catch (error) {
    console.error('Get medicine error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving medicine'
    });
  }
});

// @desc    Search medicines
// @route   GET /api/medicine/search/:term
// @access  Public
router.get('/search/:term', async (req, res) => {
  try {
    const { term } = req.params;
    const { limit = 10 } = req.query;
    
    if (!term) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }
    
    // Use the static method defined in the model
    const medicines = await Medicine.findBySearchTerm(term)
      .limit(parseInt(limit))
      .populate('approvedBy', 'firstName lastName email');
    
    res.json({
      success: true,
      message: 'Medicines found successfully',
      data: {
        medicines,
        count: medicines.length
      }
    });
  } catch (error) {
    console.error('Search medicines error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching medicines'
    });
  }
});

// @desc    Create medicine (Admin only)
// @route   POST /api/medicine
// @access  Private/Admin
router.post('/', protect, async (req, res) => {
  try {
    // Only admins can create medicines
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const {
      name, brandName, genericName, manufacturer, dosageForm, strength,
      description, uses, dosageInstructions, sideEffects, contraindications,
      warnings, storageInstructions, category, subcategory, prescriptionRequired,
      barcode, imageUrl, tags
    } = req.body;
    
    // Create new medicine
    const medicine = new Medicine({
      name,
      brandName,
      genericName,
      manufacturer,
      dosageForm,
      strength,
      description,
      uses,
      dosageInstructions,
      sideEffects,
      contraindications,
      warnings,
      storageInstructions,
      category,
      subcategory,
      prescriptionRequired,
      barcode,
      imageUrl,
      tags,
      approved: true, // Admin-created medicines are approved by default
      approvedBy: req.user._id
    });
    
    await medicine.save();
    
    res.status(201).json({
      success: true,
      message: 'Medicine created successfully',
      data: {
        medicine
      }
    });
  } catch (error) {
    console.error('Create medicine error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating medicine'
    });
  }
});

// @desc    Update medicine (Admin only)
// @route   PUT /api/medicine/:id
// @access  Private/Admin
router.put('/:id', protect, async (req, res) => {
  try {
    // Only admins can update medicines
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Medicine updated successfully',
      data: {
        medicine
      }
    });
  } catch (error) {
    console.error('Update medicine error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating medicine'
    });
  }
});

// @desc    Delete medicine (Admin only)
// @route   DELETE /api/medicine/:id
// @access  Private/Admin
router.delete('/:id', protect, async (req, res) => {
  try {
    // Only admins can delete medicines
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }
    
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Medicine deleted successfully'
    });
  } catch (error) {
    console.error('Delete medicine error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting medicine'
    });
  }
});

// @desc    Analyze medicine from text using AI
// @route   POST /api/medicine/analyze-text
// @access  Public
router.post('/analyze-text', async (req, res) => {
  try {
    const { text, medicineName } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required for analysis'
      });
    }
    
    // Use the AI service to analyze the medicine text
    const analysis = await medicalAIService.performMedicineAnalysis(
      'analysis_system', 
      medicineName || 'unknown', 
      text
    );
    
    res.json({
      success: true,
      message: 'Medicine text analyzed successfully',
      data: {
        analysis
      }
    });
  } catch (error) {
    console.error('Medicine text analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error analyzing medicine text',
      error: error.message
    });
  }
});

module.exports = router;