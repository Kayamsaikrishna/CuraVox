const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { AdvancedMedicalAI } = require('./aiService');

const medicalAIService = new AdvancedMedicalAI();

/**
 * Process image with OCR
 * @param {string} imagePath - Path to the image file
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} - OCR result
 */
const processImageWithOCR = async (imagePath, options = {}) => {
  return new Promise(async (resolve, reject) => {
    try {
      // 1. TRY GEMINI FLASH FIRST (Cognitive Vision)
      // Restored this block as User now has an API Key
      if (process.env.GEMINI_API_KEY) {
        console.log("🚀 Using Gemini Vision (Dr. CuraVox) for Analysis...");
        const geminiService = require('./geminiService');
        try {
          // Gemini does OCR + Analysis in one shot
          const geminiResult = await geminiService.analyzeImage(imagePath);

          console.log("🔍 DEBUG: Gemini Raw Result:", JSON.stringify(geminiResult, null, 2));

          if (geminiResult) {
            resolve({
              text: geminiResult.extractedText || "Gemini Vision Analysis",
              confidence: (geminiResult.confidence || 0.9) * 100,
              language: 'eng',
              processingTime: Date.now() - Date.now(), // Approximate
              engine: 'gemini-2.5-flash',
              engineVersion: '2.5.0',
              medicineName: geminiResult.medicineName,
              processedImagePath: imagePath, // No processing needed for Vision AI
              aiAnalysis: {
                identifiedMedicine: geminiResult.medicineName,
                confidence: geminiResult.confidence,
                dosageInfo: geminiResult.strength,
                usageInfo: Array.isArray(geminiResult.uses) ? geminiResult.uses.join(', ') : geminiResult.uses,
                sideEffects: geminiResult.sideEffects,
                warnings: geminiResult.warnings,
                recommendations: [geminiResult.doctor_insight || "Consult a doctor"]
              }
            });
            return; // EXIT FUNCTION, WE ARE DONE
          }
        } catch (geminiError) {
          console.error("Gemini failed, falling back to local OCR:", geminiError);
          // Verify fall through to Tesseract
        }
      }

      const {
        confidenceThreshold = 80,
        userId = null,
        deviceInfo = {},
        language = 'eng'
      } = options;

      // Record start time
      const startTime = Date.now();

      // 1. Deep Preprocessing (High-Res Upscale for Small Text)
      // We create a "Scan Ready" version of the image
      const processedImagePath = await preprocessImageHighRes(imagePath);

      // 2. Multi-Angle OCR (0, 90, 180, 270 degrees)
      // Medicine strips often have text in different orientations. We scan ALL of them.
      const angles = [0, 90, 180, 270];
      let combinedText = "";
      let maxConfidence = 0;
      let primaryMedicineName = null;

      console.log("Starting Multi-Angle Deep Scan... This may take a moment.");

      // Run OCR on all angles sequentially (to save memory) or parallel (if robust)
      // Sequential is safer for reliability
      for (const angle of angles) {
        const rotatedImagePath = await rotateImage(processedImagePath, angle);

        const result = await Tesseract.recognize(
          rotatedImagePath,
          language,
          {
            logger: m => { } // Silence individual loggers to keep console clean
          },
          {
            tessedit_pageseg_mode: '6', // Assume uniform block of text
            preserve_interword_spaces: '1'
          }
        );

        const text = result.data.text.trim();
        const conf = result.data.confidence;

        if (text.length > 5) {
          combinedText += `\n[Angle ${angle}° Scan]: ${text}`;
          if (conf > maxConfidence) maxConfidence = conf;

          // Try to detect name in this specific angle
          const detected = detectMedicineName(text);
          if (detected && !primaryMedicineName) primaryMedicineName = detected;
        }

        // Cleanup temp rotated file
        try { fs.unlinkSync(rotatedImagePath); } catch (e) { }
      }

      console.log("Multi-Angle Scan Complete. Analyzing findings...");

      // Perform AI analysis on the COMBINED text from all angles
      // This gives the AI the maximum amount of context to figure out the medicine
      const aiAnalysis = await performAIAnalysis(combinedText, primaryMedicineName);

      // Prepare result object
      const ocrResult = {
        text: combinedText, // Return all text found
        confidence: maxConfidence,
        language: language,
        processingTime: Date.now() - startTime,
        engine: 'tesseract.js (Multi-Angle)',
        engineVersion: Tesseract.version,
        medicineName: aiAnalysis.identifiedMedicine || primaryMedicineName || "Unknown",
        processedImagePath: processedImagePath,
        aiAnalysis: aiAnalysis
      };

      resolve(ocrResult);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Preprocess image for High-Res OCR (Upscale + Sharpen)
 */
const preprocessImageHighRes = async (imagePath) => {
  try {
    const ext = path.extname(imagePath);
    const baseName = path.basename(imagePath, ext);
    const tempPath = path.join('uploads', `${baseName}_hires.png`);

    await sharp(imagePath)
      .resize(2400, null, { fit: 'inside' }) // 2X larger than before for small text
      .grayscale()
      .normalize()
      .sharpen({
        sigma: 2,
        m1: 0,
        m2: 3,
        x1: 2,
        y2: 10,
        y3: 20,
      })
      .toFormat('png')
      .toFile(tempPath);

    return tempPath;
  } catch (error) {
    console.error('Error preprocessing image:', error);
    return imagePath;
  }
};

/**
 * Rotate image for multi-angle scanning
 */
const rotateImage = async (imagePath, angle) => {
  if (angle === 0) return imagePath;

  const ext = path.extname(imagePath);
  const baseName = path.basename(imagePath, ext); // Corrected: removed .replace
  const rotatedPath = path.join('uploads', `${baseName}_rot${angle}.png`);

  await sharp(imagePath)
    .rotate(angle)
    .toFile(rotatedPath);

  return rotatedPath;
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
        `${word}${words[i + 1].toLowerCase()}`.includes(indicator)))) {

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
    // Always use the advanced AI service to get detailed information
    // We pass the full OCR text so the AI can find the name itself (using fuzzy match) if the simple regex failed
    const analysis = await medicalAIService.performMedicineAnalysis('ocr_system', medicineName, text);

    return {
      identifiedMedicine: analysis.medicineName, // This will now be the corrected name (e.g. "Metformin")
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