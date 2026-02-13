import React, { useState } from 'react';
import { User, Assessment, Question } from '../../types';
import { getAssessments, saveAssessment } from '../../services/storageService';
import { Plus, Save, Trash2, ListChecks, Users } from 'lucide-react';

const CustomAssessmentManager: React.FC<{ user: User }> = ({ user }) => {
    const [assessments, setAssessments] = useState<Assessment[]>(getAssessments());
    const [isAdding, setIsAdding] = useState(false);
    const [newAsm, setNewAsm] = useState<Partial<Assessment>>({
        title: '',
        subject: 'Biology',
        questions: [],
        targetGrade: '9'
    });
    const [qs, setQs] = useState<Question[]>([]);

    const addQ = () => setQs([...qs, { id: Date.now().toString(), text: 'New Question?', options: ['A', 'B', 'C', 'D'], correctAnswer: 'A', type: 'MCQ', difficulty: 'IGCSE', topic: 'general' }]);

    const handleSave = () => {
        if (!newAsm.title || qs.length === 0) return;
        const asm: Assessment = {
            id: Date.now().toString(),
            title: newAsm.title!,
            subject: newAsm.subject!,
            questions: qs,
            assignedTo: ['all'],
            targetGrade: newAsm.targetGrade!,
            createdBy: user.username
        };
        saveAssessment(asm);
        setAssessments(getAssessments());
        setIsAdding(false);
        setNewAsm({ title: '', subject: 'Biology', questions: [], targetGrade: '9' });
        setQs([]);
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Assessment Hub</h2>
                    <p className="text-white/50 text-sm">Create and assign custom quizzes for your students.</p>
                </div>
                <button onClick={() => setIsAdding(true)} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all">
                    <Plus size={18} /> New Assessment
                </button>
            </div>

            <div className="grid gap-4">
                {assessments.map(a => (
                    <div key={a.id} className="bg-white/5 border border-white/10 p-6 rounded-2xl flex justify-between items-center group hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-6">
                            <div className="bg-purple-900/30 p-4 rounded-xl text-purple-400">
                                <ListChecks size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-lg">{a.title}</h4>
                                <div className="flex gap-4 mt-2">
                                    <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest px-2 py-0.5 bg-white/5 rounded flex items-center gap-1"><Users size={10} /> Grade {a.targetGrade}</span>
                                    <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest px-2 py-0.5 bg-white/5 rounded">{a.questions.length} Items</span>
                                    <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest px-2 py-0.5 bg-white/5 rounded">{a.subject}</span>
                                </div>
                            </div>
                        </div>
                        <button className="p-3 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}

                {assessments.length === 0 && (
                    <div className="py-20 border-2 border-dashed border-white/5 rounded-3xl text-center text-white/20 italic">
                        No assessments created yet. Click "New Assessment" to begin.
                    </div>
                )}
            </div>

            {isAdding && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
                    <div className="w-full max-w-2xl bg-slate-900 border border-white/20 rounded-3xl p-8 shadow-2xl flex flex-col max-h-[90vh]">
                        <h3 className="text-2xl font-bold text-white mb-6">Design Assessment</h3>
                        <div className="space-y-6 overflow-y-auto pr-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-white/40 uppercase ml-1">Assessment Title</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-purple-500/50"
                                        placeholder="e.g. End of Term Quiz"
                                        value={newAsm.title}
                                        onChange={e => setNewAsm({ ...newAsm, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-white/40 uppercase ml-1">Subject</label>
                                    <select className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-white outline-none" value={newAsm.subject} onChange={e => setNewAsm({ ...newAsm, subject: e.target.value })}>
                                        <option value="Biology">Biology</option>
                                        <option value="Physics">Physics</option>
                                        <option value="Chemistry">Chemistry</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold text-white/40 uppercase ml-1">Questions ({qs.length})</label>
                                    <button onClick={addQ} className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 transition-colors">
                                        <Plus size={14} /> Add Question
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {qs.map((q, idx) => (
                                        <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/10 space-y-3 relative group/q">
                                            <input
                                                className="bg-transparent text-white font-bold w-full outline-none border-b border-transparent focus:border-purple-500/30 pb-1"
                                                value={q.text}
                                                onChange={e => {
                                                    const n = [...qs];
                                                    n[idx].text = e.target.value;
                                                    setQs(n);
                                                }}
                                                placeholder="Enter question text..."
                                            />
                                            <div className="grid grid-cols-2 gap-2">
                                                {q.options.map((o, oi) => (
                                                    <input
                                                        key={oi}
                                                        className="bg-black/20 text-xs text-white/70 p-2 rounded border border-white/5 outline-none focus:border-purple-500/30"
                                                        value={o}
                                                        onChange={e => {
                                                            const n = [...qs];
                                                            n[idx].options[oi] = e.target.value;
                                                            setQs(n);
                                                        }}
                                                        placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <select
                                                    className="bg-slate-800 text-[10px] text-white/60 p-1 rounded border border-white/10 outline-none"
                                                    value={q.correctAnswer}
                                                    onChange={e => {
                                                        const n = [...qs];
                                                        n[idx].correctAnswer = e.target.value;
                                                        setQs(n);
                                                    }}
                                                >
                                                    {q.options.map((o, oi) => <option key={oi} value={o}>Correct: {o || `Option ${String.fromCharCode(65 + oi)}`}</option>)}
                                                </select>
                                                <button onClick={() => setQs(qs.filter((_, i) => i !== idx))} className="p-1 text-white/10 hover:text-red-400 transition-colors">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {qs.length === 0 && <div className="text-center py-6 text-white/20 text-xs italic">No questions added yet.</div>}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-white/10">
                                <button onClick={() => setIsAdding(false)} className="flex-1 px-6 py-3 rounded-xl font-bold text-white/50 hover:bg-white/5 transition-all">Cancel</button>
                                <button onClick={handleSave} className="flex-1 px-6 py-3 rounded-xl font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 transition-all">
                                    <Save size={18} /> Publish Assessment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomAssessmentManager;
