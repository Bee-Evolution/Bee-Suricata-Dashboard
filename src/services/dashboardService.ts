/**
 * Dashboard Service
 * Provides real-time data from Supabase for the dashboard
 */

import { getSupabaseClient } from "@/lib/supabase";

export interface DashboardStats {
  total_alerts: number;
  critical_alerts: number;
  high_alerts: number;
  medium_alerts: number;
  low_alerts: number;
  unique_attackers: number;
  alerts_last_hour: number;
  alerts_last_24h: number;
  database_status: "connected" | "disconnected" | "error";
  last_updated: string;
}

export interface TimeSeriesData {
  time: string;
  count: number;
}

export interface AttackDistribution {
  type: string;
  count: number;
  percentage: number;
}

export interface TopAttacker {
  ip: string;
  alert_count: number;
  severity: string;
  last_seen: string;
  country?: string;
}

export interface RecentAlert {
  id: number;
  timestamp: string;
  severity: string;
  source_ip: string;
  destination_ip: string;
  attack_type: string;
  message: string;
  risk_score: number;
}

export interface SystemStatus {
  database_connected: boolean;
  api_status: "operational" | "degraded" | "down";
  uptime: string;
  version: string;
  last_health_check: string;
}

class DashboardService {
  private supabase = getSupabaseClient();

  async getDashboardStats(): Promise<DashboardStats> {
    if (!this.supabase) {
      return {
        total_alerts: 0,
        critical_alerts: 0,
        high_alerts: 0,
        medium_alerts: 0,
        low_alerts: 0,
        unique_attackers: 0,
        alerts_last_hour: 0,
        alerts_last_24h: 0,
        database_status: "disconnected",
        last_updated: new Date().toISOString(),
      };
    }

    try {
      // Get total alerts
      const { count: totalAlerts } = await this.supabase
        .from("security_alerts")
        .select("*", { count: "exact", head: true });

      // Get alerts by severity
      const [criticalRes, highRes, mediumRes, lowRes] = await Promise.all([
        this.supabase
          .from("security_alerts")
          .select("*", { count: "exact", head: true })
          .eq("severity", "critical"),
        this.supabase
          .from("security_alerts")
          .select("*", { count: "exact", head: true })
          .eq("severity", "high"),
        this.supabase
          .from("security_alerts")
          .select("*", { count: "exact", head: true })
          .eq("severity", "medium"),
        this.supabase
          .from("security_alerts")
          .select("*", { count: "exact", head: true })
          .eq("severity", "low"),
      ]);

      // Get unique attackers
      const { data: uniqueIps } = await this.supabase
        .from("security_alerts")
        .select("src_ip");

      const uniqueIpSet = new Set((uniqueIps || []).map((a) => a.src_ip));

      // Get alerts in last hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count: lastHour } = await this.supabase
        .from("security_alerts")
        .select("*", { count: "exact", head: true })
        .gte("timestamp", oneHourAgo);

      // Get alerts in last 24 hours
      const oneDayAgo = new Date(
        Date.now() - 24 * 60 * 60 * 1000,
      ).toISOString();
      const { count: last24h } = await this.supabase
        .from("security_alerts")
        .select("*", { count: "exact", head: true })
        .gte("timestamp", oneDayAgo);

      return {
        total_alerts: totalAlerts || 0,
        critical_alerts: criticalRes.count || 0,
        high_alerts: highRes.count || 0,
        medium_alerts: mediumRes.count || 0,
        low_alerts: lowRes.count || 0,
        unique_attackers: uniqueIpSet.size,
        alerts_last_hour: lastHour || 0,
        alerts_last_24h: last24h || 0,
        database_status: "connected",
        last_updated: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        total_alerts: 0,
        critical_alerts: 0,
        high_alerts: 0,
        medium_alerts: 0,
        low_alerts: 0,
        unique_attackers: 0,
        alerts_last_hour: 0,
        alerts_last_24h: 0,
        database_status: "error",
        last_updated: new Date().toISOString(),
      };
    }
  }

  async getTimeSeriesData(hours: number = 24): Promise<TimeSeriesData[]> {
    if (!this.supabase) return [];

    try {
      const startTime = new Date(
        Date.now() - hours * 60 * 60 * 1000,
      ).toISOString();

      const { data: alerts } = await this.supabase
        .from("security_alerts")
        .select("timestamp")
        .gte("timestamp", startTime)
        .order("timestamp", { ascending: true });

      if (!alerts) return [];

      // Group alerts by hour
      const hourlyData: Record<string, number> = {};
      const now = new Date();

      // Initialize all hours with 0
      for (let i = hours - 1; i >= 0; i--) {
        const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hourKey = `${hour.toISOString().slice(0, 13)}:00:00`;
        hourlyData[hourKey] = 0;
      }

      // Count alerts per hour
      alerts.forEach((alert) => {
        const alertHour = `${new Date(alert.timestamp).toISOString().slice(0, 13)}:00:00`;
        if (hourlyData[alertHour] !== undefined) {
          hourlyData[alertHour]++;
        }
      });

      // Convert to array format
      return Object.entries(hourlyData).map(([time, count]) => ({
        time: new Date(time).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        count,
      }));
    } catch (error) {
      console.error("Error fetching time series data:", error);
      return [];
    }
  }

