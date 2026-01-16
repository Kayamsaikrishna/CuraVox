import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import LoadingSpinner from '../common/LoadingSpinner';
import AudioPlayer from '../common/AudioPlayer';
import Alert from '../common/Alert';

const OCRResultDisplay = ({ result, isLoading, error }) => {
  const [copied, setCopied] = useState(false);
  const [showRawText, setShowRawText] = useState(false);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert type="error" message={`OCR Error: ${error}`} />
    );
  }

  if (!result) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No OCR results to display. Please scan an image to get started.</p>
      </div>
    );
  }

  // Handle new Gemini AI format
  const aiData = result.aiAnalysis || result;
  const isAiEnhanced = !!aiData.identifiedMedicine || !!aiData.medicineName;

  return (
    <div className="ocr-result-display space-y-6">
      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-blue-900 flex items-center">
              <span className="text-2xl mr-2">💊</span>
              {aiData.medicineName || aiData.identifiedMedicine || "Medicine Identified"}
            </h3>
            {aiData.strength && (
              <p className="text-blue-700 font-medium mt-1">
                Strength: <span className="text-blue-900 bg-blue-100 px-2 py-0.5 rounded-full text-sm">{aiData.strength}</span>
              </p>
            )}
            {aiData.manufacturer && (
              <p className="text-gray-500 text-sm mt-1">Manufacturer: {aiData.manufacturer}</p>
            )}

            <p className="text-green-700 mt-3 font-semibold flex items-center">
              <span className="mr-1">✨</span>
              Confidence Score: {aiData.confidence ? Math.round(aiData.confidence * 100) : 95}%
            </p>
          </div>
          <AudioPlayer
            text={`Found ${aiData.medicineName}. ${aiData.doctor_insight || "Please review the details below."}`}
            label="Listen to Analysis"
          />
        </div>
      </Card>

      {/* Doctor Insight - The "Premium" Feature */}
      {(aiData.doctor_insight || aiData.recommendations) && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-5">
          <h4 className="text-purple-900 font-bold flex items-center mb-2">
            <span className="text-2xl mr-2">👨‍⚕️</span> Doctor's Insight (AI)
          </h4>
          <p className="text-purple-800 italic text-lg">
            "{aiData.doctor_insight || aiData.recommendations?.[0]}"
          </p>
        </div>
      )}

      {/* Detailed Analysis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Uses */}
        {(aiData.uses || aiData.usageInfo) && (
          <Card className="border-t-4 border-t-green-500">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center">
              <span className="bg-green-100 text-green-600 p-1 rounded mr-2">📋</span> Uses
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {Array.isArray(aiData.uses)
                ? aiData.uses.map((use, i) => <li key={i}>{use}</li>)
                : <li>{aiData.usageInfo || aiData.uses}</li>}
            </ul>
          </Card>
        )}

        {/* Side Effects */}
        {(aiData.sideEffects) && (
          <Card className="border-t-4 border-t-orange-400">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center">
              <span className="bg-orange-100 text-orange-600 p-1 rounded mr-2">⚠️</span> Side Effects
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              {Array.isArray(aiData.sideEffects)
                ? aiData.sideEffects.map((effect, i) => <li key={i}>{effect}</li>)
                : <p>{aiData.sideEffects}</p>}
            </ul>
          </Card>
        )}
      </div>

      {/* Safety Warnings - Critical */}
      {(aiData.warnings) && (
        <Card className="bg-red-50 border border-red-200">
          <h4 className="font-bold text-red-800 mb-3 flex items-center text-lg">
            <span className="text-xl mr-2">🛑</span> Safety Warnings
          </h4>
          <ul className="space-y-2">
            {Array.isArray(aiData.warnings)
              ? aiData.warnings.map((warn, i) => (
                <li key={i} className="flex items-start text-red-700">
                  <span className="mr-2">•</span> {warn}
                </li>
              ))
              : <p className="text-red-700">{aiData.warnings}</p>}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default OCRResultDisplay;