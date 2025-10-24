"use client";

import {
  Clear as ClearIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { Providers } from "@/app/providers";
import { IPManagementModal } from "@/components/ip-management/IPManagementModal";
import Layout from "@/components/layout";
import { getSupabaseClient } from "@/lib/supabase";
import type {
  AlertSeverity,
  Alert as AlertType,
  DetectionType,
} from "@/types/alerts";

type TimeRange = "1hour" | "6hours" | "24hours" | "7days" | "30days";

export default function AlertsScreen() {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<AlertType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<AlertSeverity[]>([
    "critical",
    "high",
    "medium",
    "low",
  ]);
  const [showAcknowledged, setShowAcknowledged] = useState(false);
  const [selectedDetectionType, setSelectedDetectionType] = useState<
    DetectionType[]
  >([]);
  const [timeRange, setTimeRange] = useState<TimeRange>("24hours");
  const [selectedAlert, setSelectedAlert] = useState<AlertType | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ipManagementModal, setIpManagementModal] = useState<{
    open: boolean;
    ip: string;
  }>({ open: false, ip: "" });

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();

      if (!supabase) {
        setError(
          "Database not configured. Please check your connection settings.",
        );
        setLoading(false);
        return;
      }

      // Calculate time range
      let query = supabase
        .from("security_alerts")
        .select("*")
        .order("timestamp", { ascending: false });

      // Apply time range filter
      if (timeRange !== "30days") {
        const now = new Date();
        let hoursAgo = 24;
        switch (timeRange) {
          case "1hour":
            hoursAgo = 1;
            break;
          case "6hours":
            hoursAgo = 6;
            break;
          case "24hours":
            hoursAgo = 24;
            break;
          case "7days":
            hoursAgo = 24 * 7;
            break;
        }
        const timeFilter = new Date(
          now.getTime() - hoursAgo * 60 * 60 * 1000,
        ).toISOString();
        query = query.gte("timestamp", timeFilter);
      }

      // Apply severity filter
      if (selectedSeverity.length > 0 && selectedSeverity.length < 4) {
        query = query.in("severity", selectedSeverity);
      }

      // Apply detection type filter
      if (selectedDetectionType.length > 0) {
        query = query.in("detection_type", selectedDetectionType);
      }

      // Execute query first (without search for complex OR logic)
      const { data: allData, error: fetchError } = await query.limit(500);

      if (fetchError) {
        console.error("Supabase error details:", fetchError);
        throw new Error(fetchError.message);
      }

      let filteredData = allData || [];
      
      console.log(`Loaded ${filteredData.length} alerts from database`);

      // Apply search filter client-side if specified
      if (debouncedSearchQuery.trim()) {
        const searchLower = debouncedSearchQuery.toLowerCase();
        filteredData = filteredData.filter((alert: any) => {
          return (
            alert.message?.toLowerCase().includes(searchLower) ||
            alert.src_ip?.toLowerCase().includes(searchLower) ||
            alert.dest_ip?.toLowerCase().includes(searchLower) ||
            alert.detection_type?.toLowerCase().includes(searchLower) ||
            alert.attack_type?.toLowerCase().includes(searchLower)
          );
        });
        console.log(`Filtered to ${filteredData.length} alerts matching "${debouncedSearchQuery}"`);
      }

      // Map database columns to frontend types
      const mappedAlerts = filteredData.map((alert: any) => ({
        ...alert,
        source_ip: alert.src_ip || alert.source_ip,
        destination_ip: alert.dest_ip || alert.destination_ip,
        source_port: alert.src_port || alert.source_port,
        destination_port: alert.dest_port || alert.destination_port,
      }));

      setAlerts(mappedAlerts);
      if (mappedAlerts.length > 0) {
        setSelectedAlert(mappedAlerts[0]);
      }
    } catch (error: any) {
      console.error("Error loading alerts:", error);
      setError(
        "Failed to load alerts. Please check your connection and try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [timeRange, selectedSeverity, selectedDetectionType, debouncedSearchQuery]);

  const applyFilters = useCallback(() => {
    let filtered = alerts;

    // Filter by acknowledged status only (search is handled by Supabase query)
    if (showAcknowledged) {
      filtered = filtered.filter((alert) => alert.is_acknowledged === true);
    } else {
      filtered = filtered.filter((alert) => alert.is_acknowledged !== true);
    }

    setFilteredAlerts(filtered);
  }, [alerts, showAcknowledged]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load alerts when filters change
  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  // Apply client-side filters when alerts or filter criteria change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const toggleSeverity = (severity: AlertSeverity) => {
    if (selectedSeverity.includes(severity)) {
      setSelectedSeverity(selectedSeverity.filter((s) => s !== severity));
    } else {
      setSelectedSeverity([...selectedSeverity, severity]);
    }
  };

  const _toggleDetectionType = (detectionType: DetectionType) => {
    if (selectedDetectionType.includes(detectionType)) {
      setSelectedDetectionType(
        selectedDetectionType.filter((t) => t !== detectionType),
      );
    } else {
      setSelectedDetectionType([...selectedDetectionType, detectionType]);
    }
  };

  const handleIPClick = (ip: string) => {
    setIpManagementModal({ open: true, ip });
  };

  const handleIPManagementClose = () => {
    setIpManagementModal({ open: false, ip: "" });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "error";
      case "high":
        return "warning";
      case "medium":
        return "info";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSeverity(["critical", "high", "medium", "low"]);
    setSelectedDetectionType([]);
    setShowAcknowledged(false);
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const supabase = getSupabaseClient();

      if (!supabase) {
        setError("Database not configured");
        return;
      }

      const { error: updateError } = await supabase
        .from("security_alerts")
        .update({ is_acknowledged: true })
        .eq("id", alertId);

      if (updateError) {
        throw updateError;
      }

      // Reload alerts to get updated data
      await loadAlerts();
    } catch (error) {
      console.error("Error acknowledging alert:", error);
      setError("Failed to acknowledge alert");
    }
  };

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
                minHeight: "400px",
              }}
            >
              <CircularProgress sx={{ color: "#FFD600" }} />
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
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h3"
              sx={{ fontWeight: 700, color: "#FFD600", mb: 1 }}
            >
              🚨 Security Alerts
            </Typography>
            <Typography variant="body1" sx={{ color: "#B0B0B0" }}>
              {filteredAlerts.length} of {alerts.length} alerts
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Search and Filters */}
          <Paper
            sx={{
              backgroundColor: "#1A1A1A",
              border: "1px solid #2B2B2B",
              p: 3,
              mb: 3,
            }}
          >
            {/* Search */}
            <TextField
              fullWidth
              placeholder="Search alerts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#B0B0B0" }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <Button
                      onClick={() => setSearchQuery("")}
                      size="small"
                      sx={{ minWidth: "auto", p: 0.5 }}
                    >
                      <ClearIcon sx={{ color: "#B0B0B0" }} />
                    </Button>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                "& .MuiOutlinedInput-root": {
                  color: "#FFF",
                  "& fieldset": { borderColor: "#2B2B2B" },
                  "&:hover fieldset": { borderColor: "#FFD600" },
                  "&.Mui-focused fieldset": { borderColor: "#FFD600" },
                },
              }}
            />

            {/* Time Range Selector */}
            <FormControl sx={{ mb: 3, minWidth: 200 }}>
              <InputLabel sx={{ color: "#B0B0B0" }}>Time Range</InputLabel>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                label="Time Range"
                sx={{
                  color: "#FFF",
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
                <MenuItem value="1hour">Last Hour</MenuItem>
                <MenuItem value="6hours">Last 6 Hours</MenuItem>
                <MenuItem value="24hours">Last 24 Hours</MenuItem>
                <MenuItem value="7days">Last 7 Days</MenuItem>
                <MenuItem value="30days">Last 30 Days</MenuItem>
              </Select>
            </FormControl>

            {/* Severity Filters */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: "#B0B0B0", mb: 1 }}>
                Filter by Severity
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {(["critical", "high", "medium", "low"] as AlertSeverity[]).map(
                  (severity) => (
                    <Chip
                      key={severity}
                      label={severity.toUpperCase()}
                      onClick={() => toggleSeverity(severity)}
                      color={
                        selectedSeverity.includes(severity)
                          ? "primary"
                          : "default"
                      }
                      variant={
                        selectedSeverity.includes(severity)
                          ? "filled"
                          : "outlined"
                      }
                      sx={{
                        backgroundColor: selectedSeverity.includes(severity)
                          ? "#FFD600"
                          : "transparent",
                        color: selectedSeverity.includes(severity)
                          ? "#000"
                          : "#B0B0B0",
                        borderColor: "#2B2B2B",
                        cursor: "pointer",
                        "&:hover": {
                          backgroundColor: selectedSeverity.includes(severity)
                            ? "#FFD600"
                            : "#2B2B2B",
                        },
                      }}
                    />
                  ),
                )}
                <Chip
                  label="ACKNOWLEDGED"
                  onClick={() => setShowAcknowledged(!showAcknowledged)}
                  color={showAcknowledged ? "primary" : "default"}
                  variant={showAcknowledged ? "filled" : "outlined"}
                  sx={{
                    backgroundColor: showAcknowledged
                      ? "#4CAF50"
                      : "transparent",
                    color: showAcknowledged ? "#000" : "#B0B0B0",
                    borderColor: "#2B2B2B",
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor: showAcknowledged ? "#4CAF50" : "#2B2B2B",
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadAlerts}
                sx={{
                  borderColor: "#FFD600",
                  color: "#FFD600",
                  "&:hover": {
                    borderColor: "#FFD600",
                    backgroundColor: "#FFD60020",
                  },
                }}
              >
                Refresh
              </Button>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={clearFilters}
                sx={{
                  borderColor: "#B0B0B0",
                  color: "#B0B0B0",
                  "&:hover": {
                    borderColor: "#B0B0B0",
                    backgroundColor: "#B0B0B020",
                  },
                }}
              >
                Clear Filters
              </Button>
            </Box>
          </Paper>

          <Grid container spacing={3}>
            {/* Alert List */}
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  backgroundColor: "#1A1A1A",
                  border: "1px solid #2B2B2B",
                  maxHeight: "600px",
                  overflow: "auto",
                }}
              >
                <Box sx={{ p: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "#FFD600", mb: 2 }}
                  >
                    Recent Alerts ({alerts.length})
                  </Typography>
                </Box>
                <Divider sx={{ borderColor: "#2B2B2B" }} />
                {alerts.map((alert) => (
                  <Box
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    sx={{
                      p: 2,
                      cursor: "pointer",
                      backgroundColor:
                        selectedAlert?.id === alert.id
                          ? "#2B2B2B"
                          : "transparent",
                      borderLeft:
                        selectedAlert?.id === alert.id
                          ? "4px solid #FFD600"
                          : "none",
                      "&:hover": { backgroundColor: "#2B2B2B" },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        mb: 1,
                      }}
                    >
                      <Chip
                        label={alert.severity}
                        color={getSeverityColor(alert.severity)}
                        size="small"
                        variant="outlined"
                      />
                      <Typography variant="caption" sx={{ color: "#B0B0B0" }}>
                        {new Date(alert.created_at).toLocaleTimeString()}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#FFD600",
                        fontFamily: "monospace",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        textDecoration: "underline",
                        "&:hover": { color: "#FFF" },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleIPClick(alert.source_ip);
                      }}
                    >
                      {alert.source_ip}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#B0B0B0" }}>
                      {alert.detection_type}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            </Grid>

            {/* Alert Details */}
            <Grid item xs={12} md={8}>
              {selectedAlert ? (
                <Box>
                  {/* Main Details */}
                  <Paper
                    sx={{
                      backgroundColor: "#1A1A1A",
                      border: "1px solid #2B2B2B",
                      p: 3,
                      mb: 3,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 3,
                      }}
                    >
                      <Box>
                        <Typography
                          variant="h5"
                          sx={{ color: "#FFD600", fontWeight: 700, mb: 1 }}
                        >
                          {selectedAlert.detection_type}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#B0B0B0" }}>
                          Alert ID: {selectedAlert.id}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Chip
                          label={selectedAlert.severity}
                          color={getSeverityColor(selectedAlert.severity)}
                          variant="outlined"
                        />
                        <Chip
                          label={
                            selectedAlert.is_acknowledged
                              ? "✓ Acknowledged"
                              : "New"
                          }
                          sx={{
                            backgroundColor: selectedAlert.is_acknowledged
                              ? "#4CAF50"
                              : "#FFD600",
                            color: "#000",
                          }}
                        />
                      </Box>
                    </Box>

                    <Divider sx={{ borderColor: "#2B2B2B", my: 2 }} />

                    {/* Network Information */}
                    <Typography
                      variant="h6"
                      sx={{ color: "#FFD600", fontWeight: 700, mb: 2 }}
                    >
                      Network Information
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      {[
                        {
                          label: "Source IP",
                          value: selectedAlert.source_ip,
                          isIP: true,
                        },
                        {
                          label: "Source Port",
                          value: selectedAlert.source_port,
                          isIP: false,
                        },
                        {
                          label: "Destination IP",
                          value: selectedAlert.destination_ip,
                          isIP: true,
                        },
                        {
                          label: "Destination Port",
                          value: selectedAlert.destination_port,
                          isIP: false,
                        },
                        {
                          label: "Protocol",
                          value: selectedAlert.protocol,
                          isIP: false,
                        },
                        {
                          label: "Protocol Info",
                          value: selectedAlert.protocol_info,
                          isIP: false,
                        },
                      ].map((item) => (
                        <Grid item xs={12} sm={6} key={item.label}>
                          <Typography
                            variant="body2"
                            sx={{ color: "#B0B0B0", mb: 0.5 }}
                          >
                            {item.label}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: item.isIP ? "#FFD600" : "#FFF",
                              fontFamily: "monospace",
                              cursor: item.isIP ? "pointer" : "default",
                              textDecoration: item.isIP ? "underline" : "none",
                              "&:hover": item.isIP ? { color: "#FFF" } : {},
                            }}
                            onClick={
                              item.isIP && item.value
                                ? () => handleIPClick(String(item.value))
                                : undefined
                            }
                          >
                            {item.value}
                          </Typography>
                        </Grid>
                      ))}
                    </Grid>

                    <Divider sx={{ borderColor: "#2B2B2B", my: 2 }} />

                    {/* Threat Assessment */}
                    <Typography
                      variant="h6"
                      sx={{ color: "#FFD600", fontWeight: 700, mb: 2 }}
                    >
                      Threat Assessment
                    </Typography>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      {[
                        {
                          label: "Risk Score",
                          value: `${selectedAlert.event_count ? selectedAlert.event_count * 10 : 50}/100`,
                        },
                        {
                          label: "Event Count",
                          value: selectedAlert.event_count || 1,
                        },
                        { label: "Country", value: "Unknown" },
                        { label: "City", value: "Unknown" },
                      ].map((item) => (
                        <Grid item xs={12} sm={6} key={item.label}>
                          <Typography
                            variant="body2"
                            sx={{ color: "#B0B0B0", mb: 0.5 }}
                          >
                            {item.label}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#FFF" }}>
                            {item.value}
                          </Typography>
                        </Grid>
                      ))}
                    </Grid>

                    <Divider sx={{ borderColor: "#2B2B2B", my: 2 }} />

                    {/* Payload */}
                    <Typography
                      variant="h6"
                      sx={{ color: "#FFD600", fontWeight: 700, mb: 2 }}
                    >
                      Payload Snippet
                    </Typography>
                    <Paper
                      sx={{
                        backgroundColor: "#0D0D0D",
                        p: 2,
                        mb: 3,
                        border: "1px solid #2B2B2B",
                        overflow: "auto",
                        maxHeight: "200px",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#FFD600",
                          fontFamily: "monospace",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-all",
                          fontSize: "0.75rem",
                        }}
                      >
                        {selectedAlert.payload_snippet ||
                          "No payload available"}
                      </Typography>
                    </Paper>

                    {/* Timestamps */}
                    <Typography variant="body2" sx={{ color: "#B0B0B0" }}>
                      Created:{" "}
                      {new Date(selectedAlert.created_at).toLocaleString()}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#B0B0B0" }}>
                      Updated:{" "}
                      {new Date(selectedAlert.updated_at).toLocaleString()}
                    </Typography>
                  </Paper>

                  {/* Actions */}
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: selectedAlert.is_acknowledged
                          ? "#4CAF50"
                          : "#FFD600",
                        color: "#000",
                        fontWeight: 700,
                        "&:hover": {
                          backgroundColor: selectedAlert.is_acknowledged
                            ? "#45A049"
                            : "#F9A825",
                        },
                      }}
                      onClick={() =>
                        handleAcknowledgeAlert(selectedAlert.id.toString())
                      }
                      disabled={selectedAlert.is_acknowledged}
                    >
                      {selectedAlert.is_acknowledged
                        ? "Acknowledged"
                        : "Acknowledge Alert"}
                    </Button>
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: "#FFD600",
                        color: "#000",
                        fontWeight: 700,
                      }}
                      onClick={() => setOpenDialog(true)}
                    >
                      Add Notes
                    </Button>
                    <Button
                      variant="outlined"
                      sx={{ borderColor: "#FFD600", color: "#FFD600" }}
                    >
                      Export Report
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Paper
                  sx={{
                    backgroundColor: "#1A1A1A",
                    border: "1px solid #2B2B2B",
                    p: 3,
                  }}
                >
                  <Typography sx={{ color: "#B0B0B0", textAlign: "center" }}>
                    Select an alert to view details
                  </Typography>
                </Paper>
              )}
            </Grid>
          </Grid>

          {/* Notes Dialog */}
          <Dialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ backgroundColor: "#1A1A1A", color: "#FFD600" }}>
              Add Notes to Alert
            </DialogTitle>
            <DialogContent sx={{ backgroundColor: "#1A1A1A", mt: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Add your analysis notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "#FFF",
                    "& fieldset": { borderColor: "#2B2B2B" },
                  },
                }}
              />
            </DialogContent>
            <DialogActions sx={{ backgroundColor: "#1A1A1A", p: 2 }}>
              <Button
                onClick={() => setOpenDialog(false)}
                sx={{ color: "#B0B0B0" }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setOpenDialog(false);
                  setNotes("");
                }}
                sx={{
                  backgroundColor: "#FFD600",
                  color: "#000",
                  fontWeight: 700,
                }}
              >
                Save Notes
              </Button>
            </DialogActions>
          </Dialog>

          {/* IP Management Modal */}
          <IPManagementModal
            open={ipManagementModal.open}
            onClose={handleIPManagementClose}
            ip={ipManagementModal.ip}
            onActionComplete={() => {
              // Refresh alerts after IP action
              loadAlerts();
            }}
          />
        </Container>
      </Layout>
    </Providers>
  );
}
