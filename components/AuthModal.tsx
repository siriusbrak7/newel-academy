
import React, { useState } from 'react';
import { User, Role } from '../types';
import { SECURITY_QUESTIONS } from '../constants';
import { getUsers, saveUser } from '../services/storageService';
import { X, Lock, UserPlus, HelpCircle } from 'lucide-react';

const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + "newel_salt_2025");
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

interface AuthModalProps {
  onLogin: (user: User) => void;
  onClose?: () => void;
}

type Mode = 'login' | 'register' | 'recover';

const AuthModal: React.FC<AuthModalProps> = ({ onLogin, onClose }) => {
  const [mode, setMode] = useState<Mode>('login');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    role: 'student' as Role,
    gradeLevel: '9',
    securityQuestion: SECURITY_QUESTIONS[0],
    securityAnswer: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const users = getUsers();
    const user = users[formData.username];

    if (!user) {
      setError("Account does not exist.");
      setIsLoading(false);
      return;
    }

    const hashedInput = await hashPassword(formData.password);
    if (user.password !== hashedInput) {
      setError("Incorrect password.");
      setIsLoading(false);
      return;
    }

    if (!user.approved) {
      setError("Account is pending administrator approval.");
      setIsLoading(false);
      return;
    }

    onLogin(user);
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // --- Input Validation ---
    const trimmedUsername = formData.username.trim();
    if (trimmedUsername.length < 3 || trimmedUsername.length > 20) {
      setError("Username must be between 3 and 20 characters.");
      setIsLoading(false);
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      setError("Username can only contain letters, numbers, and underscores.");
      setIsLoading(false);
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setIsLoading(false);
      return;
    }
    if (!/[A-Z]/.test(formData.password) || !/[a-z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      setError("Password must include uppercase, lowercase, and a number.");
      setIsLoading(false);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }
    if (!formData.securityAnswer.trim()) {
      setError("Security answer is required.");
      setIsLoading(false);
      return;
    }

    const users = getUsers();

    if (users[trimmedUsername]) {
      setError("Username is already taken.");
      setIsLoading(false);
      return;
    }

    const hashedPassword = await hashPassword(formData.password);

    const newUser: User = {
      username: trimmedUsername,
      password: hashedPassword,
      role: formData.role,
      approved: formData.role === 'student', // Admins shouldn't really be registered this way, but for demo safety
      gradeLevel: formData.role === 'student' ? formData.gradeLevel : undefined,
      securityQuestion: formData.securityQuestion,
      securityAnswer: formData.securityAnswer.toLowerCase()
    };

    saveUser(newUser);
    setSuccess("Registration submitted! An admin must approve your account.");
    setIsLoading(false);
    setTimeout(() => {
      setSuccess('');
      setMode('login');
    }, 3000);
  };

  return (
    <div className="w-full max-w-md glass border border-white/20 p-8 rounded-3xl shadow-2xl relative overflow-hidden animate-fade-in">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl"></div>

      {onClose && (
        <button onClick={onClose} className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors z-20">
          <X size={24} />
        </button>
      )}

      <div className="text-center mb-8 relative z-10">
        <h2 className="text-3xl font-bold text-white mb-2">
          {mode === 'login' && 'Mission Control'}
          {mode === 'register' && 'New Recruit'}
          {mode === 'recover' && 'Data Recovery'}
        </h2>
        <p className="text-white/40 text-sm">
          {mode === 'login' && 'Log in to continue your scientific journey'}
          {mode === 'register' && 'Sign up for access to AI tutoring'}
          {mode === 'recover' && 'Verify identity to reset access'}
        </p>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2"><Lock size={14} /> {error}</div>}
      {success && <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2"><UserPlus size={14} /> {success}</div>}

      <form onSubmit={mode === 'login' ? handleLogin : handleRegister} className="space-y-4 relative z-10">
        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Username</label>
          <input
            type="text"
            name="username"
            autoComplete="username"
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Password</label>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        {mode === 'register' && (
          <>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Role</label>
                <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-white outline-none">
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>
              {formData.role === 'student' && (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-white/40 ml-1">Grade</label>
                  <select name="gradeLevel" value={formData.gradeLevel} onChange={handleChange} className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-white outline-none">
                    {['9', '10', '11', '12'].map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="space-y-1 pt-2">
              <label className="text-[10px] uppercase font-bold text-white/40 ml-1 flex items-center gap-1"><HelpCircle size={10} /> Recovery Question</label>
              <select
                name="securityQuestion"
                className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-white text-xs outline-none"
                value={formData.securityQuestion}
                onChange={handleChange}
              >
                {SECURITY_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
              </select>
              <input
                type="text"
                name="securityAnswer"
                placeholder="Your Answer..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white mt-2 focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
                value={formData.securityAnswer}
                onChange={handleChange}
                required
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-4 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl shadow-lg transform active:scale-95 transition-all disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : (mode === 'login' ? 'Launch Dashboard' : 'Initiate Registration')}
        </button>
      </form>

      <div className="mt-8 text-center relative z-10 border-t border-white/5 pt-6">
        {mode === 'login' ? (
          <p className="text-white/40 text-sm">
            New to the Academy? <button onClick={() => setMode('register')} className="text-cyan-400 font-bold hover:underline">Register</button>
          </p>
        ) : (
          <p className="text-white/40 text-sm">
            Already have an account? <button onClick={() => setMode('login')} className="text-cyan-400 font-bold hover:underline">Log In</button>
          </p>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
