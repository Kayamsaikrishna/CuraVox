import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useAccessibility from '../../hooks/useAccessibility';

// --- Ultra-Prism Local Icons ---
const IconTarget = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
);
const IconCheck = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);
const IconAlert = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
);

const PillIdentificationGame = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const { speak } = useAccessibility();

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
    speak('Medicine quiz started. Identify the medicine based on its appearance.');
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    const isCorrect = answer === pillQuestions[currentQuestion].correctAnswer;

    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedback(`Correct! This is ${pillQuestions[currentQuestion].name}.`);
      speak(`Correct! This is ${pillQuestions[currentQuestion].name}.`);
    } else {
      setFeedback(`Not quite. This is actually ${pillQuestions[currentQuestion].name}.`);
      speak(`Incorrect. This is actually ${pillQuestions[currentQuestion].name}.`);
    }

    setTimeout(() => {
      if (currentQuestion < pillQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer('');
        setFeedback('');
      } else {
        setGameCompleted(true);
        speak(`Quiz completed. Your final score is ${score} out of ${pillQuestions.length}.`);
      }
    }, 2500);
  };

  const resetGame = () => {
    setGameStarted(false);
    setGameCompleted(false);
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer('');
    setFeedback('');
    speak('Quiz reset. Ready to try again.');
  };

  return (
    <div className="text-slate-900">
      <AnimatePresence mode="wait">
        {!gameStarted && !gameCompleted && (
          <motion.div
            key="start"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="text-center py-10"
          >
            <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
              <IconTarget />
            </div>
            <h2 className="text-5xl font-black tracking-tighter mb-6">Medicine Quiz</h2>
            <p className="text-xl text-slate-500 font-bold max-w-xl mx-auto mb-12 italic opacity-80 leading-relaxed">
              Test your knowledge. Identify medicines based on how they look.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={startGame}
              className="px-16 py-8 bg-emerald-600 text-white rounded-[3rem] font-black text-[13px] uppercase tracking-[0.4em] shadow-[0_30px_60px_-15px_rgba(16,185,129,0.4)]"
            >
              Start Quiz
            </motion.button>
          </motion.div>
        )}

        {gameStarted && !gameCompleted && (
          <motion.div
            key="game"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12"
          >
            <div className="flex justify-between items-center bg-white px-10 py-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Question</span>
                <p className="text-2xl font-black text-emerald-600 tabular-nums">{currentQuestion + 1} / {pillQuestions.length}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Score</span>
                <p className="text-2xl font-black text-indigo-600 tabular-nums">{score}</p>
              </div>
            </div>

            <div className="bg-white rounded-[4rem] p-16 border-2 border-emerald-50 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 text-emerald-600 group-hover:rotate-45 transition-transform duration-1000">
                <IconTarget />
              </div>
              <h3 className="text-3xl font-black text-[#020617] tracking-tighter mb-10 border-l-[6px] border-emerald-500 pl-8">Identify this Medicine</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {[
                  { label: 'Shape', val: pillQuestions[currentQuestion].shape },
                  { label: 'Color', val: pillQuestions[currentQuestion].color },
                  { label: 'Marking', val: pillQuestions[currentQuestion].markings }
                ].map((attr, i) => (
                  <div key={i} className="bg-slate-50 p-8 rounded-[2rem] border border-white">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{attr.label}</p>
                    <p className="text-xl font-black text-slate-800 tracking-tight">{attr.val}</p>
                  </div>
                ))}
              </div>

              <p className="text-2xl font-black text-emerald-900 leading-relaxed italic opacity-70 px-4">
                "{pillQuestions[currentQuestion].description}"
              </p>
            </div>

            <AnimatePresence mode="wait">
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-10 rounded-[2.5rem] border-4 text-center font-black text-2xl tracking-tight shadow-xl ${selectedAnswer === pillQuestions[currentQuestion].correctAnswer
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                >
                  {feedback}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pillQuestions[currentQuestion].answers.map((answer, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!!feedback}
                  onClick={() => handleAnswerSelect(answer)}
                  className={`p-8 rounded-[2.5rem] font-black text-xl tracking-tight border-2 transition-all ${selectedAnswer === answer
                    ? (answer === pillQuestions[currentQuestion].correctAnswer ? 'bg-emerald-600 border-emerald-700 text-white shadow-lg' : 'bg-rose-600 border-rose-700 text-white shadow-lg')
                    : 'bg-white border-slate-100 text-slate-600 hover:border-emerald-200 shadow-sm disabled:opacity-50'
                    }`}
                >
                  {answer}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {gameCompleted && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-32 h-32 bg-[#020617] text-white rounded-[3rem] flex items-center justify-center mx-auto mb-10 shadow-2xl animate-bounce">
              <IconCheck />
            </div>
            <h3 className="text-6xl font-black text-[#020617] tracking-tighter mb-8 tabular-nums">Final Score: {Math.round((score / pillQuestions.length) * 100)}%</h3>
            <p className="text-2xl text-slate-500 font-bold max-w-xl mx-auto mb-16 italic opacity-80 leading-relaxed">
              {score === pillQuestions.length
                ? 'Excellent! You identified all medicines correctly.'
                : 'Quiz complete. Keep practicing to improve your identification skills.'}
            </p>
            <div className="flex justify-center gap-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={resetGame}
                className="px-12 py-8 bg-emerald-600 text-white rounded-[3rem] font-black text-[13px] uppercase tracking-[0.4em] shadow-2xl"
              >
                Try Again
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-20 p-12 bg-emerald-50 rounded-[4rem] border-l-[16px] border-emerald-600 group hover:bg-emerald-100 transition-colors">
        <h4 className="text-[12px] font-black text-emerald-800 uppercase tracking-[0.6em] mb-6 flex items-center gap-4">
          <div className="w-1.5 h-6 bg-emerald-600 rounded-full"></div>
          Safety Note
        </h4>
        <p className="text-2xl font-black text-emerald-900 opacity-60 leading-relaxed italic pr-12">
          Always verify your medicines against the prescription label. This quiz is for educational purposes only.
        </p>
      </div>
    </div>
  );
};

export default PillIdentificationGame;