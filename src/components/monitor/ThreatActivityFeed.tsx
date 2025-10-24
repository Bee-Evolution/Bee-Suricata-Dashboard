"use client";

import {
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Computer as ComputerIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  LocationOn as LocationIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import type { ThreatActivity } from "@/services/realtimeService";

interface ThreatActivityFeedProps {
  activities: ThreatActivity[];
  maxItems?: number;
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case "critical":
      return <ErrorIcon sx={{ color: "#FF6B6B" }} />;
    case "high":
      return <WarningIcon sx={{ color: "#FF8C42" }} />;
    case "medium":
      return <InfoIcon sx={{ color: "#FFD600" }} />;
    case "low":
      return <CheckCircleIcon sx={{ color: "#4CAF50" }} />;
    default:
      return <SecurityIcon sx={{ color: "#B0B0B0" }} />;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "#FF6B6B";
    case "high":
      return "#FF8C42";
    case "medium":
      return "#FFD600";
    case "low":
      return "#4CAF50";
    default:
      return "#B0B0B0";
  }
};

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
};

export default function ThreatActivityFeed({
  activities,
  maxItems = 20,
}: ThreatActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <Paper
      sx={{
        p: 3,
        backgroundColor: "#1A1A1A",
        border: "2px solid #2B2B2B",
        borderRadius: 2,
        height: "100%",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <SecurityIcon sx={{ color: "#FFD600", mr: 1 }} />
        <Typography variant="h6" sx={{ color: "#FFD600", fontWeight: "bold" }}>
          Live Threat Activity
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

      <List sx={{ maxHeight: 400, overflow: "auto" }}>
        {displayActivities.length === 0 ? (
          <ListItem>
            <ListItemText
              primary={
                <Typography sx={{ color: "#B0B0B0", textAlign: "center" }}>
                  No recent threat activity
                </Typography>
              }
            />
          </ListItem>
        ) : (
          displayActivities.map((activity, index) => (
            <React.Fragment key={`${activity.timestamp}-${index}`}>
              <ListItem sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      backgroundColor: getSeverityColor(activity.severity),
                      width: 40,
                      height: 40,
                    }}
                  >
                    {getSeverityIcon(activity.severity)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "#FFF", fontWeight: "bold" }}
                      >
                        {activity.attackType}
                      </Typography>
                      <Chip
                        label={activity.severity.toUpperCase()}
                        size="small"
                        sx={{
                          backgroundColor: getSeverityColor(activity.severity),
                          color: "#000",
                          fontWeight: "bold",
                          fontSize: "0.7rem",
                        }}
                      />
                      {activity.isBlocked && (
                        <Tooltip title="Blocked">
                          <BlockIcon sx={{ color: "#FF6B6B", fontSize: 16 }} />
                        </Tooltip>
                      )}
                      {activity.isAcknowledged && (
                        <Tooltip title="Acknowledged">
                          <CheckCircleIcon
                            sx={{ color: "#4CAF50", fontSize: 16 }}
                          />
                        </Tooltip>
                      )}
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 0.5,
                        }}
                      >
                        <ComputerIcon sx={{ color: "#B0B0B0", fontSize: 14 }} />
                        <Typography
                          variant="caption"
                          sx={{ color: "#B0B0B0", fontFamily: "monospace" }}
                        >
                          {activity.sourceIP} → {activity.destinationIP}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 0.5,
                        }}
                      >
                        <LocationIcon sx={{ color: "#B0B0B0", fontSize: 14 }} />
                        <Typography variant="caption" sx={{ color: "#B0B0B0" }}>
                          {activity.city}, {activity.country}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: "#B0B0B0" }}>
                        {activity.description}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mt: 0.5,
                        }}
                      >
                        <Typography variant="caption" sx={{ color: "#B0B0B0" }}>
                          Risk Score: {activity.riskScore}/100
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#B0B0B0" }}>
                          {formatTime(activity.timestamp)}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </ListItem>
              {index < displayActivities.length - 1 && (
                <Divider sx={{ backgroundColor: "#2B2B2B", mx: 2 }} />
              )}
            </React.Fragment>
          ))
        )}
      </List>
    </Paper>
  );
}
