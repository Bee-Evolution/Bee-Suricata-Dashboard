"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import type {
  Alert,
  AlertStats,
  AttackDistribution,
  TopIp,
} from "@/types/alerts";

export function useAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = getSupabaseClient();

      if (!supabase) {
        setError("Supabase not configured. Check your environment variables.");
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("security_alerts")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;
      setAlerts(data || []);
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch alerts";
      setError(message);
      console.error("Error fetching alerts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();

    const supabase = getSupabaseClient();
    if (!supabase) return;

    // Subscribe to real-time updates
    const subscription = supabase
      .channel("alerts_channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "security_alerts",
        },
        (payload) => {
          setAlerts((prev) => [payload.new as Alert, ...prev].slice(0, 50));
        },
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchAlerts]);

  return { alerts, loading, error, refetch: fetchAlerts };
}

export function useAlertStats() {
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const supabase = getSupabaseClient();

        if (!supabase) {
          setError("Supabase not configured");
          setLoading(false);
          return;
        }

        // Get total alerts
        const { count: totalAlerts } = await supabase
          .from("security_alerts")
          .select("*", { count: "exact", head: true });

        // Get critical alerts
        const { count: criticalAlerts } = await supabase
          .from("security_alerts")
          .select("*", { count: "exact", head: true })
          .eq("severity", "critical");

        // Get unique IPs
        const { data: uniqueIps } = await supabase
          .from("security_alerts")
          .select("src_ip");

        const uniqueIpSet = new Set((uniqueIps || []).map((a) => a.src_ip));

        // Get most common attack type
        const { data: allAlerts } = await supabase
          .from("security_alerts")
          .select("detection_type")
          .limit(1000);

        const typeCounts: Record<string, number> = {};
        (allAlerts || []).forEach((a) => {
          typeCounts[a.detection_type] =
            (typeCounts[a.detection_type] || 0) + 1;
        });

        const mostCommonAttack =
          Object.entries(typeCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
          null;

        // Get alerts in last 24h
        const oneDayAgo = new Date(
          Date.now() - 24 * 60 * 60 * 1000,
        ).toISOString();
        const { count: last24h } = await supabase
          .from("security_alerts")
          .select("*", { count: "exact", head: true })
          .gte("timestamp", oneDayAgo);

        setStats({
          total_alerts: totalAlerts || 0,
          critical_alerts: criticalAlerts || 0,
          unique_source_ips: uniqueIpSet.size,
          most_common_attack: mostCommonAttack as any,
          alerts_last_24h: last24h || 0,
          current_trend: "stable",
        });

        setError(null);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch stats";
        setError(message);
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}

export function useAttackDistribution() {
  const [distribution, setDistribution] = useState<AttackDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDistribution = async () => {
      try {
        setLoading(true);
        const supabase = getSupabaseClient();

        if (!supabase) {
          setError("Supabase not configured");
          setLoading(false);
          return;
        }

        const { data: allAlerts } = await supabase
          .from("security_alerts")
          .select("attack_type")
          .limit(1000);

        const typeCounts: Record<string, number> = {};
        (allAlerts || []).forEach((a) => {
          const attackType = a.attack_type || "Unknown";
          typeCounts[attackType] = (typeCounts[attackType] || 0) + 1;
        });

        const total = Object.values(typeCounts).reduce((a, b) => a + b, 0);
        const dist = Object.entries(typeCounts)
          .map(([type, count]) => ({
            type: type as any,
            count,
            percentage: (count / total) * 100,
          }))
          .sort((a, b) => b.count - a.count) // Sort by count descending
          .slice(0, 8); // Limit to top 8 attack types to avoid overcrowding

        setDistribution(dist);
        setError(null);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch distribution";
        setError(message);
        console.error("Error fetching distribution:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDistribution();
  }, []);

  return { distribution, loading, error };
}

export function useTopIps() {
  const [topIps, setTopIps] = useState<TopIp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopIps = async () => {
      try {
        setLoading(true);
        const supabase = getSupabaseClient();

        if (!supabase) {
          setError("Supabase not configured");
          setLoading(false);
          return;
        }

        const { data: allAlerts } = await supabase
          .from("security_alerts")
          .select("src_ip, severity, timestamp")
          .limit(1000);

        const ipMap: Record<
          string,
          { count: number; maxSeverity: string; lastSeen: string }
        > = {};

        (allAlerts || []).forEach((a) => {
          if (!ipMap[a.src_ip]) {
            ipMap[a.src_ip] = {
              count: 0,
              maxSeverity: "info",
              lastSeen: a.timestamp,
            };
          }
          ipMap[a.src_ip].count += 1;
          ipMap[a.src_ip].lastSeen = a.timestamp;
        });

        const topList = Object.entries(ipMap)
          .sort(([, a], [, b]) => b.count - a.count)
          .slice(0, 10)
          .map(([ip, data]) => ({
            ip,
            alert_count: data.count,
            severity: data.maxSeverity as any,
            last_seen: data.lastSeen,
          }));

        setTopIps(topList);
        setError(null);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch top IPs";
        setError(message);
        console.error("Error fetching top IPs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopIps();
  }, []);

  return { topIps, loading, error };
}
