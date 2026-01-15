const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { medicalAIService } = require('../ai_ml_engine');

/**
 * Process image with OCR
 * @param {string} imagePath - Path to the image file
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} - OCR result
 */
const processImageWithOCR = async (imagePath, options = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        confidenceThreshold = 80,
        userId = null,
        deviceInfo = {},
        language = 'eng'
      } = options;

      // Record start time for processing time calculation
      const startTime = Date.now();

      // Preprocess image for better OCR results
      const processedImagePath = await preprocessImage(imagePath);

      // Perform OCR using Tesseract
      const result = await Tesseract.recognize(
        processedImagePath,
        language,
        {
          logger: (progress) => {
            // Log progress if needed
            console.log(`OCR Progress: ${Math.round(progress.progress * 100)}%`);
          }
        }
      );

      // Calculate processing time
      const processingTime = Date.now() - startTime;

      // Extract text and confidence
      const extractedText = result.data.text;
      const confidence = result.data.confidence;

      // Detect medicine name from extracted text
      const medicineName = detectMedicineName(extractedText);

      // Perform AI analysis (simulated for now)
      const aiAnalysis = await performAIAnalysis(extractedText, medicineName);

      // Prepare result object
      const ocrResult = {
        text: extractedText,
        confidence: confidence,
        language: language,
        processingTime: processingTime,
        engine: 'tesseract.js',
        engineVersion: Tesseract.version,
        medicineName: medicineName,
        processedImagePath: processedImagePath,
        aiAnalysis: aiAnalysis
      };

      // Resolve with the result
      resolve(ocrResult);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Preprocess image for better OCR results
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<string>} - Path to processed image
 */
const preprocessImage = async (imagePath) => {
  try {
    // Create a temporary processed image path
    const ext = path.extname(imagePath);
    const baseName = path.basename(imagePath, ext);
    const tempPath = path.join('uploads', `${baseName}_processed.png`);

    // Process the image using Sharp
    await sharp(imagePath)
      .resize(1200, null, { fit: 'inside' }) // Resize to max 1200px width
      .flatten({ background: { r: 255, g: 255, b: 255 } }) // Flatten transparency
      .sharpen() // Sharpen the image
      .normalize() // Normalize contrast
      .toFile(tempPath);

    return tempPath;
  } catch (error) {
    console.error('Error preprocessing image:', error);
    // If preprocessing fails, return the original image path
    return imagePath;
  }
};

/**
 * Detect medicine name from extracted text
 * @param {string} text - Extracted text from OCR
 * @returns {string|null} - Detected medicine name or null
 */
const detectMedicineName = (text) => {
  // Clean the text
  const cleanText = text
    .replace(/[0-9]/g, '') // Remove numbers
    .replace(/[^\w\s]/gi, ' ') // Replace special characters with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();

  // Split into words
  const words = cleanText.split(/\s+/);

  // Common medicine prefixes/suffixes that might indicate a medicine name
  const medicineIndicators = [
    'tab', 'caps', 'cap', 'syp', 'syr', 'inj', 'sol', 'cre', 'ointment',
    'tablet', 'capsule', 'syrup', 'injection', 'solution', 'cream', 'ointment'
  ];

  // Look for potential medicine names
  for (let i = 0; i < words.length; i++) {
    const word = words[i].toLowerCase();
    
    // Check if current word or combination with next word matches medicine indicators
    if (medicineIndicators.some(indicator => 
      word.includes(indicator) || 
      (i < words.length - 1 && 
       `${word}${words[i+1].toLowerCase()}`.includes(indicator)))) {
      
      // Return the likely medicine name (previous word or words)
      if (i > 0) {
        // Check if previous word is capitalized (indicating a name)
        const prevWord = words[i - 1];
        if (prevWord.length > 2 && /^[A-Z]/.test(prevWord)) {
          return prevWord;
        }
      }
      
      // Check for brand names that are capitalized
      for (let j = Math.max(0, i - 3); j < Math.min(words.length, i + 3); j++) {
        if (j !== i) {
          const potentialName = words[j];
          // Look for capitalized words that could be medicine names
          if (potentialName.length > 2 && /^[A-Z]/.test(potentialName) && 
              !medicineIndicators.some(ind => potentialName.toLowerCase().includes(ind))) {
            return potentialName;
          }
        }
      }
    }
  }

  // If no specific pattern found, return the first capitalized word that looks like a medicine
  for (const word of words) {
    if (word.length > 3 && /^[A-Z]/.test(word) && 
        !['FOR', 'THE', 'AND', 'WITH', 'USE', 'PER'].includes(word.toUpperCase())) {
      return word;
    }
  }

  return null;
};

/**
 * Perform AI analysis on extracted text
 * @param {string} text - Extracted text from OCR
 * @param {string|null} medicineName - Detected medicine name
 * @returns {Promise<Object>} - AI analysis results
 */
