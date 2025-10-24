"use client";

import { Box, Chip, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface RealtimeChartProps {
  data: Array<{
    time: string;
    value: number;
    timestamp: string;
  }>;
  title: string;
  color: string;
  type?: "line" | "area";
  height?: number;
}

export default function RealtimeChart({
  data,
  title,
  color,
  type = "line",
  height = 200,
}: RealtimeChartProps) {
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsLive((prev) => !prev);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (time: string) => {
    return new Date(time).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          sx={{
            p: 2,
            backgroundColor: "#1A1A1A",
            border: "1px solid #2B2B2B",
            color: "#FFF",
          }}
        >
          <Typography variant="body2" sx={{ color: "#B0B0B0" }}>
            {formatTime(label)}
          </Typography>
          <Typography variant="h6" sx={{ color: color, fontWeight: "bold" }}>
            {payload[0].value}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Paper
      sx={{
        p: 3,
        backgroundColor: "#1A1A1A",
        border: "2px solid #2B2B2B",
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ color: "#FFD600", fontWeight: "bold" }}>
          {title}
        </Typography>
        <Chip
          label={isLive ? "🟢 LIVE" : "⚪"}
          size="small"
          sx={{
            backgroundColor: isLive ? "#4CAF50" : "#666",
            color: "#FFF",
            fontWeight: "bold",
            animation: isLive ? "pulse 2s infinite" : "none",
          }}
        />
      </Box>

      <ResponsiveContainer width="100%" height={height}>
        {type === "area" ? (
          <AreaChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient
                id={`gradient-${title}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2B2B2B" />
            <XAxis
              dataKey="time"
              stroke="#B0B0B0"
              fontSize={12}
              tickFormatter={formatTime}
            />
            <YAxis stroke="#B0B0B0" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${title})`}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            />
          </AreaChart>
        ) : (
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2B2B2B" />
            <XAxis
              dataKey="time"
              stroke="#B0B0B0"
              fontSize={12}
              tickFormatter={formatTime}
            />
            <YAxis stroke="#B0B0B0" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </Paper>
  );
}
