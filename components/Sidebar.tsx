
import React from 'react';
import { Theme } from '../types';
// Added missing Settings icon import
import { X, Moon, Monitor, Download, Upload, ShieldCheck, Database, Settings, Sun, Sparkles } from 'lucide-react';
import { exportAllData, importAllData } from '../services/storageService';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: Theme;
  setTheme: (t: Theme) => void;
}

const Sidebar = ({ isOpen, onClose, currentTheme, setTheme }: SidebarProps) => {

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newel_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (importAllData(content)) {
        alert("Data restored successfully! The app will reload.");
        window.location.reload();
      } else {
        alert("Failed to restore data. Invalid file format.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className={`fixed inset-y-0 right-0 w-full sm:w-80 bg-slate-900/95 backdrop-blur-2xl border-l border-white/10 transform transition-transform duration-500 ease-in-out z-[150] shadow-2xl p-6 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
    >
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-cyan-600/20 rounded-lg text-cyan-400">
            <Settings size={20} />
          </div>
          <h2 className="text-xl font-bold text-white">System Settings</h2>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="flex-grow space-y-8 overflow-y-auto pr-2">
        <div>
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Monitor size={14} /> UI Appearance
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => setTheme('Cosmic')}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${currentTheme === 'Cosmic' ? 'bg-cyan-600/20 border-cyan-500 text-white shadow-lg shadow-cyan-900/20' : 'bg-white/5 border-transparent text-white/70 hover:bg-white/10'}`}
            >
              <div className="flex items-center gap-3">
                <Moon size={18} className={currentTheme === 'Cosmic' ? "text-cyan-400" : ""} />
                <div className="text-left">
                  <p className="font-bold text-sm">Cosmic</p>
                  <p className="text-[10px] opacity-50">Deep space & nebulae</p>
                </div>
              </div>
              {currentTheme === 'Cosmic' && <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>}
            </button>
            <button
              onClick={() => setTheme('Cyber-Dystopian')}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${currentTheme === 'Cyber-Dystopian' ? 'bg-green-600/20 border-green-500 text-green-400 font-mono' : 'bg-white/5 border-transparent text-white/70 hover:bg-white/10'}`}
            >
              <div className="flex items-center gap-3">
                <Monitor size={18} className={currentTheme === 'Cyber-Dystopian' ? "text-green-500" : ""} />
                <div className="text-left">
                  <p className="font-bold text-sm">Matrix</p>
                  <p className="text-[10px] opacity-50">Digital hacker aesthetic</p>
                </div>
              </div>
              {currentTheme === 'Cyber-Dystopian' && <div className="w-2 h-2 bg-green-400 rounded-full"></div>}
            </button>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10">
          <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Database size={14} /> Data Cloud & Local
          </h3>
          <div className="space-y-3">
            <button
              onClick={handleExport}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white/5 hover:bg-cyan-600/20 text-cyan-200 border border-white/5 hover:border-cyan-500/30 transition-all text-sm font-medium"
            >
              <Download size={18} /> Backup Local Database
            </button>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button
                className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white/5 hover:bg-orange-600/20 text-orange-200 border border-white/5 hover:border-orange-500/30 transition-all text-sm font-medium"
              >
                <Upload size={18} /> Restore from File
              </button>
            </div>
          </div>
          <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <p className="text-[10px] text-yellow-500/80 leading-relaxed uppercase tracking-widest font-bold">Notice</p>
            <p className="text-xs text-white/40 mt-1">Local data syncs with your encrypted browser storage. Backups are recommended weekly.</p>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 text-white/40 text-xs">
            <ShieldCheck size={16} className="text-yellow-500" />
            <span>Data stored locally in your browser</span>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-white/10 text-center">
        <p className="text-[10px] font-mono text-white/20 tracking-tighter uppercase">Newel Academy OS v2.2.0 • Build 202505</p>
      </div>
    </div >
  );
};

export default Sidebar;
