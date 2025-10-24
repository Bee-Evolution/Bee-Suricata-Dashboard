"use client";

import {
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  LockOpen as UnlockIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  Paper,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import Layout from "@/components/layout";
import apiService from "@/services/api";
import type {
  IPAddress,
  IPManagementStats,
  LoginAttempt,
} from "@/types/ip-management";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ip-management-tabpanel-${index}`}
      aria-labelledby={`ip-management-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function IPManagementPage() {
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState<IPManagementStats | null>(null);
  const [allIPs, setAllIPs] = useState<IPAddress[]>([]);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIP, setSelectedIP] = useState<IPAddress | null>(null);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [autoBlockEnabled, setAutoBlockEnabled] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, ipsRes, attemptsRes] = await Promise.all([
        apiService.getIPManagementStats(),
        apiService.getAllIPs(),
        apiService.getLoginAttempts(),
      ]);

      setStats(statsRes.data || statsRes);
      setAllIPs(ipsRes.data || ipsRes || []);
      setLoginAttempts(attemptsRes.data || attemptsRes || []);
      setError(null);
    } catch (err) {
      setError("Failed to fetch IP management data");
      console.error("Error fetching data:", err);
      // Set empty arrays as fallback
      setAllIPs([]);
      setLoginAttempts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleBlockIP = async (ip: string, reason: string) => {
    try {
      await apiService.blockIP({ ip, blockType: "temporary", reason });
      setBlockDialogOpen(false);
      setBlockReason("");
      fetchData();
    } catch (_err) {
      setError("Failed to block IP address");
    }
  };

  const handleUnblockIP = async (ip: string) => {
    try {
      await apiService.unblockIP(ip);
      fetchData();
    } catch (_err) {
      setError("Failed to unblock IP address");
    }
  };

  const handleWhitelistIP = async (ip: string) => {
    try {
      await apiService.whitelistIP({ ip, reason: "Whitelisted by admin" });
      fetchData();
    } catch (_err) {
      setError("Failed to whitelist IP address");
    }
  };

  const handlePermanentBlock = async (ip: string) => {
    try {
      await apiService.blockIP({
        ip,
        blockType: "permanent",
        reason: "Permanently blocked due to repeated violations",
      });
      fetchData();
    } catch (_err) {
      setError("Failed to permanently block IP address");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "blocked":
        return "error";
      case "whitelisted":
        return "success";
      case "monitored":
        return "warning";
      default:
        return "default";
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 80) return "error";
    if (riskScore >= 60) return "warning";
    if (riskScore >= 40) return "info";
    return "success";
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ p: 3 }}>
          <Typography>Loading IP Management data...</Typography>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "start",
          }}
        >
          <Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                color: "#FFD600",
                mb: 1,
                letterSpacing: "-0.02em",
              }}
            >
              IP Management & Authentication Security
            </Typography>
            <Typography variant="body1" sx={{ color: "#B0B0B0" }}>
              Monitor and manage IP addresses, track login attempts, and
              configure security policies
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        {stats && (
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 3,
                    background: `linear-gradient(135deg, #1A1A1A 0%, #2B2B2B 100%)`,
                    border: `2px solid #FFD600`,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    minHeight: 120,
                  }}
                >
                  <Box sx={{ color: "#FFD600", fontSize: 32 }}>
                    <SecurityIcon />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: "#B0B0B0", mb: 0.5 }}
                    >
                      Total IPs
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ color: "#E0E0E0", fontWeight: 700 }}
                    >
                      {stats.totalIPs}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 3,
                    background: `linear-gradient(135deg, #1A1A1A 0%, #2B2B2B 100%)`,
                    border: `2px solid #F44336`,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    minHeight: 120,
                  }}
                >
                  <Box sx={{ color: "#F44336", fontSize: 32 }}>
                    <BlockIcon />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: "#B0B0B0", mb: 0.5 }}
                    >
                      Blocked IPs
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ color: "#E0E0E0", fontWeight: 700 }}
                    >
                      {stats.blockedIPs}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 3,
                    background: `linear-gradient(135deg, #1A1A1A 0%, #2B2B2B 100%)`,
                    border: `2px solid #FF9800`,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    minHeight: 120,
                  }}
                >
                  <Box sx={{ color: "#FF9800", fontSize: 32 }}>
                    <WarningIcon />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: "#B0B0B0", mb: 0.5 }}
                    >
                      Failed Logins
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ color: "#E0E0E0", fontWeight: 700 }}
                    >
                      {stats.failedAttempts || 0}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  sx={{
                    p: 3,
                    background: `linear-gradient(135deg, #1A1A1A 0%, #2B2B2B 100%)`,
                    border: `2px solid #4CAF50`,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    minHeight: 120,
                  }}
                >
                  <Box sx={{ color: "#4CAF50", fontSize: 32 }}>
                    <CheckCircleIcon />
                  </Box>
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{ color: "#B0B0B0", mb: 0.5 }}
                    >
                      Whitelisted
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ color: "#E0E0E0", fontWeight: 700 }}
                    >
                      {stats.whitelistedIPs}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Auto Block Toggle */}
        <Paper
          sx={{
            p: 3,
            backgroundColor: "#1A1A1A",
            border: "1px solid #2B2B2B",
            borderRadius: 2,
            mb: 4,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{ color: "#FFD600", mb: 1, fontWeight: 700 }}
              >
                Auto Block System
              </Typography>
              <Typography variant="body2" sx={{ color: "#B0B0B0" }}>
                Automatically block IPs after 3 failed login attempts
              </Typography>
            </Box>
            <FormControlLabel
              control={
                <Switch
                  checked={autoBlockEnabled}
                  onChange={(e) => setAutoBlockEnabled(e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#FFD600",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#FFD600",
                    },
                  }}
                />
              }
              label=""
            />
          </Box>
        </Paper>

        {/* Tabs */}
        <Paper
          sx={{
            backgroundColor: "#1A1A1A",
            border: "1px solid #2B2B2B",
            borderRadius: 2,
            mb: 4,
          }}
        >
          <Box sx={{ borderBottom: 1, borderColor: "#2B2B2B" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{
                "& .MuiTab-root": {
                  color: "#B0B0B0",
                  "&.Mui-selected": {
                    color: "#FFD600",
                  },
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: "#FFD600",
                },
              }}
            >
              <Tab label="IP Addresses" />
              <Tab label="Login Attempts" />
              <Tab label="Authentication Security" />
            </Tabs>
          </Box>

          {/* IP Addresses Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{ color: "#FFD600", fontWeight: 700 }}
              >
                IP Address Management
              </Typography>
              <Button
                startIcon={<RefreshIcon />}
                onClick={fetchData}
                sx={{
                  color: "#FFD600",
                  borderColor: "#FFD600",
                  "&:hover": {
                    borderColor: "#F9A825",
                    backgroundColor: "#FFD60020",
                  },
                }}
                variant="outlined"
              >
                Refresh
              </Button>
            </Box>

            <TableContainer
              component={Paper}
              sx={{ backgroundColor: "#0D0D0D", border: "1px solid #2B2B2B" }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "#FFD600", fontWeight: 600 }}>
                      IP Address
                    </TableCell>
                    <TableCell sx={{ color: "#FFD600", fontWeight: 600 }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ color: "#FFD600", fontWeight: 600 }}>
                      Risk Score
                    </TableCell>
                    <TableCell sx={{ color: "#FFD600", fontWeight: 600 }}>
                      Location
                    </TableCell>
                    <TableCell sx={{ color: "#FFD600", fontWeight: 600 }}>
                      Last Seen
                    </TableCell>
                    <TableCell sx={{ color: "#FFD600", fontWeight: 600 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {allIPs.map((ip) => (
                    <TableRow key={ip.ip}>
                      <TableCell sx={{ color: "#E0E0E0" }}>{ip.ip}</TableCell>
                      <TableCell>
                        <Chip
                          label={
                            ip.isBlocked
                              ? "blocked"
                              : ip.isWhitelisted
                                ? "whitelisted"
                                : "monitored"
                          }
                          color={
                            getStatusColor(
                              ip.isBlocked
                                ? "blocked"
                                : ip.isWhitelisted
                                  ? "whitelisted"
                                  : "monitored",
                            ) as any
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${ip.riskScore}%`}
                          color={getRiskColor(ip.riskScore) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ color: "#E0E0E0" }}>
                        {ip.country || "Unknown"}
                      </TableCell>
                      <TableCell sx={{ color: "#E0E0E0" }}>
                        {new Date(ip.lastSeen).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          {ip.isBlocked ? (
                            <Tooltip title="Unblock IP">
                              <IconButton
                                size="small"
                                onClick={() => handleUnblockIP(ip.ip)}
                                sx={{ color: "#4CAF50" }}
                              >
                                <UnlockIcon />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <>
                              <Tooltip title="Block IP">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedIP(ip);
                                    setBlockDialogOpen(true);
                                  }}
                                  sx={{ color: "#F44336" }}
                                >
                                  <BlockIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Permanent Block">
                                <IconButton
                                  size="small"
                                  onClick={() => handlePermanentBlock(ip.ip)}
                                  sx={{ color: "#D32F2F" }}
                                >
                                  <LockIcon />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          <Tooltip title="Whitelist IP">
                            <IconButton
                              size="small"
                              onClick={() => handleWhitelistIP(ip.ip)}
                              sx={{ color: "#4CAF50" }}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Login Attempts Tab */}
          <TabPanel value={tabValue} index={1}>
            <Typography
              variant="h6"
              sx={{ color: "#FFD600", mb: 2, fontWeight: 700 }}
            >
              Recent Login Attempts
            </Typography>

            <TableContainer
              component={Paper}
              sx={{ backgroundColor: "#0D0D0D", border: "1px solid #2B2B2B" }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "#FFD600", fontWeight: 600 }}>
                      IP Address
                    </TableCell>
                    <TableCell sx={{ color: "#FFD600", fontWeight: 600 }}>
                      Username
                    </TableCell>
                    <TableCell sx={{ color: "#FFD600", fontWeight: 600 }}>
                      Status
                    </TableCell>
                    <TableCell sx={{ color: "#FFD600", fontWeight: 600 }}>
                      Attempts
                    </TableCell>
                    <TableCell sx={{ color: "#FFD600", fontWeight: 600 }}>
                      Last Attempt
                    </TableCell>
                    <TableCell sx={{ color: "#FFD600", fontWeight: 600 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loginAttempts.map((attempt, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ color: "#E0E0E0" }}>
                        {attempt.ip}
                      </TableCell>
                      <TableCell sx={{ color: "#E0E0E0" }}>
                        {attempt.username}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={attempt.success ? "Success" : "Failed"}
                          color={attempt.success ? "success" : "error"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell sx={{ color: "#E0E0E0" }}>
                        {attempt.attemptCount}
                      </TableCell>
                      <TableCell sx={{ color: "#E0E0E0" }}>
                        {new Date(attempt.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          {attempt.attemptCount >= 3 && !attempt.success && (
                            <Tooltip title="Block IP">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedIP({
                                    id: `temp-${attempt.ip}`,
                                    ip: attempt.ip,
                                    isBlocked: false,
                                    isWhitelisted: false,
                                    riskScore: 0,
                                    lastSeen: new Date().toISOString(),
                                    type: "source",
                                    alertCount: 0,
                                  });
                                  setBlockReason(
                                    "Multiple failed login attempts",
                                  );
                                  setBlockDialogOpen(true);
                                }}
                                sx={{ color: "#F44336" }}
                              >
                                <BlockIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => {
                                // TODO: Implement IP details modal
                              }}
                              sx={{ color: "#FFD600" }}
                            >
                              <PersonIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Authentication Security Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography
              variant="h6"
              sx={{ color: "#FFD600", mb: 2, fontWeight: 700 }}
            >
              Authentication Security Settings
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    p: 3,
                    backgroundColor: "#1A1A1A",
                    border: "1px solid #2B2B2B",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ color: "#FFD600", mb: 2, fontWeight: 700 }}
                  >
                    Login Protection
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Enable auto-block after 3 failed attempts"
                      sx={{ color: "#E0E0E0" }}
                    />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Permanent block after 5 failed attempts"
                      sx={{ color: "#E0E0E0" }}
                    />
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <FormControlLabel
                      control={<Switch />}
                      label="Email notifications for blocked IPs"
                      sx={{ color: "#E0E0E0" }}
                    />
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper
                  sx={{
                    p: 3,
                    backgroundColor: "#1A1A1A",
                    border: "1px solid #2B2B2B",
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ color: "#FFD600", mb: 2, fontWeight: 700 }}
                  >
                    Security Statistics
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Total blocked IPs today:{" "}
                      <strong style={{ color: "#F44336" }}>12</strong>
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Failed login attempts today:{" "}
                      <strong style={{ color: "#FF9800" }}>47</strong>
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Auto-blocked IPs:{" "}
                      <strong style={{ color: "#F44336" }}>8</strong>
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Manually unblocked:{" "}
                      <strong style={{ color: "#4CAF50" }}>3</strong>
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </TabPanel>
        </Paper>

        {/* Block IP Dialog */}
        <Dialog
          open={blockDialogOpen}
          onClose={() => setBlockDialogOpen(false)}
        >
          <DialogTitle sx={{ color: "#FFD600" }}>Block IP Address</DialogTitle>
          <DialogContent>
            <Typography sx={{ mb: 2 }}>
              Block IP: <strong>{selectedIP?.ip}</strong>
            </Typography>
            <TextField
              autoFocus
              margin="dense"
              label="Reason for blocking"
              fullWidth
              variant="outlined"
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBlockDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={() =>
                selectedIP && handleBlockIP(selectedIP.ip, blockReason)
              }
              variant="contained"
              sx={{ backgroundColor: "#F44336" }}
            >
              Block IP
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
}
