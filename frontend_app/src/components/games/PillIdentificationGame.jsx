import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { speak } from '../../utils/speech';

const PillIdentificationGame = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPill, setCurrentPill] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [gameCompleted, setGameCompleted] = useState(false);
  
  // Sample pill data with characteristics
  const pillData = [
    { id: 1, name: 'Paracetamol', shape: 'oval', color: 'white', markings: 'PCT 500' },
    { id: 2, name: 'Ibuprofen', shape: 'capsule', color: 'white', markings: 'IBU 400' },
    { id: 3, name: 'Aspirin', shape: 'round', color: 'white', markings: 'ASP' },
    { id: 4, name: 'Amoxicillin', shape: 'capsule', color: 'blue', markings: 'AMOX' },
    { id: 5, name: 'Lisinopril', shape: 'round', color: 'white', markings: 'LIS 10' },
    { id: 6, name: 'Metformin', shape: 'oval', color: 'white', markings: 'MET 500' },
    { id: 7, name: 'Atorvastatin', shape: 'round', color: 'pink', markings: 'ATO 20' },
    { id: 8, name: 'Levothyroxine', shape: 'round', color: 'white', markings: 'L-T4 50' }
  ];

  // Start the game
  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setQuestionNumber(0);
    setGameCompleted(false);
    generateQuestion();
    speak("Pill identification game started. Identify the medicine based on its description.");
  };

  // Generate a new question
  const generateQuestion = () => {
    const randomIndex = Math.floor(Math.random() * pillData.length);
    const correctPill = pillData[randomIndex];
    
    // Create options including the correct answer
    const correctOption = {
      id: correctPill.id,
      name: correctPill.name,
      isCorrect: true
    };
    
    // Get 3 random wrong answers
    const wrongPills = pillData
      .filter(pill => pill.id !== correctPill.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3)
      .map(pill => ({
        id: pill.id,
        name: pill.name,
        isCorrect: false
      }));
    
    // Combine and shuffle options
    const allOptions = [correctOption, ...wrongPills].sort(() => 0.5 - Math.random());
    
    setCurrentPill(correctPill);
    setOptions(allOptions);
    setFeedback('');
  };

  // Handle answer selection
  const handleAnswer = (selectedOption) => {
    if (selectedOption.isCorrect) {
      setScore(score + 1);
      setFeedback('Correct! Well done.');
      speak("Correct! Well done.");
    } else {
      setFeedback(`Incorrect. The correct answer is ${currentPill.name}.`);
      speak(`Incorrect. The correct answer is ${currentPill.name}.`);
    }
    
    // Move to next question after delay
    setTimeout(() => {
      if (questionNumber < 4) { // 5 questions total
        setQuestionNumber(questionNumber + 1);
        generateQuestion();
      } else {
        setGameCompleted(true);
        speak(`Game completed! Your score is ${score} out of 5.`);
      }
    }, 1500);
  };

  // Reset the game
  const resetGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setScore(0);
    setQuestionNumber(0);
    setCurrentPill(null);
    setOptions([]);
    setFeedback('');
  };

  // Render game screen based on state
  const renderGameScreen = () => {
    if (!gameStarted) {
      return (
        <div className="text-center py-8">
          <h3 className="text-2xl font-bold text-indigo-700 mb-4">Pill Identification Game</h3>
          <p className="text-gray-700 mb-6">
            Test your knowledge of medicine identification. Learn to recognize pills by their characteristics.
          </p>
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">How to Play:</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• You'll be given descriptions of pills</li>
              <li>• Choose the correct medicine name from the options</li>
              <li>• Complete 5 questions to finish the game</li>
              <li>• Perfect for learning to identify your medicines</li>
            </ul>
          </div>
          <Button 
            onClick={startGame}
            variant="primary"
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600"
          >
            Start Game
          </Button>
        </div>
      );
    }

    if (gameCompleted) {
      return (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-green-700 mb-2">Game Completed!</h3>
          <p className="text-xl text-gray-700 mb-4">
            Your Score: <span className="font-bold text-indigo-600">{score}/5</span>
          </p>
          <p className="text-gray-600 mb-6">
            {score === 5 ? 'Perfect! You know your medicines well!' : 
             score >= 3 ? 'Good job! Keep practicing to improve.' : 
             'Practice makes perfect. Try again to improve your knowledge.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={startGame}
              variant="primary"
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              Play Again
            </Button>
            <Button 
              onClick={resetGame}
              variant="outline"
              className="border-gray-500 text-gray-700 hover:bg-gray-50"
            >
              Main Menu
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-indigo-700">Question {questionNumber + 1}/5</h3>
          <div className="text-lg font-semibold text-gray-700">
            Score: <span className="text-indigo-600">{score}</span>
          </div>
        </div>

        <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <h4 className="font-semibold text-yellow-800 mb-2">Identify this pill:</h4>
          <p className="text-gray-700">
            This pill is <span className="font-medium">{currentPill.shape}</span> shaped, 
            <span className="font-medium"> {currentPill.color}</span> in color, 
            and has the marking "<span className="font-medium">{currentPill.markings}</span>".
          </p>
        </div>

        {feedback && (
          <div className={`mb-4 p-3 rounded-lg ${
            feedback.includes('Correct') ? 'bg-green-100 border border-green-300 text-green-800' : 
            'bg-red-100 border border-red-300 text-red-800'
          }`}>
            {feedback}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {options.map((option, index) => (
            <Button
              key={option.id}
              onClick={() => handleAnswer(option)}
              variant="outline"
              className={`h-full p-4 text-left border-2 ${
                option.isCorrect && feedback.includes('Correct') 
                  ? 'border-green-500 bg-green-50 text-green-800' 
                  : option.isCorrect && feedback.includes('Incorrect')
                  ? 'border-green-500 bg-green-50 text-green-800' 
                  : !option.isCorrect && feedback.includes('Incorrect') && feedback.includes(option.name)
                  ? 'border-red-500 bg-red-50 text-red-800' 
                  : 'border-gray-300 hover:bg-gray-50'
              }`}
              disabled={!!feedback}
            >
              <div className="flex items-center">
                <span className="mr-3 font-medium">{String.fromCharCode(65 + index)}.</span>
                <span>{option.name}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-amber-200">
      <div className="mb-4">
        <h3 className="text-xl font-bold text-amber-800 mb-2">Pill Identification Game</h3>
        <p className="text-gray-700">
          Interactive game to help you learn to identify your medicines by their physical characteristics.
        </p>
      </div>

      {renderGameScreen()}
    </Card>
  );
};

export default PillIdentificationGame;