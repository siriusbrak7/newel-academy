
import React, { useState, useEffect } from 'react';
import { User, LeaderboardEntry, Question } from '../types';
import { getLeaderboards, saveSprintScore } from '../services/storageService';
import { QUESTION_BANK } from '../constants';
import { Trophy, Timer, Zap, Target } from 'lucide-react';
import Confetti from './Confetti';

// --- SPRINT CHALLENGE (222 Seconds) ---
export const SprintChallenge: React.FC<{ user: User }> = ({ user }) => {
  const [active, setActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(222);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // Initialize Game
  const startGame = () => {
    // 1. Get All Physics & Chemistry Questions
    const physQs = QUESTION_BANK['Physics'] || [];
    const chemQs = QUESTION_BANK['Chemistry'] || [];

    // 2. Get 70 Random Biology Questions
    const bioQs = QUESTION_BANK['Biology'] || [];
    const shuffledBio = [...bioQs].sort(() => 0.5 - Math.random());
    const selectedBio = shuffledBio.slice(0, 70);

    // 3. Combine
    const combinedPool = [...physQs, ...chemQs, ...selectedBio];

    // 4. Shuffle Final Pool
    const finalShuffled = [...combinedPool].sort(() => 0.5 - Math.random());

    if (finalShuffled.length === 0) {
      alert("Question bank is empty. Please contact admin.");
      return;
    }

    setQuestions(finalShuffled);
    setTimeLeft(222);
    setScore(0);
    setCurrentIndex(0);
    setStreak(0);
    setGameOver(false);
    setActive(true);
    setShowConfetti(false);
  };

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (active && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && active) {
      endGame();
    }
    return () => clearInterval(timer);
  }, [active, timeLeft]);

  const endGame = () => {
    setActive(false);
    setGameOver(true);
    saveSprintScore(user.username, score);
    if (score > 50) setShowConfetti(true);
  };

  const handleAnswer = (option: string) => {
    const q = questions[currentIndex];
    if (option === q.correctAnswer) {
      const points = 10 + (streak * 2); // Streak bonus
      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
    } else {
      setScore(prev => Math.max(0, prev - 5)); // Penalty
      setStreak(0);
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      endGame(); // Ran out of questions
    }
  };

  if (!active && !gameOver) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/10 rounded-3xl text-center space-y-6 max-w-2xl mx-auto">
        <Zap size={64} className="text-yellow-400 animate-pulse" />
        <h2 className="text-4xl font-bold text-white">222-Second Sprint</h2>
        <p className="text-white/60 max-w-md">
          Answer as many questions as you can in 3 minutes and 42 seconds.
          <br />+10 points for correct, -5 for wrong. Streak bonuses apply!
        </p>
        <button
          onClick={startGame}
          className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-black font-bold text-xl px-12 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all"
        >
          Start Sprint
        </button>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/10 rounded-3xl text-center space-y-6">
        {showConfetti && <Confetti />}
        <Trophy size={64} className="text-yellow-400" />
        <h2 className="text-4xl font-bold text-white">Sprint Complete!</h2>
        <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
          {score} <span className="text-2xl text-white/40">pts</span>
        </div>
        <p className="text-white/60">Your score has been added to the leaderboard.</p>
        <button
          onClick={() => setGameOver(false)}
          className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-3 rounded-lg transition-colors"
        >
          Play Again
        </button>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3 bg-black/30 px-4 py-2 rounded-lg border border-white/10">
          <Timer className="text-cyan-400" />
          <span className={`text-2xl font-mono font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>
        <div className="flex items-center gap-4">
          {streak > 1 && <div className="text-yellow-400 font-bold italic animate-bounce">{streak}x Streak!</div>}
          <div className="text-2xl font-bold text-white">Score: {score}</div>
        </div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/20 p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 h-1 bg-cyan-500 transition-all duration-300" style={{ width: `${((222 - timeLeft) / 222) * 100}%` }}></div>

        <div className="flex justify-between items-center mb-6 text-sm text-white/40 uppercase tracking-widest">
          <span>{currentQ.topic}</span>
          <span>{currentQ.difficulty}</span>
        </div>

        <h3 className="text-2xl font-bold text-white mb-8">{currentQ.text}</h3>

        <div className="grid gap-4">
          {currentQ.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleAnswer(opt)}
              className="w-full text-left p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-cyan-500/20 hover:border-cyan-400 text-white transition-all group"
            >
              <span className="inline-block w-8 font-bold opacity-30 group-hover:opacity-100">{String.fromCharCode(65 + i)}</span>
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- LEADERBOARDS ---
export const LeaderboardView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'academic' | 'challenge' | 'assessments'>('academic');
  const [data, setData] = useState<{ academic: LeaderboardEntry[], challenge: LeaderboardEntry[], assessments: LeaderboardEntry[] }>({
    academic: [], challenge: [], assessments: []
  });

  useEffect(() => {
    setData(getLeaderboards());
  }, []);

  const renderTable = (entries: LeaderboardEntry[], metric: string) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="text-xs uppercase text-white/40 bg-white/5">
          <tr>
            <th className="p-4 rounded-tl-lg">Rank</th>
            <th className="p-4">Student</th>
            <th className="p-4">Grade</th>
            <th className="p-4 rounded-tr-lg text-right">{metric}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {entries.length === 0 ? (
            <tr><td colSpan={4} className="p-8 text-center text-white/30">No data available yet.</td></tr>
          ) : (
            entries.map((entry, i) => (
              <tr key={i} className="hover:bg-white/5 transition-colors group">
                <td className="p-4">
                  {i === 0 ? <Trophy size={20} className="text-yellow-400" /> :
                    i === 1 ? <Trophy size={20} className="text-gray-300" /> :
                      i === 2 ? <Trophy size={20} className="text-orange-400" /> :
                        <span className="font-mono text-white/50">#{i + 1}</span>}
                </td>
                <td className="p-4 font-bold text-white group-hover:text-cyan-400 transition-colors">{entry.username}</td>
                <td className="p-4 text-white/60">{entry.gradeLevel || '-'}</td>
                <td className="p-4 text-right font-mono text-cyan-300 font-bold">{Math.round(entry.score)}{metric === 'Score' ? '' : '%'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-white mb-2">Leaderboards</h2>
        <p className="text-white/60">See who's topping the charts at Newel Academy.</p>
      </div>

      <div className="flex justify-center gap-4 mb-8">
        {[
          { id: 'academic', label: 'Academic Progress', icon: <Target size={18} /> },
          { id: 'challenge', label: 'Sprint Challenge', icon: <Zap size={18} /> },
          { id: 'assessments', label: 'Assessments', icon: <Trophy size={18} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${activeTab === tab.id
                ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-lg scale-105'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2">
        {activeTab === 'academic' && renderTable(data.academic, 'Completion')}
        {activeTab === 'challenge' && renderTable(data.challenge, 'Score')}
        {activeTab === 'assessments' && renderTable(data.assessments, 'Avg Score')}
      </div>
    </div>
  );
};
