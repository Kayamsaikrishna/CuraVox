import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import AudioPlayer from '../common/AudioPlayer';

const MedicineCard = ({ medicine, onDetailsClick, onSetReminder }) => {
  const {
    id,
    name,
    activeIngredients = [],
    dosage = '',
    usage = '',
    sideEffects = [],
    expiryDate = '',
    manufacturer = ''
  } = medicine;

  const handleSpeakDetails = () => {
    const details = `Medicine: ${name}. Active ingredients: ${activeIngredients.join(', ')}. Dosage: ${dosage}. Usage: ${usage}. Side effects: ${sideEffects.join(', ')}`;
    // We'll just pass the text to the AudioPlayer which will handle the speech
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-indigo-700">{name}</h3>
            <AudioPlayer text={`Medicine: ${name}. ${usage || 'Usage information not available'}`} />
          </div>
          
          {manufacturer && (
            <p className="text-sm text-gray-600 mt-1">Manufacturer: {manufacturer}</p>
          )}
          
          {activeIngredients.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700">Active Ingredients:</p>
              <p className="text-gray-600">{activeIngredients.join(', ')}</p>
            </div>
          )}
          
          {dosage && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700">Dosage:</p>
              <p className="text-gray-600">{dosage}</p>
            </div>
          )}
          
          {usage && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700">Usage:</p>
              <p className="text-gray-600">{usage}</p>
            </div>
          )}
          
          {sideEffects.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700">Side Effects:</p>
              <p className="text-gray-600">{sideEffects.join(', ')}</p>
            </div>
          )}
          
          {expiryDate && (
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700">Expiry Date:</p>
              <p className="text-gray-600">{new Date(expiryDate).toLocaleDateString()}</p>
            </div>
          )}
        </div>
        
        <div className="ml-4 flex flex-col space-y-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onDetailsClick(id)}
            aria-label={`View details for ${name}`}
          >
            Details
          </Button>
          
          {onSetReminder && (
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => onSetReminder(medicine)}
              aria-label={`Set reminder for ${name}`}
            >
              Reminder
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MedicineCard;