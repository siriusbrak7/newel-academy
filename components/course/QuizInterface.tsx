
import React, { useState, useEffect, useRef } from 'react';
import { Question, Submission } from '../../types';
import { saveSubmission } from '../../services/storageService';
import { getAITutorResponse } from '../../services/geminiService';
import { Type } from "@google/genai";
import { Timer, Loader2, CheckCircle, Clock, List, AlertCircle, ArrowLeft } from 'lucide-react';
import Confetti from '../Confetti';

interface QuizProps {
  title: string;
  questions: Question[];
  onComplete: (score: number, passed: boolean) => void;
  passThreshold: number;
  onClose: () => void;
  isAssessment?: boolean;
  isCourseFinal?: boolean;
  assessmentId?: string;
  username?: string;
  subject?: string;
  topicId?: string;
}

export const QuizInterface = ({ title, questions, onComplete, passThreshold, onClose, isAssessment, isCourseFinal, assessmentId, username, subject, topicId }: QuizProps) => {
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [grading, setGrading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [cheatingAttempts, setCheatingAttempts] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    setActiveQuestions([...questions]);
  }, [questions]);

  useEffect(() => {
    if (isAssessment || isCourseFinal) {
      let seconds = questions.reduce((acc, q) => acc + (q.type === 'MCQ' ? 25 : 1200), 0);
      seconds = Math.max(seconds, 60);
      startTimeRef.current = Date.now();
      setTimeLeft(seconds);
    }
  }, [questions, isAssessment, isCourseFinal]);

  useEffect(() => {
    if (timeLeft === null || submitted || grading || !startTimeRef.current || isPaused) return;
    const timerId = setInterval(() => {
      const elapsed = Math.floor((Date.now() - (startTimeRef.current || 0)) / 1000);
      const initialTime = questions.reduce((acc, q) => acc + (q.type === 'MCQ' ? 25 : 1200), 0);
      const remaining = Math.max(0, Math.max(initialTime, 60) - elapsed);
      setTimeLeft(remaining);
      if (remaining <= 0) { clearInterval(timerId); handleSubmit(true); }
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, submitted, grading, questions, isPaused]);

  // Anti-Cheating Listeners
  useEffect(() => {
    if (submitted || grading) return;

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        setIsPaused(true);
        setCheatingAttempts(prev => {
          const next = prev + 1;
          if (next >= 3) {
            // Swap Question logic
            setActiveQuestions(prevQs => {
              const newQs = [...prevQs];
              const current = newQs[currentQ];
              // Pick a different one from the pool if possible, or just shuffle
              const others = newQs.filter((_, i) => i !== currentQ);
              const randomReplacement = others[Math.floor(Math.random() * others.length)];
              if (randomReplacement) {
                newQs[currentQ] = { ...randomReplacement, id: `swapped_${Date.now()}` };
              }
              return newQs;
            });
            return 0; // Reset counter after swap
          }
          return next;
        });
      }
    };

    const preventCheating = (e: Event) => e.preventDefault();

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', () => setIsPaused(true));

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', () => setIsPaused(true));
    };
  }, [submitted, grading, currentQ]);

  const handleSubmit = async (forced = false) => {
    if (forced) alert("Time's up! Submitting...");
    setGrading(true);

    let mcqScore = 0, mcqCount = 0, theoryScore = 0, theoryFeedback = '';
    activeQuestions.forEach((q, idx) => {
      if (q.type === 'MCQ') {
        mcqCount++;
        if (answers[idx] === q.correctAnswer) mcqScore++;
      }
    });

    const theoryQIndex = activeQuestions.findIndex(q => q.type === 'THEORY');
    if (theoryQIndex >= 0) {
      try {
        const aiResponse = await getAITutorResponse(
          `Grade essay: "${answers[theoryQIndex]}" for Q: "${activeQuestions[theoryQIndex].text}"`,
          "Grading",
          { json: true, schema: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } }, required: ["score", "feedback"] } }
        );
        const result = JSON.parse(aiResponse);
        theoryScore = result.score; theoryFeedback = result.feedback;
      } catch { theoryScore = 50; theoryFeedback = "Auto-graded (Fallback)"; }
    }

    const finalPercent = mcqCount > 0 ? (theoryQIndex >= 0 ? ((mcqScore / mcqCount) * 70 + theoryScore * 0.3) : (mcqScore / mcqCount) * 100) : theoryScore;
    setScore(finalPercent); setFeedback(theoryFeedback); setSubmitted(true); setGrading(false);
    if (finalPercent >= passThreshold) setShowConfetti(true);

    if (username) {
      saveSubmission({
        assessmentId: assessmentId || `course_${title}`,
        username, answers: {}, submittedAt: Date.now(),
        graded: true, score: Math.round(finalPercent), feedback: theoryFeedback
      });
    }
    onComplete(finalPercent, finalPercent >= passThreshold);
  };

  if (grading) return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90"><Loader2 className="animate-spin text-cyan-400" size={48} /></div>;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      {showConfetti && <Confetti />}
      <div className="bg-slate-900 border border-white/20 p-6 rounded-2xl max-w-2xl w-full flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <div className="flex items-center gap-6">
            {cheatingAttempts > 0 && <div className="text-red-500 text-xs font-bold animate-pulse">Strikes: {cheatingAttempts}/3</div>}
            {timeLeft !== null && <div className="text-cyan-400 font-mono font-bold">Time: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>}
            <button onClick={onClose} className="text-white/50 hover:text-white">Close</button>
          </div>
        </div>

        {!submitted ? (
          <div
            className="flex-grow overflow-y-auto relative"
            onCopy={e => e.preventDefault()}
            onPaste={e => e.preventDefault()}
            onCut={e => e.preventDefault()}
          >
            {isPaused && (
              <div className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center text-red-500">
                  <AlertCircle size={32} />
                </div>
                <h4 className="text-2xl font-bold text-white">Session Paused</h4>
                <p className="text-white/60 text-sm max-w-xs">
                  A tab switch or loss of focus was detected. Switching tabs more than 3 times will result in a question swap.
                </p>
                <button
                  onClick={() => setIsPaused(false)}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-8 py-2 rounded-xl transition-all"
                >
                  Resume Assessment
                </button>
              </div>
            )}

            <p className="text-lg text-white mb-6 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
              <span className="text-cyan-400 font-mono mr-2">Q{currentQ + 1}:</span>
              {activeQuestions[currentQ]?.text}
            </p>
            {activeQuestions[currentQ]?.type === 'MCQ' ? (
              <div className="space-y-3">
                {activeQuestions[currentQ].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setAnswers({ ...answers, [currentQ]: opt })}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${answers[currentQ] === opt ? 'bg-cyan-600/30 border-cyan-400 text-white' : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'}`}
                  >
                    <span className="inline-block w-8 font-bold opacity-30">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <textarea
                className="w-full h-48 bg-black/30 border border-white/10 rounded-xl p-4 text-white focus:border-cyan-500/50 outline-none transition-all"
                placeholder="Type your answer here..."
                value={answers[currentQ] || ''}
                onChange={(e) => setAnswers({ ...answers, [currentQ]: e.target.value })}
                onPaste={e => e.preventDefault()}
              />
            )}
            <div className="flex justify-between mt-8">
              <button disabled={currentQ === 0} onClick={() => setCurrentQ(c => c - 1)} className="text-white/50 hover:text-white transition-colors flex items-center gap-2">
                <ArrowLeft size={16} /> Previous
              </button>
              {currentQ < activeQuestions.length - 1 ? (
                <button onClick={() => setCurrentQ(c => c + 1)} className="bg-cyan-600 hover:bg-cyan-500 px-8 py-2 rounded-xl text-white font-bold transition-all shadow-lg shadow-cyan-900/40">
                  Next Question
                </button>
              ) : (
                <button onClick={() => handleSubmit()} className="bg-green-600 hover:bg-green-500 px-8 py-2 rounded-xl text-white font-bold transition-all shadow-lg shadow-green-900/40">
                  Submit Assessment
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center p-8">
            <h2 className="text-4xl font-bold text-white mb-4">{Math.round(score)}%</h2>
            <p className="text-white/60 mb-6">{feedback}</p>
            <button onClick={onClose} className="bg-white/10 px-8 py-2 rounded-lg text-white">Done</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizInterface;
