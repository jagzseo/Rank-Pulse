import React from 'react';
import { getCreditUsage, getCacheSize, clearSerpCache } from '../services/serpApi';
import { Zap, Database, Trash2, Info } from 'lucide-react';

export default function CreditUsageBar() {
  const [usage, setUsage] = React.useState(getCreditUsage());
  const [cacheSize, setCacheSize] = React.useState(getCacheSize());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setUsage(getCreditUsage());
      setCacheSize(getCacheSize());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleClearCache = () => {
    clearSerpCache();
    setCacheSize(0);
  };

  const totalSaved = usage.savedRequests;
  const efficiency = usage.totalRequests > 0
    ? Math.round((totalSaved / (usage.totalRequests + totalSaved)) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="bg-violet-100 p-1.5 rounded-lg">
              <Zap size={14} className="text-violet-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">API Calls Today</p>
              <p className="text-sm font-bold text-gray-900">{usage.totalRequests}</p>
            </div>
          </div>

          <div className="w-px h-8 bg-gray-200" />

          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 p-1.5 rounded-lg">
              <Database size={14} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Credits Saved</p>
              <p className="text-sm font-bold text-emerald-700">
                {totalSaved}
                {efficiency > 0 && (
                  <span className="text-xs font-normal text-emerald-500 ml-1">
                    ({efficiency}% efficiency)
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="w-px h-8 bg-gray-200" />

          <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-1.5 rounded-lg">
              <Info size={14} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">SERP Cache</p>
              <p className="text-sm font-bold text-blue-700">{cacheSize} entries</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearCache}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
            title="Clear SERP cache"
          >
            <Trash2 size={12} />
            Clear Cache
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          💡 <span className="font-medium text-gray-500">Credit-saving tips:</span>{' '}
          Use <span className="font-medium text-emerald-600">Smart Check</span> to skip recently checked keywords • 
          SERP results are cached for 1 hour • 
          Results per query are optimized based on keyword history
        </p>
      </div>
    </div>
  );
}
