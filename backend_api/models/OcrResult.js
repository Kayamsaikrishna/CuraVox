const mongoose = require('mongoose');

const ocrResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalImage: {
    type: String,
    required: true
  },
  processedImage: {
    type: String,
    required: false
  },
  extractedText: {
    type: String,
    required: true
  },
  confidenceScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  detectedLanguage: {
    type: String,
    required: false
  },
  medicineName: {
    type: String,
    required: false,
    index: true
  },
  matchedMedicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: false
  },
  processingTime: {
    type: Number, // in milliseconds
    required: false
  },
  ocrEngine: {
    type: String,
    required: false,
    default: 'tesseract.js'
  },
  ocrEngineVersion: {
    type: String,
    required: false
  },
  deviceInfo: {
    userAgent: {
      type: String,
      required: false
    },
    platform: {
      type: String,
      required: false
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point']
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  confidenceThreshold: {
    type: Number,
    default: 80,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'completed'
  },
  errorMessage: {
    type: String,
    required: false
  },
  aiAnalysis: {
    identifiedMedicine: {
      type: String,
      required: false
    },
    confidence: {
      type: Number,
      required: false,
      min: 0,
      max: 100
    },
    dosageInfo: {
      type: String,
      required: false
    },
    composition: {
      type: String, // Active Ingredients
      required: false
    },
    manufacturer: {
      type: String,
      required: false
    },
    usageInfo: [String], // Changed to Array
    sideEffects: [String],
    warnings: [String],
    recommendations: [String],
    doctor_insight: {
      type: String,
      required: false
    },
    dates: {
      expiryDate: String,
      mfgDate: String
    },
    safetyAdvice: {
      alcohol: String,
      pregnancy: String,
      driving: String
    },
    typical_schedule: {
      frequency: String,
      timing: String
    },
    patient_friendly_speech: {
      type: String,
      required: false
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
ocrResultSchema.index({ userId: 1, createdAt: -1 }); // For user's recent scans
// ocrResultSchema.index({ medicineName: 1 }); // Removed duplicate index
ocrResultSchema.index({ confidenceScore: -1 }); // For sorting by confidence
ocrResultSchema.index({ createdAt: -1 }); // For chronological ordering

// Virtual for formatted date
ocrResultSchema.virtual('formattedDate').get(function () {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

// Static method to get user's scan history
ocrResultSchema.statics.getUserScans = function (userId, limit = 10, skip = 0) {
  return this.find({ userId })
    .populate('matchedMedicine', 'name brandName strength')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);
};

// Static method to get scans by medicine name
ocrResultSchema.statics.getByMedicineName = function (medicineName, limit = 10) {
  return this.find({
    medicineName: { $regex: medicineName, $options: 'i' }
  })
    .populate('userId', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Static method to get scans with low confidence
ocrResultSchema.statics.getLowConfidenceScans = function (threshold = 70) {
  return this.find({
    confidenceScore: { $lt: threshold }
  })
    .populate('userId', 'firstName lastName email')
    .sort({ confidenceScore: 1 });
};

const OcrResult = mongoose.model('OcrResult', ocrResultSchema);

module.exports = OcrResult;