const performAIAnalysis = async (text, medicineName) => {
  try {
    // If we have a medicine name, use the AI service to get detailed information
    if (medicineName) {
      const analysis = await medicalAIService.performMedicineAnalysis('ocr_system', medicineName, text);
      
      return {
        identifiedMedicine: analysis.medicineName,
        confidence: analysis.confidence,
        dosageInfo: analysis.dosage,
        usageInfo: analysis.uses.join(', '),
        sideEffects: analysis.sideEffects,
        warnings: analysis.warnings,
        recommendations: [
          'Always follow prescribed dosage',
          'Store in cool, dry place',
          'Keep out of reach of children',
          'Consult doctor for any concerns'
        ]
      };
    } else {
      // If no specific medicine detected, return basic analysis
      return {
        identifiedMedicine: 'Unknown',
        confidence: 30,
        dosageInfo: extractDosageInfo(text),
        usageInfo: extractUsageInfo(text),
        sideEffects: extractSideEffects(text),
        warnings: extractWarnings(text),
        recommendations: generateRecommendations(medicineName)
      };
    }
  } catch (error) {
    console.error('Error in AI analysis:', error);
    // Fallback to basic analysis if AI service fails
    return {
      identifiedMedicine: medicineName || 'Unknown',
      confidence: 50,
      dosageInfo: extractDosageInfo(text),
      usageInfo: extractUsageInfo(text),
      sideEffects: extractSideEffects(text),
      warnings: extractWarnings(text),
      recommendations: generateRecommendations(medicineName)
    };
  }
};

/**
 * Extract dosage information from text
 * @param {string} text - Extracted text from OCR
 * @returns {string} - Dosage information
 */
const extractDosageInfo = (text) => {
  // Look for common dosage patterns
  const dosagePatterns = [
    /\b\d+\s*(mg|mcg|g|ml|iu)\b/gi,
    /\b(?:take|dose|dosage|strength)\s*[:\-]?\s*([^.\n]+)/gi,
    /(\d+)\s*(?:times?|per day|daily|bid|tid|qid)/gi
  ];

  for (const pattern of dosagePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0];
    }
  }

  return 'Dosage information not clearly specified in the text';
};

/**
 * Extract usage information from text
 * @param {string} text - Extracted text from OCR
 * @returns {string} - Usage information
 */
const extractUsageInfo = (text) => {
  // Look for common usage patterns
  const usagePatterns = [
    /\b(?:for|indication|used for)\s*[:\-]?\s*([^.\n]+)/gi,
    /\b(?:treatment|therapy|prevent)\s+(?:of|for)?\s*([^.\n]+)/gi,
    /\b(?:before|after|with)\s+(?:food|meal|mealtime)/gi
  ];

  for (const pattern of usagePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0];
    }
  }

  return 'Usage information not clearly specified in the text';
};

/**
 * Extract side effects from text
 * @param {string} text - Extracted text from OCR
 * @returns {Array} - Side effects
 */
const extractSideEffects = (text) => {
  // Look for common side effect patterns
  const sideEffectPatterns = [
    /\b(side effects?|adverse reactions?|unwanted effects?)\s*[:\-]?\s*([^.\n]+)/gi,
    /\b(common|serious|major|minor)\s+(?:side effects?|reactions?)\s*[:\-]?\s*([^.\n]+)/gi
  ];

  const sideEffects = [];
  for (const pattern of sideEffectPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      sideEffects.push(...matches);
    }
  }

  return sideEffects.length > 0 ? sideEffects : ['Side effects information not clearly specified'];
};

/**
 * Extract warnings from text
 * @param {string} text - Extracted text from OCR
 * @returns {Array} - Warnings
 */
const extractWarnings = (text) => {
  // Look for common warning patterns
  const warningPatterns = [
    /\b(warning|caution|contraindication|not suitable|avoid)\s*[:\-]?\s*([^.\n]+)/gi,
    /\b(do not|never|avoid|caution|consult doctor)\s+([^.\n]+)/gi
  ];

  const warnings = [];
  for (const pattern of warningPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      warnings.push(...matches);
    }
  }

  return warnings.length > 0 ? warnings : ['Warning information not clearly specified'];
};

/**
 * Generate recommendations based on medicine name
 * @param {string|null} medicineName - Detected medicine name
 * @returns {Array} - Recommendations
 */
const generateRecommendations = (medicineName) => {
  const recommendations = [
    'Always follow the prescribed dosage',
    'Store in a cool, dry place away from direct sunlight',
    'Keep out of reach of children',
    'Consult your doctor if you experience unusual side effects'
  ];

  if (medicineName) {
    recommendations.push(`Verify this is the correct medicine: ${medicineName}`);
    recommendations.push(`Check expiration date before use`);
  }

  return recommendations;
};

module.exports = {
  processImageWithOCR
};