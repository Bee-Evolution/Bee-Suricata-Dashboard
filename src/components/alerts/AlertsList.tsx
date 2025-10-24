"use client";

import {
  Box,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import type React from "react";
import { useMemo, useState } from "react";
import { useAlerts } from "@/hooks/useAlerts";
import {
  type Alert,
  type AlertSeverity,
  DETECTION_TYPE_LABELS,
  type DetectionType,
  SEVERITY_COLORS,
  SEVERITY_LABELS,
} from "@/types/alerts";
import { AlertDetailDrawer } from "./AlertDetailDrawer";

export const AlertsList: React.FC = () => {
  const { alerts, loading } = useAlerts();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | "all">(
    "all",
  );
  const [detectionTypeFilter, setDetectionTypeFilter] = useState<
    DetectionType | "all"
  >("all");

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesSearch =
        alert.source_ip?.includes(searchText) ||
        alert.destination_ip?.includes(searchText) ||
        alert.message?.toLowerCase().includes(searchText.toLowerCase());

      const matchesSeverity =
        severityFilter === "all" || alert.severity === severityFilter;
      const matchesType =
        detectionTypeFilter === "all" ||
        alert.detection_type === detectionTypeFilter;

      return matchesSearch && matchesSeverity && matchesType;
    });
  }, [alerts, searchText, severityFilter, detectionTypeFilter]);

  const handleRowClick = (alert: Alert) => {
    setSelectedAlert(alert);
    setDrawerOpen(true);
  };

  if (loading && alerts.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
        }}
      >
        <CircularProgress sx={{ color: "#FFD600" }} />
      </Box>
    );
  }

  return (
    <>
      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Search by IP, message..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#E0E0E0",
                "& fieldset": { borderColor: "#2B2B2B" },
                "&:hover fieldset": { borderColor: "#FFD600" },
                "&.Mui-focused fieldset": { borderColor: "#FFD600" },
              },
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: "#B0B0B0" }}>Severity</InputLabel>
            <Select
              value={severityFilter}
              onChange={(e) =>
                setSeverityFilter(e.target.value as AlertSeverity | "all")
              }
              label="Severity"
              sx={{
                color: "#E0E0E0",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#2B2B2B",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#FFD600",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#FFD600",
                },
              }}
            >
              <MenuItem value="all">All Severities</MenuItem>
              <MenuItem value="critical">Critical</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="info">Info</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth>
            <InputLabel sx={{ color: "#B0B0B0" }}>Detection Type</InputLabel>
            <Select
              value={detectionTypeFilter}
              onChange={(e) =>
                setDetectionTypeFilter(e.target.value as DetectionType | "all")
              }
              label="Detection Type"
              sx={{
                color: "#E0E0E0",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#2B2B2B",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#FFD600",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#FFD600",
                },
              }}
            >
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="http_basic_auth">HTTP Basic Auth</MenuItem>
              <MenuItem value="http_form_auth">HTTP Form Auth</MenuItem>
              <MenuItem value="ftp_auth">FTP Auth</MenuItem>
              <MenuItem value="pop3_auth">POP3 Auth</MenuItem>
              <MenuItem value="imap_auth">IMAP Auth</MenuItem>
              <MenuItem value="telnet_auth">Telnet Auth</MenuItem>
              <MenuItem value="ssh_bruteforce">SSH Brute-Force</MenuItem>
              <MenuItem value="smb_ntlm">SMB/NTLM Auth</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Results Count */}
      <Typography variant="body2" sx={{ color: "#B0B0B0", mb: 2 }}>
        Showing {filteredAlerts.length} of {alerts.length} alerts
      </Typography>

      {/* Alerts Table */}
      <TableContainer
        component={Paper}
        sx={{ backgroundColor: "#1A1A1A", border: "1px solid #2B2B2B" }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#0A0A0A" }}>
              <TableCell sx={{ color: "#FFD600", fontWeight: 700 }}>
                Timestamp
              </TableCell>
              <TableCell sx={{ color: "#FFD600", fontWeight: 700 }}>
                Source IP
              </TableCell>
              <TableCell sx={{ color: "#FFD600", fontWeight: 700 }}>
                Detection Type
              </TableCell>
              <TableCell sx={{ color: "#FFD600", fontWeight: 700 }}>
                Severity
              </TableCell>
              <TableCell sx={{ color: "#FFD600", fontWeight: 700 }}>
                Message
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAlerts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  sx={{ textAlign: "center", py: 4, color: "#B0B0B0" }}
                >
                  No alerts found
                </TableCell>
              </TableRow>
            ) : (
              filteredAlerts.map((alert) => (
                <TableRow
                  key={alert.id}
                  onClick={() => handleRowClick(alert)}
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: "#2B2B2B",
                    },
                    borderBottom: "1px solid #2B2B2B",
                  }}
                >
                  <TableCell sx={{ color: "#E0E0E0", fontSize: "0.85rem" }}>
                    {new Date(alert.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "#E0E0E0",
                      fontFamily: "monospace",
                      fontSize: "0.85rem",
                    }}
                  >
                    {alert.source_ip}
                  </TableCell>
                  <TableCell sx={{ color: "#FFD600", fontSize: "0.85rem" }}>
                    {DETECTION_TYPE_LABELS[alert.detection_type]}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={SEVERITY_LABELS[alert.severity]}
                      size="small"
                      sx={{
                        backgroundColor: SEVERITY_COLORS[alert.severity],
                        color: alert.severity === "low" ? "#000" : "#fff",
                        fontWeight: 700,
                      }}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "#B0B0B0",
                      maxWidth: 300,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {alert.message}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Detail Drawer */}
      <AlertDetailDrawer
        alert={selectedAlert}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
};
