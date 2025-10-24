"use client";

import { Box, Typography } from "@mui/material";
import type React from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useAttackDistribution } from "@/hooks/useAlerts";

const COLORS = [
  "#FFD600", // Bee Yellow
  "#FF6F00", // Orange
  "#42A5F5", // Blue
  "#66BB6A", // Green
  "#EF5350", // Red
  "#AB47BC", // Purple
  "#FFA726", // Light Orange
  "#26C6DA", // Cyan
];

export const AttackDistributionChart: React.FC = () => {
  const { distribution, loading, error } = useAttackDistribution();

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
        <Typography>Loading distribution...</Typography>
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
        <Typography color="error">
          Error loading distribution: {error}
        </Typography>
      </Box>
    );
  }

  if (!distribution || distribution.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 300,
        }}
      >
        <Typography color="text.secondary">No attack data available</Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={distribution as any}
          cx="50%"
          cy="40%"
          labelLine={false}
          label={false}
          outerRadius={90}
          innerRadius={25}
          fill="#8884d8"
          dataKey="count"
          paddingAngle={2} // Add small gaps between slices
        >
          {distribution.map((entry, index) => (
            <Cell
              key={(entry as any).type || `cell-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, _name: string, props: any) => [
            `${value} alerts (${props.payload.percentage.toFixed(1)}%)`,
            props.payload.type || "Unknown",
          ]}
          labelStyle={{ color: "#FFF" }}
          contentStyle={{
            backgroundColor: "#1A1A1A",
            border: "1px solid #2B2B2B",
            borderRadius: "8px",
            color: "#FFF",
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={60}
          iconType="circle"
          wrapperStyle={{
            paddingTop: "15px",
            fontSize: "13px",
            color: "#FFF",
            lineHeight: "1.4",
            fontWeight: "500",
          }}
          formatter={(value: string, entry: any) => {
            const percentage = entry.payload.percentage.toFixed(1);
            return `${value} (${percentage}%)`;
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
