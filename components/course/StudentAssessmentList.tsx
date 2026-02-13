import React, { useState, useEffect } from 'react';
import { User, Assessment, Submission } from '../../types';
import { getAssessments, getSubmissions, saveSubmission } from '../../services/storageService';
import { ClipboardList, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import QuizInterface from './QuizInterface';

const StudentAssessmentList: React.FC<{ user: User }> = ({ user }) => {
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [activeQuiz, setActiveQuiz] = useState<Assessment | null>(null);

    const loadData = () => {
        const all = getAssessments();
        const subs = getSubmissions();
        const filtered = all.filter(a => a.targetGrade === 'all' || a.targetGrade === user.gradeLevel);
        setAssessments(filtered);
        setSubmissions(subs.filter(s => s.username === user.username));
    };

    useEffect(() => {
        loadData();
    }, [user.username, user.gradeLevel]);

    const onQuizComplete = (score: number, passed: boolean) => {
        if (!activeQuiz) return;
        const submission: Submission = {
            assessmentId: activeQuiz.id,
            username: user.username,
            answers: {}, // Simplified
            submittedAt: Date.now(),
            graded: true,
            score: score,
            aiGraded: true
        };
        saveSubmission(submission);
        loadData();
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="mb-10">
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <ClipboardList className="text-purple-400" size={32} /> My Assessments
                </h2>
                <p className="text-white/50 text-sm">Review pending and completed evaluations.</p>
            </div>

            <div className="space-y-4">
                {assessments.map(a => {
                    const sub = submissions.find(s => s.assessmentId === a.id);
                    const isDone = !!sub;

                    return (
                        <div key={a.id} className="bg-white/5 border border-white/10 p- map6 rounded-2xl flex justify-between items-center group hover:bg-white/10 transition-all">
                            <div className="flex items-center gap-6">
                                <div className={`p-4 rounded-xl ${isDone ? 'bg-green-500/20 text-green-400' : 'bg-purple-900/30 text-purple-400'}`}>
                                    {isDone ? <CheckCircle2 size={24} /> : <div className="font-bold">{a.questions.length}</div>}
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">{a.title}</h4>
                                    <div className="flex gap-4 mt-2">
                                        <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest px-2 py-0.5 bg-white/5 rounded">{a.subject}</span>
                                        <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest px-2 py-0.5 bg-white/5 rounded flex items-center gap-1">
                                            {isDone ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                                            {isDone ? `Scored ${Math.round(sub.score!)}%` : 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {!isDone ? (
                                <button
                                    onClick={() => setActiveQuiz(a)}
                                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-purple-500/20 transition-all"
                                >
                                    Start Quiz
                                </button>
                            ) : (
                                <div className="text-right">
                                    <span className="text-xs text-white/30 block mb-1">Submitted</span>
                                    <span className="text-xs text-white/60 font-mono">{new Date(sub.submittedAt).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    );
                })}

                {assessments.length === 0 && (
                    <div className="py-20 border-2 border-dashed border-white/5 rounded-3xl text-center text-white/20 italic flex flex-col items-center gap-3">
                        <AlertCircle size={32} />
                        No assessments assigned to your grade level yet.
                    </div>
                )}
            </div>

            {activeQuiz && (
                <QuizInterface
                    title={activeQuiz.title}
                    questions={activeQuiz.questions}
                    passThreshold={60}
                    onComplete={onQuizComplete}
                    onClose={() => setActiveQuiz(null)}
                    isCourseFinal={false}
                    username={user.username}
                />
            )}
        </div>
    );
};

export default StudentAssessmentList;
