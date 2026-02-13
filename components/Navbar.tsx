
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Role } from '../types';
import { LogOut, BookOpen, LayoutDashboard, Trophy, Settings, Bell, Volume2, VolumeX, LogIn, Menu, X } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  toggleSidebar: () => void;
  notifications: number;
  onOpenAuth: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, toggleSidebar, notifications, onOpenAuth }) => {
  const [soundOn, setSoundOn] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="w-full h-16 bg-slate-900/40 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-4 md:px-8 sticky top-0 z-[90]">
      <div className="flex items-center gap-4">
        {user && (
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden text-white/60 hover:text-white"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}
        <Link to="/" className="text-2xl md:text-3xl font-bold cursor-pointer hover:opacity-80 transition-opacity">
          <span style={{ fontFamily: "'Pacifico', cursive" }} className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
            Newel
          </span>
          <span className="hidden sm:inline-block ml-1 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400" style={{ fontFamily: "'Pacifico', cursive" }}>
            Academy
          </span>
        </Link>
      </div>

      <div className="flex items-center space-x-2 md:space-x-6">
        {user ? (
          <>
            <div className="hidden md:flex space-x-6 text-sm font-medium">
              <Link to="/" className="hover:text-cyan-400 transition-colors flex items-center gap-2 text-white/80">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              {user.role !== 'admin' && (
                <>
                  <Link to="/courses" className="hover:text-cyan-400 transition-colors flex items-center gap-2 text-white/80">
                    <BookOpen size={16} /> Courses
                  </Link>
                  <Link to="/leaderboard" className="hover:text-cyan-400 transition-colors flex items-center gap-2 text-white/80">
                    <Trophy size={16} /> Leaderboard
                  </Link>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-3 md:gap-5">
              <button onClick={() => setSoundOn(!soundOn)} className="hidden sm:block text-white/60 hover:text-white transition-colors">
                  {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>

              <div className="relative cursor-pointer hover:text-cyan-400 text-white/60 transition-colors">
                  <Bell size={18} />
                  {notifications > 0 && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  )}
              </div>

              <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

              <button 
                onClick={toggleSidebar}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/80"
                title="Settings"
              >
                <Settings size={20} />
              </button>
              <button 
                onClick={onLogout} 
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/30 text-red-400 rounded-xl transition-all text-sm font-bold border border-red-500/20"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </>
        ) : (
          <button 
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-all text-sm font-bold shadow-lg shadow-cyan-500/20"
          >
            <LogIn size={16} /> <span className="hidden sm:inline">Login</span>
          </button>
        )}
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && user && (
        <div className="absolute top-16 left-0 w-full bg-slate-900/95 backdrop-blur-2xl border-b border-white/10 p-6 md:hidden flex flex-col gap-4 animate-fade-in shadow-2xl">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 text-white p-3 rounded-xl bg-white/5 font-bold">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          {user.role !== 'admin' && (
            <>
              <Link to="/courses" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 text-white p-3 rounded-xl bg-white/5 font-bold">
                <BookOpen size={20} /> Courses
              </Link>
              <Link to="/leaderboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-4 text-white p-3 rounded-xl bg-white/5 font-bold">
                <Trophy size={20} /> Leaderboard
              </Link>
            </>
          )}
          <button 
            onClick={() => { setMobileMenuOpen(false); onLogout(); }} 
            className="flex items-center gap-4 text-red-400 p-3 rounded-xl bg-red-500/10 font-bold mt-4"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
