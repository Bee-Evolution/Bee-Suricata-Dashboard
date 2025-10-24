"use client";

import {
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import { Box, Card, CardContent, Chip, Typography } from "@mui/material";
import type React from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
  color?: string;
  subtitle?: string;
  compact?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon,
  trend,
  trendValue,
  color = "#FFD600",
  subtitle,
  compact = false,
}) => {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUpIcon sx={{ color: "#4CAF50", fontSize: "1rem" }} />;
      case "down":
        return <TrendingDownIcon sx={{ color: "#F44336", fontSize: "1rem" }} />;
      case "stable":
        return <TrendingFlatIcon sx={{ color: "#FFD600", fontSize: "1rem" }} />;
      default:
        return <TrendingFlatIcon sx={{ color: "#B0B0B0", fontSize: "1rem" }} />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "#4CAF50";
      case "down":
        return "#F44336";
      case "stable":
        return "#FFD600";
      default:
        return "#B0B0B0";
    }
  };

  return (
    <Card
      sx={{
        backgroundColor: "#1A1A1A",
        border: "1px solid #2B2B2B",
        borderRadius: 2,
        height: "100%",
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          borderColor: color,
          transform: "translateY(-2px)",
          boxShadow: `0 4px 20px ${color}20`,
        },
      }}
    >
      <CardContent
        sx={{
          p: compact ? 2 : 3,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {icon && (
              <Typography
                sx={{
                  fontSize: compact ? "1.5rem" : "2rem",
                  lineHeight: 1,
                }}
              >
                {icon}
              </Typography>
            )}
            <Typography
              variant={compact ? "body2" : "body1"}
              sx={{
                color: "#B0B0B0",
                fontWeight: 500,
                lineHeight: 1.2,
              }}
            >
              {label}
            </Typography>
          </Box>
          {trend && trendValue && (
            <Chip
              icon={getTrendIcon()}
              label={trendValue}
              size="small"
              sx={{
                backgroundColor: `${getTrendColor()}20`,
                color: getTrendColor(),
                border: `1px solid ${getTrendColor()}40`,
                fontSize: "0.7rem",
                height: "24px",
              }}
            />
          )}
        </Box>

        {/* Value */}
        <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
          <Typography
            variant={compact ? "h5" : "h4"}
            sx={{
              color: color,
              fontWeight: 700,
              lineHeight: 1,
              fontSize: compact ? "1.5rem" : "2rem",
            }}
          >
            {typeof value === "number" ? value.toLocaleString() : value}
          </Typography>
        </Box>

        {/* Subtitle */}
        {subtitle && (
          <Typography
            variant="caption"
            sx={{
              color: "#B0B0B0",
              mt: 1,
              display: "block",
            }}
          >
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
