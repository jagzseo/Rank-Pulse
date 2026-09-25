import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Keyword, SerpResult } from '../types';
import RankingChart from './RankingChart';
import AlertsSection from './AlertsSection';
import {
  ArrowLeft,
  Plus,
  Trash2,
  RefreshCw,
  Globe,
  MapPin,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  X,
  AlertCircle,
  BarChart3,
  Calendar,
  Target,
  Award,
  ExternalLink,
  ListChecks,
  Loader2,
  Star,
  Eye,
  Zap,
} from 'lucide-react';

export default function ProjectDetail() {
  const {
    projects,
    selectedProjectId,
    setCurrentView,
    setSelectedProjectId,
    addKeyword,
    addBulkKeywords,
    removeKeyword,
    checkRankings,
    checkSingleKeyword,
    checkProgress,
  } = useAppStore();

  const [showAddKeyword, setShowAddKeyword] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');
  const [newKeywordUrl, setNewKeywordUrl] = useState('');
  const [isGoogleBusiness, setIsGoogleBusiness] = useState(false);
  const [bulkKeywords, setBulkKeywords] = useState('');
  const [bulkIsGBP, setBulkIsGBP] = useState(false);
  const [selectedKeyword, setSelectedKeyword] = useState<Keyword | null>(null);
  const [checkingSingle, setCheckingSingle] = useState<string | null>(null);

  const project = projects.find((p) => p.id === selectedProjectId);

  if (!project) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Project not found</p>
        <button
          onClick={() => setCurrentView('projects')}
          className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
        >
          ← Back to Projects
        </button>
      </div>
    );
  }

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;

    const keyword: Keyword = {
      id: Math.random().toString(36).substr(2, 9),
      text: newKeyword.trim(),
      currentPosition: null,
      previousPosition: null,
      bestPosition: null,
      url: newKeywordUrl || project.url,
      isGoogleBusiness,
      history: [],
      lastChecked: null,
      serpResults: [],
    };

    addKeyword(project.id, keyword);
    setNewKeyword('');
    setNewKeywordUrl('');
    setIsGoogleBusiness(false);
    setShowAddKeyword(false);
  };

  const handleBulkAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const keywords = bulkKeywords
      .split('\n')
      .map((k) => k.trim())
      .filter((k) => k.length > 0);

    if (keywords.length === 0) return;

    const newKeywords: Keyword[] = keywords.map((text) => ({
      id: Math.random().toString(36).substr(2, 9),
      text,
      currentPosition: null,
      previousPosition: null,
      bestPosition: null,
      url: project.url,
      isGoogleBusiness: bulkIsGBP,
      history: [],
      lastChecked: null,
      serpResults: [],
    }));

    addBulkKeywords(project.id, newKeywords);
    setBulkKeywords('');
    setBulkIsGBP(false);
    setShowBulkAdd(false);
  };

  const handleCheckAll = async () => {
    if (project.keywords.length === 0) return;
    await checkRankings(project.id);
  };

  const handleCheckSingle = async (keywordId: string) => {
    setCheckingSingle(keywordId);
    await checkSingleKeyword(project.id, keywordId);
    setCheckingSingle(null);
    // Refresh selected keyword if it's open
    if (selectedKeyword?.id === keywordId) {
      const updated = useAppStore.getState().projects
        .find((p) => p.id === project.id)
        ?.keywords.find((k) => k.id === keywordId);
      if (updated) setSelectedKeyword(updated);
    }
  };

  const handleViewKeyword = (keyword: Keyword) => {
    setSelectedKeyword(keyword);
  };

  const handlePreviewOnGoogle = (keywordText: string) => {
    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(keywordText)}`;
    window.open(googleSearchUrl, '_blank');
  };

  const getPositionChange = (current: number | null, previous: number | null) => {
    if (!current || !previous) return { diff: 0, trend: 'neutral' as const };
    const diff = previous - current;
    return {
      diff: Math.abs(diff),
      trend: diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral',
    };
  };

  // Only average keywords that have actual positions (not null/0)
  const keywordsWithPositions = project.keywords.filter((k) => k.currentPosition && k.currentPosition > 0);
  const avgPosition = keywordsWithPositions.length
    ? Math.round(
        (keywordsWithPositions.reduce((sum, k) => sum + (k.currentPosition || 0), 0) /
          keywordsWithPositions.length) * 10
      ) / 10
    : 0;

  const top3Count = project.keywords.filter((k) => k.currentPosition && k.currentPosition <= 3).length;
  const top10Count = project.keywords.filter((k) => k.currentPosition && k.currentPosition <= 10).length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <button
          onClick={() => {
            setSelectedProjectId(null);
            setCurrentView('projects');
          }}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors self-start"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            {project.trackGoogleBusiness && (
              <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                <AlertCircle size={12} />
                GBP Tracking
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <Globe size={14} />
              {project.searchEngine.charAt(0).toUpperCase() + project.searchEngine.slice(1)}
            </span>
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin size={14} />
              {project.city ? `${project.city}, ` : ''}{project.country}
            </span>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm text-gray-500 truncate">{project.url}</span>
          </div>
        </div>
        <button
          onClick={handleCheckAll}
          disabled={checkProgress.isChecking || project.keywords.length === 0}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed self-start"
        >
          <RefreshCw size={16} className={checkProgress.isChecking ? 'animate-spin' : ''} />
          {checkProgress.isChecking
            ? `Checking ${checkProgress.current}/${checkProgress.total}...`
            : 'Check All Rankings'}
        </button>
      </div>

      {/* Progress Bar */}
      {checkProgress.isChecking && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Checking rankings...</span>
            <span className="text-sm text-gray-500">
              {checkProgress.current} / {checkProgress.total}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2.5 rounded-full transition-all duration-500"
              style={{
                width: `${(checkProgress.current / checkProgress.total) * 100}%`,
              }}
            />
          </div>
          {checkProgress.error && (
            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
              <AlertCircle size={12} />
              {checkProgress.error}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            Note: API calls are rate-limited (~1.2s per keyword). Please be patient.
          </p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Target size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{project.keywords.length}</p>
              <p className="text-xs text-gray-500">Keywords</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg">
              <BarChart3 size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{avgPosition || '—'}</p>
              <p className="text-xs text-gray-500">Avg. Position</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Award size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{top3Count}</p>
              <p className="text-xs text-gray-500">Top 3</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-lg">
              <Star size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{top10Count}</p>
              <p className="text-xs text-gray-500">Top 10</p>
            </div>
          </div>
        </div>
      </div>

      {/* Keywords Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Keywords</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBulkAdd(true)}
              className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <ListChecks size={16} />
              Bulk Add
            </button>
            <button
              onClick={() => setShowAddKeyword(true)}
              className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              <Plus size={16} />
              Add Keyword
            </button>
          </div>
        </div>

        {project.keywords.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No keywords added yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Add keywords individually or in bulk to start tracking
            </p>
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                onClick={() => setShowAddKeyword(true)}
                className="inline-flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors"
              >
                <Plus size={16} />
                Add Keyword
              </button>
              <button
                onClick={() => setShowBulkAdd(true)}
                className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                <ListChecks size={16} />
                Bulk Add
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Keyword
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Current
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Change
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Best
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    SERP
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {project.keywords.map((keyword) => {
                  const { diff, trend } = getPositionChange(
                    keyword.currentPosition,
                    keyword.previousPosition
                  );
                  
                  // Get the actual ranking URL from SERP results
                  const getRankingUrl = () => {
                    if (!keyword.serpResults || keyword.serpResults.length === 0) {
                      return null;
                    }
                    
                    try {
                      const projectDomain = new URL(project.url).hostname.replace('www.', '');
                      
                      // Find the SERP result that matches our domain
                      const rankingResult = keyword.serpResults.find((result) => {
                        try {
                          const resultDomain = new URL(result.link).hostname.replace('www.', '');
                          return resultDomain === projectDomain;
                        } catch {
                          return false;
                        }
                      });
                      
                      if (rankingResult) {
                        // Convert to relative URL
                        const urlObj = new URL(rankingResult.link);
                        const relativePath = urlObj.pathname + urlObj.search + urlObj.hash;
                        return relativePath === '/' ? '/' : relativePath;
                      }
                    } catch {
                      // Fallback to keyword URL if parsing fails
                    }
                    
                    return null;
                  };
                  
                  const rankingUrl = getRankingUrl();
                  
                  return (
                    <tr key={keyword.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleViewKeyword(keyword)}
                          className="text-left group"
                        >
                          <span className="text-sm font-medium text-gray-900 group-hover:text-emerald-600 transition-colors">
                            {keyword.text}
                          </span>
                          {rankingUrl ? (
                            <p className="text-xs text-emerald-600 mt-0.5 truncate max-w-[250px] font-mono">
                              {rankingUrl}
                            </p>
                          ) : (
                            <p className="text-xs text-gray-400 mt-0.5 italic">
                              Not yet ranked
                            </p>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {keyword.currentPosition ? (
                          <span
                            className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold ${
                              keyword.currentPosition <= 3
                                ? 'bg-emerald-100 text-emerald-700'
                                : keyword.currentPosition <= 10
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            #{keyword.currentPosition}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {keyword.currentPosition && keyword.previousPosition ? (
                          trend === 'up' ? (
                            <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-medium">
                              <ArrowUpRight size={12} />
                              {diff}
                            </span>
                          ) : trend === 'down' ? (
                            <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2.5 py-1 rounded-full text-xs font-medium">
                              <ArrowDownRight size={12} />
                              {diff}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full text-xs font-medium">
                              <Minus size={12} />
                              0
                            </span>
                          )
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-sm font-medium text-gray-600">
                          {keyword.bestPosition ? `#${keyword.bestPosition}` : '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {keyword.isGoogleBusiness ? (
                          <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                            <AlertCircle size={10} />
                            GBP
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full font-medium">
                            <Globe size={10} />
                            Organic
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleViewKeyword(keyword)}
                          className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full font-medium hover:bg-indigo-100 transition-colors"
                          title="View SERP Results"
                        >
                          <Eye size={10} />
                          {keyword.serpResults.length > 0 ? `${keyword.serpResults.length} results` : 'View'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleCheckSingle(keyword.id)}
                            disabled={checkingSingle === keyword.id}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Check this keyword"
                          >
                            {checkingSingle === keyword.id ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Zap size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => handlePreviewOnGoogle(keyword.text)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Preview on Google"
                          >
                            <ExternalLink size={16} />
                          </button>
                          <button
                            onClick={() => removeKeyword(project.id, keyword.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove Keyword"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ranking History Chart */}
      <RankingChart keywords={project.keywords} />

      {/* SEO Health Alerts */}
      <AlertsSection keywords={project.keywords} projectUrl={project.url} />

      {/* Add Single Keyword Modal */}
      {showAddKeyword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Add Keyword</h2>
              <button
                onClick={() => setShowAddKeyword(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddKeyword} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Keyword
                </label>
                <input
                  type="text"
                  required
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="e.g., best running shoes"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Target URL (optional)
                </label>
                <input
                  type="url"
                  value={newKeywordUrl}
                  onChange={(e) => setNewKeywordUrl(e.target.value)}
                  placeholder={project.url}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <p className="text-xs text-gray-400 mt-1">Leave empty to use project URL</p>
              </div>

              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg border border-amber-100">
                <input
                  type="checkbox"
                  id="kwGBP"
                  checked={isGoogleBusiness}
                  onChange={(e) => setIsGoogleBusiness(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label htmlFor="kwGBP" className="flex-1">
                  <span className="text-sm font-medium text-gray-900">
                    Track as Google Business
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Track local pack / Maps ranking
                  </p>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddKeyword(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-emerald-500/20"
                >
                  Add Keyword
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Add Modal */}
      {showBulkAdd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Bulk Add Keywords</h2>
                <p className="text-xs text-gray-500 mt-0.5">Add multiple keywords at once</p>
              </div>
              <button
                onClick={() => setShowBulkAdd(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBulkAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Keywords (one per line)
                </label>
                <textarea
                  required
                  value={bulkKeywords}
                  onChange={(e) => setBulkKeywords(e.target.value)}
                  placeholder={`best running shoes\nnike shoes online\ncheap sneakers\nmarathon shoes\ntrail running shoes`}
                  rows={8}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none font-mono"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {bulkKeywords.split('\n').filter((k) => k.trim().length > 0).length} keywords detected
                </p>
              </div>

              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg border border-amber-100">
                <input
                  type="checkbox"
                  id="bulkGBP"
                  checked={bulkIsGBP}
                  onChange={(e) => setBulkIsGBP(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label htmlFor="bulkGBP" className="flex-1">
                  <span className="text-sm font-medium text-gray-900">
                    Track all as Google Business
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Track local pack / Maps ranking for all keywords
                  </p>
                </label>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle size={14} className="text-blue-500 mt-0.5 shrink-0" />
                <p className="text-xs text-blue-700">
                  After adding keywords, click "Check All Rankings" to fetch their positions from the search engine. Each keyword takes ~1.2 seconds due to API rate limits.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBulkAdd(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-blue-500/20"
                >
                  Add {bulkKeywords.split('\n').filter((k) => k.trim().length > 0).length} Keywords
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SERP Results Modal */}
      {selectedKeyword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  SERP Results
                </h2>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <span className="font-medium text-gray-700">"{selectedKeyword.text}"</span>
                  <span className="text-gray-300">•</span>
                  <span>{project.searchEngine} - {project.city ? `${project.city}, ` : ''}{project.country}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleCheckSingle(selectedKeyword.id);
                  }}
                  disabled={checkingSingle === selectedKeyword.id}
                  className="flex items-center gap-1.5 text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-100 transition-colors disabled:opacity-50"
                >
                  {checkingSingle === selectedKeyword.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <RefreshCw size={14} />
                  )}
                  Refresh
                </button>
                <button
                  onClick={() => setSelectedKeyword(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedKeyword.currentPosition && (() => {
                // Get the actual ranking URL from SERP results
                let rankingUrl = selectedKeyword.url;
                if (selectedKeyword.serpResults && selectedKeyword.serpResults.length > 0) {
                  try {
                    const projectDomain = new URL(project.url).hostname.replace('www.', '');
                    const rankingResult = selectedKeyword.serpResults.find((result) => {
                      try {
                        const resultDomain = new URL(result.link).hostname.replace('www.', '');
                        return resultDomain === projectDomain;
                      } catch {
                        return false;
                      }
                    });
                    
                    if (rankingResult) {
                      const urlObj = new URL(rankingResult.link);
                      rankingUrl = urlObj.pathname + urlObj.search + urlObj.hash;
                      if (rankingUrl === '/') rankingUrl = '/';
                    }
                  } catch {
                    // Fallback to selectedKeyword.url
                  }
                }
                
                return (
                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      #{selectedKeyword.currentPosition}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-emerald-800">
                        Your URL is at position #{selectedKeyword.currentPosition}
                      </p>
                      <p className="text-xs text-emerald-600 truncate max-w-[400px] font-mono">
                        {rankingUrl}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {selectedKeyword.serpResults.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No SERP data available</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Click "Check Rankings" or "Refresh" to fetch the latest SERP results
                  </p>
                  <button
                    onClick={() => handleCheckSingle(selectedKeyword.id)}
                    disabled={checkingSingle === selectedKeyword.id}
                    className="mt-4 inline-flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    {checkingSingle === selectedKeyword.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <RefreshCw size={16} />
                    )}
                    Fetch Results
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedKeyword.serpResults.map((result) => (
                    <div
                      key={result.position}
                      className={`p-4 rounded-xl border transition-all ${
                        result.isYours
                          ? 'bg-emerald-50/50 border-emerald-200 shadow-sm shadow-emerald-100'
                          : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                            result.isYours
                              ? 'bg-emerald-500 text-white'
                              : result.position <= 3
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {result.position}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium text-blue-700 truncate">
                              {result.title}
                            </h4>
                            {result.isYours && (
                              <span className="shrink-0 text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-medium">
                                YOUR SITE
                              </span>
                            )}
                          </div>
                          <p className={`text-xs mt-0.5 truncate font-mono ${
                            result.isYours ? 'text-emerald-700' : 'text-gray-500'
                          }`}>
                            {result.isYours ? (() => {
                              try {
                                const urlObj = new URL(result.link);
                                const path = urlObj.pathname + urlObj.search + urlObj.hash;
                                return path === '/' ? '/' : path;
                              } catch {
                                return result.link;
                              }
                            })() : result.domain}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {result.snippet}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {result.link && (
                              <a
                                href={result.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] text-blue-500 hover:text-blue-700 flex items-center gap-0.5"
                              >
                                <ExternalLink size={10} />
                                Visit
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Ranking History */}
              {selectedKeyword.history.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    Ranking History
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-end gap-1 h-24">
                      {selectedKeyword.history.map((entry, idx) => {
                        const maxPos = Math.max(
                          ...selectedKeyword.history.map((h) => h.position),
                          10
                        );
                        const height = ((maxPos - entry.position + 1) / maxPos) * 100;
                        return (
                          <div
                            key={idx}
                            className="flex-1 flex flex-col items-center gap-1"
                          >
                            <span className="text-[9px] text-gray-500 font-medium">
                              {entry.position}
                            </span>
                            <div
                              className={`w-full rounded-t-sm transition-all ${
                                entry.position <= 3
                                  ? 'bg-emerald-400'
                                  : entry.position <= 10
                                  ? 'bg-blue-400'
                                  : 'bg-gray-300'
                              }`}
                              style={{ height: `${Math.max(height, 8)}%` }}
                            />
                            <span className="text-[8px] text-gray-400">
                              {entry.date.slice(5)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
