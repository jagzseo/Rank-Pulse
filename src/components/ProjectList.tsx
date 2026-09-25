import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { locations } from '../data/locations';
import { Project, SearchEngine } from '../types';
import {
  Plus,
  Globe,
  MapPin,
  Trash2,
  Eye,
  Search,
  X,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';

export default function ProjectList() {
  const { projects, addProject, deleteProject, setCurrentView, setSelectedProjectId } =
    useAppStore();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    searchEngine: 'google' as SearchEngine,
    country: 'United States',
    city: '',
    trackGoogleBusiness: false,
  });

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedLocation = locations.find((l) => l.country === formData.country);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      url: formData.url,
      searchEngine: formData.searchEngine,
      country: formData.country,
      city: formData.city,
      trackGoogleBusiness: formData.trackGoogleBusiness,
      keywords: [],
      createdAt: new Date().toISOString().split('T')[0],
      lastChecked: null,
    };
    addProject(newProject);
    setShowForm(false);
    setFormData({
      name: '',
      url: '',
      searchEngine: 'google',
      country: 'United States',
      city: '',
      trackGoogleBusiness: false,
    });
  };

  const handleViewProject = (id: string) => {
    setSelectedProjectId(id);
    setCurrentView('project-detail');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your SEO tracking projects
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all hover:scale-[1.02]"
        >
          <Plus size={18} />
          New Project
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search projects by name or URL..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        />
      </div>

      {/* Projects List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No projects found</p>
            <p className="text-sm text-gray-400 mt-1">Create a new project to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Engine & Location
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Keywords
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Avg. Position
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Trend
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Last Checked
                  </th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProjects.map((project) => {
                  const keywordsWithPositions = project.keywords.filter(
                    (k) => k.currentPosition && k.currentPosition > 0
                  );
                  const avgPosition = keywordsWithPositions.length
                    ? Math.round(
                        (keywordsWithPositions.reduce(
                          (sum, k) => sum + (k.currentPosition || 0),
                          0
                        ) /
                          keywordsWithPositions.length) *
                          10
                      ) / 10
                    : null;

                  const improvedCount = project.keywords.filter(
                    (k) =>
                      k.currentPosition &&
                      k.previousPosition &&
                      k.currentPosition < k.previousPosition
                  ).length;
                  const declinedCount = project.keywords.filter(
                    (k) =>
                      k.currentPosition &&
                      k.previousPosition &&
                      k.currentPosition > k.previousPosition
                  ).length;

                  return (
                    <tr
                      key={project.id}
                      className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                      onClick={() => handleViewProject(project.id)}
                    >
                      {/* Project Name & URL */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {project.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 text-sm truncate">
                                {project.name}
                              </h3>
                              {project.trackGoogleBusiness && (
                                <span className="flex items-center gap-0.5 text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-medium shrink-0">
                                  <AlertCircle size={9} />
                                  GBP
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {project.url}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Engine & Location */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="flex items-center gap-1.5 text-xs text-gray-700">
                            <Globe size={12} className="text-gray-400" />
                            <span className="capitalize">{project.searchEngine}</span>
                          </span>
                          <span className="flex items-center gap-1.5 text-xs text-gray-500">
                            <MapPin size={12} className="text-gray-400" />
                            {project.city ? `${project.city}, ` : ''}
                            {project.country}
                          </span>
                        </div>
                      </td>

                      {/* Keywords Count */}
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-semibold">
                          {project.keywords.length}
                        </span>
                      </td>

                      {/* Average Position */}
                      <td className="px-6 py-4 text-center">
                        {avgPosition ? (
                          <span
                            className={`inline-flex items-center justify-center min-w-[2.5rem] px-2 py-1 rounded-md text-sm font-semibold ${
                              avgPosition <= 3
                                ? 'bg-emerald-50 text-emerald-700'
                                : avgPosition <= 10
                                ? 'bg-blue-50 text-blue-700'
                                : avgPosition <= 30
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            #{avgPosition}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>

                      {/* Trend */}
                      <td className="px-6 py-4 text-center">
                        {improvedCount > 0 || declinedCount > 0 ? (
                          <div className="flex items-center justify-center gap-1">
                            {improvedCount > 0 && (
                              <span className="flex items-center gap-0.5 text-xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
                                <TrendingUp size={10} />
                                {improvedCount}
                              </span>
                            )}
                            {declinedCount > 0 && (
                              <span className="flex items-center gap-0.5 text-xs bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-medium">
                                <TrendingDown size={10} />
                                {declinedCount}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>

                      {/* Last Checked */}
                      <td className="px-6 py-4 text-center">
                        <span className="text-xs text-gray-500">
                          {project.lastChecked || 'Never'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewProject(project.id);
                            }}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteProject(project.id);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Project"
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

      {/* Summary Footer */}
      {filteredProjects.length > 0 && (
        <div className="flex items-center justify-between px-2 text-xs text-gray-500">
          <span>
            Showing {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
          </span>
          <span>
            Total: {filteredProjects.reduce((sum, p) => sum + p.keywords.length, 0)} keywords
          </span>
        </div>
      )}

      {/* New Project Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Create New Project</h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Project Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., My E-Commerce Store"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Website URL
                </label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              {/* Search Engine */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Search Engine
                </label>
                <select
                  value={formData.searchEngine}
                  onChange={(e) =>
                    setFormData({ ...formData, searchEngine: e.target.value as SearchEngine })
                  }
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="google">Google</option>
                  <option value="bing">Bing</option>
                  <option value="yahoo">Yahoo</option>
                  <option value="duckduckgo">DuckDuckGo</option>
                </select>
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Country
                </label>
                <select
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      country: e.target.value,
                      city: '',
                    })
                  }
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  {locations.map((loc) => (
                    <option key={loc.country} value={loc.country}>
                      {loc.country}
                    </option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  City <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  <option value="">-- Select City (Optional) --</option>
                  {selectedLocation?.cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Google Business */}
              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg border border-amber-100">
                <input
                  type="checkbox"
                  id="trackGBP"
                  checked={formData.trackGoogleBusiness}
                  onChange={(e) =>
                    setFormData({ ...formData, trackGoogleBusiness: e.target.checked })
                  }
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <label htmlFor="trackGBP" className="flex-1">
                  <span className="text-sm font-medium text-gray-900">
                    Track Google Business Profile
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Monitor your local pack / Google Maps rankings
                  </p>
                </label>
              </div>

              {/* Submit */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
