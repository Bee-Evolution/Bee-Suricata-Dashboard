"use client";

import {
  CheckCircle as CheckIcon,
  NetworkCheck as NetworkIcon,
  Security as SecurityIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { Providers } from "@/app/providers";
import Layout from "@/components/layout";
import apiService from "@/services/api";

interface ProtocolStats {
  protocol: string;
  total_alerts: number;
  critical_alerts: number;
  high_alerts: number;
  medium_alerts: number;
  low_alerts: number;
  last_alert: string;
  risk_level: "low" | "medium" | "high" | "critical";
}

const protocols = [
  {
    name: "HTTP",
    description: "Hypertext Transfer Protocol - Web traffic monitoring",
    icon: "🌐",
    color: "#2196F3",
  },
  {
    name: "FTP",
    description: "File Transfer Protocol - File transfer monitoring",
    icon: "📁",
    color: "#FF9800",
  },
  {
    name: "SSH",
    description: "Secure Shell - Remote access monitoring",
    icon: "🔐",
    color: "#4CAF50",
  },
  {
    name: "POP3",
    description: "Post Office Protocol - Email monitoring",
    icon: "📧",
    color: "#9C27B0",
  },
  {
    name: "IMAP",
    description: "Internet Message Access Protocol - Email monitoring",
    icon: "📬",
    color: "#E91E63",
  },
  {
    name: "Telnet",
    description: "Teletype Network - Remote terminal monitoring",
    icon: "🖥️",
    color: "#F44336",
  },
  {
    name: "SMB",
    description: "Server Message Block - File sharing monitoring",
    icon: "💾",
    color: "#607D8B",
  },
  {
    name: "NTLM",
    description: "NT LAN Manager - Authentication monitoring",
    icon: "🔑",
    color: "#795548",
  },
];

export default function ProtocolScreen() {
  const [protocolStats, setProtocolStats] = useState<ProtocolStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProtocolStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch real protocol statistics from backend
      const response = await apiService.getProtocolStatistics();

      if (response.data && Array.isArray(response.data)) {
        setProtocolStats(response.data);
      } else {
        // Fallback to mock data if API returns unexpected format
        const mockStats: ProtocolStats[] = protocols.map(
          (protocol, _index) => ({
            protocol: protocol.name,
            total_alerts: Math.floor(Math.random() * 100) + 10,
            critical_alerts: Math.floor(Math.random() * 10),
            high_alerts: Math.floor(Math.random() * 20) + 5,
            medium_alerts: Math.floor(Math.random() * 30) + 10,
            low_alerts: Math.floor(Math.random() * 40) + 5,
            last_alert: new Date(
              Date.now() - Math.random() * 86400000,
            ).toISOString(),
            risk_level: ["low", "medium", "high", "critical"][
              Math.floor(Math.random() * 4)
            ] as any,
          }),
        );

        setProtocolStats(mockStats);
      }
    } catch (error) {
      console.error("Error loading protocol stats:", error);
      setError("Failed to load protocol statistics");

      // Fallback to mock data on error
      const mockStats: ProtocolStats[] = protocols.map((protocol, _index) => ({
        protocol: protocol.name,
        total_alerts: Math.floor(Math.random() * 100) + 10,
        critical_alerts: Math.floor(Math.random() * 10),
        high_alerts: Math.floor(Math.random() * 20) + 5,
        medium_alerts: Math.floor(Math.random() * 30) + 10,
        low_alerts: Math.floor(Math.random() * 40) + 5,
        last_alert: new Date(
          Date.now() - Math.random() * 86400000,
        ).toISOString(),
        risk_level: ["low", "medium", "high", "critical"][
          Math.floor(Math.random() * 4)
        ] as any,
      }));

      setProtocolStats(mockStats);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProtocolStats();
  }, [loadProtocolStats]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "critical":
        return "#F44336";
      case "high":
        return "#FF9800";
      case "medium":
        return "#FFC107";
      case "low":
        return "#4CAF50";
      default:
        return "#B0B0B0";
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "critical":
        return <WarningIcon sx={{ color: "#F44336" }} />;
      case "high":
        return <WarningIcon sx={{ color: "#FF9800" }} />;
      case "medium":
        return <NetworkIcon sx={{ color: "#FFC107" }} />;
      case "low":
        return <CheckIcon sx={{ color: "#4CAF50" }} />;
      default:
        return <NetworkIcon sx={{ color: "#B0B0B0" }} />;
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
              <LinearProgress sx={{ width: "100%", color: "#FFD600" }} />
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
              🔍 Protocol Analysis
            </Typography>
            <Typography variant="body1" sx={{ color: "#B0B0B0" }}>
              Protocol-specific attack detection and monitoring
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Protocol Cards */}
          <Grid container spacing={3}>
            {protocols.map((protocol, _index) => {
              const stats = protocolStats.find(
                (s) => s.protocol === protocol.name,
              );
              const totalAlerts = stats?.total_alerts || 0;
              const riskLevel = stats?.risk_level || "low";

              return (
                <Grid item xs={12} sm={6} md={4} key={protocol.name}>
                  <Card
                    sx={{
                      backgroundColor: "#1A1A1A",
                      border: "1px solid #2B2B2B",
                      borderRadius: 2,
                      height: "100%",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        borderColor: protocol.color,
                        transform: "translateY(-2px)",
                        boxShadow: `0 4px 20px ${protocol.color}20`,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      {/* Header */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography sx={{ fontSize: "2rem" }}>
                            {protocol.icon}
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{
                              color: protocol.color,
                              fontWeight: 700,
                            }}
                          >
                            {protocol.name}
                          </Typography>
                        </Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {getRiskIcon(riskLevel)}
                          <Chip
                            label={riskLevel.toUpperCase()}
                            size="small"
                            sx={{
                              backgroundColor: `${getRiskColor(riskLevel)}20`,
                              color: getRiskColor(riskLevel),
                              border: `1px solid ${getRiskColor(riskLevel)}40`,
                              fontWeight: 700,
                            }}
                          />
                        </Box>
                      </Box>

                      {/* Description */}
                      <Typography
                        variant="body2"
                        sx={{
                          color: "#B0B0B0",
                          mb: 3,
                          lineHeight: 1.4,
                        }}
                      >
                        {protocol.description}
                      </Typography>

                      <Divider sx={{ borderColor: "#2B2B2B", mb: 2 }} />

                      {/* Statistics */}
                      <Box sx={{ mb: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{ color: "#B0B0B0", mb: 1 }}
                        >
                          Total Alerts
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{
                            color: protocol.color,
                            fontWeight: 700,
                          }}
                        >
                          {totalAlerts.toLocaleString()}
                        </Typography>
                      </Box>

                      {/* Alert Breakdown */}
                      {stats && (
                        <Box sx={{ mb: 2 }}>
                          <Grid container spacing={1}>
                            {[
                              {
                                label: "Critical",
                                value: stats.critical_alerts,
                                color: "#F44336",
                              },
                              {
                                label: "High",
                                value: stats.high_alerts,
                                color: "#FF9800",
                              },
                              {
                                label: "Medium",
                                value: stats.medium_alerts,
                                color: "#FFC107",
                              },
                              {
                                label: "Low",
                                value: stats.low_alerts,
                                color: "#4CAF50",
                              },
                            ].map((item) => (
                              <Grid item xs={6} key={item.label}>
                                <Box sx={{ textAlign: "center" }}>
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      color: item.color,
                                      fontWeight: 700,
                                      fontSize: "1.1rem",
                                    }}
                                  >
                                    {item.value}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: "#B0B0B0",
                                      fontSize: "0.7rem",
                                    }}
                                  >
                                    {item.label}
                                  </Typography>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}

                      {/* Last Alert */}
                      {stats && (
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{ color: "#B0B0B0" }}
                          >
                            Last Alert:{" "}
                            {new Date(stats.last_alert).toLocaleString()}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Summary Section */}
          <Box sx={{ mt: 4 }}>
            <Paper
              sx={{
                backgroundColor: "#1A1A1A",
                border: "1px solid #2B2B2B",
                p: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#FFD600", mb: 2 }}
              >
                Protocol Monitoring Summary
              </Typography>
              <Typography variant="body2" sx={{ color: "#B0B0B0", mb: 2 }}>
                Our system monitors multiple network protocols for
                authentication attacks and suspicious activity:
              </Typography>
              <Grid container spacing={2}>
                {[
                  {
                    protocol: "HTTP/HTTPS",
                    purpose: "Web application attacks, credential harvesting",
                  },
                  {
                    protocol: "FTP",
                    purpose: "File transfer attacks, credential theft",
                  },
                  {
                    protocol: "SSH",
                    purpose: "Brute-force attacks, unauthorized access",
                  },
                  {
                    protocol: "Email (POP3/IMAP)",
                    purpose: "Email credential attacks, phishing",
                  },
                  {
                    protocol: "Telnet",
                    purpose: "Cleartext authentication, credential exposure",
                  },
                  {
                    protocol: "SMB/NTLM",
                    purpose: "Windows authentication attacks, lateral movement",
                  },
                ].map((item) => (
                  <Grid item xs={12} md={6} key={item.protocol}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <SecurityIcon
                        sx={{ color: "#FFD600", fontSize: "1rem" }}
                      />
                      <Typography
                        variant="body2"
                        sx={{ color: "#FFF", fontWeight: 600 }}
                      >
                        {item.protocol}
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{ color: "#B0B0B0", ml: 3 }}
                    >
                      {item.purpose}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Box>
        </Container>
      </Layout>
    </Providers>
  );
}
