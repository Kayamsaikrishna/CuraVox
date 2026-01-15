import React from 'react';
import { Card } from '../../components/common/Card';
import PillIdentificationGame from '../../components/games/PillIdentificationGame';

const GamesPage = () => {
  return (
    <div className="games-page max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Games & Learning</h1>
        <p className="text-gray-600">
          Interactive games to help you learn about your medications in a fun way
        </p>
      </div>

      {/* Pill Identification Game */}
      <div className="mb-8">
        <PillIdentificationGame />
      </div>

      {/* Information Section */}
      <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 flex items-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          About Learning Games
        </h3>
        <p className="text-blue-700 mt-2">
          Our interactive games are designed to help visually impaired users learn about their medications in an engaging way.
          The pill identification game helps you practice recognizing medicines by their physical characteristics like shape, color, and markings.
          Regular practice can improve your confidence when handling medications.
        </p>
      </div>
    </div>
  );
};

export default GamesPage;