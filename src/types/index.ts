export interface Project {
  id: string;
  name: string;
  url: string;
  searchEngine: SearchEngine;
  country: string;
  city: string;
  trackGoogleBusiness: boolean;
  keywords: Keyword[];
  createdAt: string;
  lastChecked: string | null;
}

export interface Keyword {
  id: string;
  text: string;
  currentPosition: number | null;
  previousPosition: number | null;
  bestPosition: number | null;
  url: string;
  isGoogleBusiness: boolean;
  history: RankHistory[];
  lastChecked: string | null;
  serpResults: SerpResult[];
}

export interface SerpResult {
  position: number;
  title: string;
  link: string;
  snippet: string;
  domain: string;
  isYours: boolean;
  // Google Maps specific fields
  rating?: number;
  reviews?: number;
  address?: string;
  phone?: string;
  type?: string;
  price?: string;
  placeId?: string;
}

export interface RankHistory {
  date: string;
  position: number;
}

export type SearchEngine = 'google' | 'bing' | 'yahoo' | 'duckduckgo';

export interface Location {
  country: string;
  cities: string[];
  countryCode: string;
}

export type ViewType = 'dashboard' | 'projects' | 'project-detail' | 'settings';

export type ApiProvider = 'scrapingdog' | 'serpapi' | 'custom';

export interface ApiConfig {
  apiKey: string;
  endpoint: string;
  provider: ApiProvider;
}
