import React, { useState, useEffect } from 'react';
import { User, StudentStats, Assessment, Announcement, LeaderboardEntry } from '../types';
import { getUsers, saveUser, deleteUser, getAllStudentStats, getAssessments, getAnnouncements, getLeaderboards } from '../services/storageService';
import { Check, X, Clock, Trash2, Megaphone, Brain, BarChart3 } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

// Register ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler);

const AdminDashboard: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<StudentStats[]>([]);
    const [activeTab, setActiveTab] = useState<'pending' | 'users' | 'teachers'>('pending');
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);

    const refreshData = () => {
        const u = getUsers();
        setUsers(Object.values(u));
        setStats(getAllStudentStats());
        setAssessments(getAssessments());
        setAnnouncements(getAnnouncements());
    };

    useEffect(() => {
        refreshData();
    }, []);

    const handleApprove = (username: string) => {
        const userToApprove = users.find(u => u.username === username);
        if (userToApprove) {
            saveUser({ ...userToApprove, approved: true });
            refreshData();
        }
    };

    const handleDeleteUser = (username: string) => {
        if (confirm(`Are you sure you want to PERMANENTLY delete user "${username}"? This action cannot be undone.`)) {
            deleteUser(username);
            refreshData();
        }
    };

    const pendingUsers = users.filter(u => !u.approved);
    const activeUsers = users.filter(u => u.approved);
    const teachers = users.filter(u => u.role === 'teacher' && u.approved);

    // Teacher Analytics Helper
    const getTeacherStats = (username: string) => {
        const createdAssessments = assessments.filter(a => a.createdBy === username).length;
        const postedAnnouncements = announcements.filter(a => a.author === username).length;
        const teacherObj = users.find(u => u.username === username);
        const assignedCount = teacherObj?.assignedStudents?.length || 0;

        return { createdAssessments, postedAnnouncements, assignedCount };
    };

    // Chart Data
    const gradeDistribution = {
        labels: ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
        datasets: [{
            label: 'Student Count',
            data: ['9', '10', '11', '12'].map(g => users.filter(u => u.role === 'student' && u.gradeLevel === g).length),
            backgroundColor: 'rgba(6, 182, 212, 0.5)',
            borderColor: '#06b6d4',
            borderWidth: 1
        }]
    };

    const performanceData = {
        labels: stats.map(s => s.username),
        datasets: [{
            label: 'Avg Assessment Score',
            data: stats.map(s => s.avgScore),
            borderColor: '#a855f7',
            backgroundColor: 'rgba(168, 85, 247, 0.2)',
            tension: 0.4,
            fill: true
        }]
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Admin Dashboard <span className="text-xs opacity-50 ml-2">v2.2</span></h2>
                    <p className="text-white/50 text-sm">System Overview & User Management</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-white/5 px-4 py-2 rounded-lg text-center">
                        <div className="text-xs text-white/50 uppercase">Total Users</div>
                        <div className="text-2xl font-bold text-white">{users.length}</div>
                    </div>
                    <div className="bg-white/5 px-4 py-2 rounded-lg text-center">
                        <div className="text-xs text-white/50 uppercase">Pending</div>
                        <div className="text-2xl font-bold text-yellow-400">{pendingUsers.length}</div>
                    </div>
                    <div className="bg-white/5 px-4 py-2 rounded-lg text-center hidden md:block">
                        <div className="text-xs text-white/50 uppercase">Teachers</div>
                        <div className="text-2xl font-bold text-purple-400">{teachers.length}</div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <h3 className="text-white font-bold mb-4">Student Grade Distribution</h3>
                    <Bar data={gradeDistribution} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' } }, x: { grid: { display: false } } } }} />
                </div>
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <h3 className="text-white font-bold mb-4">Performance Overview</h3>
                    <Line data={performanceData} options={{ plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100, grid: { color: 'rgba(255,255,255,0.1)' } }, x: { display: false } } }} />
                </div>
            </div>

            {/* Management Section */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6">
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4 overflow-x-auto">
                    <div className="flex gap-6 min-w-max">
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`font-bold pb-2 transition-colors ${activeTab === 'pending' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-white/50 hover:text-white'}`}
                        >
                            Pending Approvals ({pendingUsers.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`font-bold pb-2 transition-colors ${activeTab === 'users' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-white/50 hover:text-white'}`}
                        >
                            Manage Active Users ({activeUsers.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('teachers')}
                            className={`font-bold pb-2 transition-colors ${activeTab === 'teachers' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-white/50 hover:text-white'}`}
                        >
                            Teacher Analytics
                        </button>
                    </div>
                </div>

                {/* PENDING APPROVALS */}
                {activeTab === 'pending' && (
                    pendingUsers.length === 0 ? (
                        <p className="text-white/50 italic">No pending users.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-white/80">
                                <thead className="bg-white/10 text-white uppercase text-xs">
                                    <tr>
                                        <th className="p-4 rounded-tl-lg">Username</th>
                                        <th className="p-4">Role</th>
                                        <th className="p-4">Details</th>
                                        <th className="p-4 rounded-tr-lg text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/10">
                                    {pendingUsers.map(user => (
                                        <tr key={user.username} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4 font-medium text-white">{user.username}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'teacher' ? 'bg-purple-500/20 text-purple-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm">
                                                {user.gradeLevel && <span className="mr-2">Grade: {user.gradeLevel}</span>}
                                            </td>
                                            <td className="p-4 flex gap-2 justify-end">
                                                <button onClick={() => handleApprove(user.username)} className="p-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/40 transition-colors">
                                                    <Check size={18} />
                                                </button>
                                                <button onClick={() => handleDeleteUser(user.username)} className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/40 transition-colors">
                                                    <X size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                )}

                {/* ACTIVE USERS & DELETE */}
                {activeTab === 'users' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-white/80">
                            <thead className="bg-white/10 text-white uppercase text-xs">
                                <tr>
                                    <th className="p-4 rounded-tl-lg">Username</th>
                                    <th className="p-4">Role</th>
                                    <th className="p-4">Session Log (Last Login)</th>
                                    <th className="p-4 rounded-tr-lg text-right">Manage</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {activeUsers.map(user => (
                                    <tr key={user.username} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 font-medium text-white">{user.username}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'teacher' ? 'bg-purple-500/20 text-purple-300' : user.role === 'admin' ? 'bg-red-500/20 text-red-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-white/60">
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} />
                                                {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            {user.username !== 'admin' && (
                                                <button
                                                    onClick={() => handleDeleteUser(user.username)}
                                                    className="p-2 bg-red-500/10 text-red-400 rounded hover:bg-red-500/30 transition-colors border border-red-500/20"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* TEACHER ANALYTICS */}
                {activeTab === 'teachers' && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-white/80">
                            <thead className="bg-white/10 text-white uppercase text-xs">
                                <tr>
                                    <th className="p-4 rounded-tl-lg">Teacher</th>
                                    <th className="p-4">Assessments Created</th>
                                    <th className="p-4">Announcements</th>
                                    <th className="p-4 rounded-tr-lg">Last Active</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/10">
                                {teachers.length === 0 ? (
                                    <tr><td colSpan={4} className="p-6 text-center text-white/40 italic">No teachers found.</td></tr>
                                ) : teachers.map(teacher => {
                                    const tStats = getTeacherStats(teacher.username);
                                    return (
                                        <tr key={teacher.username} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4 font-medium text-white flex items-center gap-2">
                                                <div className="bg-purple-500/20 p-2 rounded-full"><Brain size={16} className="text-purple-300" /></div>
                                                {teacher.username}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <BarChart3 size={16} className="text-cyan-400" />
                                                    <span className="font-bold text-white">{tStats.createdAssessments}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Megaphone size={16} className="text-yellow-400" />
                                                    <span className="font-bold text-white">{tStats.postedAnnouncements}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-white/60">
                                                {teacher.lastLogin ? new Date(teacher.lastLogin).toLocaleDateString() : 'Never'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AdminDashboard;
