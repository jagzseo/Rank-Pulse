import { create } from 'zustand';
import { Project, Keyword, ViewType } from '../types';
import { fetchSerpResults, findYourPosition, getApiConfig, extractDomain } from '../services/serpApi';
import { locations } from '../data/locations';

interface AppState {
  projects: Project[];
  currentView: ViewType;
  selectedProjectId: string | null;
  sidebarOpen: boolean;
  checkProgress: { current: number; total: number; isChecking: boolean; error: string | null };
  setCurrentView: (view: ViewType) => void;
  setSelectedProjectId: (id: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addKeyword: (projectId: string, keyword: Keyword) => void;
  addBulkKeywords: (projectId: string, keywords: Keyword[]) => void;
  removeKeyword: (projectId: string, keywordId: string) => void;
  checkRankings: (projectId: string) => Promise<void>;
  checkSingleKeyword: (projectId: string, keywordId: string) => Promise<void>;
  setCheckProgress: (progress: { current: number; total: number; isChecking: boolean; error: string | null }) => void;
}

// Load projects from localStorage or use defaults
function loadProjects(): Project[] {
  const stored = localStorage.getItem('rankpulse_projects');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Ensure serpResults exists on all keywords
      return parsed.map((p: Project) => ({
        ...p,
        keywords: p.keywords.map((k: Keyword) => ({
          ...k,
          serpResults: k.serpResults || [],
        })),
      }));
    } catch {
      return getDefaultProjects();
    }
  }
  return getDefaultProjects();
}

function saveProjects(projects: Project[]) {
  localStorage.setItem('rankpulse_projects', JSON.stringify(projects));
}

function getDefaultProjects(): Project[] {
  return [
    {
      id: 'proj1',
      name: 'Demo Project',
      url: 'https://example.com',
      searchEngine: 'google',
      country: 'United States',
      city: '',
      trackGoogleBusiness: false,
      createdAt: new Date().toISOString().split('T')[0],
      lastChecked: null,
      keywords: [],
    },
  ];
}

function getDomainFromUrl(url: string): string {
  try {
    return extractDomain(url);
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  }
}

