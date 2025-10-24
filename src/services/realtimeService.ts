/**
 * Real-Time Monitor Service
 * Generates simulated real-time data for monitoring dashboard
 */

export interface RealtimeStats {
  totalAlerts: number;
  criticalAlerts: number;
  highAlerts: number;
  mediumAlerts: number;
  lowAlerts: number;
  acknowledgedAlerts: number;
  activeThreats: number;
  blockedIPs: number;
}

export interface ThreatActivity {
  timestamp: string;
  sourceIP: string;
  destinationIP: string;
  protocol: string;
  severity: "critical" | "high" | "medium" | "low";
  attackType: string;
  description: string;
  country: string;
  city: string;
  riskScore: number;
  isBlocked: boolean;
  isAcknowledged: boolean;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  networkTraffic: number;
  diskUsage: number;
  activeConnections: number;
  blockedConnections: number;
}

// Attack types for simulation
const ATTACK_TYPES = [
  "Port Scan",
  "DDoS Attack",
  "SQL Injection",
  "XSS Attack",
  "Brute Force",
  "Malware Detection",
  "Botnet Activity",
  "Data Exfiltration",
  "Ransomware",
  "Phishing Attempt",
  "Zero-day Exploit",
  "Insider Threat",
  "APT Attack",
  "Cryptocurrency Mining",
  "Command Injection",
  "Directory Traversal",
];

const PROTOCOLS = [
  "HTTP",
  "HTTPS",
  "SSH",
  "FTP",
  "SMTP",
  "DNS",
  "ICMP",
  "UDP",
  "TCP",
];

const COUNTRIES = [
  {
    name: "United States",
    cities: ["New York", "Los Angeles", "Chicago", "Houston"],
  },
  { name: "China", cities: ["Beijing", "Shanghai", "Guangzhou", "Shenzhen"] },
  {
    name: "Russia",
    cities: ["Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg"],
  },
  { name: "Germany", cities: ["Berlin", "Munich", "Hamburg", "Frankfurt"] },
  {
    name: "United Kingdom",
    cities: ["London", "Manchester", "Birmingham", "Glasgow"],
  },
  { name: "France", cities: ["Paris", "Lyon", "Marseille", "Toulouse"] },
  { name: "Japan", cities: ["Tokyo", "Osaka", "Kyoto", "Yokohama"] },
  { name: "South Korea", cities: ["Seoul", "Busan", "Incheon", "Daegu"] },
  {
    name: "Brazil",
    cities: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador"],
  },
  { name: "India", cities: ["Mumbai", "Delhi", "Bangalore", "Chennai"] },
];

const SEVERITY_WEIGHTS = {
  critical: 0.15,
  high: 0.25,
  medium: 0.35,
  low: 0.25,
};

// Generate random IP address
function generateRandomIP(): string {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

// Generate random timestamp within a date range
function generateTimestamp(startDate: Date, endDate: Date): string {
  const start = startDate.getTime();
  const end = endDate.getTime();
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime).toISOString();
}

// Get random severity based on weights
function getRandomSeverity(): "critical" | "high" | "medium" | "low" {
  const random = Math.random();
  let cumulative = 0;

  for (const [severity, weight] of Object.entries(SEVERITY_WEIGHTS)) {
    cumulative += weight;
    if (random <= cumulative) {
      return severity as "critical" | "high" | "medium" | "low";
    }
  }

  return "medium";
}

// Generate risk score based on severity
function generateRiskScore(severity: string): number {
  const baseScores = {
    critical: 85,
    high: 70,
    medium: 50,
    low: 25,
  };

  return (
    baseScores[severity as keyof typeof baseScores] +
    Math.floor(Math.random() * 15)
  );
}

