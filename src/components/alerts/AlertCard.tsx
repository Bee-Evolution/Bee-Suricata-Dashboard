"use client";

import {
  NetworkCheck as NetworkIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import {
  Box,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import type React from "react";
import {
  type Alert as AlertType,
  DETECTION_TYPE_LABELS,
  SEVERITY_COLORS,
} from "@/types/alerts";

interface AlertCardProps {
  alert: AlertType;
  onViewDetails?: (alert: AlertType) => void;
  compact?: boolean;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onViewDetails,
  compact = false,
}) => {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <WarningIcon sx={{ color: SEVERITY_COLORS.critical }} />;
      case "high":
        return <SecurityIcon sx={{ color: SEVERITY_COLORS.high }} />;
      case "medium":
        return <NetworkIcon sx={{ color: SEVERITY_COLORS.medium }} />;
      default:
        return <WarningIcon sx={{ color: SEVERITY_COLORS.low }} />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Card
      sx={{
        backgroundColor: "#1A1A1A",
        border: "1px solid #2B2B2B",
        borderRadius: 2,
        mb: 2,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          borderColor: "#FFD600",
          transform: "translateY(-2px)",
          boxShadow: "0 4px 20px rgba(255, 214, 0, 0.1)",
        },
      }}
    >
      <CardContent sx={{ p: compact ? 2 : 3 }}>
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
            {getSeverityIcon(alert.severity)}
            <Chip
              label={alert.severity.toUpperCase()}
              size="small"
              sx={{
                backgroundColor:
                  SEVERITY_COLORS[
                    alert.severity as keyof typeof SEVERITY_COLORS
                  ],
                color: "#000",
                fontWeight: 700,
                fontSize: "0.7rem",
              }}
            />
            {alert.is_acknowledged && (
              <Chip
                label="ACK"
                size="small"
                sx={{
                  backgroundColor: "#4CAF50",
                  color: "#FFF",
                  fontWeight: 700,
                  fontSize: "0.7rem",
                }}
              />
            )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="caption" sx={{ color: "#B0B0B0" }}>
              {formatTimestamp(alert.timestamp)}
            </Typography>
            {onViewDetails && (
              <Tooltip title="View Details">
                <IconButton
                  size="small"
                  onClick={() => onViewDetails(alert)}
                  sx={{ color: "#FFD600" }}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Attack Type */}
        <Typography
          variant="h6"
          sx={{
            color: "#FFD600",
            fontWeight: 700,
            mb: 1,
            fontSize: compact ? "1rem" : "1.1rem",
          }}
        >
          {DETECTION_TYPE_LABELS[alert.detection_type] || alert.detection_type}
        </Typography>

        {/* Network Info */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: "#B0B0B0", mb: 0.5 }}>
            Source IP
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#FFF",
              fontFamily: "monospace",
              fontWeight: 600,
              mb: 1,
            }}
          >
            {alert.source_ip}:{alert.source_port}
          </Typography>
          <Typography variant="body2" sx={{ color: "#B0B0B0", mb: 0.5 }}>
            Target
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#FFF",
              fontFamily: "monospace",
            }}
          >
            {alert.destination_ip}:{alert.destination_port} ({alert.protocol})
          </Typography>
        </Box>

        {/* Message */}
        {!compact && alert.message && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: "#B0B0B0", mb: 0.5 }}>
              Description
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#FFF",
                lineHeight: 1.4,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {alert.message}
            </Typography>
          </Box>
        )}

        {/* Footer */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="caption" sx={{ color: "#B0B0B0" }}>
            {new Date(alert.timestamp).toLocaleString()}
          </Typography>
          {alert.event_count && alert.event_count > 1 && (
            <Chip
              label={`${alert.event_count} events`}
              size="small"
              variant="outlined"
              sx={{
                borderColor: "#FFD600",
                color: "#FFD600",
                fontSize: "0.7rem",
              }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
