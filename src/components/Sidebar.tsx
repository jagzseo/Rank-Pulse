import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { ViewType } from '../types';
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';

const menuItems: { id: ViewType; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'projects', label: 'Projects', icon: <FolderKanban size={20} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={20} /> },
];

export default function Sidebar() {
  const { currentView, setCurrentView, sidebarOpen, setSidebarOpen, projects } = useAppStore();

  const totalKeywords = projects.reduce((sum, p) => sum + p.keywords.length, 0);

  return (
    <aside
      className={`bg-gray-900 text-white flex flex-col transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-700">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-xl shadow-lg shadow-emerald-500/20">
          <TrendingUp size={22} className="text-white" />
        </div>
        {sidebarOpen && (
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              RankPulse
            </h1>
            <p className="text-[10px] text-gray-400 -mt-0.5">SEO Rank Tracker</p>
          </div>
        )}
      </div>

      {/* Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="flex items-center justify-center py-2 text-gray-400 hover:text-white transition-colors"
      >
        {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setCurrentView(item.id);
              if (item.id !== 'project-detail') {
                useAppStore.getState().setSelectedProjectId(null);
              }
            }}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              currentView === item.id
                ? 'bg-emerald-500/15 text-emerald-400 shadow-sm'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            {item.icon}
            {sidebarOpen && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Stats */}
      {sidebarOpen && (
        <div className="px-4 py-4 border-t border-gray-700">
          <div className="bg-gray-800/60 rounded-xl p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Zap size={14} className="text-yellow-400" />
              <span>Quick Stats</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-700/40 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-emerald-400">{projects.length}</p>
                <p className="text-[10px] text-gray-400">Projects</p>
              </div>
              <div className="bg-gray-700/40 rounded-lg p-2 text-center">
                <p className="text-lg font-bold text-cyan-400">{totalKeywords}</p>
                <p className="text-[10px] text-gray-400">Keywords</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
