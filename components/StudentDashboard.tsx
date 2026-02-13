import React, { useState, useEffect } from 'react';
import { User, Assessment, Announcement } from '../types';
import { getProgress, getCourses, calculateUserStats, getAssessments, getSubmissions, getAnnouncements } from '../services/storageService';
import { Brain, Atom, Zap, Megaphone, ClipboardList, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';
import { getAITutorResponse } from '../services/geminiService';

// Register ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler);

const StudentDashboard: React.FC<{ user: User }> = ({ user }) => {
    const [advice, setAdvice] = useState<string>("Analyzing your learning patterns...");
    const [pendingAssessments, setPendingAssessments] = useState<Assessment[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);

    // Stats
    const progress = getProgress(user.username);
    const courses = getCourses();

    // Calculate Real Stats
    const { activeDays, streak } = calculateUserStats(user);

    // Calculate specific stats for charts
    const subjectScores: number[] = [];
    const subjectLabels: string[] = [];

    useEffect(() => {
        // Refresh pending assessments
        const all = getAssessments();
        const subs = getSubmissions();
        // Filter: Grade matches AND (assigned to all OR specific user) AND (not submitted)
        const pending = all.filter(a =>
            (a.targetGrade === 'all' || a.targetGrade === user.gradeLevel) &&
            !subs.some(s => s.assessmentId === a.id && s.username === user.username)
        );
        setPendingAssessments(pending.slice(0, 3)); // Show max 3 on dashboard
        setAnnouncements(getAnnouncements());
    }, [user]);

    Object.keys(courses).forEach(sub => {
        let totalScore = 0;
        let count = 0;
        Object.keys(courses[sub]).forEach(tid => {
            if (progress[sub]?.[tid]?.mainAssessmentScore) {
                totalScore += progress[sub][tid].mainAssessmentScore!;
                count++;
            }
        });
        if (count > 0) {
            subjectLabels.push(sub);
            subjectScores.push(totalScore / count);
        }
    });

    const chartData = {
        labels: subjectLabels.length ? subjectLabels : ['No Data'],
        datasets: [{
            label: 'Average Score',
            data: subjectScores.length ? subjectScores : [0],
            backgroundColor: ['rgba(6, 182, 212, 0.6)', 'rgba(168, 85, 247, 0.6)', 'rgba(236, 72, 153, 0.6)'],
            borderColor: 'transparent',
            hoverOffset: 4
        }]
    };

    useEffect(() => {
        const generateAdvice = async () => {
            // Simple logic for advice
            if (subjectScores.length === 0) {
                setAdvice("Start your first course to get personalized AI advice!");
                return;
            }
            const lowestScore = Math.min(...subjectScores);
            if (lowestScore < 60) {
                const subject = subjectLabels[subjectScores.indexOf(lowestScore)];
                const text = await getAITutorResponse(`Give 1 short sentence of advice for a student failing ${subject}.`);
                setAdvice(text);
            } else {
                setAdvice("You are doing great! Try the 222-Sprint to test your speed.");
            }
        };
        generateAdvice();
    }, []);

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text(`Progress Report: ${user.username}`, 10, 20);
        doc.setFontSize(12);
        doc.text(`Grade Level: ${user.gradeLevel}`, 10, 30);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 10, 40);

        let y = 60;
        subjectLabels.forEach((sub, i) => {
            doc.text(`${sub}: ${Math.round(subjectScores[i])}% Average`, 10, y);
            y += 10;
        });

        doc.save(`${user.username}_report.pdf`);
    };

    const features = [
        { title: "Smart Exam Prep", desc: "AI questions from CAIE, IB, and AP papers.", icon: <Brain className="text-purple-400" size={32} />, color: "from-purple-500/20 to-blue-500/20", link: "/exam-prep" },
        { title: "AI Explainer", desc: "Get instant simplifications of complex theories.", icon: <Atom className="text-cyan-400" size={32} />, color: "from-cyan-500/20 to-teal-500/20", link: "/courses" },
        { title: "222 Sprint", desc: "Challenge: Answer as many as you can in 222 seconds.", icon: <Zap className="text-yellow-400" size={32} />, color: "from-yellow-500/20 to-orange-500/20", link: "/challenge" }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-gradient-to-r from-slate-800 to-slate-900 border border-white/10 p-8 rounded-2xl flex items-center justify-between">
                        <div>
                            <h2 className="text-4xl font-bold text-white mb-2">Hello, {user.username}</h2>
                            <p className="text-white/60">Ready to master Grade {user.gradeLevel} Science?</p>
                        </div>
                        <button onClick={exportPDF} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm">Export Report</button>
                    </div>

                    {/* AI Advisor */}
                    <div className="bg-gradient-to-r from-purple-900/40 to-cyan-900/40 border border-white/10 p-6 rounded-2xl flex gap-4 items-start">
                        <div className="bg-white/10 p-3 rounded-full"><Brain className="text-cyan-300" /></div>
                        <div>
                            <h4 className="font-bold text-cyan-300 mb-1">AI Advisor</h4>
                            <p className="text-white/80 italic">"{advice}"</p>
                        </div>
                    </div>

                    {/* Announcements */}
                    {announcements.length > 0 && (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-2xl">
                            <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2"><Megaphone size={20} /> Important Updates</h3>
                            <div className="space-y-4">
                                {announcements.slice(0, 2).map(ann => (
                                    <div key={ann.id} className="border-l-4 border-yellow-500 pl-4">
                                        <p className="text-white font-medium">{ann.title}</p>
                                        <p className="text-white/60 text-sm">{ann.content}</p>
                                        <span className="text-white/30 text-xs">{new Date(ann.timestamp).toLocaleDateString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Pending Assessments Summary */}
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2"><ClipboardList className="text-cyan-400" /> My Active Assessments</h3>
                            <Link to="/assessments" className="text-sm text-cyan-400 hover:underline">View All</Link>
                        </div>
                        <div className="space-y-3">
                            {pendingAssessments.length === 0 && <p className="text-white/40 italic text-sm">No pending assessments.</p>}
                            {pendingAssessments.map(a => (
                                <div key={a.id} className="bg-white/5 p-3 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="text-white font-bold text-sm">{a.title}</p>
                                        <p className="text-white/40 text-xs">{a.subject} • {a.questions.length} Qs</p>
                                    </div>
                                    <Link to="/assessments" className="bg-cyan-600/50 hover:bg-cyan-600 text-white px-3 py-1 rounded text-xs">Start</Link>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {features.map((f, i) => (
                            <Link to={f.link} key={i} className={`group bg-gradient-to-br ${f.color} backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:scale-105 transition-all cursor-pointer shadow-xl`}>
                                <div className="mb-4 bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                                    {f.icon}
                                </div>
                                <h3 className="font-bold text-white mb-1">{f.title}</h3>
                                <p className="text-white/60 text-xs">{f.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl h-64 flex flex-col items-center justify-center">
                        <h3 className="text-white font-bold mb-4 self-start">Subject Performance</h3>
                        {subjectLabels.length > 0 ? (
                            <div className="w-48 h-48"><Doughnut data={chartData} options={{ plugins: { legend: { display: false } } }} /></div>
                        ) : <p className="text-white/30">No Data Yet</p>}
                    </div>

                    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                        <h3 className="text-white font-bold mb-4">Quick Stats</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-white/60 flex items-center gap-2"><Clock size={16} /> Active Days</span>
                                <span className="text-white font-mono">{activeDays}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-white/60 flex items-center gap-2"><Zap size={16} /> Streak</span>
                                <span className="text-yellow-400 font-mono font-bold">{streak} Days</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
