import React, { useState, useEffect } from 'react';
import useAccessibility from '../../hooks/useAccessibility';

const PillIdentificationGame = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const { speak } = useAccessibility();

  // Mock pill data for the game
  const pillQuestions = [
    {
      id: 1,
      name: "Aspirin",
      description: "Small, round, white tablet",
      shape: "Round",
      color: "White",
      markings: "None",
      answers: ["Aspirin", "Ibuprofen", "Acetaminophen", "Lisinopril"],
      correctAnswer: "Aspirin"
    },
    {
      id: 2,
      name: "Lisinopril",
      description: "Oval, white tablet with '10' on one side",
      shape: "Oval",
      color: "White",
      markings: "10",
      answers: ["Lisinopril", "Metformin", "Atorvastatin", "Amlodipine"],
      correctAnswer: "Lisinopril"
    },
    {
      id: 3,
      name: "Metformin",
      description: "Capsule-shaped, white with blue cap",
      shape: "Capsule",
      color: "White/Blue",
      markings: "MET 500mg",
      answers: ["Metformin", "Sitagliptin", "Glipizide", "Pioglitazone"],
      correctAnswer: "Metformin"
    },
    {
      id: 4,
      name: "Atorvastatin",
      description: "Triangular, pink tablet",
      shape: "Triangular",
      color: "Pink",
      markings: "Pfizer 10",
      answers: ["Atorvastatin", "Rosuvastatin", "Simvastatin", "Pravastatin"],
      correctAnswer: "Atorvastatin"
    },
    {
      id: 5,
      name: "Amlodipine",
      description: "Round, yellow tablet with score line",
      shape: "Round",
      color: "Yellow",
      markings: "Norvasc 5",
      answers: ["Amlodipine", "Nifedipine", "Felodipine", "Verapamil"],
      correctAnswer: "Amlodipine"
    }
  ];

  const startGame = () => {
    setGameStarted(true);
    setGameCompleted(false);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer('');
    setFeedback('');
    speak('Pill identification game started. Identify the medicine based on its appearance.');
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    const isCorrect = answer === pillQuestions[currentQuestion].correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
      setFeedback(`Correct! This is ${pillQuestions[currentQuestion].name}.`);
      speak(`Correct! This is ${pillQuestions[currentQuestion].name}.`);
    } else {
      setFeedback(`Incorrect. This is ${pillQuestions[currentQuestion].name}.`);
      speak(`Incorrect. This is ${pillQuestions[currentQuestion].name}.`);
    }
    
    setTimeout(() => {
      if (currentQuestion < pillQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer('');
        setFeedback('');
      } else {
        setGameCompleted(true);
        speak(`Game completed! Your score is ${score} out of ${pillQuestions.length}.`);
      }
    }, 2000);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer('');
    setFeedback('');
    speak('Game reset. Ready to start again.');
  };

  return (
    <div style={{ 
      backgroundColor: '#f0fdf4', 
      border: '2px solid #4ade80', 
      borderRadius: '8px', 
      padding: '24px' 
    }}>
      <h2 
        style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          color: '#16a34a',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center'
        }}
        tabIndex="0"
      >
        <span style={{ fontSize: '24px', marginRight: '10px' }}>🎯</span>
        Pill Identification Game
      </h2>
      
      {!gameStarted && !gameCompleted && (
        <div style={{ textAlign: 'center' }}>
          <p style={{ 
            color: '#16a34a', 
            marginBottom: '20px',
            fontSize: '16px'
          }} tabIndex="0">
            Test your knowledge of medicine appearances. Identify medicines based on their shape, color, and markings.
          </p>
          <button
            onClick={startGame}
            style={{
              padding: '12px 24px',
              backgroundColor: '#22c55e',
              color: 'white',
              border: '2px solid #16a34a',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '16px'
            }}
            tabIndex="0"
          >
            Start Game
          </button>
        </div>
      )}
      
      {gameStarted && !gameCompleted && (
        <div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px',
            padding: '12px',
            backgroundColor: '#dcfce7',
            borderRadius: '6px'
          }}>
            <p style={{ 
              color: '#16a34a', 
              fontWeight: '600',
              fontSize: '16px'
            }} tabIndex="0">
              Question {currentQuestion + 1} of {pillQuestions.length}
            </p>
            <p style={{ 
              color: '#16a34a', 
              fontWeight: '600',
              fontSize: '16px'
            }} tabIndex="0">
              Score: {score}
            </p>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            border: '2px solid #a3e635',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#16a34a',
              marginBottom: '12px'
            }} tabIndex="0">
              Identify this medicine:
            </h3>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '20px',
              flexWrap: 'wrap',
              marginBottom: '20px'
            }}>
              <div style={{
                backgroundColor: '#f0f9ff',
                border: '2px solid #7dd3fc',
                borderRadius: '8px',
                padding: '15px',
                minWidth: '200px'
              }}>
                <p style={{ fontWeight: '600', color: '#0284c7', marginBottom: '8px' }}>Shape:</p>
                <p style={{ color: '#0284c7' }}>{pillQuestions[currentQuestion].shape}</p>
              </div>
              
              <div style={{
                backgroundColor: '#f0f9ff',
                border: '2px solid #7dd3fc',
                borderRadius: '8px',
                padding: '15px',
                minWidth: '200px'
              }}>
                <p style={{ fontWeight: '600', color: '#0284c7', marginBottom: '8px' }}>Color:</p>
                <p style={{ color: '#0284c7' }}>{pillQuestions[currentQuestion].color}</p>
              </div>
              
              <div style={{
                backgroundColor: '#f0f9ff',
                border: '2px solid #7dd3fc',
                borderRadius: '8px',
                padding: '15px',
                minWidth: '200px'
              }}>
                <p style={{ fontWeight: '600', color: '#0284c7', marginBottom: '8px' }}>Markings:</p>
                <p style={{ color: '#0284c7' }}>{pillQuestions[currentQuestion].markings}</p>
              </div>
            </div>
            
            <p style={{ 
              color: '#16a34a', 
              fontStyle: 'italic',
              marginBottom: '20px'
            }} tabIndex="0">
              "{pillQuestions[currentQuestion].description}"
            </p>
          </div>
          
          {feedback && (
            <div style={{
              backgroundColor: selectedAnswer === pillQuestions[currentQuestion].correctAnswer ? '#dcfce7' : '#fee2e2',
              border: `2px solid ${selectedAnswer === pillQuestions[currentQuestion].correctAnswer ? '#4ade80' : '#fecaca'}`,
              borderRadius: '6px',
              padding: '16px',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              <p style={{ 
                color: selectedAnswer === pillQuestions[currentQuestion].correctAnswer ? '#16a34a' : '#dc2626',
                fontWeight: '600',
                fontSize: '16px'
              }} tabIndex="0">
                {feedback}
              </p>
            </div>
          )}
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '12px',
            marginBottom: '20px'
          }}>
            {pillQuestions[currentQuestion].answers.map((answer, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(answer)}
                disabled={!!feedback}
                style={{
                  padding: '12px',
                  backgroundColor: selectedAnswer === answer ? 
                    (answer === pillQuestions[currentQuestion].correctAnswer ? '#22c55e' : '#ef4444') :
                    '#e7f5e7',
                  color: selectedAnswer === answer ? 
                    'white' : 
                    '#16a34a',
                  border: '2px solid #4ade80',
                  borderRadius: '6px',
                  cursor: feedback ? 'not-allowed' : 'pointer',
                  fontWeight: selectedAnswer === answer ? '600' : 'normal',
                  opacity: feedback && answer !== pillQuestions[currentQuestion].correctAnswer ? 0.6 : 1
                }}
                tabIndex="0"
              >
                {answer}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {gameCompleted && (
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#16a34a',
            marginBottom: '12px'
          }} tabIndex="0">
            Game Completed!
          </h3>
          <p style={{ 
            fontSize: '18px', 
            color: '#16a34a', 
            marginBottom: '20px',
            fontWeight: '600'
          }} tabIndex="0">
            Your Score: {score} / {pillQuestions.length}
          </p>
          <p style={{ 
            color: '#16a34a', 
            marginBottom: '20px',
            fontSize: '16px'
          }} tabIndex="0">
            {score === pillQuestions.length ? 
              'Perfect! You identified all pills correctly!' : 
              score >= pillQuestions.length / 2 ? 
              'Good job! You identified more than half of the pills correctly.' : 
              'Keep practicing to improve your pill identification skills.'}
          </p>
          <button
            onClick={resetGame}
            style={{
              padding: '12px 24px',
              backgroundColor: '#22c55e',
              color: 'white',
              border: '2px solid #16a34a',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '16px',
              marginRight: '10px'
            }}
            tabIndex="0"
          >
            Play Again
          </button>
          <button
            onClick={() => {
              resetGame();
              speak('Returning to medicine list');
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: '2px solid #4b5563',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '16px'
            }}
            tabIndex="0"
          >
            Back to Medicine List
          </button>
        </div>
      )}
      
      <div style={{ 
        marginTop: '20px', 
        padding: '16px', 
        backgroundColor: '#e0f2fe', 
        border: '2px solid #7dd3fc',
        borderRadius: '6px' 
      }}>
        <h3 style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          color: '#0284c7',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center'
        }} tabIndex="0">
          <span style={{ fontSize: '18px', marginRight: '8px' }}>💡</span>
          Safety Tip
        </h3>
        <p style={{ color: '#0284c7', fontSize: '14px' }} tabIndex="0">
          Always verify your medicines by checking the prescription label and consulting your pharmacist. 
          Never take a medicine that doesn't match your prescription.
        </p>
      </div>
    </div>
  );
};

export default PillIdentificationGame;