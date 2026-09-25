import React, { useState, useEffect } from 'react';
import {
  Key,
  Bell,
  Clock,
  Globe,
  Save,
  CheckCircle2,
  Shield,
  Zap,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import { getApiConfig, saveApiConfig, getProviderDefaults } from '../services/serpApi';
import { ApiProvider } from '../types';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [provider, setProvider] = useState<ApiProvider>('scrapingdog');
  const [checkFrequency, setCheckFrequency] = useState('daily');
  const [notifications, setNotifications] = useState(true);
  const [emailNotify, setEmailNotify] = useState('');
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    const config = getApiConfig();
    setApiKey(config.apiKey);
    setEndpoint(config.endpoint);
    setProvider(config.provider);
  }, []);

  const handleProviderChange = (newProvider: ApiProvider) => {
    setProvider(newProvider);
    const defaults = getProviderDefaults(newProvider);
    if (newProvider !== 'custom') {
      setApiKey(defaults.apiKey);
      setEndpoint(defaults.endpoint);
    }
  };

  const handleSave = () => {
    saveApiConfig(apiKey, endpoint, provider);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      let testUrl = '';
      
      if (provider === 'scrapingdog') {
        const params = new URLSearchParams({
          api_key: apiKey,
          query: 'test',
          results: '1',
          country: 'us',
          page: '0',
        });
        testUrl = `${endpoint}?${params.toString()}`;
      } else if (provider === 'serpapi') {
        const params = new URLSearchParams({
          engine: 'google',
          q: 'test',
          api_key: apiKey,
          num: '1',
        });
        testUrl = `${endpoint}?${params.toString()}`;
      } else {
        const params = new URLSearchParams({
          api_key: apiKey,
          query: 'test',
          results: '1',
        });
        testUrl = `${endpoint}?${params.toString()}`;
      }

      const response = await fetch(testUrl);

      if (response.ok) {
        const data = await response.json();
        if (data.organic_results || data.local_results) {
          setTestResult({
            success: true,
            message: `Connection successful! API returned ${data.organic_results?.length || 0} organic results.`,
          });
        } else {
          setTestResult({
            success: true,
            message: 'Connection successful! API is responding correctly.',
          });
        }
      } else if (response.status === 401 || response.status === 403) {
        setTestResult({
          success: false,
          message: 'Invalid API key. Please check your key.',
        });
      } else if (response.status === 429) {
        setTestResult({
          success: false,
          message: 'Rate limit exceeded. Your key works but you have used all available searches.',
        });
      } else {
        setTestResult({
          success: false,
          message: `API returned status ${response.status}: ${response.statusText}`,
        });
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        message: `Connection failed: ${error.message}`,
      });
    }

    setTesting(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure your rank tracker API and preferences
        </p>
      </div>

      {/* API Configuration */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="bg-violet-100 p-2 rounded-lg">
            <Key size={18} className="text-violet-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">API Configuration</h2>
            <p className="text-xs text-gray-500">Select your SERP API provider</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Provider
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => handleProviderChange('scrapingdog')}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  provider === 'scrapingdog'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🐕</span>
                  <span className={`text-sm font-semibold ${provider === 'scrapingdog' ? 'text-emerald-700' : 'text-gray-700'}`}>
                    Scrapingdog
                  </span>
                </div>
                <p className="text-xs text-gray-500">Fast & reliable Google scraping</p>
              </button>

              <button
                onClick={() => handleProviderChange('serpapi')}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  provider === 'serpapi'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🔍</span>
                  <span className={`text-sm font-semibold ${provider === 'serpapi' ? 'text-emerald-700' : 'text-gray-700'}`}>
                    SerpAPI
                  </span>
                </div>
                <p className="text-xs text-gray-500">Multi-engine support</p>
              </button>

              <button
                onClick={() => handleProviderChange('custom')}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  provider === 'custom'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">⚙️</span>
                  <span className={`text-sm font-semibold ${provider === 'custom' ? 'text-emerald-700' : 'text-gray-700'}`}>
                    Custom API
                  </span>
                </div>
                <p className="text-xs text-gray-500">Your own endpoint</p>
              </button>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle2 size={18} className="text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm text-emerald-800 font-medium">
                {provider === 'scrapingdog' && 'Scrapingdog API Configured'}
                {provider === 'serpapi' && 'SerpAPI Configured'}
                {provider === 'custom' && 'Custom API Configured'}
              </p>
              <p className="text-xs text-emerald-600 mt-0.5">
                Your API credentials are ready to use.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              API Endpoint
            </label>
            <input
              type="url"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
              placeholder="https://api.provider.com/search"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              API Key
            </label>
            <div className="relative">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono pr-20"
                placeholder="Your API key"
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input[type="password"]') as HTMLInputElement;
                  if (input) {
                    input.type = input.type === 'password' ? 'text' : 'password';
                  }
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
              >
                Show/Hide
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleTestConnection}
              disabled={testing || !apiKey}
              className="flex items-center gap-2 px-4 py-2.5 bg-violet-50 text-violet-700 border border-violet-200 rounded-lg text-sm font-medium hover:bg-violet-100 transition-colors disabled:opacity-50"
            >
              {testing ? <Zap size={16} className="animate-pulse" /> : <Zap size={16} />}
              {testing ? 'Testing...' : 'Test Connection'}
            </button>
            {provider === 'scrapingdog' && (
              <a
                href="https://www.scrapingdog.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
              >
                <ExternalLink size={12} />
                Manage API Key
              </a>
            )}
            {provider === 'serpapi' && (
              <a
                href="https://serpapi.com/manage-api-key"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
              >
                <ExternalLink size={12} />
                Manage API Key
              </a>
            )}
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-lg border flex items-start gap-2 ${
                testResult.success ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle size={16} className="text-red-600 mt-0.5 shrink-0" />
              )}
              <p className={`text-sm ${testResult.success ? 'text-emerald-700' : 'text-red-700'}`}>
                {testResult.message}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Check Frequency */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-lg">
            <Clock size={18} className="text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Check Frequency</h2>
            <p className="text-xs text-gray-500">How often should we check rankings</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: 'hourly', label: 'Hourly', desc: 'Every hour' },
              { value: 'daily', label: 'Daily', desc: 'Once per day' },
              { value: 'weekly', label: 'Weekly', desc: 'Once per week' },
              { value: 'manual', label: 'Manual', desc: 'On demand only' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setCheckFrequency(option.value)}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  checkFrequency === option.value
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className={`text-sm font-medium ${checkFrequency === option.value ? 'text-emerald-700' : 'text-gray-700'}`}>
                  {option.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{option.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-gray-400" />
          <span className="text-sm text-gray-500">Settings are saved locally in your browser</span>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"
        >
          {saved ? (
            <>
              <CheckCircle2 size={16} />
              Saved!
            </>
          ) : (
            <>
              <Save size={16} />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}
