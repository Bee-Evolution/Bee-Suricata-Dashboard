"use client";

import ErrorIcon from "@mui/icons-material/Error";
import PublicIcon from "@mui/icons-material/Public";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WarningIcon from "@mui/icons-material/Warning";
import { Box, Grid, Paper, Skeleton, Typography } from "@mui/material";
import type React from "react";
import { useAlertStats } from "@/hooks/useAlerts";
import { DETECTION_TYPE_LABELS } from "@/types/alerts";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtext?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  color,
  subtext,
}) => (
  <Paper
    sx={{
      p: 3,
      background: `linear-gradient(135deg, #1A1A1A 0%, #2B2B2B 100%)`,
      border: `2px solid ${color}`,
      borderRadius: 2,
      display: "flex",
      alignItems: "center",
      gap: 2,
    }}
  >
    <Box sx={{ color, fontSize: 32 }}>{icon}</Box>
    <Box>
      <Typography variant="body2" sx={{ color: "#B0B0B0", mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="h6" sx={{ color: "#E0E0E0", fontWeight: 700 }}>
        {value}
      </Typography>
      {subtext && (
        <Typography variant="caption" sx={{ color: "#B0B0B0" }}>
          {subtext}
        </Typography>
      )}
    </Box>
  </Paper>
);

export const AlertStatsCards: React.FC = () => {
  const { stats, loading } = useAlertStats();

  if (loading) {
    return (
      <Grid container spacing={2}>
        {[...Array(4)].map((_, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Paper sx={{ p: 3, background: "#1A1A1A" }}>
              <Skeleton height={40} sx={{ mb: 1 }} />
              <Skeleton height={30} width="60%" />
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          label="Total Alerts"
          value={stats.total_alerts}
          icon={<TrendingUpIcon />}
          color="#FFD600"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          label="Critical Alerts"
          value={stats.critical_alerts}
          icon={<ErrorIcon />}
          color="#F44336"
          subtext={`${((stats.critical_alerts / stats.total_alerts) * 100).toFixed(1)}% of total`}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          label="Unique Source IPs"
          value={stats.unique_source_ips}
          icon={<PublicIcon />}
          color="#42A5F5"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          label="Most Common"
          value={
            stats.most_common_attack &&
            DETECTION_TYPE_LABELS[stats.most_common_attack]
              ? DETECTION_TYPE_LABELS[stats.most_common_attack].split(" ")[0]
              : "N/A"
          }
          icon={<WarningIcon />}
          color="#FF9800"
          subtext={
            stats.most_common_attack ? `${stats.most_common_attack}` : "No data"
          }
        />
      </Grid>
    </Grid>
  );
};