export const useAppStore = create<AppState>((set, get) => ({
  projects: loadProjects(),
  currentView: 'dashboard',
  selectedProjectId: null,
  sidebarOpen: true,
  checkProgress: { current: 0, total: 0, isChecking: false, error: null },

  setCurrentView: (view) => set({ currentView: view }),
  setSelectedProjectId: (id) => set({ selectedProjectId: id }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setCheckProgress: (progress) => set({ checkProgress: progress }),

  addProject: (project) => {
    set((state) => {
      const newProjects = [...state.projects, project];
      saveProjects(newProjects);
      return { projects: newProjects };
    });
  },

  updateProject: (id, updates) =>
    set((state) => {
      const newProjects = state.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      );
      saveProjects(newProjects);
      return { projects: newProjects };
    }),

  deleteProject: (id) =>
    set((state) => {
      const newProjects = state.projects.filter((p) => p.id !== id);
      saveProjects(newProjects);
      return {
        projects: newProjects,
        selectedProjectId: state.selectedProjectId === id ? null : state.selectedProjectId,
      };
    }),

  addKeyword: (projectId, keyword) =>
    set((state) => {
      const newProjects = state.projects.map((p) =>
        p.id === projectId
          ? { ...p, keywords: [...p.keywords, keyword] }
          : p
      );
      saveProjects(newProjects);
      return { projects: newProjects };
    }),

  addBulkKeywords: (projectId, keywords) =>
    set((state) => {
      const newProjects = state.projects.map((p) =>
        p.id === projectId
          ? { ...p, keywords: [...p.keywords, ...keywords] }
          : p
      );
      saveProjects(newProjects);
      return { projects: newProjects };
    }),

  removeKeyword: (projectId, keywordId) =>
    set((state) => {
      const newProjects = state.projects.map((p) =>
        p.id === projectId
          ? { ...p, keywords: p.keywords.filter((k) => k.id !== keywordId) }
          : p
      );
      saveProjects(newProjects);
      return { projects: newProjects };
    }),

  checkRankings: async (projectId) => {
    const state = get();
    const project = state.projects.find((p) => p.id === projectId);
    if (!project || project.keywords.length === 0) return;

    const { apiKey } = getApiConfig();
    if (!apiKey) {
      set({ checkProgress: { current: 0, total: 0, isChecking: false, error: 'API key not configured. Please add your API key in Settings.' } });
      return;
    }

    const locationData = locations.find((l) => l.country === project.country);
    const countryCode = locationData?.countryCode || 'us';
    const projectDomain = getDomainFromUrl(project.url);

    set({ checkProgress: { current: 0, total: project.keywords.length, isChecking: true, error: null } });

    const today = new Date().toISOString().split('T')[0];
    let updatedKeywords = [...project.keywords];

    for (let i = 0; i < project.keywords.length; i++) {
      const keyword = project.keywords[i];

      set({ checkProgress: { current: i, total: project.keywords.length, isChecking: true, error: null } });

      try {
        const serpResults = await fetchSerpResults({
          query: keyword.text,
          engine: project.searchEngine,
          country: project.country,
          countryCode,
          city: project.city || '',
          isGoogleBusiness: keyword.isGoogleBusiness,
        });

        // Determine which domain to look for
        const targetDomain = keyword.url ? getDomainFromUrl(keyword.url) : projectDomain;

        // Mark your results
        const resultsWithYours = serpResults.map((r) => {
          const resultDomain = getDomainFromUrl(r.link);
          return {
            ...r,
            isYours: resultDomain === targetDomain || r.link.includes(targetDomain),
          };
        });

        const yourPosition = findYourPosition(resultsWithYours, keyword.url || project.url);

        updatedKeywords[i] = {
          ...keyword,
          previousPosition: keyword.currentPosition,
          currentPosition: yourPosition,
          bestPosition: yourPosition
            ? Math.min(keyword.bestPosition || yourPosition, yourPosition)
            : keyword.bestPosition,
          serpResults: resultsWithYours,
          lastChecked: today,
          history: yourPosition
            ? [...keyword.history, { date: today, position: yourPosition }]
            : keyword.history,
        };
      } catch (error: any) {
        console.error(`Error checking "${keyword.text}":`, error);
        set({ checkProgress: { current: i + 1, total: project.keywords.length, isChecking: true, error: error.message } });
      }

      // Rate limit delay between requests
      if (i < project.keywords.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }

      // Update keywords progressively in the UI
      set((state) => {
        const newProjects = state.projects.map((p) =>
          p.id === projectId ? { ...p, keywords: [...updatedKeywords] } : p
        );
        saveProjects(newProjects);
        return { projects: newProjects };
      });
    }

    // Final update with lastChecked
    set((state) => {
      const newProjects = state.projects.map((p) =>
        p.id === projectId ? { ...p, keywords: updatedKeywords, lastChecked: today } : p
      );
      saveProjects(newProjects);
      return {
        projects: newProjects,
        checkProgress: { current: project.keywords.length, total: project.keywords.length, isChecking: false, error: null },
      };
    });
  },

  checkSingleKeyword: async (projectId, keywordId) => {
    const state = get();
    const project = state.projects.find((p) => p.id === projectId);
    const keyword = project?.keywords.find((k) => k.id === keywordId);
    if (!project || !keyword) return;

    const { apiKey } = getApiConfig();
    if (!apiKey) return;

    const locationData = locations.find((l) => l.country === project.country);
    const countryCode = locationData?.countryCode || 'us';
    const today = new Date().toISOString().split('T')[0];
    const projectDomain = getDomainFromUrl(project.url);

    try {
      const serpResults = await fetchSerpResults({
        query: keyword.text,
        engine: project.searchEngine,
        country: project.country,
        countryCode,
        city: project.city || '',
        isGoogleBusiness: keyword.isGoogleBusiness,
      });

      const targetDomain = keyword.url ? getDomainFromUrl(keyword.url) : projectDomain;

      const resultsWithYours = serpResults.map((r) => {
        const resultDomain = getDomainFromUrl(r.link);
        return {
          ...r,
          isYours: resultDomain === targetDomain || r.link.includes(targetDomain),
        };
      });

      const yourPosition = findYourPosition(resultsWithYours, keyword.url || project.url);

      const updatedKeyword: Keyword = {
        ...keyword,
        previousPosition: keyword.currentPosition,
        currentPosition: yourPosition,
        bestPosition: yourPosition
          ? Math.min(keyword.bestPosition || yourPosition, yourPosition)
          : keyword.bestPosition,
        serpResults: resultsWithYours,
        lastChecked: today,
        history: yourPosition
          ? [...keyword.history, { date: today, position: yourPosition }]
          : keyword.history,
      };

      set((state) => {
        const newProjects = state.projects.map((p) =>
          p.id === projectId
            ? { ...p, keywords: p.keywords.map((k) => (k.id === keywordId ? updatedKeyword : k)) }
            : p
        );
        saveProjects(newProjects);
        return { projects: newProjects };
      });
    } catch (error) {
      console.error(`Error checking single keyword:`, error);
    }
  },
}));
