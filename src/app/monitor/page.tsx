"use client";

import {
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Timeline as TimelineIcon,
} from "@mui/icons-material";
import {
  Box,
  Chip,
  Container,
  Grid,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
// Import our custom components
import RealtimeChart from "@/components/charts/RealtimeChart";
import Layout from "@/components/layout";
import ThreatActivityFeed from "@/components/monitor/ThreatActivityFeed";
import { getSupabaseClient } from "@/lib/supabase";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`monitor-tabpanel-${index}`}
      aria-labelledby={`monitor-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

interface RealtimeAlert {
  id: number;
  timestamp: string;
  severity: string;
  // Database columns (from Supabase)
  src_ip?: string;
  dest_ip?: string;
  src_port?: number;
  dest_port?: number;
  // Frontend mapped columns (for compatibility)
  source_ip?: string;
  destination_ip?: string;
  source_port?: number;
  destination_port?: number;
  protocol?: string;
  attack_type?: string;
  detection_type?: string;
  message?: string;
  payload?: string;
  risk_score?: number;
  is_acknowledged?: boolean;
  is_blocked?: boolean;
  country?: string;
  city?: string;
  classification?: string;
}

interface RealtimeStats {
  total_alerts: number;
  severity_breakdown: { [key: string]: number };
  top_source_ips: [string, number][];
  top_attack_types: [string, number][];
  time_range_hours: number;
}

export default function RealtimeMonitor() {
  const [currentTab, setCurrentTab] = useState(0);
  const [isLive, setIsLive] = useState(true);
  const [_selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [currentActivities, setCurrentActivities] = useState<RealtimeAlert[]>(
    [],
  );
  const [realtimeStats, setRealtimeStats] = useState<RealtimeStats>({
    total_alerts: 0,
    severity_breakdown: {},
    top_source_ips: [],
    top_attack_types: [],
    time_range_hours: 24,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real-time data from Supabase directly
  const fetchRealtimeData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = getSupabaseClient();
      if (!supabase) {
        setError("Supabase client not available");
        setLoading(false);
        return;
      }

      // Fetch recent alerts (last 24 hours) using Supabase directly
      const twentyFourHoursAgo = new Date(
        Date.now() - 24 * 60 * 60 * 1000,
      ).toISOString();

      const { data: alerts, error: alertsError } = await supabase
        .from("security_alerts")
        .select("*")
        .gte("timestamp", twentyFourHoursAgo)
        .order("timestamp", { ascending: false })
        .limit(100);

      if (alertsError) {
        console.error("Error fetching alerts:", alertsError);
        setError("Failed to load alerts from database");
        setLoading(false);
        return;
      }

      if (!alerts || alerts.length === 0) {
        console.warn("No alerts returned from Supabase");
        setCurrentActivities([]);
        setRealtimeStats({
          total_alerts: 0,
          severity_breakdown: {},
          top_source_ips: [],
          top_attack_types: [],
          time_range_hours: 24,
        });
        setLoading(false);
        return;
      }

      setCurrentActivities(alerts as any);

      // Calculate stats from the alerts
      const severityBreakdown: { [key: string]: number } = {};
      const sourceIpCounts: { [key: string]: number } = {};
      const attackTypeCounts: { [key: string]: number } = {};

      alerts.forEach((alert: any) => {
        // Count by severity
        const severity = alert.severity.toLowerCase();
        severityBreakdown[severity] = (severityBreakdown[severity] || 0) + 1;

        // Count by source IP
        if (alert.src_ip) {
          sourceIpCounts[alert.src_ip] =
            (sourceIpCounts[alert.src_ip] || 0) + 1;
        }

        // Count by attack type
        if (alert.detection_type) {
          attackTypeCounts[alert.detection_type] =
            (attackTypeCounts[alert.detection_type] || 0) + 1;
        }
      });

      // Convert counts to sorted arrays
      const topSourceIps = Object.entries(sourceIpCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10) as [string, number][];

      const topAttackTypes = Object.entries(attackTypeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10) as [string, number][];

      setRealtimeStats({
        total_alerts: alerts.length,
        severity_breakdown: severityBreakdown,
        top_source_ips: topSourceIps,
        top_attack_types: topAttackTypes,
        time_range_hours: 24,
      });
    } catch (err) {
      console.error("Error fetching real-time data:", err);
      setError("Failed to load real-time data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchRealtimeData();
  }, [fetchRealtimeData]);

  // Real-time updates
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      fetchRealtimeData();
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [isLive, fetchRealtimeData]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const _handleDateChange = (event: any) => {
    const newDate = event.target.value;
    setSelectedDate(newDate);
    // Note: Date filtering would need to be implemented in the backend
    // For now, we'll just update the selected date
  };

  const handleRefresh = () => {
    fetchRealtimeData();
  };

  // Generate chart data for the last hour
  const generateChartData = useCallback(() => {
    const now = new Date();
    const data = [];

    for (let i = 59; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60000); // Every minute
      const alertsInMinute = currentActivities.filter((activity) => {
        const activityTime = new Date(activity.timestamp);
        return (
          activityTime >= time &&
          activityTime < new Date(time.getTime() + 60000)
        );
      }).length;

      data.push({
        time: time.toISOString(),
        value: alertsInMinute,
        timestamp: time.toISOString(),
      });
    }

    return data;
  }, [currentActivities]);

  // Calculate stats from real data
  const calculatedStats = {
    totalAlerts: realtimeStats.total_alerts,
    criticalAlerts: realtimeStats.severity_breakdown.critical || 0,
    highAlerts: realtimeStats.severity_breakdown.high || 0,
    mediumAlerts: realtimeStats.severity_breakdown.medium || 0,
    lowAlerts: realtimeStats.severity_breakdown.low || 0,
    acknowledgedAlerts: currentActivities.filter((a) => a.is_acknowledged)
      .length,
    activeThreats: currentActivities.filter(
      (a) => !a.is_acknowledged && !a.is_blocked,
    ).length,
    blockedIPs: new Set(
      currentActivities.filter((a) => a.is_blocked).map((a) => a.source_ip),
    ).size,
  };

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography
              variant="h3"
              sx={{ fontWeight: 700, color: "#FFD600", mb: 1 }}
            >
              Real-time Monitor
            </Typography>
            <Typography variant="body1" sx={{ color: "#B0B0B0" }}>
              Live threat detection and system monitoring dashboard
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {loading && (
              <Chip
                label="🔄 Loading..."
                sx={{
                  backgroundColor: "#FFD600",
                  color: "#000",
                  fontWeight: "bold",
                }}
              />
            )}

            {error && (
              <Chip
                label="❌ Error"
                sx={{
                  backgroundColor: "#FF6B6B",
                  color: "#FFF",
                  fontWeight: "bold",
                }}
              />
            )}

            <Chip
              label={isLive ? "🟢 LIVE" : "⚪ PAUSED"}
              onClick={() => setIsLive(!isLive)}
              sx={{
                backgroundColor: isLive ? "#4CAF50" : "#666",
                color: "#FFF",
                fontWeight: "bold",
                cursor: "pointer",
                animation: isLive ? "pulse 2s infinite" : "none",
              }}
            />

            <IconButton
              onClick={handleRefresh}
              disabled={loading}
              sx={{
                color: "#FFD600",
                "&:hover": { backgroundColor: "rgba(255, 214, 0, 0.1)" },
                "&:disabled": { color: "#666" },
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Real-time Statistics */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            {
              label: "Total Alerts",
              value: calculatedStats.totalAlerts,
              color: "#FFD600",
              icon: <SecurityIcon />,
            },
            {
              label: "Critical",
              value: calculatedStats.criticalAlerts,
              color: "#FF6B6B",
              icon: <SecurityIcon />,
            },
            {
              label: "High",
              value: calculatedStats.highAlerts,
              color: "#FF8C42",
              icon: <SecurityIcon />,
            },
            {
              label: "Active Threats",
              value: calculatedStats.activeThreats,
              color: "#F44336",
              icon: <SecurityIcon />,
            },
            {
              label: "Blocked IPs",
              value: calculatedStats.blockedIPs,
              color: "#9C27B0",
              icon: <SecurityIcon />,
            },
            {
              label: "Acknowledged",
              value: calculatedStats.acknowledgedAlerts,
              color: "#4CAF50",
              icon: <SecurityIcon />,
            },
          ].map((item) => (
            <Grid item xs={12} sm={6} md={2} key={item.label}>
              <Paper
                sx={{
                  p: 2,
                  backgroundColor: "#1A1A1A",
                  border: "2px solid #2B2B2B",
                  borderRadius: 2,
                  textAlign: "center",
                }}
              >
                <Box sx={{ color: item.color, mb: 1 }}>{item.icon}</Box>
                <Typography variant="body2" sx={{ color: "#B0B0B0", mb: 1 }}>
                  {item.label}
                </Typography>
                <Typography
                  variant="h5"
                  sx={{ color: item.color, fontWeight: 700 }}
                >
                  {item.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Tabs */}
        <Paper
          sx={{
            backgroundColor: "#1A1A1A",
            border: "2px solid #2B2B2B",
            borderRadius: 2,
          }}
        >
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            sx={{
              borderBottom: "1px solid #2B2B2B",
              "& .MuiTab-root": {
                color: "#B0B0B0",
                "&.Mui-selected": { color: "#FFD600" },
              },
              "& .MuiTabs-indicator": { backgroundColor: "#FFD600" },
            }}
          >
            <Tab
              label="Live Activity"
              icon={<TimelineIcon />}
              iconPosition="start"
            />
            <Tab
              label="System Metrics"
              icon={<SpeedIcon />}
              iconPosition="start"
            />
            <Tab
              label="Threat Feed"
              icon={<SecurityIcon />}
              iconPosition="start"
            />
          </Tabs>

          <TabPanel value={currentTab} index={0}>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                  <RealtimeChart
                    data={generateChartData()}
                    title="Alerts per Minute (Last Hour)"
                    color="#FFD600"
                    type="area"
                    height={300}
                  />
                </Grid>
                <Grid item xs={12} lg={4}>
                  <ThreatActivityFeed
                    activities={currentActivities.slice(0, 10).map((alert) => ({
                      timestamp: alert.timestamp || new Date().toISOString(),
                      sourceIP: alert.src_ip || alert.source_ip || "Unknown",
                      destinationIP:
                        alert.dest_ip || alert.destination_ip || "Unknown",
                      protocol: alert.protocol || "Unknown",
                      severity: (alert.severity?.toLowerCase() || "low") as
                        | "critical"
                        | "high"
                        | "medium"
                        | "low",
                      attackType:
                        alert.detection_type || alert.attack_type || "Unknown",
                      description: alert.message || "No description",
                      country: alert.country || "Unknown",
                      city: alert.city || "Unknown",
                      riskScore: alert.risk_score || 0,
                      isBlocked: alert.is_blocked || false,
                      isAcknowledged: alert.is_acknowledged || false,
                    }))}
                  />
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          <TabPanel value={currentTab} index={1}>
            <Box sx={{ p: 3 }}>
              <Typography
                variant="h6"
                sx={{ color: "#FFD600", fontWeight: "bold", mb: 3 }}
              >
                System Metrics
              </Typography>
              <Typography variant="body1" sx={{ color: "#B0B0B0" }}>
                System metrics will be available when connected to the local
                Suricata database. This feature requires the sync service to be
                running and collecting system performance data.
              </Typography>
            </Box>
          </TabPanel>

          <TabPanel value={currentTab} index={2}>
            <Box sx={{ p: 3 }}>
              <ThreatActivityFeed
                activities={currentActivities.map((alert) => ({
                  timestamp: alert.timestamp || new Date().toISOString(),
                  sourceIP: alert.src_ip || alert.source_ip || "Unknown",
                  destinationIP:
                    alert.dest_ip || alert.destination_ip || "Unknown",
                  protocol: alert.protocol || "Unknown",
                  severity: (alert.severity?.toLowerCase() || "low") as
                    | "critical"
                    | "high"
                    | "medium"
                    | "low",
                  attackType:
                    alert.detection_type || alert.attack_type || "Unknown",
                  description: alert.message || "No description",
                  country: alert.country || "Unknown",
                  city: alert.city || "Unknown",
                  riskScore: alert.risk_score || 0,
                  isBlocked: alert.is_blocked || false,
                  isAcknowledged: alert.is_acknowledged || false,
                }))}
                maxItems={50}
              />
            </Box>
          </TabPanel>
        </Paper>
      </Container>
    </Layout>
  );
}
