import React, { useState } from 'react';
import { User, Topic, UserProgress } from '../../types';
import { getCourses, getProgress } from '../../services/storageService';
import { BookOpen, GraduationCap, ChevronRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StudentCourseList: React.FC<{ user: User }> = ({ user }) => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [selSub, setSelSub] = useState('Biology');

    const courses = getCourses();
    const progress = getProgress(user.username);

    const subjects = Object.keys(courses);
    const activeTopics = Object.values(courses[selSub] || {});

    const filteredTopics = activeTopics.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getCompletion = (tid: string) => {
        const p = progress[selSub]?.[tid];
        if (!p) return 0;
        const subCount = courses[selSub][tid].subtopics.length;
        const passedSub = Object.values(p.subtopics).filter(v => v).length;
        return Math.round(((passedSub / subCount) * 0.7 + (p.mainAssessmentPassed ? 0.3 : 0)) * 100);
    };

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h2 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                        <GraduationCap className="text-cyan-400" size={36} /> Learning Path
                    </h2>
                    <p className="text-white/50">Explore topics tailored for Grade {user.gradeLevel}.</p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-3 text-white/30" size={18} />
                        <input
                            type="text"
                            placeholder="Search topics..."
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white outline-none focus:border-cyan-500/50"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none"
                        value={selSub}
                        onChange={e => setSelSub(e.target.value)}
                    >
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTopics.length === 0 && (
                    <div className="col-span-full py-20 text-center text-white/30 italic">No topics found matching your search.</div>
                )}
                {filteredTopics.map(t => (
                    <div
                        key={t.id}
                        onClick={() => navigate(`/courses/${selSub}/${t.id}`)}
                        className="group bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:bg-white/10 hover:scale-[1.02] transition-all cursor-pointer relative overflow-hidden"
                    >
                        <div className="mb-4 flex justify-between items-start">
                            <div className="bg-cyan-500/20 p-3 rounded-xl text-cyan-400 group-hover:scale-110 transition-transform">
                                <BookOpen size={24} />
                            </div>
                            <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Grade {t.gradeLevel}</span>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">{t.title}</h3>
                        <p className="text-white/50 text-sm line-clamp-2 mb-6">{t.description}</p>

                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-white/40">
                                <span>Progress</span>
                                <span>{getCompletion(t.id)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-1000"
                                    style={{ width: `${getCompletion(t.id)}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="text-cyan-400" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentCourseList;