  async getAttackDistribution(): Promise<AttackDistribution[]> {
    if (!this.supabase) return [];

    try {
      const { data: alerts } = await this.supabase
        .from("security_alerts")
        .select("attack_type")
        .limit(1000);

      if (!alerts) return [];

      const typeCounts: Record<string, number> = {};
      alerts.forEach((alert) => {
        const type = alert.attack_type || "Unknown";
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });

      const total = Object.values(typeCounts).reduce((a, b) => a + b, 0);

      return Object.entries(typeCounts)
        .map(([type, count]) => ({
          type,
          count,
          percentage: (count / total) * 100,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    } catch (error) {
      console.error("Error fetching attack distribution:", error);
      return [];
    }
  }

  async getTopAttackers(limit: number = 10): Promise<TopAttacker[]> {
    if (!this.supabase) return [];

    try {
      const { data: alerts } = await this.supabase
        .from("security_alerts")
        .select("src_ip, severity, timestamp, country")
        .limit(1000);

      if (!alerts) return [];

      const ipMap: Record<
        string,
        {
          count: number;
          maxSeverity: string;
          lastSeen: string;
          country?: string;
        }
      > = {};

      alerts.forEach((alert) => {
        if (!ipMap[alert.src_ip]) {
          ipMap[alert.src_ip] = {
            count: 0,
            maxSeverity: "info",
            lastSeen: alert.timestamp,
            country: alert.country,
          };
        }
        ipMap[alert.src_ip].count += 1;
        ipMap[alert.src_ip].lastSeen = alert.timestamp;

        // Update severity if higher
        const severityOrder = {
          critical: 4,
          high: 3,
          medium: 2,
          low: 1,
          info: 0,
        };
        if (
          severityOrder[alert.severity as keyof typeof severityOrder] >
          severityOrder[
            ipMap[alert.src_ip].maxSeverity as keyof typeof severityOrder
          ]
        ) {
          ipMap[alert.src_ip].maxSeverity = alert.severity;
        }
      });

      return Object.entries(ipMap)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, limit)
        .map(([ip, data]) => ({
          ip,
          alert_count: data.count,
          severity: data.maxSeverity,
          last_seen: data.lastSeen,
          country: data.country,
        }));
    } catch (error) {
      console.error("Error fetching top attackers:", error);
      return [];
    }
  }

  async getRecentAlerts(limit: number = 10): Promise<RecentAlert[]> {
    if (!this.supabase) return [];

    try {
      const { data: alerts } = await this.supabase
        .from("security_alerts")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(limit);

      if (!alerts) return [];

      return alerts.map((alert) => ({
        id: alert.id,
        timestamp: alert.timestamp,
        severity: alert.severity,
        source_ip: alert.src_ip,
        destination_ip: alert.dest_ip,
        attack_type: alert.attack_type,
        message: alert.message,
        risk_score: alert.risk_score || 0,
      }));
    } catch (error) {
      console.error("Error fetching recent alerts:", error);
      return [];
    }
  }

  async getSystemStatus(): Promise<SystemStatus> {
    if (!this.supabase) {
      return {
        database_connected: false,
        api_status: "down",
        uptime: "N/A",
        version: "2.0.0",
        last_health_check: new Date().toISOString(),
      };
    }

    try {
      // Test database connection
      const { data, error } = await this.supabase
        .from("security_alerts")
        .select("count")
        .limit(1);

      return {
        database_connected: !error,
        api_status: !error ? "operational" : "degraded",
        uptime: "99.9%",
        version: "2.0.0",
        last_health_check: new Date().toISOString(),
      };
    } catch (_error) {
      return {
        database_connected: false,
        api_status: "down",
        uptime: "N/A",
        version: "2.0.0",
        last_health_check: new Date().toISOString(),
      };
    }
  }

  // Real-time subscription methods
  subscribeToAlerts(callback: (alert: RecentAlert) => void) {
    if (!this.supabase) return null;

    return this.supabase
      .channel("dashboard_alerts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "security_alerts",
        },
        (payload) => {
          const alert = payload.new as any;
          callback({
            id: alert.id,
            timestamp: alert.timestamp,
            severity: alert.severity,
            source_ip: alert.source_ip,
            destination_ip: alert.destination_ip,
            attack_type: alert.attack_type,
            message: alert.message,
            risk_score: alert.risk_score || 0,
          });
        },
      )
      .subscribe();
  }

  subscribeToStats(callback: (stats: DashboardStats) => void) {
    if (!this.supabase) return null;

    return this.supabase
      .channel("dashboard_stats")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "security_alerts",
        },
        async () => {
          const stats = await this.getDashboardStats();
          callback(stats);
        },
      )
      .subscribe();
  }
}

export const dashboardService = new DashboardService();
