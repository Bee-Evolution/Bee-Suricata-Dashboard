"use client";

import {
  Hub as HubIcon,
  Memory as MemoryIcon,
  NetworkCheck as NetworkIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Storage as StorageIcon,
} from "@mui/icons-material";
import {
  Box,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Typography,
} from "@mui/material";
import type React from "react";
import type { SystemMetrics as SystemMetricsType } from "@/services/realtimeService";

interface SystemMetricsProps {
  metrics: SystemMetricsType;
}

const MetricCard = ({
  title,
  value,
  unit,
  percentage,
  icon,
  color,
}: {
  title: string;
  value: number;
  unit: string;
  percentage: number;
  icon: React.ReactNode;
  color: string;
}) => (
  <Paper
    sx={{
      p: 2,
      backgroundColor: "#1A1A1A",
      border: "2px solid #2B2B2B",
      borderRadius: 2,
      height: "100%",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
      <Box sx={{ color, mr: 1 }}>{icon}</Box>
      <Typography variant="body2" sx={{ color: "#B0B0B0", flex: 1 }}>
        {title}
      </Typography>
      <Chip
        label={`${percentage}%`}
        size="small"
        sx={{
          backgroundColor:
            percentage > 80
              ? "#FF6B6B"
              : percentage > 60
                ? "#FFD600"
                : "#4CAF50",
          color: "#000",
          fontWeight: "bold",
        }}
      />
    </Box>

    <Typography variant="h5" sx={{ color: "#FFF", fontWeight: "bold", mb: 1 }}>
      {value.toLocaleString()} {unit}
    </Typography>

    <LinearProgress
      variant="determinate"
      value={percentage}
      sx={{
        height: 8,
        borderRadius: 4,
        backgroundColor: "#2B2B2B",
        "& .MuiLinearProgress-bar": {
          backgroundColor:
            percentage > 80
              ? "#FF6B6B"
              : percentage > 60
                ? "#FFD600"
                : "#4CAF50",
          borderRadius: 4,
        },
      }}
    />
  </Paper>
);

export default function SystemMetrics({ metrics }: SystemMetricsProps) {
  return (
    <Paper
      sx={{
        p: 3,
        backgroundColor: "#1A1A1A",
        border: "2px solid #2B2B2B",
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <SpeedIcon sx={{ color: "#FFD600", mr: 1 }} />
        <Typography variant="h6" sx={{ color: "#FFD600", fontWeight: "bold" }}>
          System Performance
        </Typography>
        <Chip
          label="🟢 LIVE"
          size="small"
          sx={{
            ml: "auto",
            backgroundColor: "#4CAF50",
            color: "#FFF",
            fontWeight: "bold",
            animation: "pulse 2s infinite",
          }}
        />
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="CPU Usage"
            value={metrics.cpuUsage}
            unit="%"
            percentage={metrics.cpuUsage}
            icon={<SpeedIcon />}
            color="#FFD600"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Memory Usage"
            value={metrics.memoryUsage}
            unit="%"
            percentage={metrics.memoryUsage}
            icon={<MemoryIcon />}
            color="#4CAF50"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Network Traffic"
            value={metrics.networkTraffic}
            unit="MB/s"
            percentage={Math.min((metrics.networkTraffic / 1500) * 100, 100)}
            icon={<NetworkIcon />}
            color="#2196F3"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Disk Usage"
            value={metrics.diskUsage}
            unit="%"
            percentage={metrics.diskUsage}
            icon={<StorageIcon />}
            color="#FF9800"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Active Connections"
            value={metrics.activeConnections}
            unit=""
            percentage={Math.min((metrics.activeConnections / 1500) * 100, 100)}
            icon={<HubIcon />}
            color="#9C27B0"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <MetricCard
            title="Blocked Connections"
            value={metrics.blockedConnections}
            unit=""
            percentage={Math.min((metrics.blockedConnections / 50) * 100, 100)}
            icon={<SecurityIcon />}
            color="#F44336"
          />
        </Grid>
      </Grid>
    </Paper>
  );
}
