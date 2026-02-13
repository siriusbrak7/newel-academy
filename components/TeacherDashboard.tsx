import React, { useState, useEffect } from 'react';
import { User, StudentStats, Assessment, LeaderboardEntry, CourseStructure, Topic, ClassOverview, Leaderboards } from '../types';
import { getAllStudentStats, getCourses, getAssessments, getLeaderboards, saveAnnouncement, saveTopic, getClassOverview } from '../services/storageService';
import { BookOpen, Zap, PenTool, Download, RefreshCw, TrendingUp, ClipboardList, Megaphone, Send, Trophy, Save, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';

// Register ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler);

const TeacherDashboard: React.FC<{ user: User }> = ({ user }) => {
    const [dashboardVersion, setDashboardVersion] = useState(0);
    const [stats, setStats] = useState<StudentStats[]>([]);
    const [classOverview, setClassOverview] = useState<ClassOverview | null>(null);
    const [recentAssessments, setRecentAssessments] = useState<Assessment[]>([]);
    const [announcementText, setAnnouncementText] = useState({ title: '', content: '' });
    const [leaderboardData, setLeaderboardData] = useState<Leaderboards>({ academic: [], challenge: [], assessments: [] });
    const [activeLeaderboard, setActiveLeaderboard] = useState<'academic' | 'challenge' | 'assessments'>('academic');

    // Instruction Editor State
    const [courses, setCourses] = useState<CourseStructure>({});
    const [selSubject, setSelSubject] = useState('Biology');
    const [selTopic, setSelTopic] = useState('');
    const [instructionText, setInstructionText] = useState('');

    const loadData = () => {
        console.log("Refreshing Teacher Dashboard Data...");
        setStats(getAllStudentStats());
        setClassOverview(getClassOverview());
        setRecentAssessments(getAssessments().slice(-5).reverse());
        setLeaderboardData(getLeaderboards());
        const c = getCourses();
        setCourses(c);

        if (!c[selSubject]) setSelSubject(Object.keys(c)[0] || 'Biology');
    };

    useEffect(() => {
        loadData();
    }, [dashboardVersion]);

    useEffect(() => {
        if (selSubject && selTopic && courses[selSubject]?.[selTopic]) {
            setInstructionText(courses[selSubject][selTopic].description || '');
        }
    }, [selSubject, selTopic, courses]);

    const forceRefresh = () => setDashboardVersion(prev => prev + 1);

    const handlePostAnnouncement = () => {
        if (!announcementText.title || !announcementText.content) return;
        saveAnnouncement({
            id: Date.now().toString(),
            title: announcementText.title,
            content: announcementText.content,
            timestamp: Date.now(),
            author: user.username
        });
        setAnnouncementText({ title: '', content: '' });
        alert("Announcement Posted!");
        forceRefresh();
    };

    const handleSaveInstructions = () => {
        if (!selSubject || !selTopic) return;
        const topic = courses[selSubject][selTopic];
        if (!topic) return;

        const updatedTopic = { ...topic, description: instructionText };
        saveTopic(selSubject, updatedTopic);
        alert("Instructions Saved!");
        forceRefresh();
    };

    const handleExportReport = () => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text('Class Performance Report', 10, 20);
        doc.setFontSize(12);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 10, 30);

        let y = 50;
        stats.forEach((s) => {
            doc.text(`${s.username} (Grade ${s.gradeLevel}) - Avg Score: ${Math.round(s.avgScore)}%`, 10, y);
            y += 10;
        });
        doc.save('class_report.pdf');
    };

    const barData = {
        labels: stats.map(s => s.username),
        datasets: [
            {
                label: 'Avg Score',
                data: stats.map(s => s.avgScore),
                backgroundColor: '#a855f7'
            }
        ]
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Teacher Dashboard</h2>
                    <div className="text-sm text-white/50">Manage your virtual classroom • Workspace v2.0</div>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleExportReport} className="flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/40 text-purple-200 border border-purple-500/30 px-4 py-2 rounded-lg text-sm transition-colors">
                        <Download size={16} /> Export Report
                    </button>
                    <button onClick={forceRefresh} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                        <RefreshCw size={16} /> Refresh Data
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center">
                    <p className="text-xs text-white/50 uppercase">Students</p>
                    <p className="text-2xl font-bold text-white">{classOverview?.totalStudents || 0}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center">
                    <p className="text-xs text-white/50 uppercase">Class Avg</p>
                    <p className="text-2xl font-bold text-cyan-400">{classOverview?.classAverage || 0}%</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center">
                    <p className="text-xs text-white/50 uppercase">Active Quizzes</p>
                    <p className="text-2xl font-bold text-purple-400">{recentAssessments.length}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-center">
                    <p className="text-xs text-white/50 uppercase">Weakest Topic</p>
                    <p className="text-sm font-bold text-red-400 mt-1 truncate">{classOverview?.weakestTopic || 'None'}</p>
                </div>
            </div>

            {/* Main Actions */}
            <div className="grid md:grid-cols-2 gap-6">
                <Link to="/courses" className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 flex items-center gap-6 hover:bg-white/10 transition-colors group">
                    <div className="bg-purple-900/50 p-4 rounded-xl group-hover:scale-110 transition-transform">
                        <BookOpen size={32} className="text-purple-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Manage Courses</h3>
                        <p className="text-white/50 text-sm">Add topics, upload materials, and create checkpoints.</p>
                    </div>
                </Link>

                <Link to="/assessments" className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 flex items-center gap-6 hover:scale-[1.02] transition-transform group shadow-lg">
                    <div className="bg-cyan-900/50 p-4 rounded-xl shadow-cyan-500/20 shadow-lg">
                        <PenTool size={32} className="text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">Create & Grade Assessments <Zap size={16} className="text-yellow-400" /></h3>
                        <p className="text-white/60 text-sm">Create MCQ/Written quizzes, use AI Auto-Grading, and review student submissions.</p>
                    </div>
                </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Left Column: Analytics & Instructions */}
                <div className="md:col-span-2 space-y-6">
                    {/* Analytics Chart */}
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><TrendingUp size={20} className="text-green-400" /> Student Performance Tracking</h3>
                        <div className="h-64">
                            <Bar data={barData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.1)' } }, x: { grid: { display: false } } } }} />
                        </div>
                    </div>

                    {/* Quick Instructions Editor */}
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><ClipboardList size={20} className="text-orange-400" /> Quick Course Instructions</h3>
                        <div className="flex gap-4 mb-4">
                            <select className="bg-black/20 border border-white/10 rounded-lg p-2 text-white flex-1" value={selSubject} onChange={e => setSelSubject(e.target.value)}>
                                {Object.keys(courses).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <select className="bg-black/20 border border-white/10 rounded-lg p-2 text-white flex-1" value={selTopic} onChange={e => setSelTopic(e.target.value)}>
                                <option value="">Select Topic</option>
                                {selSubject && courses[selSubject] && Object.values(courses[selSubject]).map((t: Topic) => <option key={t.id} value={t.id}>{t.title}</option>)}
                            </select>
                        </div>
                        <textarea
                            className="w-full h-32 bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm mb-4"
                            placeholder="Select a topic to edit its instructions/description..."
                            value={instructionText}
                            onChange={e => setInstructionText(e.target.value)}
                        />
                        <button onClick={handleSaveInstructions} className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 px-6 rounded-lg text-sm flex items-center gap-2">
                            <Save size={16} /> Save Instructions
                        </button>
                    </div>
                </div>

                {/* Right Column: Announcements & Recent */}
                <div className="space-y-6">
                    {/* Post Announcement */}
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Megaphone size={18} /> Post Announcement</h3>
                        <div className="space-y-3">
                            <input
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white text-sm"
                                placeholder="Title (e.g. Exam next week)"
                                value={announcementText.title}
                                onChange={e => setAnnouncementText({ ...announcementText, title: e.target.value })}
                            />
                            <textarea
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white text-sm h-24"
                                placeholder="Message content..."
                                value={announcementText.content}
                                onChange={e => setAnnouncementText({ ...announcementText, content: e.target.value })}
                            />
                            <button onClick={handlePostAnnouncement} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded-lg text-sm flex justify-center items-center gap-2">
                                <Send size={16} /> Post Update
                            </button>
                        </div>
                    </div>

                    {/* Recent Assessments List */}
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                        <h3 className="text-white font-bold mb-4">Recent Assessments</h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {recentAssessments.length === 0 && <p className="text-white/40 italic text-sm">No assessments created yet.</p>}
                            {recentAssessments.map(a => (
                                <div key={a.id} className="text-sm text-white/70 border-b border-white/5 pb-2 last:border-0">
                                    <p className="font-bold text-white">{a.title}</p>
                                    <div className="flex justify-between mt-1">
                                        <span className="text-xs opacity-50 bg-white/10 px-2 py-0.5 rounded">{a.subject}</span>
                                        <span className="text-xs opacity-50">Grade {a.targetGrade}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Class Leaderboards */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2"><Trophy className="text-yellow-400" /> Class Leaderboards</h3>
                    <div className="flex gap-2">
                        {['academic', 'challenge', 'assessments'].map(t => (
                            <button
                                key={t}
                                onClick={() => setActiveLeaderboard(t as any)}
                                className={`text-xs px-3 py-1 rounded-full uppercase font-bold transition-all ${activeLeaderboard === t ? 'bg-cyan-600 text-white' : 'bg-white/10 text-white/50'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-white/70">
                        <thead className="bg-white/5 text-white uppercase font-bold text-xs">
                            <tr>
                                <th className="p-4">Rank</th>
                                <th className="p-4">Student</th>
                                <th className="p-4 text-right">Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {leaderboardData[activeLeaderboard].length === 0 && (
                                <tr><td colSpan={3} className="p-4 text-center italic text-white/30">No data available.</td></tr>
                            )}
                            {leaderboardData[activeLeaderboard].map((entry, i) => (
                                <tr key={i} className="hover:bg-white/5">
                                    <td className="p-4 text-white font-mono">#{i + 1}</td>
                                    <td className="p-4 font-bold text-white">{entry.username}</td>
                                    <td className="p-4 text-right font-mono text-cyan-300">{Math.round(entry.score)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detailed Student List */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Student Progress Overview</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-white/70">
                        <thead className="bg-white/5 text-white uppercase font-bold text-xs">
                            <tr>
                                <th className="p-4">Student</th>
                                <th className="p-4">Grade</th>
                                <th className="p-4">Avg Score</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Last Active</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {stats.map(s => (
                                <tr key={s.username} className="hover:bg-white/5 transition-colors">
                                    <td className="p-4 font-medium text-white">{s.username}</td>
                                    <td className="p-4"><span className="bg-white/10 px-2 py-1 rounded text-xs">{s.gradeLevel}</span></td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-1.5 bg-black/20 rounded-full overflow-hidden">
                                                <div className="h-full bg-purple-500" style={{ width: `${s.avgScore}%` }}></div>
                                            </div>
                                            <span className="font-mono text-xs">{Math.round(s.avgScore)}%</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {s.avgScore < 50 ? (
                                            <span className="text-red-400 flex items-center gap-1 text-xs bg-red-500/10 px-2 py-1 rounded border border-red-500/20"><AlertCircle size={12} /> Needs Help</span>
                                        ) : (
                                            <span className="text-green-400 text-xs bg-green-500/10 px-2 py-1 rounded border border-green-500/20">On Track</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-xs opacity-60">{s.lastActive}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
