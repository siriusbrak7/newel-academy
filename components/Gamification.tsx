import * as React from 'react';
const { useState, useEffect, useRef } = React;
import { User, LeaderboardEntry, Question } from '../types';
import { saveQuantumVelocityScore, getLeaderboards } from '../services/storageService';
import { QUESTION_BANK } from '../constants';
import { Trophy, Zap, Target, Play, RotateCcw, ArrowLeft, Heart, Star, Pause, HelpCircle, X, Check, XCircle } from 'lucide-react';
import Confetti from './Confetti';

// Custom SVG Icon Component for visual flair
const RocketLauncher = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.71-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3" />
    <path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5" />
  </svg>
);

// --- COSMIC SCIENCE RUNNER GAME (CYBER-COSMIC OVERHAUL) ---
export const SprintChallenge = ({ user }: { user: User }) => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [multiplier, setMultiplier] = useState(1);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string, type: 'success' | 'error', id: number } | null>(null);

  // New Visual State
  const [shakeIntensity, setShakeIntensity] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<{
    playerX: number;
    targetX: number;
    lane: number;
    obstacles: any[];
    stars: any[];
    particles: { x: number, y: number, vx: number, vy: number, life: number, color: string, size: number }[];
    frame: number;
    speed: number;
    questionTimer: number;
    warpSpeed: boolean;
  }>({
    playerX: 1, // 0, 1, 2 for lanes
    targetX: 1,
    lane: 1,
    obstacles: [],
    stars: [],
    particles: [],
    frame: 0,
    speed: 5,
    questionTimer: 0,
    warpSpeed: false
  });

  const LANS_COUNT = 3;
  const usedQuestionIds = useRef<string[]>([]);

  const getNewQuestion = () => {
    const subjects = ['Biology', 'Physics', 'Chemistry'];
    const sub = subjects[Math.floor(Math.random() * subjects.length)];
    const pool = QUESTION_BANK[sub] || [];
    if (pool.length === 0) return null;

    // Filter out recently used questions to prevent repeats
    let available = pool.filter(q => !usedQuestionIds.current.includes(q.id));
    if (available.length === 0) {
      usedQuestionIds.current = []; // Reset if we've cycled through all
      available = pool;
    }

    const q = available[Math.floor(Math.random() * available.length)];

    // Add to used list (keep last 10)
    usedQuestionIds.current.push(q.id);
    if (usedQuestionIds.current.length > 10) usedQuestionIds.current.shift();

    setCurrentQuestion(q);
    setOptions([...q.options].sort(() => 0.5 - Math.random()));
    return q;
  };

  const createParticles = (x: number, y: number, color: string, count: number = 20) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      gameRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color,
        size: Math.random() * 3 + 1
      });
    }
  };

  const initGame = () => {
    setScore(0);
    setLives(3);
    setMultiplier(1);
    setGameState('playing');
    setIsPaused(false);
    setFeedback(null);
    setShakeIntensity(0);
    getNewQuestion();

    // Create initial stars
    const stars = [];
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random() * 400,
        y: Math.random() * 600,
        size: Math.random() * 2,
        speed: Math.random() * 2 + 1,
        z: Math.random() * 2 // depth for parallax
      });
    }
    gameRef.current.stars = stars;
    gameRef.current.obstacles = [];
    gameRef.current.particles = [];
    gameRef.current.playerX = 1;
    gameRef.current.targetX = 1;
    gameRef.current.lane = 1;
    gameRef.current.speed = 8; // Faster base speed for excitement
    gameRef.current.warpSpeed = false;
  };

  const handleInput = (e: KeyboardEvent) => {
    if (gameState !== 'playing' || isPaused) return;
    if (e.key === 'ArrowLeft') {
      gameRef.current.lane = Math.max(0, gameRef.current.lane - 1);
    } else if (e.key === 'ArrowRight') {
      gameRef.current.lane = Math.min(2, gameRef.current.lane + 1);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleInput);
    return () => window.removeEventListener('keydown', handleInput);
  }, [gameState, isPaused]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let shakeTimer = 0;

    const render = () => {
      if (isPaused) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const g = gameRef.current;
      g.frame++;

      // Screen Shake Decay
      if (shakeIntensity > 0) {
        setShakeIntensity(prev => Math.max(0, prev - 1));
        shakeTimer = shakeIntensity;
      } else {
        shakeTimer = 0;
      }

      // Clear with Trail Effect (Dark Space)
      ctx.fillStyle = g.warpSpeed ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.save();

      // Apply Screen Shake
      if (shakeTimer > 0) {
        const dx = (Math.random() - 0.5) * shakeTimer;
        const dy = (Math.random() - 0.5) * shakeTimer;
        ctx.translate(dx, dy);
      }

      // Draw Stars (Warp Effect)
      ctx.fillStyle = 'white';
      g.stars.forEach(s => {
        if (g.warpSpeed || multiplier >= 3) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(200, 255, 255, ${0.2 * s.z})`;
          ctx.lineWidth = s.size;
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x, s.y - (s.speed * 8));
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + Math.random() * 0.5})`;
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
        }

        s.y += s.speed * (g.warpSpeed ? 2 : 1) * s.z;
        if (s.y > canvas.height) {
          s.y = 0;
          s.x = Math.random() * canvas.width;
        }
      });

      // Update Player Position (Smooth lerp)
      const targetWidthX = (canvas.width / LANS_COUNT) * g.lane + (canvas.width / LANS_COUNT / 2);
      g.playerX += (targetWidthX - g.playerX) * 0.15;

      // Update & Draw Particles
      for (let i = g.particles.length - 1; i >= 0; i--) {
        const p = g.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        p.size *= 0.95;

        if (p.life <= 0) {
          g.particles.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // Draw Player Ship (Cyber-Fighter)
      ctx.save();
      ctx.translate(g.playerX, canvas.height - 80);

      const lean = (g.playerX - targetWidthX) * 0.05;
      ctx.rotate(lean * Math.PI / 180);

      ctx.shadowBlur = 20;
      ctx.shadowColor = '#06b6d4';

      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(0, -30);
      ctx.lineTo(20, 15);
      ctx.lineTo(0, 5);
      ctx.lineTo(-20, 15);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(5, 5);
      ctx.lineTo(-5, 5);
      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur = 30;
      ctx.shadowColor = '#ec4899';
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.moveTo(-8, 15);
      ctx.lineTo(8, 15);
      ctx.lineTo(0, 25 + Math.random() * 10);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // Spawn/Update Obstacles
      if (g.frame % 100 === 0 && currentQuestion) {
        if (!g.obstacles.some(o => o.type === 'answer')) {
          const shuffledOptions = [...options];
          for (let i = 0; i < 3; i++) {
            g.obstacles.push({
              x: (canvas.width / 3) * i + (canvas.width / 6),
              y: -50,
              type: 'answer',
              text: shuffledOptions[i] || '',
              lane: i,
              color: i === 0 ? '#06b6d4' : i === 1 ? '#a855f7' : '#ec4899'
            });
          }
        }
      }

      // Draw & Update Obstacles
      g.obstacles.forEach((o, index) => {
        o.y += g.speed;

        ctx.save();
        ctx.translate(o.x, o.y);

        const pulse = 1 + Math.sin(g.frame * 0.1) * 0.2;
        ctx.shadowBlur = 20 * pulse;
        ctx.shadowColor = o.color;

        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.strokeStyle = o.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px "Courier New"';
        ctx.shadowBlur = 0;
        ctx.textAlign = 'center';
        ctx.fillText(o.text.substring(0, 15), 0, 5);
        ctx.restore();

        // Collision Check
        if (Math.abs(o.y - (canvas.height - 80)) < 40 && g.lane === o.lane) {
          if (o.text === currentQuestion?.correctAnswer) {
            setScore(prev => prev + (100 * multiplier));
            setMultiplier(prev => Math.min(prev + 0.5, 10));
            g.speed += 0.2;
            g.warpSpeed = true;
            setTimeout(() => { g.warpSpeed = false; }, 1000);

            setFeedback({ text: 'HYPER DRIVE!', type: 'success', id: Date.now() });
            createParticles(o.x, o.y, '#22d3ee', 30);
            setShakeIntensity(5);

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
            setFeedback({ text: 'HULL BREACH!', type: 'error', id: Date.now() });
            createParticles(o.x, o.y, '#ef4444', 40);
            setShakeIntensity(20);

            getNewQuestion();
          }
          g.obstacles = [];
        }

        if (o.y > canvas.height + 50) {
          g.obstacles.splice(index, 1);
          if (g.obstacles.length === 0) getNewQuestion();
        }
      });
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameState, currentQuestion, options, isPaused, shakeIntensity]);

  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center">
      <div className="relative w-full max-w-[500px] h-[700px] bg-black border-[3px] border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.3)]">

        {/* CRT Scanline Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[5] bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20"></div>

        {gameState === 'menu' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black/80 z-20 backdrop-blur-sm">
            <RocketLauncher className="text-cyan-400 mb-6 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)] animate-bounce" size={100} />
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-500 mb-2 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] text-center leading-tight">
              NEON<br />VELOCITY
            </h1>
            <p className="text-cyan-300/80 mb-8 font-mono text-center max-w-md tracking-wider">
              &gt; SYSTEM READY<br />&gt; AWAITING PILOT INPUT
            </p>

            <div className="flex gap-4">
              <button
                onClick={initGame}
                className="group relative px-8 py-4 bg-cyan-600/20 border border-cyan-500 text-cyan-400 font-bold font-mono text-xl overflow-hidden transition-all hover:bg-cyan-500 hover:text-black hover:shadow-[0_0_20px_rgba(34,211,238,0.6)]"
              >
                <div className="absolute inset-0 w-full h-full bg-cyan-400/20 transform -translate-x-full transition-transform group-hover:translate-x-0"></div>
                [ INITIALIZE ]
              </button>

              <button
                onClick={() => setShowHelp(true)}
                className="p-4 border border-white/20 text-white/60 hover:text-white hover:border-white transition-all rounded-full"
              >
                <HelpCircle size={24} />
              </button>
            </div>

            {showHelp && (
              <div className="absolute inset-0 z-30 bg-gray-900/95 flex flex-col items-center justify-center p-8 backdrop-blur-xl">
                <div className="bg-black border border-cyan-500 p-8 max-w-sm w-full relative shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                  <button onClick={() => setShowHelp(false)} className="absolute top-2 right-2 text-cyan-500 hover:text-cyan-300">
                    <X size={24} />
                  </button>
                  <h3 className="text-xl font-mono text-cyan-400 mb-6 border-b border-cyan-900 pb-2">MISSION_BRIEFING.TXT</h3>
                  <ul className="space-y-4 font-mono text-sm text-gray-300">
                    <li className="flex gap-3"><span className="text-cyan-500">&gt;</span> Steer with Arrow Keys</li>
                    <li className="flex gap-3"><span className="text-green-500">&gt;</span> Collect CORRECT answers</li>
                    <li className="flex gap-3"><span className="text-red-500">&gt;</span> AVOID wrong data</li>
                    <li className="flex gap-3"><span className="text-purple-500">&gt;</span> Build COMBO for Speed</li>
                  </ul>
                  <button onClick={() => setShowHelp(false)} className="w-full mt-6 py-2 bg-cyan-500 text-black font-black font-mono hover:bg-white transition-colors">
                    UNDERSTOOD
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {gameState === 'gameOver' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-black/95 z-20">
            {showConfetti && <Confetti />}
            <Trophy size={64} className="text-yellow-400 mb-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
            <h3 className="text-4xl font-black text-white mb-2 tracking-tighter">MISSION COMPLETE</h3>
            <div className="text-7xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-purple-500 my-6 drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]">
              {score}
            </div>

            <div className="flex items-center gap-2 mb-8 bg-white/5 border border-white/10 px-6 py-2 rounded-full">
              <span className="text-cyan-400 font-mono font-bold tracking-widest">
                RANK: {score > 1000 ? "CYBER_LORD" : score > 500 ? "NET_RUNNER" : "SCRIPT_KIDDIE"}
              </span>
            </div>

            <button
              onClick={initGame}
              className="px-8 py-3 bg-white text-black font-black font-mono text-lg hover:bg-cyan-400 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              RESTART_SYSTEM
            </button>
          </div>
        )}

        <canvas
          ref={canvasRef}
          width={500}
          height={700}
          className={`w-full h-full block transition-transform duration-75 ${shakeIntensity > 0 ? 'scale-[1.02]' : 'scale-100'}`}
        />

        {gameState === 'playing' && (
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-2">
                <div className="flex gap-1 items-center bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-red-500/30">
                  <span className="text-[10px] text-red-500 font-bold mr-1">HULL</span>
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 w-6 skew-x-[-20deg] ${i < lives ? "bg-red-500 shadow-[0_0_10px_red]" : "bg-red-900/30"}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="pointer-events-auto self-start mt-2 p-2 hover:text-cyan-400 text-white/50 transition-colors"
                >
                  {isPaused ? <Play size={24} /> : <Pause size={24} />}
                </button>
              </div>

              <div className="text-right">
                <div className="font-mono text-5xl font-black text-white italic drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] tracking-tighter">
                  {score}
                </div>
                <div className={`text-xs font-bold font-mono uppercase tracking-widest ${multiplier > 1 ? 'text-purple-400 animate-pulse' : 'text-gray-500'}`}>
                  Multiplier x{multiplier.toFixed(1)}
                </div>
              </div>
            </div>

            {isPaused && (
              <div className="absolute inset-0 flex items-center justify-center">
                <h2 className="text-6xl font-black text-white tracking-[1rem] opacity-50 animate-pulse">PAUSED</h2>
              </div>
            )}

            {feedback && (
              <div key={feedback.id} className="absolute top-1/2 left-0 w-full text-center transform -translate-y-1/2">
                <h2 className={`text-5xl font-black italic tracking-tighter ${feedback.type === 'success' ? 'text-cyan-400 drop-shadow-[0_0_20px_cyan]' : 'text-red-500 drop-shadow-[0_0_20px_red]'} animate-bounce`}>
                  {feedback.text}
                </h2>
              </div>
            )}

            {currentQuestion && (
              <div className={`mb-4 transition-all duration-300 ${isPaused ? 'opacity-0' : 'opacity-100'}`}>
                <div className="bg-black/80 backdrop-blur-xl border-t-2 border-cyan-500 p-6 rounded-t-3xl shadow-[0_-10px_30px_rgba(6,182,212,0.2)]">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">[ INCOMING DATA STREAM ]</span>
                    <span className="text-[10px] font-mono text-white/30 uppercase">{currentQuestion.topic}</span>
                  </div>
                  <p className="text-white text-lg font-medium leading-snug font-sans">{currentQuestion.text}</p>
                </div>
              </div>
            )}
          </div>
        )}
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
                <td className="p-4 font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{entry.username}</td>
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
        <h2 className="text-4xl font-black text-white mb-2 italic tracking-tighter">LEADERBOARDS</h2>
        <p className="text-white/40 font-mono text-xs uppercase tracking-widest">Global Ranking System Output</p>
      </div>

      <div className="flex justify-center flex-wrap gap-4 mb-8">
        {[
          { id: 'academic', label: 'ACADEMIC', icon: <Target size={18} /> },
          { id: 'challenge', label: 'QUANTUM VELOCITY', icon: <Zap size={18} /> },
          { id: 'assessments', label: 'ASSESSMENTS', icon: <Trophy size={18} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-none font-black font-mono transition-all border-b-2 ${activeTab === tab.id
              ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10'
              : 'border-transparent text-white/40 hover:text-white hover:bg-white/5'
              }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-2 shadow-2xl">
        {activeTab === 'academic' && renderTable(data.academic, 'Completion')}
        {activeTab === 'challenge' && renderTable(data.challenge, 'Score')}
        {activeTab === 'assessments' && renderTable(data.assessments, 'Avg Score')}
      </div>
    </div>
  );
};
