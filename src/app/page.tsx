"use client";

import {
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertsList } from "@/components/alerts/AlertsList";
import { AttackDistributionChart } from "@/components/charts/AttackDistributionChart";
import { TopIpsChart } from "@/components/charts/TopIpsChart";
import Layout from "@/components/layout";
import { AlertStatsCards } from "@/components/stats/AlertStatsCards";
import { useConnection } from "@/contexts/ConnectionContext";
import {
  type DashboardStats,
  dashboardService,
  type SystemStatus,
  type TimeSeriesData,
} from "@/services/dashboardService";
import { Providers } from "./providers";

export default function Home() {
  const { connectionState } = useConnection();
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch data from Supabase
      const [stats, timeSeries, systemStatusData] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getTimeSeriesData(24),
        dashboardService.getSystemStatus(),
      ]);

      setDashboardStats(stats);
      setTimeSeriesData(timeSeries);
      setSystemStatus(systemStatusData);

      // Also try to fetch from backend API as fallback
      try {
        const baseURL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const [analyticsRes, statusRes] = await Promise.all([
          axios.get(`${baseURL}/api/analytics/dashboard`, { timeout: 5000 }),
          axios.get(`${baseURL}/api/status`, { timeout: 5000 }),
        ]);

        // Use backend data if Supabase is not connected
        if (
          stats.database_status === "disconnected" &&
          analyticsRes.data.hourly_data
        ) {
          setTimeSeriesData(analyticsRes.data.hourly_data);
        }

        if (stats.database_status === "disconnected") {
          setSystemStatus(statusRes.data);
        }
      } catch (_apiError) {
        console.log("Backend API not available, using Supabase data only");
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  return (
    <Providers>
      <Layout>
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {/* Header */}
          <Box
            sx={{
              mb: 4,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "start",
            }}
          >
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: "#FFD600",
                  mb: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                Security Intelligence Dashboard
              </Typography>
              <Typography variant="body1" sx={{ color: "#B0B0B0" }}>
                Real-time monitoring of network intrusion attempts and
                authentication attacks
              </Typography>
            </Box>
            {systemStatus && (
              <Chip
                label={`${connectionState.supabaseConnected ? "🟢" : "🔴"} ${connectionState.backendConnected ? "System Healthy" : "System Issues"}`}
                sx={{
                  backgroundColor: connectionState.supabaseConnected
                    ? "#4CAF50"
                    : "#F44336",
                  color: "#FFF",
                }}
              />
            )}
          </Box>

          {/* Statistics Cards */}
          <Box sx={{ mb: 4 }}>
            <AlertStatsCards />
          </Box>

          {/* Quick Stats Row */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {[
              {
                label: "Database Status",
                value: connectionState.supabaseConnected
                  ? "Connected"
                  : "Disconnected",
                color: connectionState.supabaseConnected
                  ? "#4CAF50"
                  : "#F44336",
              },
              {
                label: "API Status",
                value: connectionState.backendConnected
                  ? "Operational"
                  : "Issues",
                color: connectionState.backendConnected ? "#4CAF50" : "#F44336",
              },
              {
                label: "Alerts Last Hour",
                value: dashboardStats?.alerts_last_hour?.toString() || "0",
                color: "#FFD600",
              },
              {
                label: "System Uptime",
                value: systemStatus?.uptime || "N/A",
                color: "#2196F3",
              },
            ].map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item.label}>
                <Card
                  sx={{
                    backgroundColor: "#1A1A1A",
                    border: "1px solid #2B2B2B",
                  }}
                >
                  <CardContent sx={{ py: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "#B0B0B0", mb: 0.5 }}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ color: item.color, fontWeight: 700 }}
                    >
                      {loading ? "..." : item.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Time Series Chart */}
          {timeSeriesData.length > 0 && (
            <Paper
              sx={{
                p: 3,
                backgroundColor: "#1A1A1A",
                border: "1px solid #2B2B2B",
                mb: 4,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, mb: 2, color: "#FFD600" }}
              >
                Alert Trend (Last 24 Hours)
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2B2B2B" />
                  <XAxis dataKey="time" stroke="#B0B0B0" />
                  <YAxis stroke="#B0B0B0" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#2B2B2B",
                      border: "none",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#FFD600"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          )}

          {/* Charts Row 1 */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  backgroundColor: "#1A1A1A",
                  border: "1px solid #2B2B2B",
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, mb: 2, color: "#FFD600" }}
                >
                  Attack Type Distribution
                </Typography>
                <AttackDistributionChart />
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  backgroundColor: "#1A1A1A",
                  border: "1px solid #2B2B2B",
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, mb: 2, color: "#FFD600" }}
                >
                  Top Attacking IPs
                </Typography>
                <TopIpsChart />
              </Paper>
            </Grid>
          </Grid>

          {/* Alerts Section */}
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, mb: 2, color: "#FFD600" }}
            >
              Recent Alerts
            </Typography>
            <Paper
              sx={{
                backgroundColor: "#1A1A1A",
                border: "1px solid #2B2B2B",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <Box sx={{ p: 3 }}>
                <AlertsList />
              </Box>
            </Paper>
          </Box>
        </Container>
      </Layout>
    </Providers>
  );
}
