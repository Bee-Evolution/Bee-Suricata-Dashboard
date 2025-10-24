/**
 * Alert type definitions for Matsekasuricata IDS
 * Covers: HTTP Basic Auth, FTP, POP3/IMAP, SSH brute-force, Telnet, SMB/NTLM
 */

export type AlertSeverity = "critical" | "high" | "medium" | "low" | "info";

export type DetectionType =
  | "http_basic_auth"
  | "http_form_auth"
  | "ftp_auth"
  | "pop3_auth"
  | "imap_auth"
  | "telnet_auth"
  | "ssh_bruteforce"
  | "smb_ntlm"
  | "port_scan"
  | "malware_signature"
  | "unknown";

export interface Alert {
  id: string;
  timestamp: string;
  source_ip: string;
  destination_ip: string;
  source_port: number;
  destination_port: number;
  protocol: string;
  detection_type: DetectionType;
  severity: AlertSeverity;
  message: string;
  payload_snippet?: string;
  protocol_info?: string;
  event_count?: number;
  is_acknowledged: boolean;
  created_at: string;
  updated_at: string;
}

export interface AlertStats {
  total_alerts: number;
  critical_alerts: number;
  unique_source_ips: number;
  most_common_attack: DetectionType | null;
  alerts_last_24h: number;
  current_trend: "increasing" | "stable" | "decreasing";
}

export interface AttackDistribution {
  type: DetectionType;
  count: number;
  percentage: number;
}

export interface TopIp {
  ip: string;
  alert_count: number;
  severity: AlertSeverity;
  last_seen: string;
}

export const DETECTION_TYPE_LABELS: Record<DetectionType, string> = {
  http_basic_auth: "HTTP Basic Auth",
  http_form_auth: "HTTP Form Auth",
  ftp_auth: "FTP Auth",
  pop3_auth: "POP3 Auth",
  imap_auth: "IMAP Auth",
  telnet_auth: "Telnet Auth",
  ssh_bruteforce: "SSH Brute-Force",
  smb_ntlm: "SMB/NTLM Auth",
  port_scan: "Port Scan",
  malware_signature: "Malware Signature",
  unknown: "Unknown",
};

export const SEVERITY_COLORS: Record<AlertSeverity, string> = {
  critical: "#F44336",
  high: "#FF6F00",
  medium: "#FFA726",
  low: "#FDD835",
  info: "#42A5F5",
};

export const SEVERITY_LABELS: Record<AlertSeverity, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
  info: "Info",
};

export const DETECTION_TYPE_SEVERITY: Record<DetectionType, AlertSeverity> = {
  http_basic_auth: "high",
  http_form_auth: "medium",
  ftp_auth: "high",
  pop3_auth: "high",
  imap_auth: "high",
  telnet_auth: "critical",
  ssh_bruteforce: "critical",
  smb_ntlm: "high",
  port_scan: "medium",
  malware_signature: "critical",
  unknown: "low",
};

export const DETECTION_TYPE_DESCRIPTIONS: Record<DetectionType, string> = {
  http_basic_auth:
    "Cleartext HTTP Basic Authentication detected in Authorization header",
  http_form_auth: "HTTP POST request with form authentication fields detected",
  ftp_auth: "Cleartext FTP authentication credentials detected",
  pop3_auth: "Plaintext POP3 email authentication attempt detected",
  imap_auth: "Plaintext IMAP email authentication attempt detected",
  telnet_auth: "Telnet cleartext authentication detected (highly insecure)",
  ssh_bruteforce: "SSH brute-force attack detected on port 22",
  smb_ntlm: "SMB/NTLM authentication attempt or pass-the-hash detected",
  port_scan: "Network port scanning activity detected",
  malware_signature: "Known malware signature matched",
  unknown: "Unknown or uncategorized alert",
};
