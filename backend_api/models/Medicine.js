const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  medicineName: {
    type: String,
    required: true,
    trim: true,
    index: true  // Remove the separate index() call to prevent duplicates
  },
  genericName: {
    type: String,
    trim: true
  },
  manufacturer: {
    type: String,
    trim: true
  },
  dosageForm: {
    type: String,
    trim: true
  },
  strength: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  uses: [{
    type: String,
    trim: true
  }],
  dosageInstructions: {
    type: String,
    trim: true
  },
  sideEffects: [{
    type: String,
    trim: true
  }],
  contraindications: [{
    type: String,
    trim: true
  }],
  warnings: [{
    type: String,
    trim: true
  }],
  storageInstructions: {
    type: String,
    trim: true
  },
  expiryDate: {
    type: Date
  },
  batchNumber: {
    type: String,
    trim: true
  },
  price: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  category: {
    type: String,
    trim: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  prescriptionRequired: {
    type: Boolean,
    default: false
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  ocrText: {
    type: String,
    trim: true
  },
  confidenceScore: {
    type: Number,
    min: 0,
    max: 1
  },
  approved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: String,
    trim: true
  },
  approvedAt: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Remove the separate index() call to prevent duplicates
// medicineSchema.index({ medicineName: 1 });

module.exports = mongoose.model('Medicine', medicineSchema);