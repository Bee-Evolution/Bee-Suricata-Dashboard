"use client";

import { Refresh as RefreshIcon } from "@mui/icons-material";
import {
  Box,
  Chip,
  Container,
  Grid,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Providers } from "@/app/providers";
import Layout from "@/components/layout";
import { MetricCard } from "@/components/stats/MetricCard";
import apiService from "@/services/api";

interface AnalyticsData {
  total_alerts: number;
  critical_alerts: number;
  high_alerts: number;
  medium_alerts: number;
  unique_attackers: number;
  top_countries: { country: string; count: number }[];
  top_protocols: { protocol: string; count: number }[];
  hourly_data: { hour: string; count: number }[];
  attack_types: { type: string; count: number }[];
  severity_breakdown: { severity: string; count: number }[];
}

const COLORS = [
  "#FFD600",
  "#FF6B6B",
  "#FF8C42",
  "#FFB347",
  "#FFA500",
  "#FF7F50",
];

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAnalytics("7days");

      // Process the data to calculate missing values
      const processedData = {
        ...response.data,
        high_alerts:
          response.data.severity_breakdown?.find(
            (s: any) => s.severity === "high",
          )?.count || 0,
        medium_alerts:
          response.data.severity_breakdown?.find(
            (s: any) => s.severity === "medium",
          )?.count || 0,
      };

      setData(processedData);
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      setError("Failed to load analytics data. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <Providers>
        <Layout>
          <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "50vh",
              }}
            >
              <Typography variant="h6" sx={{ color: "#FFD600" }}>
                📊 Loading Security Analytics...
              </Typography>
            </Box>
          </Container>
        </Layout>
      </Providers>
    );
  }

  if (error) {
    return (
      <Providers>
        <Layout>
          <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "50vh",
              }}
            >
              <Typography variant="h6" sx={{ color: "#FF6B6B" }}>
                ❌ {error}
              </Typography>
            </Box>
          </Container>
        </Layout>
      </Providers>
    );
  }

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
              alignItems: "flex-start",
            }}
          >
            <Box>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, color: "#FFD600", mb: 1 }}
              >
                📊 Security Analytics
              </Typography>
              <Typography variant="body1" sx={{ color: "#B0B0B0" }}>
                Last 7 Days Overview - Deep insights into network security
                threats and patterns
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Chip
                label="🟢 LIVE"
                sx={{
                  backgroundColor: "#4CAF50",
                  color: "#FFF",
                  fontWeight: "bold",
                  animation: "pulse 2s infinite",
                }}
              />
              <IconButton
                onClick={fetchAnalytics}
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

          {/* Executive Summary */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: "#FFD600", mb: 3 }}
            >
              Executive Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  label="Total Events"
                  value={data?.total_alerts || 0}
                  icon="🚨"
                  color="#FFD600"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  label="Threat Actors"
                  value={data?.unique_attackers || 0}
                  icon="👤"
                  color="#FF6B6B"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  label="Critical Alerts"
                  value={data?.critical_alerts || 0}
                  icon="⚠️"
                  color="#F44336"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <MetricCard
                  label="High Severity"
                  value={data?.high_alerts || 0}
                  icon="🔴"
                  color="#FF8C42"
                />
              </Grid>
            </Grid>
          </Box>

          {/* Charts Row 1 */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Alert Timeline */}
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  backgroundColor: "#1A1A1A",
                  border: "1px solid #2B2B2B",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, mb: 2, color: "#FFD600" }}
                >
                  📈 Alert Timeline
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data?.hourly_data || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2B2B2B" />
                    <XAxis dataKey="hour" stroke="#B0B0B0" />
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
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Severity Distribution */}
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  backgroundColor: "#1A1A1A",
                  border: "1px solid #2B2B2B",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, mb: 2, color: "#FFD600" }}
                >
                  🎯 Severity Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data?.severity_breakdown || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ severity, count }) => `${severity}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(data?.severity_breakdown || []).map((entry, index) => (
                        <Cell
                          key={entry.severity || `cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>

          {/* Charts Row 2 */}
          <Grid container spacing={3}>
            {/* Top Countries */}
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  backgroundColor: "#1A1A1A",
                  border: "1px solid #2B2B2B",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, mb: 2, color: "#FFD600" }}
                >
                  Top Countries
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data?.top_countries || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2B2B2B" />
                    <XAxis dataKey="country" stroke="#B0B0B0" />
                    <YAxis stroke="#B0B0B0" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#2B2B2B",
                        border: "none",
                      }}
                    />
                    <Bar dataKey="count" fill="#FFD600" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Top Protocols */}
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 3,
                  backgroundColor: "#1A1A1A",
                  border: "1px solid #2B2B2B",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, mb: 2, color: "#FFD600" }}
                >
                  Protocols Used in Attacks
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data?.top_protocols || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2B2B2B" />
                    <XAxis dataKey="protocol" stroke="#B0B0B0" />
                    <YAxis stroke="#B0B0B0" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#2B2B2B",
                        border: "none",
                      }}
                    />
                    <Bar dataKey="count" fill="#FF8C42" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Layout>
    </Providers>
  );
}
