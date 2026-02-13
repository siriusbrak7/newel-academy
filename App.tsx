
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AuthModal from './components/AuthModal';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProgressProvider } from './contexts/ProgressContext';
import { initStorage } from './services/storageService';
import { Theme } from './types';
import { DEFAULT_THEME } from './constants';
import { Rocket, Sparkles, Globe, Zap, ArrowRight, Star, Loader2 } from 'lucide-react';

// Lazy-load heavy components for better initial page load
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const TeacherDashboard = lazy(() => import('./components/TeacherDashboard'));
const StudentDashboard = lazy(() => import('./components/StudentDashboard'));
const StudentCourseList = lazy(() => import('./components/course/StudentCourseList'));
const TopicDetail = lazy(() => import('./components/course/TopicDetail'));
const CourseManager = lazy(() => import('./components/course/CourseManager'));
const CustomAssessmentManager = lazy(() => import('./components/course/CustomAssessmentManager'));
const StudentAssessmentList = lazy(() => import('./components/course/StudentAssessmentList'));
const SprintChallenge = lazy(() => import('./components/Gamification').then(m => ({ default: m.SprintChallenge })));
const LeaderboardView = lazy(() => import('./components/Gamification').then(m => ({ default: m.LeaderboardView })));
const AITutorChat = lazy(() => import('./components/AITutorChat'));
const VoiceTutor = lazy(() => import('./components/VoiceTutor'));

const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center py-24">
    <Loader2 className="animate-spin text-cyan-400" size={36} />
  </div>
);

