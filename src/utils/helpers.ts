import { theme } from "../theme/theme";
import type { SeverityLevel, TimeRange } from "../types";

export const getSeverityColor = (severity: SeverityLevel): string => {
  const colorMap: Record<SeverityLevel, string> = {
    critical: theme.colors.critical,
    high: theme.colors.high,
    medium: theme.colors.medium,
    low: theme.colors.low,
  };
  return colorMap[severity] || theme.colors.medium;
};

export const getSeverityEmoji = (severity: SeverityLevel): string => {
  const emojiMap: Record<SeverityLevel, string> = {
    critical: "🔴",
    high: "🟠",
    medium: "🟡",
    low: "🟢",
  };
  return emojiMap[severity] || "🟡";
};

export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
};

export const formatFullTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getTimeRangeInHours = (timeRange: TimeRange): number => {
  const rangeMap: Record<TimeRange, number> = {
    hour: 1,
    "6hours": 6,
    "24hours": 24,
    "7days": 168,
    "30days": 720,
  };
  return rangeMap[timeRange] || 24;
};

export const getTimeRangeLabel = (timeRange: TimeRange): string => {
  const labelMap: Record<TimeRange, string> = {
    hour: "Last Hour",
    "6hours": "Last 6 Hours",
    "24hours": "Last 24 Hours",
    "7days": "Last 7 Days",
    "30days": "Last 30 Days",
  };
  return labelMap[timeRange] || "Last 24 Hours";
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const maskIpAddress = (ip: string): string => {
  const parts = ip.split(".");
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.*.***`;
  }
  return ip;
};

export const calculateRiskScore = (alerts: any[]): number => {
  if (!alerts.length) return 0;

  const severityWeights = {
    critical: 10,
    high: 7,
    medium: 4,
    low: 1,
  };

  const totalScore = alerts.reduce((sum, alert) => {
    return sum + (severityWeights[alert.severity as SeverityLevel] || 0);
  }, 0);

  const maxScore = alerts.length * 10;
  return Math.round((totalScore / maxScore) * 100);
};

export const getRiskLevel = (score: number): string => {
  if (score >= 80) return "Critical";
  if (score >= 60) return "High";
  if (score >= 40) return "Medium";
  if (score >= 20) return "Low";
  return "Minimal";
};
