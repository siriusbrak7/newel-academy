import React, { useState, useEffect } from 'react';
import { User, Topic, TopicProgress } from '../../types';
import { getCourses, getProgress, updateTopicProgress } from '../../services/storageService';
import { QUESTION_BANK, IGCSE_CELL_BIO_THEORY } from '../../constants';
import { ArrowLeft, Play, CheckCircle2, Lock, FileText, Globe, MessageSquare } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import QuizInterface from './QuizInterface';
import AITutorChat from '../AITutorChat';

const TopicDetail = ({ user }: { user: User }) => {
    const { subject, topicId } = useParams<{ subject: string; topicId: string }>();
    const navigate = useNavigate();
    const [topic, setTopic] = useState<Topic | null>(null);
    const [progress, setProgress] = useState<TopicProgress | null>(null);
    const [activeQuiz, setActiveQuiz] = useState<any>(null);
    const [showAITutor, setShowAITutor] = useState(false);

    useEffect(() => {
        if (!subject || !topicId) return;
        const t = getCourses()[subject]?.[topicId];
        if (t) {
            setTopic(t);
            setProgress(getProgress(user.username)[subject]?.[topicId] || { subtopics: {}, checkpointScores: {}, mainAssessmentPassed: false });
        } else navigate('/courses');
    }, [subject, topicId, user.username, navigate]);

    if (!topic || !progress) return <div className="p-20 text-center text-white/50">Loading...</div>;

    const startCheckpoint = (st: string) => {
        if (!subject || !topic) return;
        const pool = topic.subtopicQuestions?.[st] || QUESTION_BANK[subject]?.filter(q => q.topic === topic.id).slice(0, 5) || [];
        setActiveQuiz({ title: `Checkpoint: ${st}`, questions: pool, isMain: false, subtopic: st });
    };

    const startMain = () => {
        if (!subject || !topic) return;
        const pool = QUESTION_BANK[subject]?.filter(q => q.topic === topic.id).slice(0, 10) || [];
        const theory = IGCSE_CELL_BIO_THEORY[0]; // Simplified
        setActiveQuiz({ title: `${topic.title} Assessment`, questions: [...pool, theory], isMain: true });
    };

    const onQuizComplete = (score: number, passed: boolean) => {
        if (!subject || !topicId || !activeQuiz || !progress) return;
        if (activeQuiz.isMain) updateTopicProgress(user.username, subject, topicId, { mainAssessmentScore: score, mainAssessmentPassed: passed });
        else updateTopicProgress(user.username, subject, topicId, { subtopics: { ...progress.subtopics, [activeQuiz.subtopic]: passed } });
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {activeQuiz && (
                <QuizInterface
                    title={activeQuiz.title}
                    questions={activeQuiz.questions}
                    passThreshold={80}
                    onComplete={onQuizComplete}
                    onClose={() => setActiveQuiz(null)}
                    isCourseFinal={activeQuiz.isMain}
                    username={user.username}
                    subject={subject}
                    topicId={topicId}
                />
            )}

            <button onClick={() => navigate('/courses')} className="mb-6 flex items-center gap-2 text-white/50 hover:text-white transition-colors">
                <ArrowLeft size={18} /> Back to Courses
            </button>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">{subject}</span>
                        <h2 className="text-4xl font-bold text-white mt-1">{topic.title}</h2>
                    </div>
                    <button
                        onClick={() => setShowAITutor(true)}
                        className="flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 px-4 py-2 rounded-xl border border-purple-500/30 transition-all shadow-lg shadow-purple-500/10"
                    >
                        <MessageSquare size={18} /> Ask Newel
                    </button>
                </div>
                <p className="text-white/70 text-lg leading-relaxed">{topic.description}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Play size={20} className="text-cyan-400" /> Learning Checkpoints
                    </h3>
                    <div className="space-y-3">
                        {topic.subtopics.map((st, i) => {
                            const isLocked = i > 0 && !progress.subtopics[topic.subtopics[i - 1]];
                            const isPassed = progress.subtopics[st];

                            return (
                                <div
                                    key={st}
                                    className={`p-5 rounded-2xl border flex justify-between items-center transition-all ${isLocked ? 'bg-black/20 border-white/5 opacity-50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${isPassed ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}>
                                            {isPassed ? <CheckCircle2 size={18} /> : i + 1}
                                        </div>
                                        <span className="text-white font-medium">{st}</span>
                                    </div>

                                    {isLocked ? (
                                        <Lock size={18} className="text-white/20" />
                                    ) : (
                                        <button
                                            onClick={() => startCheckpoint(st)}
                                            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase ${isPassed ? 'bg-white/10 text-white/50 hover:bg-white/20' : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-lg shadow-cyan-500/20'}`}
                                        >
                                            {isPassed ? 'Retake' : 'Start'}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="pt-6">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <FileText size={20} className="text-purple-400" /> Study Materials
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {topic.materials.length === 0 && <p className="text-white/30 italic text-sm">No materials uploaded yet.</p>}
                            {topic.materials.map(m => {
                                const youtubeRegex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
                                const ytMatch = m.type === 'link' ? m.content.match(youtubeRegex) : null;
                                const ytId = ytMatch ? ytMatch[1] : null;

                                if (ytId) {
                                    return (
                                        <div key={m.id} className="col-span-full bg-black/40 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                                            <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Play size={16} className="text-red-500" />
                                                    <span className="text-sm font-bold text-white">{m.title}</span>
                                                </div>
                                                <span className="text-[10px] text-white/30 uppercase font-mono">YouTube Player</span>
                                            </div>
                                            <div className="aspect-video relative">
                                                <iframe
                                                    src={`https://www.youtube.com/embed/${ytId}`}
                                                    title={m.title}
                                                    className="absolute inset-0 w-full h-full"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                ></iframe>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <a
                                        key={m.id}
                                        href={m.type === 'link' ? m.content : '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center gap-3 hover:bg-white/10 transition-colors"
                                    >
                                        <div className="p-2 bg-white/5 rounded-lg">
                                            {m.type === 'link' ? <Globe size={18} className="text-blue-400" /> : <FileText size={18} className="text-orange-400" />}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-white font-medium text-sm truncate">{m.title}</p>
                                            <p className="text-white/30 text-[10px] uppercase font-bold">{m.type}</p>
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div>
                    <div className={`bg-gradient-to-br p-6 rounded-3xl border transition-all ${Object.keys(progress.subtopics).length === topic.subtopics.length ? 'from-cyan-900/40 to-purple-900/40 border-cyan-500/30' : 'from-slate-900 to-slate-800 border-white/10 opacity-50'}`}>
                        <h3 className="text-lg font-bold text-white mb-4">Final Assessment</h3>
                        <p className="text-white/50 text-sm mb-6">Master all checkpoints to unlock the topic certification quiz.</p>

                        {progress.mainAssessmentPassed ? (
                            <div className="bg-green-500/20 border border-green-500/30 p-4 rounded-2xl text-center">
                                <CheckCircle2 size={32} className="text-green-400 mx-auto mb-2" />
                                <p className="text-green-400 font-bold">TOPIC MASTERED</p>
                                <p className="text-white/40 text-[10px] mt-1">Score: {progress.mainAssessmentScore}%</p>
                                <button onClick={startMain} className="mt-4 text-xs text-white/50 hover:text-white underline">Retake Quiz</button>
                            </div>
                        ) : (
                            <button
                                disabled={Object.keys(progress.subtopics).length < topic.subtopics.length}
                                onClick={startMain}
                                className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-white/5 disabled:text-white/20 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20"
                            >
                                Unlock Assessment
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {showAITutor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-2xl bg-slate-900 border border-white/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[80vh]">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><MessageSquare /></div>
                                <div>
                                    <h4 className="font-bold text-white">Newel (AI Science Mentor)</h4>
                                    <p className="text-[10px] text-white/40 uppercase">Topic Context: {topic.title}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAITutor(false)} className="text-white/30 hover:text-white"><ArrowLeft /></button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <AITutorChat context={`Subject: ${subject}\nTopic: ${topic.title}\nDescription: ${topic.description}`} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TopicDetail;