const RequireAuth: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({ children, allowedRoles }) => {
  const { loggedIn, user } = useAuth();
  if (!loggedIn || !user) return <Navigate to="/" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <div className="p-10 text-center text-red-500 text-2xl font-bold">Access Denied</div>;
  }
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user, loggedIn, login, logout } = useAuth();
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await initStorage();
      } catch (err) {
        console.error('[Init] Storage initialization failed:', err);
      } finally {
        setIsInitializing(false);
      }
    };
    init();
    document.title = "Newel Academy • Ace Scientific Concepts with Your Personal AI Tutor";
  }, []);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-cyan-400" size={48} />
        <p className="text-white/40 text-sm">Initializing Newel Academy…</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-500 relative`}>
      <Navbar
        user={user}
        onLogout={logout}
        toggleSidebar={() => setSidebarOpen(true)}
        notifications={2}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentTheme={theme}
        setTheme={setTheme}
      />

      {showAuthModal && !loggedIn && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-lg p-4">
          <AuthModal onLogin={login} onClose={() => setShowAuthModal(false)} />
        </div>
      )}

      <main className="flex-grow container mx-auto px-4 md:px-8 py-8 relative z-10 flex flex-col">
        <ErrorBoundary fallbackTitle="This section encountered an error">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={
                loggedIn && user ? (
                  <Navigate to={
                    user.role === 'admin' ? '/admin' :
                      user.role === 'teacher' ? '/teacher-dashboard' : '/student-dashboard'
                  } replace />
                ) : (
                  <div className="min-h-[85vh] flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24 relative pt-12 lg:pt-0">

                    {/* Visual Graphic - Fixed position for Desktop, Center for Mobile */}
                    <div className="order-1 lg:order-2 flex-1 relative flex justify-center items-center w-full max-w-sm lg:max-w-none">
                      {/* Planetary Ring */}
                      <div className="absolute inset-0 border-2 border-cyan-500/10 rounded-full animate-spin-slow scale-110 lg:scale-150"></div>

                      {/* The Rocket - restore cosmic style */}
                      <div className="relative group animate-float">
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-16 h-32 bg-gradient-to-t from-cyan-500 via-purple-500 to-transparent blur-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                        <div className="bg-slate-900/50 p-8 lg:p-12 rounded-full border border-white/10 shadow-[0_0_50px_rgba(34,211,238,0.2)] backdrop-blur-md">
                          <Rocket size={100} className="text-white drop-shadow-[0_0_20px_rgba(34,211,238,0.8)] -rotate-45 lg:w-[140px] lg:h-[140px]" />
                        </div>
                      </div>

                      {/* Orbiting Elements */}
                      <div className="absolute top-0 right-10 animate-pulse delay-700">
                        <Star className="text-yellow-400 fill-yellow-400" size={24} />
                      </div>
                      <div className="absolute bottom-10 left-10 animate-bounce delay-1000">
                        <Globe className="text-cyan-400" size={32} />
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="order-2 lg:order-1 flex-1 space-y-6 lg:space-y-10 text-center lg:text-left z-10">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs md:text-sm font-bold animate-fade-in tracking-widest">
                        <Sparkles size={14} /> <span>EXPLORE THE SCIENTIFIC FRONTIER</span>
                      </div>

                      <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1]" style={{ fontFamily: "'Pacifico', cursive" }}>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-white to-purple-400">
                          Newel Academy
                        </span>
                      </h1>

                      <p className="text-lg md:text-xl lg:text-2xl font-light text-white/70 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                        Personalized AI mentorship for <span className="text-white font-bold">Physics, Chemistry, and Biology</span>. Master your curriculum through a cosmic learning experience.
                      </p>

                      <div className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start pt-6">
                        <button
                          onClick={() => setShowAuthModal(true)}
                          className="w-full sm:w-auto group relative px-8 lg:px-12 py-4 lg:py-5 bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold text-lg lg:text-xl rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.3)] hover:shadow-[0_0_60px_rgba(168,85,247,0.4)] transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                          <span>Join the Mission</span>
                          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button
                          className="w-full sm:w-auto px-8 lg:px-12 py-4 lg:py-5 border border-white/10 rounded-2xl text-white/60 hover:text-white hover:bg-white/5 transition-all text-lg flex items-center justify-center gap-2"
                          onClick={() => window.scrollTo({ top: 1000, behavior: 'smooth' })}
                        >
                          Learn More
                        </button>
                      </div>

                      <div className="flex items-center justify-center lg:justify-start gap-4 pt-8 border-t border-white/5">
                        <div className="flex -space-x-3">
                          {[1, 2, 3, 4].map(i => (
                            <img key={i} className="w-10 h-10 rounded-full border-2 border-slate-900" src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="Student" />
                          ))}
                        </div>
                        <p className="text-xs md:text-sm text-white/40"><span className="text-green-400 font-bold">2,400+</span> students are leveling up their science grades today.</p>
                      </div>
                    </div>
                  </div>
                )
              } />

              <Route path="/admin" element={<RequireAuth allowedRoles={['admin']}><AdminDashboard /></RequireAuth>} />
              <Route path="/teacher-dashboard" element={<RequireAuth allowedRoles={['teacher']}>{user && <TeacherDashboard user={user} />}</RequireAuth>} />
              <Route path="/student-dashboard" element={<RequireAuth allowedRoles={['student']}>{user && <StudentDashboard user={user} />}</RequireAuth>} />
              <Route path="/courses" element={<RequireAuth allowedRoles={['teacher', 'student']}>{user?.role === 'teacher' ? <CourseManager user={user} /> : user && <StudentCourseList user={user} />}</RequireAuth>} />
              <Route path="/courses/:subject/:topicId" element={<RequireAuth allowedRoles={['student']}>{user && <TopicDetail user={user} />}</RequireAuth>} />
              <Route path="/assessments" element={<RequireAuth allowedRoles={['teacher', 'student']}>{user?.role === 'teacher' ? <CustomAssessmentManager user={user} /> : user && <StudentAssessmentList user={user} />}</RequireAuth>} />
              <Route path="/leaderboard" element={<RequireAuth allowedRoles={['student', 'teacher']}><LeaderboardView /></RequireAuth>} />
              <Route path="/challenge" element={<RequireAuth allowedRoles={['student']}>{user && <SprintChallenge user={user} />}</RequireAuth>} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      <footer className="text-center py-10 text-white/20 text-xs md:text-sm relative z-10 border-t border-white/5 bg-slate-950/20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 mb-6">
            <span className="hover:text-cyan-400 cursor-pointer transition-colors">Documentation</span>
            <span className="hover:text-cyan-400 cursor-pointer transition-colors">Curriculum</span>
            <span className="hover:text-cyan-400 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-cyan-400 cursor-pointer transition-colors">System Status</span>
          </div>
          <p>Newel Academy © 2025 • High-Fidelity Scientific Learning Environment • Version 2.2.0-Alpha</p>
        </div>
      </footer>

      {loggedIn && user?.role === 'student' && (
        <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[80] flex flex-col gap-4">
          <AITutorChat />
          <VoiceTutor />
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <ProgressProvider>
      <AppContent />
    </ProgressProvider>
  </AuthProvider>
);

export default App;
