// Type definitions for Matseka Suricata application

export type SeverityLevel = "critical" | "high" | "medium" | "low";

export type ProtocolType =
  | "HTTP"
  | "FTP"
  | "SSH"
  | "POP3"
  | "IMAP"
  | "Telnet"
  | "SMB"
  | "NTLM";

export interface Alert {
  id: number;
  timestamp: string;
  severity: SeverityLevel;
  source_ip: string;
  destination_ip: string;
  source_port: number;
  destination_port: number;
  protocol: ProtocolType;
  attack_type: string;
  message: string;
  payload?: string;
  signature_id: number;
  classification?: string;
  priority?: number;
  country?: string;
  risk_score?: number;
  created_at: string;
}

export interface AlertFilters {
  severity?: SeverityLevel[];
  protocols?: ProtocolType[];
  timeRange?: TimeRange;
  sourceIp?: string;
  searchQuery?: string;
}

export type TimeRange = "hour" | "6hours" | "24hours" | "7days" | "30days";

export interface DashboardStats {
  totalAlerts: number;
  uniqueAttackers: number;
  criticalAlerts: number;
  averageAlertsPerHour: number;
  lastAlertTime?: string;
}

export interface ProtocolStats {
  protocol: ProtocolType;
  count: number;
  criticalCount: number;
  uniqueIps: number;
}

export interface TimeSeriesData {
  timestamp: string;
  count: number;
  severity?: SeverityLevel;
}

export interface SeverityDistribution {
  severity: SeverityLevel;
  count: number;
  percentage: number;
}

export interface DatabaseConfig {
  url?: string;
  connected: boolean;
  stats?: {
    totalAlerts: number;
    oldestAlert?: string;
    newestAlert?: string;
    databaseSize?: string;
  };
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
}
