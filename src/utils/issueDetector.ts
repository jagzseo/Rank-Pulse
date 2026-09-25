import { Keyword, SerpResult } from '../types';
import { extractDomain } from '../services/serpApi';

export interface CannibalizationIssue {
  type: 'cannibalization' | 'www-inconsistency' | 'protocol-inconsistency';
  keyword: string;
  keywordId: string;
  severity: 'warning' | 'critical';
  message: string;
  details: string;
  urls: string[];
  date: string;
}

export function detectIssues(keywords: Keyword[], projectUrl: string): CannibalizationIssue[] {
  const issues: CannibalizationIssue[] = [];

  keywords.forEach((keyword) => {
    if (!keyword.serpResults || keyword.serpResults.length === 0) return;

    // Check for keyword cannibalization
    const cannibalizationIssues = detectCannibalization(keyword, projectUrl);
    issues.push(...cannibalizationIssues);

    // Check for URL version inconsistencies over time
    const versionIssues = detectVersionInconsistencies(keyword, projectUrl);
    issues.push(...versionIssues);

    // Check for protocol inconsistencies
    const protocolIssues = detectProtocolInconsistencies(keyword, projectUrl);
    issues.push(...protocolIssues);
  });

  return issues;
}

function detectCannibalization(keyword: Keyword, projectUrl: string): CannibalizationIssue[] {
  const issues: CannibalizationIssue[] = [];

  if (!keyword.serpResults || keyword.serpResults.length === 0) return issues;

  try {
    const projectDomain = extractDomain(projectUrl);

    // Find all results from the same domain
    const domainResults = keyword.serpResults.filter((result) => {
      const resultDomain = extractDomain(result.link);
      return resultDomain === projectDomain;
    });

    // If multiple URLs from same domain rank, it's cannibalization
    if (domainResults.length > 1) {
      const urls = domainResults.map((r) => r.link);
      const positions = domainResults.map((r) => `#${r.position}`).join(', ');

      issues.push({
        type: 'cannibalization',
        keyword: keyword.text,
        keywordId: keyword.id,
        severity: 'warning',
        message: 'Keyword Cannibalization Detected',
        details: `Multiple URLs from your domain are ranking for "${keyword.text}" at positions ${positions}. This can split ranking signals and hurt your SEO performance. Consider consolidating content or using canonical tags.`,
        urls,
        date: keyword.lastChecked || new Date().toISOString().split('T')[0],
      });
    }
  } catch (error) {
    console.error('Error detecting cannibalization:', error);
  }

  return issues;
}

function detectVersionInconsistencies(keyword: Keyword, projectUrl: string): CannibalizationIssue[] {
  const issues: CannibalizationIssue[] = [];

  if (!keyword.history || keyword.history.length < 2) return issues;

  try {
    const projectDomain = extractDomain(projectUrl);
    const hasWww = projectDomain.startsWith('www.');
    const domainWithoutWww = projectDomain.replace(/^www\./, '');

    // Check if the keyword's position history shows URL version changes
    // We'll look at the SERP results over time
    const recentChecks = keyword.history.slice(-5); // Last 5 checks

    if (recentChecks.length < 2) return issues;

    // For now, we'll check if the current SERP results show mixed www/non-www
    if (keyword.serpResults && keyword.serpResults.length > 0) {
      const yourResults = keyword.serpResults.filter((r) => {
        const domain = extractDomain(r.link);
        return domain === projectDomain || domain === domainWithoutWww;
      });

      const hasWwwVersion = yourResults.some((r) => r.link.includes('://www.'));
      const hasNonWwwVersion = yourResults.some((r) => !r.link.includes('://www.') && r.link.includes('://'));

      if (hasWwwVersion && hasNonWwwVersion) {
        const urls = yourResults.map((r) => r.link);
        issues.push({
          type: 'www-inconsistency',
          keyword: keyword.text,
          keywordId: keyword.id,
          severity: 'warning',
          message: 'WWW Version Inconsistency',
          details: `Your website is ranking with both www and non-www versions for "${keyword.text}". This can cause duplicate content issues. Ensure proper redirects and canonical tags are in place.`,
          urls,
          date: keyword.lastChecked || new Date().toISOString().split('T')[0],
        });
      }
    }
  } catch (error) {
    console.error('Error detecting version inconsistencies:', error);
  }

  return issues;
}

function detectProtocolInconsistencies(keyword: Keyword, projectUrl: string): CannibalizationIssue[] {
  const issues: CannibalizationIssue[] = [];

  try {
    const projectDomain = extractDomain(projectUrl);
    const expectedProtocol = projectUrl.startsWith('https') ? 'https' : 'http';

    if (keyword.serpResults && keyword.serpResults.length > 0) {
      const yourResults = keyword.serpResults.filter((r) => {
        const domain = extractDomain(r.link);
        return domain === projectDomain;
      });

      const hasHttps = yourResults.some((r) => r.link.startsWith('https://'));
      const hasHttp = yourResults.some((r) => r.link.startsWith('http://') && !r.link.startsWith('https://'));

      // If both protocols are present, or if we see http when expecting https
      if ((hasHttps && hasHttp) || (expectedProtocol === 'https' && hasHttp)) {
        const urls = yourResults.map((r) => r.link);
        issues.push({
          type: 'protocol-inconsistency',
          keyword: keyword.text,
          keywordId: keyword.id,
          severity: 'critical',
          message: 'HTTP/HTTPS Protocol Inconsistency',
          details: `Your website is ranking with mixed HTTP and HTTPS protocols for "${keyword.text}". This is a security and SEO issue. Ensure all pages redirect to HTTPS and update internal links.`,
          urls,
          date: keyword.lastChecked || new Date().toISOString().split('T')[0],
        });
      }
    }
  } catch (error) {
    console.error('Error detecting protocol inconsistencies:', error);
  }

  return issues;
}
