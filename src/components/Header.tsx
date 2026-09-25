import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Bell, Search, User, HelpCircle } from 'lucide-react';

export default function Header() {
  const { currentView, projects } = useAppStore();
  const totalKeywords = projects.reduce((sum, p) => sum + p.keywords.length, 0);

  const viewTitles: Record<string, string> = {
    dashboard: 'Dashboard',
    projects: 'Projects',
    'project-detail': 'Project Details',
    settings: 'Settings',
  };

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-medium text-gray-500">
          {viewTitles[currentView] || 'Dashboard'}
        </h2>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-900 font-semibold">RankPulse</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Quick search */}
        <div className="relative hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Quick search..."
            className="pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm w-56 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
          />
        </div>

        {/* Help */}
        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Help">
          <HelpCircle size={18} />
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Notifications">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2 ml-2 pl-3 border-l border-gray-200">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            <User size={16} />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900 leading-tight">Admin</p>
            <p className="text-[10px] text-gray-400">{totalKeywords} keywords tracked</p>
          </div>
        </div>
      </div>
    </header>
  );
}
