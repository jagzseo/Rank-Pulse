import React from 'react';
import { Keyword } from '../types';
import { detectIssues, CannibalizationIssue } from '../utils/issueDetector';
import { AlertTriangle, AlertCircle, Info, ExternalLink, Shield } from 'lucide-react';

interface AlertsSectionProps {
  keywords: Keyword[];
  projectUrl: string;
}

export default function AlertsSection({ keywords, projectUrl }: AlertsSectionProps) {
  const issues = detectIssues(keywords, projectUrl);

  if (issues.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <Shield size={18} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">SEO Health Alerts</h2>
            <p className="text-xs text-gray-500">No issues detected</p>
          </div>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-800">All Clear!</p>
            <p className="text-xs text-emerald-600">
              No keyword cannibalization or URL consistency issues detected.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const criticalIssues = issues.filter((i) => i.severity === 'critical');
  const warningIssues = issues.filter((i) => i.severity === 'warning');

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-lg">
              <AlertTriangle size={18} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">SEO Health Alerts</h2>
              <p className="text-xs text-gray-500">
                {issues.length} issue{issues.length !== 1 ? 's' : ''} detected
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {criticalIssues.length > 0 && (
              <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                <AlertCircle size={12} />
                {criticalIssues.length} Critical
              </span>
            )}
            {warningIssues.length > 0 && (
              <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                <AlertTriangle size={12} />
                {warningIssues.length} Warning{warningIssues.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-3">
        {issues.map((issue, index) => (
          <AlertCard key={index} issue={issue} />
        ))}
      </div>
    </div>
  );
}

function AlertCard({ issue }: { issue: CannibalizationIssue }) {
  const getIcon = () => {
    switch (issue.severity) {
      case 'critical':
        return <AlertCircle size={20} className="text-red-600" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-amber-600" />;
      default:
        return <Info size={20} className="text-blue-600" />;
    }
  };

  const getBgColor = () => {
    switch (issue.severity) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getTypeLabel = () => {
    switch (issue.type) {
      case 'cannibalization':
        return 'Cannibalization';
      case 'www-inconsistency':
        return 'WWW Inconsistency';
      case 'protocol-inconsistency':
        return 'Protocol Issue';
      default:
        return 'Issue';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getBgColor()}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-gray-900">{issue.message}</h3>
            <span className="text-xs bg-white/80 text-gray-600 px-2 py-0.5 rounded-full font-medium">
              {getTypeLabel()}
            </span>
          </div>
          <p className="text-xs text-gray-700 mb-2">{issue.details}</p>
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-600">Affected URLs:</p>
            {issue.urls.map((url, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <ExternalLink size={10} className="text-gray-400 flex-shrink-0" />
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 truncate"
                >
                  {url}
                </a>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Detected: {new Date(issue.date).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
