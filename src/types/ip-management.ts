export interface IPAddress {
  id: string;
  ip: string;
  type: "source" | "destination";
  country?: string;
  isBlocked: boolean;
  isWhitelisted: boolean;
  blockReason?: string;
  blockedAt?: string;
  blockedBy?: string;
  whitelistedAt?: string;
  whitelistedBy?: string;
  lastSeen: string;
  alertCount: number;
  riskScore: number;
}

export interface LoginAttempt {
  id: string;
  ip: string;
  username: string;
  timestamp: string;
  success: boolean;
  userAgent?: string;
  country?: string;
  attemptCount: number;
  isBlocked: boolean;
  blockType?: "temporary" | "permanent";
  blockedUntil?: string;
}

export interface IPBlockRequest {
  ip: string;
  reason: string;
  duration?: number; // in hours, 0 for permanent
  blockType: "temporary" | "permanent";
}

export interface IPWhitelistRequest {
  ip: string;
  reason: string;
}

export interface IPManagementStats {
  totalIPs: number;
  blockedIPs: number;
  whitelistedIPs: number;
  suspiciousIPs: number;
  recentLoginAttempts: number;
  failedAttempts: number;
  blockedAttempts: number;
}

export interface IPDetails {
  ip: string;
  country?: string;
  city?: string;
  isp?: string;
  organization?: string;
  timezone?: string;
  isBlocked: boolean;
  isWhitelisted: boolean;
  blockReason?: string;
  blockedAt?: string;
  lastSeen: string;
  alertCount: number;
  riskScore: number;
  loginAttempts: LoginAttempt[];
  recentAlerts: Array<{
    id: string;
    timestamp: string;
    severity: string;
    attackType: string;
    message: string;
  }>;
}

export const BLOCK_REASONS = [
  "Suspicious activity detected",
  "Multiple failed login attempts",
  "Known malicious IP",
  "Brute force attack",
  "DDoS attempt",
  "Malware communication",
  "Command and control server",
  "Phishing attempt",
  "Port scanning",
  "Other security threat",
] as const;

export const WHITELIST_REASONS = [
  "Trusted internal network",
  "Authorized service provider",
  "Legitimate business partner",
  "Security testing environment",
  "Monitoring system",
  "Backup service",
  "CDN provider",
  "Load balancer",
  "Other legitimate use",
] as const;
