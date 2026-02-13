import React, { useState } from 'react';
import { User, Topic, CourseStructure } from '../../types';
import { getCourses, saveTopic } from '../../services/storageService';
import { Plus, Trash2, BookOpen, AlertCircle } from 'lucide-react';

const CourseManager: React.FC<{ user: User }> = ({ user }) => {
    const [courses, setCourses] = useState<CourseStructure>(getCourses());
    const [selSub, setSelSub] = useState(Object.keys(courses)[0] || 'Biology');
    const [showAdd, setShowAdd] = useState(false);
    const [newTopic, setNewTopic] = useState<Partial<Topic>>({ title: '', gradeLevel: '9', description: '', subtopics: [] });

    const handleSave = () => {
        if (!newTopic.title || !newTopic.description) return;
        const t: Topic = {
            id: newTopic.title.toLowerCase().replace(/\s+/g, '_'),
            title: newTopic.title,
            gradeLevel: newTopic.gradeLevel || '9',
            description: newTopic.description,
            subtopics: newTopic.subtopics || [],
            materials: []
        };
        saveTopic(selSub, t);
        setCourses(getCourses());
        setShowAdd(false);
        setNewTopic({ title: '', gradeLevel: '9', description: '', subtopics: [] });
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h2 className="text-3xl font-bold text-white">Course Management</h2>
                    <p className="text-white/50 text-sm">Organize subjects, topics, and checkpoints.</p>
                </div>
                <button onClick={() => setShowAdd(true)} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 px-6 rounded-xl flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all">
                    <Plus size={18} /> Add Topic
                </button>
            </div>

            <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                {Object.keys(courses).map(s => (
                    <button
                        key={s}
                        onClick={() => setSelSub(s)}
                        className={`px-6 py-2 rounded-full font-bold transition-all whitespace-nowrap ${selSub === s ? 'bg-white text-black' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            <div className="grid gap-4">
                {Object.values(courses[selSub] || {}).map((t: Topic) => (
                    <div key={t.id} className="bg-white/5 border border-white/10 p-5 rounded-2xl flex justify-between items-center group hover:bg-white/10 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-400">
                                <BookOpen size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white">{t.title}</h4>
                                <div className="flex gap-3 mt-1">
                                    <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest px-2 py-0.5 bg-white/5 rounded">Grade {t.gradeLevel}</span>
                                    <span className="text-[10px] uppercase font-bold text-white/30 tracking-widest px-2 py-0.5 bg-white/5 rounded">{t.subtopics.length} Checkpoints</span>
                                </div>
                            </div>
                        </div>
                        <button className="p-2 text-white/20 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
                {Object.values(courses[selSub] || {}).length === 0 && (
                    <div className="py-12 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-white/30">
                        <AlertCircle size={32} className="mb-2 opacity-20" />
                        <p>No topics added to {selSub} yet.</p>
                    </div>
                )}
            </div>

            {showAdd && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-lg bg-slate-900 border border-white/20 rounded-3xl p-8 shadow-2xl">
                        <h3 className="text-2xl font-bold text-white mb-6">Create New Topic</h3>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-white/40 uppercase ml-1">Title</label>
                                <input
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-cyan-500/50"
                                    placeholder="e.g. Molecular Biology"
                                    value={newTopic.title}
                                    onChange={e => setNewTopic({ ...newTopic, title: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-white/40 uppercase ml-1">Subject</label>
                                    <select className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-white outline-none" value={selSub} onChange={e => setSelSub(e.target.value)}>
                                        {Object.keys(courses).map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-white/40 uppercase ml-1">Grade Level</label>
                                    <select className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-white outline-none" value={newTopic.gradeLevel} onChange={e => setNewTopic({ ...newTopic, gradeLevel: e.target.value })}>
                                        {['9', '10', '11', '12'].map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-white/40 uppercase ml-1">Description</label>
                                <textarea
                                    className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-cyan-500/50"
                                    placeholder="Brief overview of the topic..."
                                    value={newTopic.description}
                                    onChange={e => setNewTopic({ ...newTopic, description: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setShowAdd(false)} className="flex-1 px-6 py-3 rounded-xl font-bold text-white/50 hover:bg-white/5 transition-all">Cancel</button>
                                <button onClick={handleSave} className="flex-1 px-6 py-3 rounded-xl font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 transition-all">Create Topic</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseManager;
