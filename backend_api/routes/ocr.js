const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const OcrResult = require('../models/OcrResult');
const Medicine = require('../models/Medicine');
const { protect } = require('../middleware/auth');
const { processImageWithOCR } = require('../services/ocrService');

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'ocr-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// @desc    Process uploaded image with OCR
// @route   POST /api/ocr/process
// @access  Private
router.post('/process', protect, upload.single('image'), [
  body('confidenceThreshold').optional().isFloat({ min: 0, max: 100 })
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

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const { confidenceThreshold = 80 } = req.body;

    try {
      // Process image with OCR
      const ocrResult = await processImageWithOCR(req.file.path, {
        confidenceThreshold: parseFloat(confidenceThreshold),
        userId: req.user.id,
        deviceInfo: {
          userAgent: req.get('User-Agent'),
          platform: req.get('Sec-CH-UA-Platform')
        }
      });

      // Save OCR result to database
      const ocrRecord = new OcrResult({
        userId: req.user.id,
        originalImage: req.file.filename,
        processedImage: ocrResult.processedImagePath || req.file.filename,
        extractedText: ocrResult.text,
        confidenceScore: ocrResult.confidence,
        detectedLanguage: ocrResult.language,
        processingTime: ocrResult.processingTime,
        ocrEngine: ocrResult.engine,
        ocrEngineVersion: ocrResult.engineVersion,
        deviceInfo: {
          userAgent: req.get('User-Agent'),
          platform: req.get('Sec-CH-UA-Platform')
        },
        location: req.body.location || null,
        confidenceThreshold: parseFloat(confidenceThreshold),
        status: 'completed',
        aiAnalysis: ocrResult.aiAnalysis || {}
      });

      // If medicine name was detected, try to match with existing medicine
      if (ocrResult.medicineName) {
        ocrRecord.medicineName = ocrResult.medicineName;
        
        // Find matching medicine in database
        const matchedMedicine = await Medicine.findOne({
          $or: [
            { name: { $regex: ocrResult.medicineName, $options: 'i' } },
            { brandName: { $regex: ocrResult.medicineName, $options: 'i' } },
            { genericName: { $regex: ocrResult.medicineName, $options: 'i' } }
          ]
        });

        if (matchedMedicine) {
          ocrRecord.matchedMedicine = matchedMedicine._id;
        }
      }

      await ocrRecord.save();

      res.json({
        success: true,
        message: 'Image processed successfully with OCR',
        data: {
          ocrResult: ocrRecord
        }
      });
    } catch (ocrError) {
      // Clean up uploaded file if OCR processing failed
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(500).json({
        success: false,
        message: 'Error processing image with OCR',
        error: ocrError.message
      });
    }
  } catch (error) {
    console.error('OCR process error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing OCR'
    });
  }
});

// @desc    Get user's OCR scan history
// @route   GET /api/ocr/history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Fetch user's OCR results with pagination
    const ocrResults = await OcrResult.getUserScans(req.user.id, parseInt(limit), skip)
      .sort(sort);

    // Get total count for pagination
    const total = await OcrResult.countDocuments({ userId: req.user.id });

    res.json({
      success: true,
      message: 'OCR history retrieved successfully',
      data: {
        ocrResults,
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
    console.error('Get OCR history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving OCR history'
    });
  }
});

// @desc    Get single OCR result by ID
// @route   GET /api/ocr/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const ocrResult = await OcrResult.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).populate('matchedMedicine', 'name brandName strength description uses sideEffects warnings');

    if (!ocrResult) {
      return res.status(404).json({
        success: false,
        message: 'OCR result not found or does not belong to user'
      });
    }

    res.json({
      success: true,
      message: 'OCR result retrieved successfully',
      data: {
        ocrResult
      }
    });
  } catch (error) {
    console.error('Get OCR result error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving OCR result'
    });
  }
});

// @desc    Get OCR statistics for user
// @route   GET /api/ocr/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    // Get basic stats
    const totalScans = await OcrResult.countDocuments({ userId: req.user.id });
    const avgConfidence = await OcrResult.aggregate([
      { $match: { userId: req.user.id } },
      { $group: { _id: null, average: { $avg: '$confidenceScore' } } }
    ]);

    const recentScans = await OcrResult.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('medicineName confidenceScore createdAt');

    res.json({
      success: true,
      message: 'OCR statistics retrieved successfully',
      data: {
        stats: {
          totalScans,
          averageConfidence: avgConfidence[0] ? avgConfidence[0].average : 0,
          recentScans
        }
      }
    });
  } catch (error) {
    console.error('Get OCR stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving OCR statistics'
    });
  }
});

module.exports = router;