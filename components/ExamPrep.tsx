
import React, { useState, useEffect } from 'react';
import { User, Question } from '../types';
import { generateExamQuestions } from '../services/geminiService';
import { saveExamQuestionsToBank, saveExamSession, getExamQuestionBank } from '../services/storageService';
import { Rocket, Brain, Target, List, ChevronRight, Loader2, CheckCircle, AlertCircle, TrendingUp, Search } from 'lucide-react';
import { QuizInterface } from './course/QuizInterface';
import { EXAM_TOPICS } from '../constants';

interface ExamPrepProps {
    user: User;
}

const ExamPrep = ({ user }: { user: User }) => {
    const [step, setStep] = useState<'config' | 'loading' | 'quiz' | 'results'>('config');
    const [config, setConfig] = useState({
        subject: 'Physics' as keyof typeof EXAM_TOPICS,
        topic: EXAM_TOPICS['Physics'][0],
        format: 'MCQ' as 'MCQ' | 'THEORY' | 'MIXED',
        count: 10
    });
    const [questions, setQuestions] = useState<any[]>([]);
    const [score, setScore] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);

    const subjects = Object.keys(EXAM_TOPICS) as (keyof typeof EXAM_TOPICS)[];
    const formats = [
        { id: 'MCQ', label: 'Multiple Choice', icon: <List size={18} /> },
        { id: 'THEORY', label: 'Theory / Written', icon: <Brain size={18} /> },
        { id: 'MIXED', label: 'Mixed Hybrid', icon: <TrendingUp size={18} /> }
    ];

    // Reset topic when subject changes
    useEffect(() => {
        if (!EXAM_TOPICS[config.subject].includes(config.topic)) {
            setConfig(prev => ({ ...prev, topic: EXAM_TOPICS[config.subject][0] }));
        }
    }, [config.subject]);

    const generateQuestions = async () => {
        if (!config.topic) return;
        setStep('loading');
        setIsGenerating(true);

        try {
            // 1. Generate via AI
            const aiQuestions = await generateExamQuestions(
                config.subject,
                config.topic,
                user.gradeLevel || '10',
                config.count,
                config.format
            );

            if (aiQuestions && aiQuestions.length > 0) {
                setQuestions(aiQuestions);
                setStep('quiz');
                // 2. Remember for future use
                saveExamQuestionsToBank(aiQuestions);
            } else {
                alert("Failed to generate questions. Please try a different topic.");
                setStep('config');
            }
        } catch (error) {
            console.error(error);
            setStep('config');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleComplete = (finalScore: number, passed: boolean) => {
        setScore(finalScore);
        setStep('results');

        // Save session metrics
        saveExamSession({
            id: Date.now().toString(),
            username: user.username,
            subject: config.subject,
            topic: config.topic,
            gradeLevel: user.gradeLevel || '10',
            count: config.count,
            format: config.format,
            score: finalScore,
            timestamp: Date.now(),
            questions: questions
        });
    };

    if (step === 'loading') {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-8 animate-fade-in text-center p-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-cyan-500/20 blur-3xl rounded-full animate-pulse"></div>
                    <Loader2 size={80} className="text-cyan-400 animate-spin relative z-10" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-white italic tracking-tight">ANALYZING EXAM DATABASES...</h2>
                    <p className="text-cyan-300 font-mono animate-pulse">FETCHING ACCREDITED QUESTIONS FROM CAIE / IB / AP...</p>
                </div>
                <div className="max-w-md bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-md">
                    <p className="text-white/60 text-sm">Newel is searching for standardized past paper questions related to <span className="text-white font-bold">{config.topic}</span> for Grade {user.gradeLevel}...</p>
                </div>
            </div>
        );
    }

    if (step === 'quiz') {
        return (
            <div className="animate-fade-in">
                <QuizInterface
                    title={`${config.subject}: ${config.topic} - Exam Prep`}
                    questions={questions}
                    passThreshold={70}
                    onComplete={handleComplete}
                    onClose={() => setStep('config')}
                    isAssessment={true}
                    username={user.username}
                />
            </div>
        );
    }

    if (step === 'results') {
        return (
            <div className="max-w-2xl mx-auto py-12 animate-fade-in">
                <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-10 text-center space-y-8 shadow-2xl">
                    <div className="inline-flex p-4 bg-green-500/10 rounded-full border border-green-500/20">
                        <CheckCircle size={60} className="text-green-400" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-4xl font-black text-white">REVISION COMPLETE</h2>
                        <p className="text-white/40 font-medium">Standardized Exam Prep Results</p>
                    </div>

                    <div className="flex justify-center gap-12">
                        <div className="text-center">
                            <p className="text-5xl font-black text-white">{score}%</p>
                            <p className="text-white/40 text-xs uppercase tracking-widest mt-1">Accuracy</p>
                        </div>
                        <div className="text-center">
                            <p className="text-5xl font-black text-white">{questions.length}</p>
                            <p className="text-white/40 text-xs uppercase tracking-widest mt-1">Questions</p>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-left space-y-3">
                        <h4 className="text-cyan-400 font-bold flex items-center gap-2">< Brain size={18} /> Newel's Insight</h4>
                        <p className="text-white/70 text-sm leading-relaxed">
                            {score >= 80
                                ? "Excellent mastery of this topic! You're ready for the actual exams. Consider trying the MIXED format next for higher complexity."
                                : "Good effort. You should focus on clarifying the core principles of this topic. I've saved these questions for your next review session."}
                        </p>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            onClick={() => setStep('config')}
                            className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all"
                        >
                            Back to Menu
                        </button>
                        <button
                            onClick={generateQuestions}
                            className="flex-1 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-all"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-12 space-y-12 animate-fade-in">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold tracking-widest">
                    <Target size={14} /> <span>SMART EXAM PREP</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-white leading-tight">Master Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">Curriculum</span></h1>
                <p className="text-white/60 text-lg max-w-2xl mx-auto">AI-generated challenges sourced from accredited <span className="text-white font-bold">CAIE, IB, and AP</span> past papers across Biology, Physics, and Chemistry.</p>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] -mr-32 -mt-32"></div>

                <div className="space-y-10 relative z-10">
                    {/* Subject Select */}
                    <div className="space-y-4">
                        <label className="text-white/40 text-sm uppercase tracking-widest font-bold">1. Select Subject</label>
                        <div className="grid grid-cols-3 gap-4">
                            {subjects.map(s => (
                                <button
                                    key={s}
                                    onClick={() => setConfig({ ...config, subject: s })}
                                    className={`py-6 rounded-2xl border-2 transition-all font-bold text-lg ${config.subject === s ? 'border-cyan-500 bg-cyan-500/10 text-white shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'border-white/5 bg-white/5 text-white/40 hover:border-white/20'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Topic Select */}
                    <div className="space-y-4">
                        <label className="text-white/40 text-sm uppercase tracking-widest font-bold">2. What topic are you revising?</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-white/20 group-focus-within:text-cyan-400 transition-colors">
                                <Search size={22} />
                            </div>
                            <select
                                value={config.topic}
                                onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                                className="w-full bg-slate-900/80 border-2 border-white/5 rounded-2xl py-6 pl-14 pr-6 text-xl text-white appearance-none focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all shadow-inner cursor-pointer"
                            >
                                {EXAM_TOPICS[config.subject].map(t => (
                                    <option key={t} value={t} className="bg-slate-900 text-white">{t}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-white/20">
                                <ChevronRight size={22} className="rotate-90" />
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Format Select */}
                        <div className="space-y-4">
                            <label className="text-white/40 text-sm uppercase tracking-widest font-bold">3. Mode</label>
                            <div className="grid grid-cols-1 gap-2">
                                {formats.map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => setConfig({ ...config, format: f.id as any })}
                                        className={`flex items-center gap-4 px-6 py-4 rounded-xl border transition-all ${config.format === f.id ? 'bg-white/10 border-cyan-500 text-white' : 'bg-white/5 border-transparent text-white/40 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-lg ${config.format === f.id ? 'bg-cyan-500 text-white' : 'bg-white/10 text-white/20'}`}>{f.icon}</div>
                                        <span className="font-bold">{f.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Count Select */}
                        <div className="space-y-4">
                            <label className="text-white/40 text-sm uppercase tracking-widest font-bold">4. Length: <span className="text-white">{config.count} Qs</span></label>
                            <input
                                type="range"
                                min="5"
                                max="20"
                                step="5"
                                value={config.count}
                                onChange={(e) => setConfig({ ...config, count: parseInt(e.target.value) })}
                                className="w-full h-3 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                            <div className="flex justify-between text-[10px] text-white/20 font-bold uppercase tracking-tighter">
                                <span>5 Qs (Quick)</span>
                                <span>10 Qs (Standard)</span>
                                <span>20 Qs (Deep Dive)</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={generateQuestions}
                        disabled={!config.topic || isGenerating}
                        className="w-full py-6 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 text-white font-black text-2xl rounded-2xl shadow-[0_0_50px_rgba(168,85,247,0.3)] hover:shadow-[0_0_70px_rgba(6,182,212,0.4)] disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-4"
                    >
                        <span>COMMENCE SESSION</span>
                        <Rocket size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExamPrep;
