"use client";

import { Box, Typography } from "@mui/material";
import type React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTopIps } from "@/hooks/useAlerts";

export const TopIpsChart: React.FC = () => {
  const { topIps, loading, error } = useTopIps();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 300,
        }}
      >
        <Typography>Loading top IPs...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 300,
        }}
      >
        <Typography color="error">Error loading top IPs: {error}</Typography>
      </Box>
    );
  }

  if (!topIps || topIps.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 300,
        }}
      >
        <Typography color="text.secondary">No IP data available</Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={topIps as any}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#2B2B2B" />
        <XAxis
          dataKey="ip"
          stroke="#B0B0B0"
          angle={-45}
          textAnchor="end"
          height={80}
          interval={0}
          fontSize={11}
        />
        <YAxis
          stroke="#B0B0B0"
          domain={[0, "dataMax"]}
          tickFormatter={(value) => value.toString()}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1A1A1A",
            border: "1px solid #2B2B2B",
            borderRadius: "8px",
            color: "#FFF",
          }}
          formatter={(value: number) => [`${value} alerts`, "Alert Count"]}
          labelFormatter={(label: string) => `IP: ${label}`}
        />
        <Bar
          dataKey="alert_count"
          fill="#FFD600"
          name="Alert Count"
          radius={[4, 4, 0, 0]}
          maxBarSize={60} // Limit bar width for better appearance
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
