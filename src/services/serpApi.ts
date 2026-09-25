import { SerpResult, SearchEngine, ApiProvider } from '../types';

// Default API configurations
const PROVIDERS = {
  scrapingdog: {
    name: 'Scrapingdog',
    endpoint: 'https://api.scrapingdog.com/google',
    apiKey: '6ab60e55c641773d9c0ecd1d',
  },
  serpapi: {
    name: 'SerpAPI',
    endpoint: 'https://serpapi.com/search',
    apiKey: '72089e5ec512442bcc69b3a35a0dcac6ebb14499172b414292f6fb8796601d72',
  },
};

export function getApiConfig(): { apiKey: string; endpoint: string; provider: ApiProvider } {
  const stored = localStorage.getItem('rankpulse_api_config');
  if (stored) {
    try {
      const config = JSON.parse(stored);
      return {
        apiKey: config.apiKey || PROVIDERS.scrapingdog.apiKey,
        endpoint: config.endpoint || PROVIDERS.scrapingdog.endpoint,
        provider: config.provider || 'scrapingdog',
      };
    } catch {
      return {
        apiKey: PROVIDERS.scrapingdog.apiKey,
        endpoint: PROVIDERS.scrapingdog.endpoint,
        provider: 'scrapingdog',
      };
    }
  }
  return {
    apiKey: PROVIDERS.scrapingdog.apiKey,
    endpoint: PROVIDERS.scrapingdog.endpoint,
    provider: 'scrapingdog',
  };
}

export function saveApiConfig(apiKey: string, endpoint: string, provider: ApiProvider) {
  localStorage.setItem(
    'rankpulse_api_config',
    JSON.stringify({ apiKey, endpoint, provider })
  );
}

export function getProviderDefaults(provider: ApiProvider) {
  if (provider === 'serpapi') return PROVIDERS.serpapi;
  return PROVIDERS.scrapingdog;
}

export interface SearchParams {
  query: string;
  engine: SearchEngine;
  country: string;
  countryCode: string;
  city: string;
  isGoogleBusiness?: boolean;
}

export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  }
}

