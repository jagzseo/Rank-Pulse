import React from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  BarChart3,
  Globe,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Award,
  AlertCircle,
} from 'lucide-react';

export default function Dashboard() {
  const { projects, setCurrentView, setSelectedProjectId } = useAppStore();

  const allKeywords = projects.flatMap((p) => p.keywords);
  const totalKeywords = allKeywords.length;
  const improvedKeywords = allKeywords.filter(
    (k) => k.currentPosition && k.previousPosition && k.currentPosition < k.previousPosition
  ).length;
  const declinedKeywords = allKeywords.filter(
    (k) => k.currentPosition && k.previousPosition && k.currentPosition > k.previousPosition
  ).length;
  const stableKeywords = allKeywords.filter(
    (k) => k.currentPosition && k.previousPosition && k.currentPosition === k.previousPosition
  ).length;
  const top3Keywords = allKeywords.filter((k) => k.currentPosition && k.currentPosition <= 3).length;
  const top10Keywords = allKeywords.filter((k) => k.currentPosition && k.currentPosition <= 10).length;
  
  // Only average keywords that have actual positions (not null/0)
  const keywordsWithPositions = allKeywords.filter((k) => k.currentPosition && k.currentPosition > 0);
  const avgPosition = keywordsWithPositions.length
    ? Math.round(
        (keywordsWithPositions.reduce((sum, k) => sum + (k.currentPosition || 0), 0) /
          keywordsWithPositions.length) * 10
      ) / 10
    : 0;

  const statCards = [
    {
      label: 'Total Keywords',
      value: totalKeywords,
      icon: <Target size={20} />,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400',
    },
    {
      label: 'Avg. Position',
      value: avgPosition || '—',
      icon: <BarChart3 size={20} />,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-400',
    },
    {
      label: 'Top 3 Rankings',
      value: top3Keywords,
      icon: <Award size={20} />,
      color: 'from-emerald-500 to-green-500',
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-400',
    },
    {
      label: 'Top 10 Rankings',
      value: top10Keywords,
      icon: <Zap size={20} />,
      color: 'from-amber-500 to-orange-500',
      bgColor: 'bg-amber-500/10',
      textColor: 'text-amber-400',
    },
  ];

  const handleProjectClick = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentView('project-detail');
  };

  const getPositionChange = (current: number | null, previous: number | null) => {
    if (!current || !previous) return { diff: 0, trend: 'neutral' as const };
    const diff = previous - current;
    return {
      diff: Math.abs(diff),
      trend: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral',
    };
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Overview of your SEO rankings across all projects
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-medium">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Live Tracking
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-xl`}>
                <span className={card.textColor}>{card.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Ranking Changes Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <TrendingUp size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{improvedKeywords}</p>
              <p className="text-sm text-gray-500">Keywords Improved</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <TrendingDown size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{declinedKeywords}</p>
              <p className="text-sm text-gray-500">Keywords Declined</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-2 rounded-lg">
              <Minus size={20} className="text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-600">{stableKeywords}</p>
              <p className="text-sm text-gray-500">Keywords Stable</p>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started Guide */}
      {totalKeywords === 0 && (
        <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl border border-emerald-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">🚀 Quick Start Guide</h3>
          <p className="text-sm text-gray-600 mb-4">Get started tracking your SEO rankings in 3 easy steps:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/80 rounded-lg p-4 border border-emerald-100">
              <div className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mb-2">1</div>
              <h4 className="text-sm font-medium text-gray-900">Create a Project</h4>
              <p className="text-xs text-gray-500 mt-1">Go to Projects → New Project. Set your URL, search engine, country & city.</p>
            </div>
            <div className="bg-white/80 rounded-lg p-4 border border-emerald-100">
              <div className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mb-2">2</div>
              <h4 className="text-sm font-medium text-gray-900">Add Keywords</h4>
              <p className="text-xs text-gray-500 mt-1">Add keywords individually or use Bulk Add to add many at once.</p>
            </div>
            <div className="bg-white/80 rounded-lg p-4 border border-emerald-100">
              <div className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center text-sm font-bold mb-2">3</div>
              <h4 className="text-sm font-medium text-gray-900">Check Rankings</h4>
              <p className="text-xs text-gray-500 mt-1">Click "Check All Rankings" to fetch live SERP data from SerpAPI.</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => setCurrentView('projects')}
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
            >
              Create Your First Project →
            </button>
            <span className="text-xs text-gray-400">API key is pre-configured ✓</span>
          </div>
        </div>
      )}

      {/* Projects Overview */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Projects Overview</h2>
          <button
            onClick={() => setCurrentView('projects')}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            View All →
          </button>
        </div>
        <div className="divide-y divide-gray-50">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project.id)}
              className="px-6 py-4 hover:bg-gray-50/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {project.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Globe size={12} />
                        {project.searchEngine}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <MapPin size={12} />
                        {project.city ? `${project.city}, ` : ''}{project.country}
                      </span>
                      {project.trackGoogleBusiness && (
                        <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                          <AlertCircle size={10} />
                          GBP
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{project.keywords.length}</p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Keywords</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">
                      {project.keywords.length
                        ? Math.round(
                            project.keywords.reduce(
                              (sum, k) => sum + (k.currentPosition || 0),
                              0
                            ) / project.keywords.length
                          )
                        : '-'}
                    </p>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider">Avg Pos</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {project.keywords.filter(
                      (k) => k.currentPosition && k.previousPosition && k.currentPosition < k.previousPosition
                    ).length > 0 && (
                      <ArrowUpRight size={16} className="text-emerald-500" />
                    )}
                    {project.keywords.filter(
                      (k) => k.currentPosition && k.previousPosition && k.currentPosition > k.previousPosition
                    ).length > 0 && (
                      <ArrowDownRight size={16} className="text-red-500" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
