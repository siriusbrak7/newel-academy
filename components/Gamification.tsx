
import React, { useState, useEffect, useRef } from 'react';
import { User, LeaderboardEntry, Question } from '../types';
import { saveQuantumVelocityScore, getLeaderboards } from '../services/storageService';
import { QUESTION_BANK } from '../constants';
import { Trophy, Zap, Target, Play, RotateCcw, ArrowLeft, Heart, Star } from 'lucide-react';
import Confetti from './Confetti';

// --- COSMIC SCIENCE RUNNER GAME ---
export const SprintChallenge = ({ user }: { user: User }) => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [multiplier, setMultiplier] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<{
    playerX: number;
    targetX: number;
    lane: number;
    obstacles: any[];
    stars: any[];
    frame: number;
    speed: number;
    questionTimer: number;
  }>({
    playerX: 1, // 0, 1, 2 for lanes
    targetX: 1,
    lane: 1,
    obstacles: [],
    stars: [],
    frame: 0,
    speed: 5,
    questionTimer: 0
  });

  const LANS_COUNT = 3;

  const getNewQuestion = () => {
    const subjects = ['Biology', 'Physics'];
    const sub = subjects[Math.floor(Math.random() * subjects.length)];
    const pool = QUESTION_BANK[sub] || [];
    if (pool.length === 0) return null;
    const q = pool[Math.floor(Math.random() * pool.length)];
    setCurrentQuestion(q);
    setOptions([...q.options].sort(() => 0.5 - Math.random()));
    return q;
  };

  const initGame = () => {
    setScore(0);
    setLives(3);
    setMultiplier(1);
    setGameState('playing');
    getNewQuestion();

    // Create initial stars
    const stars = [];
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * 400,
        y: Math.random() * 600,
        size: Math.random() * 2,
        speed: Math.random() * 2 + 1
      });
    }
    gameRef.current.stars = stars;
    gameRef.current.obstacles = [];
    gameRef.current.playerX = 1;
    gameRef.current.targetX = 1;
    gameRef.current.lane = 1;
    gameRef.current.speed = 5;
  };

  const handleInput = (e: KeyboardEvent) => {
    if (gameState !== 'playing') return;
    if (e.key === 'ArrowLeft') {
      gameRef.current.lane = Math.max(0, gameRef.current.lane - 1);
    } else if (e.key === 'ArrowRight') {
      gameRef.current.lane = Math.min(2, gameRef.current.lane + 1);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleInput);
    return () => window.removeEventListener('keydown', handleInput);
  }, [gameState]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const g = gameRef.current;
      g.frame++;

      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Stars
      ctx.fillStyle = 'white';
      g.stars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
        s.y += s.speed;
        if (s.y > canvas.height) s.y = 0;
      });

      // Update Player Position (Smooth move)
      const targetX = (canvas.width / LANS_COUNT) * g.lane + (canvas.width / LANS_COUNT / 2);
      g.playerX += (targetX - g.playerX) * 0.2;

      // Draw Player Ship
      ctx.save();
      ctx.translate(g.playerX, canvas.height - 80);

      // Ship Glow
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 30);
      gradient.addColorStop(0, 'rgba(34, 211, 238, 0.4)');
      gradient.addColorStop(1, 'rgba(34, 211, 238, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      ctx.fill();

      // Ship Body
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.moveTo(0, -25);
      ctx.lineTo(15, 10);
      ctx.lineTo(-15, 10);
      ctx.closePath();
      ctx.fill();

      // Ship Engine
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.moveTo(-8, 10);
      ctx.lineTo(8, 10);
      ctx.lineTo(0, 15 + Math.sin(g.frame * 0.5) * 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Spawn/Update Obstacles
      if (g.frame % 100 === 0 && currentQuestion) {
        // Only spawn if we don't have active answer orbs
        if (!g.obstacles.some(o => o.type === 'answer')) {
          const shuffledOptions = [...options];
          for (let i = 0; i < 3; i++) {
            g.obstacles.push({
              x: (canvas.width / 3) * i + (canvas.width / 6),
              y: -50,
              type: 'answer',
              text: shuffledOptions[i],
              lane: i,
              color: i === 0 ? '#06b6d4' : i === 1 ? '#a855f7' : '#ec4899'
            });
          }
        }
      }

      // Draw & Update Obstacles
      g.obstacles.forEach((o, index) => {
        o.y += g.speed;

        // Draw Orb
        ctx.save();
        ctx.translate(o.x, o.y);

        const orbGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 25);
        orbGrad.addColorStop(0, o.color);
        orbGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = orbGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(o.text.substring(0, 20), 0, 5);
        ctx.restore();

        // Collision Check
        if (Math.abs(o.y - (canvas.height - 80)) < 30 && g.lane === o.lane) {
          if (o.text === currentQuestion?.correctAnswer) {
            setScore(prev => {
              const newScore = prev + (10 * multiplier);
              if (newScore > highScore) setHighScore(newScore);
              return newScore;
            });
            setMultiplier(prev => Math.min(prev + 0.5, 5));
            g.speed += 0.1;
            getNewQuestion();
          } else {
            setLives(prev => {
              const newLives = prev - 1;
              if (newLives <= 0) {
                setGameState('gameOver');
                saveQuantumVelocityScore(user.username, score);
              }
              return newLives;
            });
            setMultiplier(1);
            getNewQuestion();
          }
          g.obstacles = []; // Clear current wave
        }

        // Remove offscreen
        if (o.y > canvas.height + 50) {
          g.obstacles.splice(index, 1);
          if (g.obstacles.length === 0) getNewQuestion(); // Missed all
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, currentQuestion, options]);

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
          Quantum Velocity
        </h2>
        <p className="text-white/40 text-sm">Steer using Left & Right arrows. Collect the correct scientific concepts!</p>
      </div>

      <div className="relative w-full max-w-[400px] h-[600px] bg-black/40 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
        {gameState === 'menu' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black/60 z-20">
            <RocketLauncher className="text-cyan-400 mb-6 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" size={80} />
            <button
              onClick={initGame}
              className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold text-xl px-12 py-4 rounded-full shadow-lg transform active:scale-95 transition-all flex items-center gap-3"
            >
              <Play size={24} /> Launch Mission
            </button>
            <div className="mt-8 text-white/40 text-xs text-center space-y-2">
              <p>Correct answer = Speed boost & points</p>
              <p>Wrong answer = Lose a life</p>
              <p>Avoid collisions with false data</p>
            </div>
          </div>
        )}

        {gameState === 'gameOver' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black/80 z-20">
            {showConfetti && <Confetti />}
            <Trophy size={64} className="text-yellow-400 mb-4" />
            <h3 className="text-3xl font-bold text-white">Mission Over</h3>
            <div className="text-5xl font-black text-cyan-400 my-4">{score}</div>
            <p className="text-white/40 mb-8 uppercase tracking-widest font-bold">Points Secured</p>
            <button
              onClick={initGame}
              className="bg-white text-black font-bold px-10 py-3 rounded-xl flex items-center gap-2 hover:bg-cyan-100 transition-colors"
            >
              <RotateCcw size={18} /> New Launch
            </button>
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={400}
          height={600}
          className="w-full h-full block"
        />

        {gameState === 'playing' && (
          <div className="absolute top-0 left-0 w-full p-4 pointer-events-none">
            <div className="flex justify-between items-start">
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <Heart
                    key={i}
                    size={20}
                    className={i < lives ? "text-red-500 fill-red-500" : "text-white/10"}
                  />
                ))}
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-white">{score}</div>
                <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-tighter">Multiplier: {multiplier.toFixed(1)}x</div>
              </div>
            </div>

            {currentQuestion && (
              <div className="absolute top-1/4 left-4 right-4 bg-white/5 backdrop-blur-md border border-white/10 p-4 rounded-xl text-center">
                <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Question Incoming</span>
                <p className="text-white text-sm font-medium mt-1 leading-tight">{currentQuestion.text}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const RocketLauncher = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3" />
    <path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5" />
  </svg>
);

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
          { id: 'challenge', label: 'Quantum Velocity', icon: <Zap size={18} /> },
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
