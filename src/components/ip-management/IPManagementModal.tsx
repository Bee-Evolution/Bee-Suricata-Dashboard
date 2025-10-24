"use client";

import {
  Block as BlockIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  LocationOn as LocationIcon,
  Security as SecurityIcon,
  AccessTime as TimeIcon,
  Warning as WarningIcon,
  CheckCircle as WhitelistIcon,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import {
  BLOCK_REASONS,
  type IPDetails,
  WHITELIST_REASONS,
} from "@/types/ip-management";

interface IPManagementModalProps {
  open: boolean;
  onClose: () => void;
  ip: string;
  onActionComplete?: () => void;
}

export const IPManagementModal: React.FC<IPManagementModalProps> = ({
  open,
  onClose,
  ip,
  onActionComplete,
}) => {
  const [ipDetails, setIpDetails] = useState<IPDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [showWhitelistForm, setShowWhitelistForm] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [blockDuration, setBlockDuration] = useState(24);
  const [blockType, setBlockType] = useState<"temporary" | "permanent">(
    "temporary",
  );
  const [whitelistReason, setWhitelistReason] = useState("");

  const fetchIPDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();

      if (!supabase) {
        setError("Database not configured");
        setLoading(false);
        return;
      }

      // Fetch IP management record
      const { data: ipData, error: ipError } = await supabase
        .from("ip_management")
        .select("*")
        .eq("ip_address", ip)
        .single();

      if (ipError && ipError.code !== "PGRST116") {
        // PGRST116 = no rows found
        throw ipError;
      }

      // Fetch related alerts for this IP
      const { data: alertsData, error: alertsError } = await supabase
        .from("security_alerts")
        .select("*")
        .or(`src_ip.eq.${ip},dest_ip.eq.${ip}`)
        .order("timestamp", { ascending: false })
        .limit(10);

      if (alertsError) {
        console.error("Error fetching alerts:", alertsError);
      }

      // Build IP details object
      const details: IPDetails = {
        ip,
        isBlocked: ipData?.is_blocked || false,
        isWhitelisted: ipData?.is_whitelisted || false,
        riskScore: ipData?.risk_score || 0,
        country: ipData?.country || "Unknown",
        city: ipData?.city || "Unknown",
        isp: ipData?.isp || "Unknown",
        organization: ipData?.asn || "Unknown",
        timezone: ipData?.region || "Unknown",
        lastSeen: ipData?.last_seen || new Date().toISOString(),
        blockReason: ipData?.block_reason,
        blockedAt: ipData?.blocked_until,
        alertCount: alertsData?.length || 0,
        loginAttempts: [],
        recentAlerts:
          alertsData?.map((alert: any) => ({
            id: alert.id,
            timestamp: alert.timestamp,
            severity: alert.severity || "unknown",
            attackType: alert.attack_type || "unknown",
            message: alert.message || "",
          })) || [],
      };

      setIpDetails(details);
    } catch (err: any) {
      console.error("Error fetching IP details:", err);
      setError(err.message || "Failed to fetch IP details");
    } finally {
      setLoading(false);
    }
  }, [ip]);

  useEffect(() => {
    if (open && ip) {
      fetchIPDetails();
    }
  }, [open, ip, fetchIPDetails]);

  const handleBlockIP = async () => {
    setActionLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();

      if (!supabase) {
        setError("Database not configured");
        setActionLoading(false);
        return;
      }

      const blockedUntil =
        blockType === "temporary"
          ? new Date(Date.now() + blockDuration * 60 * 60 * 1000).toISOString()
          : null;

      const { error: upsertError } = await supabase
        .from("ip_management")
        .upsert(
          {
            ip_address: ip,
            status: "blocked",
            is_blocked: true,
            is_whitelisted: false,
            block_reason: blockReason,
            blocked_until: blockedUntil,
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "ip_address",
          },
        );

      if (upsertError) {
        throw upsertError;
      }

      setSuccess(`IP ${ip} has been blocked successfully`);
      setShowBlockForm(false);
      fetchIPDetails();
      onActionComplete?.();
    } catch (err: any) {
      setError(err.message || "Failed to block IP");
    } finally {
      setActionLoading(false);
    }
  };

  const handleWhitelistIP = async () => {
    setActionLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();

      if (!supabase) {
        setError("Database not configured");
        setActionLoading(false);
        return;
      }

      const { error: upsertError } = await supabase
        .from("ip_management")
        .upsert(
          {
            ip_address: ip,
            status: "whitelisted",
            is_blocked: false,
            is_whitelisted: true,
            whitelist_reason: whitelistReason,
            blocked_until: null,
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "ip_address",
          },
        );

      if (upsertError) {
        throw upsertError;
      }

      setSuccess(`IP ${ip} has been whitelisted successfully`);
      setShowWhitelistForm(false);
      fetchIPDetails();
      onActionComplete?.();
    } catch (err: any) {
      setError(err.message || "Failed to whitelist IP");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblockIP = async () => {
    setActionLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();

      if (!supabase) {
        setError("Database not configured");
        setActionLoading(false);
        return;
      }

      const { error: updateError } = await supabase
        .from("ip_management")
        .update({
          status: "allowed",
          is_blocked: false,
          blocked_until: null,
          block_reason: null,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("ip_address", ip);

      if (updateError) {
        throw updateError;
      }

      setSuccess(`IP ${ip} has been unblocked successfully`);
      fetchIPDetails();
      onActionComplete?.();
    } catch (err: any) {
      setError(err.message || "Failed to unblock IP");
    } finally {
      setActionLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return "#f44336";
    if (score >= 60) return "#ff9800";
    if (score >= 40) return "#ffeb3b";
    return "#4caf50";
  };

  const _getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "#f44336";
      case "high":
        return "#ff5722";
      case "medium":
        return "#ff9800";
      case "low":
        return "#4caf50";
      default:
        return "#9e9e9e";
    }
  };

  const resetForms = () => {
    setShowBlockForm(false);
    setShowWhitelistForm(false);
    setBlockReason("");
    setBlockDuration(24);
    setBlockType("temporary");
    setWhitelistReason("");
    setError(null);
    setSuccess(null);
  };

  const handleClose = () => {
    resetForms();
    onClose();
  };

  if (!open) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "#1A1A1A",
          color: "#FFF",
          minHeight: "80vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: "#2B2B2B",
          color: "#FFD600",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pr: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SecurityIcon />
          <Typography variant="h6" component="div">
            IP Management: {ip}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: "#FFD600" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress sx={{ color: "#FFD600" }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : success ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        ) : ipDetails ? (
          <Box>
            {/* IP Status and Actions */}
            <Card sx={{ mb: 3, backgroundColor: "#2B2B2B" }}>
              <CardHeader
                title={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="h6" sx={{ color: "#FFD600" }}>
                      {ipDetails.ip}
                    </Typography>
                    <Chip
                      label={
                        ipDetails.isBlocked
                          ? "BLOCKED"
                          : ipDetails.isWhitelisted
                            ? "WHITELISTED"
                            : "ALLOWED"
                      }
                      color={
                        ipDetails.isBlocked
                          ? "error"
                          : ipDetails.isWhitelisted
                            ? "success"
                            : "default"
                      }
                      sx={{ fontWeight: "bold" }}
                    />
                    <Chip
                      label={`Risk: ${ipDetails.riskScore}/100`}
                      sx={{
                        backgroundColor: getRiskColor(ipDetails.riskScore),
                        color: "#FFF",
                        fontWeight: "bold",
                      }}
                    />
                  </Box>
                }
                action={
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {!ipDetails.isBlocked && !ipDetails.isWhitelisted && (
                      <>
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={<BlockIcon />}
                          onClick={() => setShowBlockForm(true)}
                          size="small"
                        >
                          Block
                        </Button>
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<WhitelistIcon />}
                          onClick={() => setShowWhitelistForm(true)}
                          size="small"
                        >
                          Whitelist
                        </Button>
                      </>
                    )}
                    {ipDetails.isBlocked && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleUnblockIP}
                        disabled={actionLoading}
                        size="small"
                      >
                        {actionLoading ? (
                          <CircularProgress size={20} />
                        ) : (
                          "Unblock"
                        )}
                      </Button>
                    )}
                  </Box>
                }
              />
            </Card>

            {/* IP Information */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <Card sx={{ backgroundColor: "#2B2B2B" }}>
                  <CardHeader title="Location Information" />
                  <CardContent>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <LocationIcon sx={{ color: "#FFD600" }} />
                        <Typography variant="body2">
                          <strong>Country:</strong>{" "}
                          {ipDetails.country || "Unknown"}
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <LocationIcon sx={{ color: "#FFD600" }} />
                        <Typography variant="body2">
                          <strong>City:</strong> {ipDetails.city || "Unknown"}
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <InfoIcon sx={{ color: "#FFD600" }} />
                        <Typography variant="body2">
                          <strong>ISP:</strong> {ipDetails.isp || "Unknown"}
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <InfoIcon sx={{ color: "#FFD600" }} />
                        <Typography variant="body2">
                          <strong>Organization:</strong>{" "}
                          {ipDetails.organization || "Unknown"}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ backgroundColor: "#2B2B2B" }}>
                  <CardHeader title="Security Information" />
                  <CardContent>
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <TimeIcon sx={{ color: "#FFD600" }} />
                        <Typography variant="body2">
                          <strong>Last Seen:</strong>{" "}
                          {formatTimestamp(ipDetails.lastSeen)}
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <WarningIcon sx={{ color: "#FFD600" }} />
                        <Typography variant="body2">
                          <strong>Alert Count:</strong> {ipDetails.alertCount}
                        </Typography>
                      </Box>
                      {ipDetails.isBlocked && ipDetails.blockReason && (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <BlockIcon sx={{ color: "#f44336" }} />
                          <Typography variant="body2">
                            <strong>Block Reason:</strong>{" "}
                            {ipDetails.blockReason}
                          </Typography>
                        </Box>
                      )}
                      {ipDetails.blockedAt && (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <TimeIcon sx={{ color: "#FFD600" }} />
                          <Typography variant="body2">
                            <strong>Blocked At:</strong>{" "}
                            {formatTimestamp(ipDetails.blockedAt)}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Login Attempts */}
            <Card sx={{ backgroundColor: "#2B2B2B", mb: 3 }}>
              <CardHeader title="Login Attempts" />
              <CardContent>
                {ipDetails.loginAttempts.length > 0 ? (
                  <List>
                    {ipDetails.loginAttempts.map(
                      (attempt: any, _index: number) => (
                        <ListItem
                          key={attempt.id}
                          sx={{ borderBottom: "1px solid #333" }}
                        >
                          <ListItemIcon>
                            <Avatar
                              sx={{
                                backgroundColor: attempt.success
                                  ? "#4caf50"
                                  : "#f44336",
                                width: 32,
                                height: 32,
                              }}
                            >
                              {attempt.success ? "✓" : "✗"}
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Typography variant="body1">
                                  {attempt.username}
                                </Typography>
                                <Chip
                                  label={attempt.success ? "Success" : "Failed"}
                                  size="small"
                                  color={attempt.success ? "success" : "error"}
                                />
                                {attempt.is_blocked && (
                                  <Chip
                                    label={
                                      attempt.block_type === "permanent"
                                        ? "Permanent Block"
                                        : "Temporary Block"
                                    }
                                    size="small"
                                    color="warning"
                                  />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {formatTimestamp(attempt.timestamp)} • Attempt
                                  #{attempt.attempt_count}
                                </Typography>
                                {attempt.user_agent && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {attempt.user_agent}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                      ),
                    )}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No login attempts recorded for this IP.
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Block Form */}
            {showBlockForm && (
              <Card sx={{ backgroundColor: "#2B2B2B", mb: 3 }}>
                <CardHeader title="Block IP Address" />
                <CardContent>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <FormControl fullWidth>
                      <InputLabel sx={{ color: "#B0B0B0" }}>
                        Block Type
                      </InputLabel>
                      <Select
                        value={blockType}
                        onChange={(e) =>
                          setBlockType(
                            e.target.value as "temporary" | "permanent",
                          )
                        }
                        sx={{ color: "#FFF" }}
                      >
                        <MenuItem value="temporary">Temporary</MenuItem>
                        <MenuItem value="permanent">Permanent</MenuItem>
                      </Select>
                    </FormControl>

                    {blockType === "temporary" && (
                      <TextField
                        label="Duration (hours)"
                        type="number"
                        value={blockDuration}
                        onChange={(e) =>
                          setBlockDuration(parseInt(e.target.value, 10) || 24)
                        }
                        sx={{ color: "#FFF" }}
                      />
                    )}

                    <FormControl fullWidth>
                      <InputLabel sx={{ color: "#B0B0B0" }}>Reason</InputLabel>
                      <Select
                        value={blockReason}
                        onChange={(e) => setBlockReason(e.target.value)}
                        sx={{ color: "#FFF" }}
                      >
                        {BLOCK_REASONS.map((reason) => (
                          <MenuItem key={reason} value={reason}>
                            {reason}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button onClick={() => setShowBlockForm(false)}>
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={handleBlockIP}
                        disabled={actionLoading || !blockReason}
                      >
                        {actionLoading ? (
                          <CircularProgress size={20} />
                        ) : (
                          "Block IP"
                        )}
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Whitelist Form */}
            {showWhitelistForm && (
              <Card sx={{ backgroundColor: "#2B2B2B", mb: 3 }}>
                <CardHeader title="Whitelist IP Address" />
                <CardContent>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                  >
                    <FormControl fullWidth>
                      <InputLabel sx={{ color: "#B0B0B0" }}>Reason</InputLabel>
                      <Select
                        value={whitelistReason}
                        onChange={(e) => setWhitelistReason(e.target.value)}
                        sx={{ color: "#FFF" }}
                      >
                        {WHITELIST_REASONS.map((reason) => (
                          <MenuItem key={reason} value={reason}>
                            {reason}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: "flex-end",
                      }}
                    >
                      <Button onClick={() => setShowWhitelistForm(false)}>
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={handleWhitelistIP}
                        disabled={actionLoading || !whitelistReason}
                      >
                        {actionLoading ? (
                          <CircularProgress size={20} />
                        ) : (
                          "Whitelist IP"
                        )}
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ backgroundColor: "#2B2B2B", p: 2 }}>
        <Button onClick={handleClose} sx={{ color: "#FFD600" }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