// Scrapingdog API implementation
async function fetchFromScrapingdog(params: SearchParams): Promise<SerpResult[]> {
  const { apiKey, endpoint } = getApiConfig();

  if (!apiKey) {
    throw new Error('API key not configured. Please add your API key in Settings.');
  }

  const searchParams = new URLSearchParams({
    api_key: apiKey,
    query: params.query,
    results: '10',
    country: params.countryCode,
    page: '0',
  });

  // Add location for geo-targeting
  if (params.city && params.country) {
    searchParams.set('location', `${params.city},${params.country}`);
  }

  // Add domain for country-specific Google
  const domainMap: Record<string, string> = {
    us: 'google.com',
    uk: 'google.co.uk',
    gb: 'google.co.uk',
    in: 'google.co.in',
    ca: 'google.ca',
    au: 'google.com.au',
    de: 'google.de',
    fr: 'google.fr',
    jp: 'google.co.jp',
    br: 'google.com.br',
    nl: 'google.nl',
  };

  const domain = domainMap[params.countryCode.toLowerCase()];
  if (domain) {
    searchParams.set('domain', domain);
  }

  const url = `${endpoint}?${searchParams.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid API key. Please check your API key in Settings.');
      }
      if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please wait before trying again.');
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    let results: SerpResult[] = [];

    if (data.organic_results) {
      results = data.organic_results.slice(0, 10).map((item: any) => ({
        position: item.rank || item.position || 0,
        title: item.title || 'N/A',
        link: item.link || '',
        snippet: item.snippet || '',
        domain: extractDomain(item.link || ''),
        isYours: false,
      }));
    }

    return results;
  } catch (error: any) {
    if (error.message.includes('API') || error.message.includes('rate limit') || error.message.includes('Invalid')) {
      throw error;
    }
    throw new Error(`Network error: ${error.message}. Check your internet connection.`);
  }
}

// SerpAPI implementation
async function fetchFromSerpAPI(params: SearchParams): Promise<SerpResult[]> {
  const { apiKey, endpoint } = getApiConfig();

  if (!apiKey) {
    throw new Error('API key not configured. Please add your API key in Settings.');
  }

  const engineParam = params.engine === 'google' ? 'google' : params.engine;

  const searchParams = new URLSearchParams({
    engine: engineParam,
    q: params.query,
    api_key: apiKey,
    gl: params.countryCode,
    hl: 'en',
    num: '10',
  });

  // Add location for geo-targeting
  if (params.city && params.country) {
    searchParams.set('location', `${params.city},${params.country}`);
  }

  // For Google Business / Local Pack
  if (params.isGoogleBusiness) {
    searchParams.set('tbm', 'lcl');
  }

  const url = `${endpoint}?${searchParams.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid API key. Please check your API key in Settings.');
      }
      if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please wait before trying again.');
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    let results: SerpResult[] = [];

    if (params.isGoogleBusiness && data.local_results) {
      const localResults = data.local_results.results || data.local_results || [];
      results = localResults.slice(0, 10).map((item: any, index: number) => ({
        position: index + 1,
        title: item.title || 'N/A',
        link: item.link || '',
        snippet: item.snippet || '',
        domain: extractDomain(item.link || ''),
        isYours: false,
      }));
    } else if (data.organic_results) {
      results = data.organic_results.slice(0, 10).map((item: any) => ({
        position: item.position || 0,
        title: item.title || 'N/A',
        link: item.link || '',
        snippet: item.snippet || '',
        domain: extractDomain(item.link || ''),
        isYours: false,
      }));
    } else if (data.local_results) {
      const localResults = data.local_results.results || data.local_results || [];
      results = localResults.slice(0, 10).map((item: any, index: number) => ({
        position: index + 1,
        title: item.title || 'N/A',
        link: item.link || '',
        snippet: item.snippet || '',
        domain: extractDomain(item.link || ''),
        isYours: false,
      }));
    }

    return results;
  } catch (error: any) {
    if (error.message.includes('API') || error.message.includes('rate limit') || error.message.includes('Invalid')) {
      throw error;
    }
    throw new Error(`Network error: ${error.message}. Check your internet connection.`);
  }
}

// Custom API implementation (for future extensibility)
async function fetchFromCustomAPI(params: SearchParams): Promise<SerpResult[]> {
  const { apiKey, endpoint } = getApiConfig();

  if (!apiKey || !endpoint) {
    throw new Error('Custom API not configured. Please add your API details in Settings.');
  }

  // For custom API, we'll use a generic format
  const searchParams = new URLSearchParams({
    api_key: apiKey,
    query: params.query,
    results: '10',
    country: params.countryCode,
  });

  if (params.city && params.country) {
    searchParams.set('location', `${params.city},${params.country}`);
  }

  const url = `${endpoint}?${searchParams.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    let results: SerpResult[] = [];

    if (data.organic_results) {
      results = data.organic_results.slice(0, 10).map((item: any) => ({
        position: item.rank || item.position || 0,
        title: item.title || 'N/A',
        link: item.link || '',
        snippet: item.snippet || '',
        domain: extractDomain(item.link || ''),
        isYours: false,
      }));
    }

    return results;
  } catch (error: any) {
    throw new Error(`Network error: ${error.message}`);
  }
}

// Main function that routes to the appropriate provider
export async function fetchSerpResults(params: SearchParams): Promise<SerpResult[]> {
  const { provider } = getApiConfig();

  switch (provider) {
    case 'serpapi':
      return fetchFromSerpAPI(params);
    case 'custom':
      return fetchFromCustomAPI(params);
    case 'scrapingdog':
    default:
      return fetchFromScrapingdog(params);
  }
}

export function findYourPosition(results: SerpResult[], yourUrl: string): number | null {
  if (!yourUrl) return null;

  try {
    const yourDomain = extractDomain(yourUrl);

    for (const result of results) {
      const resultDomain = extractDomain(result.link);
      if (resultDomain === yourDomain || result.link.includes(yourDomain)) {
        return result.position;
      }
    }
  } catch {
    const yourDomain = yourUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    for (const result of results) {
      if (result.link.includes(yourDomain)) {
        return result.position;
      }
    }
  }
  return null;
}
