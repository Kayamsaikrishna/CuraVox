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

  return (
    <div className="ocr-result-display space-y-6">
      {/* Summary Card */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-blue-900">OCR Result Summary</h3>
            <p className="text-blue-700 mt-1">
              Found {result.medicines?.length || 0} medicines in the image
            </p>
          </div>
          <AudioPlayer text={`Found ${result.medicines?.length || 0} medicines in the image`} />
        </div>
      </Card>

      {/* Raw Text Section */}
      {result.rawText && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Raw Extracted Text</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowRawText(!showRawText)}
            >
              {showRawText ? 'Hide' : 'Show'} Raw Text
            </Button>
          </div>
          
          {showRawText && (
            <div className="bg-gray-50 p-4 rounded-md max-h-40 overflow-y-auto">
              <p className="whitespace-pre-wrap">{result.rawText}</p>
            </div>
          )}
        </Card>
      )}

      {/* Medicines List */}
      {result.medicines && result.medicines.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Medicines Found</h3>
          {result.medicines.map((medicine, index) => (
            <Card key={index} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-indigo-700">{medicine.name}</h4>
                  
                  {medicine.activeIngredients && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700">Active Ingredients:</p>
                      <ul className="list-disc list-inside text-gray-600 ml-2">
                        {medicine.activeIngredients.map((ingredient, idx) => (
                          <li key={idx}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {medicine.dosage && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700">Dosage:</p>
                      <p className="text-gray-600">{medicine.dosage}</p>
                    </div>
                  )}
                  
                  {medicine.usage && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700">Usage:</p>
                      <p className="text-gray-600">{medicine.usage}</p>
                    </div>
                  )}
                  
                  {medicine.sideEffects && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-700">Side Effects:</p>
                      <p className="text-gray-600">{medicine.sideEffects}</p>
                    </div>
                  )}
                </div>
                
                <div className="ml-4 flex flex-col space-y-2">
                  <AudioPlayer text={`Medicine: ${medicine.name}. ${medicine.usage ? `Usage: ${medicine.usage}` : ''}`} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(medicine, null, 2))}
                  >
                    Copy Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-4">
        <Button onClick={() => copyToClipboard(result.rawText)}>
          {copied ? 'Copied!' : 'Copy Full Text'}
        </Button>
        <Button variant="secondary" onClick={() => window.print()}>
          Print Results
        </Button>
        <AudioPlayer text={result.rawText} />
      </div>
    </div>
  );
};

export default OCRResultDisplay;