import React, { useMemo, useState } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Keyword } from '../types';
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react';

interface RankingChartProps {
  keywords: Keyword[];
}

type TimeRange = '1w' | '1m' | '3m' | '6m' | 'all';

interface ChartDataPoint {
  date: string;
  avgPosition: number;
  totalKeywords: number;
  trackedKeywords: number;
}

export default function RankingChart({ keywords }: RankingChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1m');

  // Aggregate keyword history data by date
  const chartData = useMemo(() => {
    const dateMap = new Map<string, { positions: number[]; total: number }>();

    keywords.forEach((keyword) => {
      keyword.history.forEach((entry) => {
        if (!dateMap.has(entry.date)) {
          dateMap.set(entry.date, { positions: [], total: keywords.length });
        }
        const dateData = dateMap.get(entry.date)!;
        dateData.positions.push(entry.position);
      });
    });

    // Convert to array and calculate averages
    const data: ChartDataPoint[] = Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        avgPosition: Math.round(
          (data.positions.reduce((sum, pos) => sum + pos, 0) / data.positions.length) * 10
        ) / 10,
        totalKeywords: data.total,
        trackedKeywords: data.positions.length,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return data;
  }, [keywords]);

  // Filter data by time range
  const filteredData = useMemo(() => {
    if (timeRange === 'all' || chartData.length === 0) return chartData;

    const now = new Date();
    let cutoffDate = new Date();

    switch (timeRange) {
      case '1w':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '1m':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
    }

    return chartData.filter((point) => new Date(point.date) >= cutoffDate);
  }, [chartData, timeRange]);

  // Calculate trend
  const trend = useMemo(() => {
    if (filteredData.length < 2) return { change: 0, percentage: 0, direction: 'neutral' };

    const first = filteredData[0].avgPosition;
    const last = filteredData[filteredData.length - 1].avgPosition;
    const change = first - last; // Positive means improvement (lower position is better)
    const percentage = first > 0 ? (change / first) * 100 : 0;

    return {
      change: Math.round(change * 10) / 10,
      percentage: Math.round(percentage * 10) / 10,
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
    };
  }, [filteredData]);

  // Get Y-axis domain (invert because lower position = better)
  const yDomain = useMemo(() => {
    if (filteredData.length === 0) return [0, 100];
    const positions = filteredData.map((d) => d.avgPosition);
    const min = Math.max(1, Math.floor(Math.min(...positions) - 2));
    const max = Math.ceil(Math.max(...positions) + 2);
    return [min, max];
  }, [filteredData]);

  // Format date for X-axis
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-xs text-gray-500 mb-1">
            {new Date(label).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
          <p className="text-lg font-bold text-gray-900">
            Avg. Position: <span className="text-emerald-600">{data.avgPosition}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {data.trackedKeywords} of {data.totalKeywords} keywords tracked
          </p>
        </div>
      );
    }
    return null;
  };

  const timeRangeOptions = [
    { value: '1w', label: '1 Week' },
    { value: '1m', label: '1 Month' },
    { value: '3m', label: '3 Months' },
    { value: '6m', label: '6 Months' },
    { value: 'all', label: 'All Time' },
  ];

  if (keywords.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <BarChart3 size={18} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Ranking History</h2>
              <p className="text-xs text-gray-500">Average position across all keywords</p>
            </div>
          </div>

          {/* Trend indicator */}
          {filteredData.length > 1 && (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                trend.direction === 'up'
                  ? 'bg-emerald-50 text-emerald-700'
                  : trend.direction === 'down'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-gray-50 text-gray-700'
              }`}
            >
              {trend.direction === 'up' ? (
                <TrendingUp size={16} />
              ) : trend.direction === 'down' ? (
                <TrendingDown size={16} />
              ) : (
                <BarChart3 size={16} />
              )}
              <span className="text-sm font-medium">
                {trend.direction === 'up' && `↑ ${Math.abs(trend.change)} positions improved`}
                {trend.direction === 'down' && `↓ ${Math.abs(trend.change)} positions declined`}
                {trend.direction === 'neutral' && 'No change'}
              </span>
            </div>
          )}
        </div>

        {/* Time range filters */}
        <div className="flex items-center gap-2 mt-4">
          {timeRangeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value as TimeRange)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                timeRange === option.value
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        {filteredData.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No ranking history available</p>
            <p className="text-sm text-gray-400 mt-1">
              Check rankings to start building your history chart
            </p>
          </div>
        ) : (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPosition" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  domain={yDomain}
                  reversed
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={{ stroke: '#e2e8f0' }}
                  label={{
                    value: 'Position',
                    angle: -90,
                    position: 'insideLeft',
                    style: { fontSize: 11, fill: '#94a3b8' },
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="avgPosition"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#colorPosition)"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Legend */}
        {filteredData.length > 0 && (
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full" />
              <span className="text-xs text-gray-600">Average Position</span>
            </div>
            <div className="text-xs text-gray-400">
              {filteredData.length} data points • {keywords.length} keywords
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