// Generate threat activity for a specific date
export function generateThreatActivityForDate(
  date: Date,
  count: number = 50,
): ThreatActivity[] {
  const activities: ThreatActivity[] = [];
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  for (let i = 0; i < count; i++) {
    const severity = getRandomSeverity();
    const attackType =
      ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
    const protocol = PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)];
    const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
    const city =
      country.cities[Math.floor(Math.random() * country.cities.length)];

    activities.push({
      timestamp: generateTimestamp(startOfDay, endOfDay),
      sourceIP: generateRandomIP(),
      destinationIP: generateRandomIP(),
      protocol,
      severity,
      attackType,
      description: `Potential ${attackType} detected from suspicious source`,
      country: country.name,
      city,
      riskScore: generateRiskScore(severity),
      isBlocked: Math.random() < 0.3, // 30% chance of being blocked
      isAcknowledged: Math.random() < 0.2, // 20% chance of being acknowledged
    });
  }

  return activities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

// Generate system metrics
export function generateSystemMetrics(): SystemMetrics {
  return {
    cpuUsage: Math.floor(Math.random() * 40) + 20, // 20-60%
    memoryUsage: Math.floor(Math.random() * 30) + 40, // 40-70%
    networkTraffic: Math.floor(Math.random() * 1000) + 500, // 500-1500 MB/s
    diskUsage: Math.floor(Math.random() * 20) + 60, // 60-80%
    activeConnections: Math.floor(Math.random() * 500) + 1000, // 1000-1500
    blockedConnections: Math.floor(Math.random() * 50) + 10, // 10-60
  };
}

// Generate real-time stats from activities
export function generateRealtimeStats(
  activities: ThreatActivity[],
): RealtimeStats {
  const totalAlerts = activities.length;
  const criticalAlerts = activities.filter(
    (a) => a.severity === "critical",
  ).length;
  const highAlerts = activities.filter((a) => a.severity === "high").length;
  const mediumAlerts = activities.filter((a) => a.severity === "medium").length;
  const lowAlerts = activities.filter((a) => a.severity === "low").length;
  const acknowledgedAlerts = activities.filter((a) => a.isAcknowledged).length;
  const activeThreats = activities.filter(
    (a) => !a.isAcknowledged && !a.isBlocked,
  ).length;
  const blockedIPs = new Set(
    activities.filter((a) => a.isBlocked).map((a) => a.sourceIP),
  ).size;

  return {
    totalAlerts,
    criticalAlerts,
    highAlerts,
    mediumAlerts,
    lowAlerts,
    acknowledgedAlerts,
    activeThreats,
    blockedIPs,
  };
}

// Generate data for multiple days (today + future days)
export function generateMultiDayData(days: number = 7): {
  [date: string]: ThreatActivity[];
} {
  const data: { [date: string]: ThreatActivity[] } = {};
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateKey = date.toISOString().split("T")[0];

    // Generate more activities for "today" and fewer for future days
    const activityCount = i === 0 ? 100 : Math.floor(Math.random() * 30) + 20;
    data[dateKey] = generateThreatActivityForDate(date, activityCount);
  }

  return data;
}

// Simulate real-time updates by adding new activities
export function simulateRealtimeUpdate(
  existingActivities: ThreatActivity[],
): ThreatActivity[] {
  const now = new Date();
  const newActivity: ThreatActivity = {
    timestamp: now.toISOString(),
    sourceIP: generateRandomIP(),
    destinationIP: generateRandomIP(),
    protocol: PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)],
    severity: getRandomSeverity(),
    attackType: ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)],
    description: `Real-time ${ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)]} detected`,
    country: COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)].name,
    city: COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)].cities[
      Math.floor(Math.random() * 4)
    ],
    riskScore: generateRiskScore(getRandomSeverity()),
    isBlocked: Math.random() < 0.3,
    isAcknowledged: false,
  };

  return [newActivity, ...existingActivities.slice(0, 99)]; // Keep only latest 100
}

// Get current date string
export function getCurrentDateString(): string {
  return new Date().toISOString().split("T")[0];
}

// Get future date string (days from now)
export function getFutureDateString(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split("T")[0];
}
