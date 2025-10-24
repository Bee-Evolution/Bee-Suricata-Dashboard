"use client";

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
  FormControlLabel,
  Grid,
  LinearProgress,
  Paper,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { Providers } from "@/app/providers";
import Layout from "@/components/layout";
import { useConfig } from "@/contexts/ConfigContext";
import { useConnection } from "@/contexts/ConnectionContext";
import apiService from "@/services/api";

export default function SettingsPage() {
  const {
    config,
    updateConfig,
    resetToDefaults,
    testConnection,
    isTesting,
    saveConfig,
    refreshServices,
  } = useConfig();
  const { connectionState, checkConnections } = useConnection();

  const [settings, setSettings] = useState({
    autoRefresh: true,
    refreshInterval: 30,
    alertThreshold: "Medium",
    emailNotifications: true,
    emailAddress: "admin@example.com",
    slackNotifications: false,
    slackWebhook: "",
  });

  const [saved, setSaved] = useState(false);
  const [_openDBDialog, _setOpenDBDialog] = useState(false);
  const [_dbLoading, _setDbLoading] = useState(false);
  const [_clearing, _setClearing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  // Home Network Settings
  const [homeNetworkSettings, setHomeNetworkSettings] = useState({
    homeNetworks: ["192.168.0.0/16", "10.0.0.0/8", "172.16.0.0/12"],
    interface: "eth0",
    portGroups: {
      http_ports: [80, 443, 8080, 8443, 8888, 9443],
      ssh_ports: [22],
      ftp_ports: [21],
      smtp_ports: [25],
      dns_ports: [53],
    },
  });
  const [networkDetection, setNetworkDetection] = useState<any>(null);
  const [loadingNetwork, setLoadingNetwork] = useState(false);
  const [savingNetwork, setSavingNetwork] = useState(false);

  // Suricata Integration Settings
  const [suricataSettings, setSuricataSettings] = useState({
    eveJsonPath: "/var/log/suricata/eve.json",
    autoReload: true,
  });
  const [savingSuricata, setSavingSuricata] = useState(false);

  // Modal states
  const [loadingModal, setLoadingModal] = useState({
    open: false,
    title: "",
    message: "",
    progress: 0,
    showProgress: false,
  });

  const [resultModal, setResultModal] = useState({
    open: false,
    title: "",
    message: "",
    type: "success" as "success" | "error" | "warning",
    details: "",
  });

  const fetchSystemStatus = useCallback(async () => {
    setLoadingStatus(true);
    try {
      // Use connection context for real-time status
      await checkConnections();

      // Try to get additional system info from backend if available
      try {
        const response = await apiService.getSystemStatus();
        setSystemStatus(response.data);
      } catch (_apiError) {
        // If backend is not available, use connection context data
        setSystemStatus({
          database: { connected: connectionState.supabaseConnected },
          api: {
            status: connectionState.backendConnected
              ? "operational"
              : "disconnected",
          },
          uptime: "N/A",
          version: "1.0.0",
        });
      }
    } catch (error) {
      console.error("Failed to fetch system status:", error);
      // Fallback to connection context data
      setSystemStatus({
        database: { connected: connectionState.supabaseConnected },
        api: {
          status: connectionState.backendConnected
            ? "operational"
            : "disconnected",
        },
        uptime: "N/A",
        version: "1.0.0",
      });
    } finally {
      setLoadingStatus(false);
    }
  }, [checkConnections, connectionState.supabaseConnected, connectionState.backendConnected]);

  const fetchNetworkConfiguration = useCallback(async () => {
    try {
      const response = await apiService.getSuricataConfig();
      if (response.data.success) {
        setHomeNetworkSettings({
          homeNetworks: response.data.data.home_networks || [
            "192.168.0.0/16",
            "10.0.0.0/8",
            "172.16.0.0/12",
          ],
          interface: response.data.data.interface || "eth0",
          portGroups: response.data.data.port_groups || {
            http_ports: [80, 443, 8080, 8443, 8888, 9443],
            ssh_ports: [22],
            ftp_ports: [21],
            smtp_ports: [25],
            dns_ports: [53],
          },
        });
      }
    } catch (error: any) {
      console.error("Failed to fetch network configuration:", error);
      // If service is not available, show a message
      if (error.response?.status === 503) {
        setConnectionStatus(
          "Network configuration service not available. Please ensure all dependencies are installed.",
        );
        setTimeout(() => setConnectionStatus(null), 5000);
      }
    }
  }, []);

  const detectNetworkInfo = useCallback(async () => {
    setLoadingNetwork(true);
    try {
      const response = await apiService.detectNetworkInfo();
      if (response.data.success) {
        setNetworkDetection(response.data.data);
      }
    } catch (error: any) {
      console.error("Failed to detect network info:", error);
      if (error.response?.status === 503) {
        setConnectionStatus(
          "Network detection service not available. Please ensure psutil is installed.",
        );
        setTimeout(() => setConnectionStatus(null), 5000);
      }
    } finally {
      setLoadingNetwork(false);
    }
  }, []);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("dashboardSettings");
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings((prevSettings) => ({ ...prevSettings, ...parsedSettings }));
      } catch (error) {
        console.error("Failed to parse saved settings:", error);
      }
    }

    // Fetch system status and network configuration
    fetchSystemStatus();
    fetchNetworkConfiguration();
    detectNetworkInfo();
  }, [
    detectNetworkInfo,
    fetchNetworkConfiguration,
    fetchSystemStatus,
  ]);

  const _handleHomeNetworkChange = (index: number, value: string) => {
    const newNetworks = [...homeNetworkSettings.homeNetworks];
    newNetworks[index] = value;
    setHomeNetworkSettings({
      ...homeNetworkSettings,
      homeNetworks: newNetworks,
    });
  };

  const _addHomeNetwork = () => {
    setHomeNetworkSettings({
      ...homeNetworkSettings,
      homeNetworks: [...homeNetworkSettings.homeNetworks, ""],
    });
  };

  const _removeHomeNetwork = (index: number) => {
    const newNetworks = homeNetworkSettings.homeNetworks.filter(
      (_, i) => i !== index,
    );
    setHomeNetworkSettings({
      ...homeNetworkSettings,
      homeNetworks: newNetworks,
    });
  };

  const handleInterfaceChange = (interfaceName: string) => {
    setHomeNetworkSettings({
      ...homeNetworkSettings,
      interface: interfaceName,
    });
  };

  const handlePortGroupChange = (groupName: string, ports: number[]) => {
    setHomeNetworkSettings({
      ...homeNetworkSettings,
      portGroups: { ...homeNetworkSettings.portGroups, [groupName]: ports },
    });
  };

  const saveNetworkConfiguration = async () => {
    setSavingNetwork(true);
    try {
      // Update home networks
      await apiService.updateHomeNetworks(homeNetworkSettings.homeNetworks);

      // Update interface
      await apiService.updateNetworkInterface(homeNetworkSettings.interface);

      // Update port groups
      await apiService.updatePortGroups(homeNetworkSettings.portGroups);

      setConnectionStatus("Network configuration saved successfully!");
      setTimeout(() => setConnectionStatus(null), 3000);
    } catch (error: any) {
      setConnectionStatus(
        `Failed to save network configuration: ${error.message}`,
      );
      setTimeout(() => setConnectionStatus(null), 5000);
    } finally {
      setSavingNetwork(false);
    }
  };

  const saveSuricataConfiguration = async () => {
    setSavingSuricata(true);
    try {
      const response = await fetch(`${config.apiUrl}/api/config/suricata`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eve_json_path: suricataSettings.eveJsonPath,
          auto_reload: suricataSettings.autoReload,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      showResultModal(
        "Configuration Saved",
        "Suricata configuration saved successfully!",
        "success",
        "EVE JSON file path and auto-reload settings have been updated.",
      );
    } catch (error: any) {
      showResultModal(
        "Save Failed",
        "Failed to save Suricata configuration",
        "error",
        error.message,
      );
    } finally {
      setSavingSuricata(false);
    }
  };

  const handleBrowseEveJson = () => {
    // Create a hidden file input
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.style.display = "none";

    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        // For browser environment, we can only get the file name, not the full path for security reasons
        // Show a note to the user that they need to enter the full server path
        showResultModal(
          "File Selected",
          `Selected file: ${file.name}`,
          "warning",
          "Please enter the full server path to the EVE JSON file in the text field above. Due to browser security restrictions, we cannot access the full file path.",
        );
      }
    };

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  };

  // Modal helper functions
  const showLoadingModal = (
    title: string,
    message: string,
    showProgress = false,
  ) => {
    setLoadingModal({
      open: true,
      title,
      message,
      progress: 0,
      showProgress,
    });
  };

  const updateLoadingProgress = (progress: number) => {
    setLoadingModal((prev) => ({ ...prev, progress }));
  };

  const hideLoadingModal = () => {
    setLoadingModal((prev) => ({ ...prev, open: false }));
  };

  const showResultModal = (
    title: string,
    message: string,
    type: "success" | "error" | "warning",
    details = "",
  ) => {
    setResultModal({
      open: true,
      title,
      message,
      type,
      details,
    });
  };

  const hideResultModal = () => {
    setResultModal((prev) => ({ ...prev, open: false }));
  };

  const _handleExportData = async () => {
    showLoadingModal(
      "Exporting Data",
      "Preparing alert data for export...",
      true,
    );

    try {
      // Get data from Supabase
      const { getSupabaseClient } = await import("@/lib/supabase");
      const supabase = getSupabaseClient();

      if (!supabase) {
        hideLoadingModal();
        showResultModal(
          "Export Failed",
          "Supabase client not configured",
          "error",
          "Please configure your Supabase connection in the Database Configuration section.",
        );
        return;
      }

      const { data: alerts, error } = await supabase
        .from("security_alerts")
        .select("*")
        .order("timestamp", { ascending: false });

      if (error) {
        hideLoadingModal();
        showResultModal(
          "Export Failed",
          "Failed to fetch alert data",
          "error",
          `Error: ${error.message}`,
        );
        return;
      }

      // Create CSV content
      const csvContent = [
        "ID,Timestamp,Severity,Source IP,Destination IP,Attack Type,Message,Risk Score",
        ...(alerts || []).map(
          (alert) =>
            `${alert.id},"${alert.timestamp}","${alert.severity}","${alert.source_ip}","${alert.destination_ip}","${alert.attack_type}","${alert.message}","${alert.risk_score || 0}"`,
        ),
      ].join("\n");

      // Download file
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `suricata-alerts-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      hideLoadingModal();
      showResultModal(
        "Export Successful",
        "Alert data has been exported successfully!",
        "success",
        `Exported ${alerts?.length || 0} alerts to CSV file.`,
      );
    } catch (error: any) {
      hideLoadingModal();
      showResultModal(
        "Export Error",
        "Failed to export alert data",
        "error",
        `Error: ${error.message || "Unknown error occurred"}`,
      );
    }
  };

  const _handleClearCache = () => {
    showResultModal(
      "Confirm Cache Clear",
      "Are you sure you want to clear all cached data? This will remove stored configuration and require re-authentication.",
      "warning",
      "This action will clear localStorage data including configuration, authentication tokens, and cached settings.",
    );
  };

  const confirmClearCache = () => {
    hideResultModal();

    try {
      // Clear all localStorage data
      localStorage.clear();

      // Reset configuration
      resetToDefaults();

      showResultModal(
        "Cache Cleared",
        "All cached data has been cleared successfully!",
        "success",
        "You may need to reconfigure your database connection and log in again.",
      );
    } catch (error: any) {
      showResultModal(
        "Clear Error",
        "Failed to clear cache",
        "error",
        `Error: ${error.message || "Unknown error occurred"}`,
      );
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
    setSaved(false);
  };

  const handleSaveSettings = async () => {
    try {
      // Save to localStorage for now
      localStorage.setItem("dashboardSettings", JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;

    const exportFileDefaultName = "dashboard-settings.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        setSettings((prevSettings) => ({
          ...prevSettings,
          ...importedSettings,
        }));
        setSaved(false);
        setConnectionStatus("Settings imported successfully!");
        setTimeout(() => setConnectionStatus(null), 3000);
      } catch (_error) {
        setConnectionStatus("Failed to import settings. Invalid file format.");
        setTimeout(() => setConnectionStatus(null), 3000);
      }
    };
    reader.readAsText(file);
  };

  const handleResetSettings = () => {
    if (
      confirm("Are you sure you want to reset all settings to default values?")
    ) {
      setSettings({
        autoRefresh: true,
        refreshInterval: 30,
        alertThreshold: "Medium",
        emailNotifications: true,
        emailAddress: "admin@example.com",
        slackNotifications: false,
        slackWebhook: "",
      });
      setSaved(false);
      setConnectionStatus("Settings reset to default values!");
      setTimeout(() => setConnectionStatus(null), 3000);
    }
  };

  const handleTestConnection = async () => {
    showLoadingModal("Testing Connection", "Checking database connectivity...");

    try {
      const result = await apiService.testConnection();
      hideLoadingModal();

      if (result.data.success) {
        showResultModal(
          "Connection Successful",
          "Database connection test completed successfully!",
          "success",
          `Status: ${result.data.message}\nTimestamp: ${result.data.timestamp}`,
        );
      } else {
        showResultModal(
          "Connection Failed",
          "Database connection test failed.",
          "error",
          `Error: ${result.data.message}`,
        );
      }
    } catch (error: any) {
      hideLoadingModal();
      showResultModal(
        "Connection Error",
        "Failed to test database connection.",
        "error",
        `Error: ${error.message || "Unknown error occurred"}`,
      );
    }
  };

  const _handleClearAlerts = async () => {
    showResultModal(
      "Confirm Action",
      "Are you sure you want to clear all alerts? This action cannot be undone.",
      "warning",
      "This will permanently delete all alert records from the database.",
    );

    // We'll handle the confirmation in the modal
  };

  const confirmClearAlerts = async () => {
    hideResultModal();
    showLoadingModal("Clearing Alerts", "Removing all alert records...", true);

    // Simulate progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress = Math.min(progress + 15, 90);
      updateLoadingProgress(progress);
    }, 150);

    try {
      const result = await apiService.clearAlerts();
      clearInterval(progressInterval);
      updateLoadingProgress(100);

      setTimeout(() => {
        hideLoadingModal();

        if (result.data.success) {
          showResultModal(
            "Alerts Cleared",
            "All alerts have been cleared successfully!",
            "success",
            `Deleted: ${result.data.deleted_count} alerts`,
          );
        } else {
          showResultModal(
            "Clear Failed",
            "Failed to clear alerts.",
            "error",
            "The operation could not be completed.",
          );
        }
      }, 500);
    } catch (error: any) {
      clearInterval(progressInterval);
      hideLoadingModal();
      showResultModal(
        "Clear Error",
        "Failed to clear alerts.",
        "error",
        `Error: ${error.message || "Unknown error occurred"}`,
      );
    }
  };

  const _handleInitializeDB = async () => {
    showLoadingModal(
      "Initializing Database",
      "Setting up database schema and tables...",
      true,
    );

    // Simulate progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress = Math.min(progress + 12, 90);
      updateLoadingProgress(progress);
    }, 300);

    try {
      const response = await apiService.initializeDatabase();
      clearInterval(progressInterval);
      updateLoadingProgress(100);

      setTimeout(() => {
        hideLoadingModal();

        if (response.data.success) {
          showResultModal(
            "Database Initialized",
            "Database has been initialized successfully!",
            "success",
            `Message: ${response.data.message}`,
          );
        } else {
          showResultModal(
            "Initialization Failed",
            "Failed to initialize database.",
            "error",
            `Error: ${response.data.message}`,
          );
        }
      }, 500);
    } catch (error: any) {
      clearInterval(progressInterval);
      hideLoadingModal();
      showResultModal(
        "Initialization Error",
        "Failed to initialize database.",
        "error",
        `Error: ${error.message || "Unknown error occurred"}`,
      );
    }
  };

  const _handleSeedData = async () => {
    showLoadingModal(
      "Seeding Database",
      "Populating database with test data...",
      true,
    );

    // Simulate progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress = Math.min(progress + 8, 90);
      updateLoadingProgress(progress);
    }, 250);

    try {
      const response = await apiService.seedDatabase();
      clearInterval(progressInterval);
      updateLoadingProgress(100);

      setTimeout(() => {
        hideLoadingModal();

        if (response.data.success) {
          showResultModal(
            "Data Seeded",
            "Database has been seeded with test data successfully!",
            "success",
            `Message: ${response.data.message}\nCount: ${response.data.count} records`,
          );
        } else {
          showResultModal(
            "Seeding Failed",
            "Failed to seed database with test data.",
            "error",
            `Error: ${response.data.message}`,
          );
        }
      }, 500);
    } catch (error: any) {
      clearInterval(progressInterval);
      hideLoadingModal();
      showResultModal(
        "Seeding Error",
        "Failed to seed database.",
        "error",
        `Error: ${error.message || "Unknown error occurred"}`,
      );
    }
  };

  const _handleResetDB = async () => {
    showResultModal(
      "Confirm Database Reset",
      "Are you sure you want to reset the database? This action cannot be undone and will delete ALL data.",
      "warning",
      "This will permanently delete all tables, data, and configurations. Make sure you have a backup if needed.",
    );
  };

  const confirmResetDB = async () => {
    hideResultModal();
    showLoadingModal(
      "Resetting Database",
      "Removing all data and resetting database...",
      true,
    );

    // Simulate progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress = Math.min(progress + 6, 90);
      updateLoadingProgress(progress);
    }, 400);

    try {
      const response = await apiService.resetDatabase();
      clearInterval(progressInterval);
      updateLoadingProgress(100);

      setTimeout(() => {
        hideLoadingModal();

        if (response.data.success) {
          showResultModal(
            "Database Reset",
            "Database has been reset successfully!",
            "success",
            `Message: ${response.data.message}`,
          );
        } else {
          showResultModal(
            "Reset Failed",
            "Failed to reset database.",
            "error",
            `Error: ${response.data.message}`,
          );
        }
      }, 500);
    } catch (error: any) {
      clearInterval(progressInterval);
      hideLoadingModal();
      showResultModal(
        "Reset Error",
        "Failed to reset database.",
        "error",
        `Error: ${error.message || "Unknown error occurred"}`,
      );
    }
  };

  return (
    <Providers>
      <Layout>
        <Container maxWidth="md" sx={{ py: 4 }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h3"
              sx={{ fontWeight: 700, color: "#FFD600", mb: 1 }}
            >
              ⚙️ Settings
            </Typography>
            <Typography variant="body1" sx={{ color: "#B0B0B0" }}>
              Configuration and management
            </Typography>
          </Box>

          {/* Status Alerts */}
          {saved && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Settings saved successfully!
            </Alert>
          )}
          {connectionStatus && (
            <Alert
              severity={
                connectionStatus.includes("successful") ? "success" : "error"
              }
              sx={{ mb: 3 }}
            >
              {connectionStatus}
            </Alert>
          )}

          {/* Home Network Settings */}
          <Paper
            sx={{
              backgroundColor: "#1A1A1A",
              border: "1px solid #2B2B2B",
              p: 3,
              mb: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#FFD600", mb: 3 }}
            >
              🏠 Home Network Configuration
            </Typography>

            <Typography variant="body2" sx={{ color: "#B0B0B0", mb: 3 }}>
              Configure your home network settings and Suricata interface
              detection
            </Typography>

            {/* Network Detection */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, color: "#FFD600", mb: 2 }}
              >
                🔍 Network Detection
              </Typography>

              <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
                <Button
                  variant="outlined"
                  onClick={detectNetworkInfo}
                  disabled={loadingNetwork}
                  sx={{
                    borderColor: "#4CAF50",
                    color: "#4CAF50",
                    fontWeight: 700,
                    "&:hover": {
                      borderColor: "#45A049",
                      backgroundColor: "#4CAF5020",
                    },
                  }}
                >
                  {loadingNetwork ? "Detecting..." : "🔍 Detect Network"}
                </Button>

                <Button
                  variant="outlined"
                  onClick={saveNetworkConfiguration}
                  disabled={savingNetwork}
                  sx={{
                    borderColor: "#FFD600",
                    color: "#FFD600",
                    fontWeight: 700,
                    "&:hover": {
                      borderColor: "#F9A825",
                      backgroundColor: "#FFD60020",
                    },
                  }}
                >
                  {savingNetwork ? "Saving..." : "💾 Save Configuration"}
                </Button>
              </Box>

              {networkDetection && (
                <Box
                  sx={{
                    backgroundColor: "#0D0D0D",
                    border: "1px solid #2B2B2B",
                    borderRadius: 1,
                    p: 2,
                    mb: 3,
                  }}
                >
                  <Typography variant="body2" sx={{ color: "#B0B0B0", mb: 1 }}>
                    Detected Interfaces:
                  </Typography>
                  {Object.entries(networkDetection.interfaces || {}).map(
                    ([name, info]: [string, any]) => (
                      <Box
                        key={name}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor: info.is_up ? "#4CAF50" : "#F44336",
                          }}
                        />
                        <Typography variant="body2" sx={{ color: "#FFF" }}>
                          {name}: {info.addresses?.[0]?.ip || "No IP"}{" "}
                          {info.is_up ? "(Up)" : "(Down)"}
                        </Typography>
                      </Box>
                    ),
                  )}
                </Box>
              )}
            </Box>

            <Divider sx={{ borderColor: "#2B2B2B", my: 3 }} />

            {/* Network Interface */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, color: "#FFD600", mb: 2 }}
              >
                🔌 Network Interface
              </Typography>

              <TextField
                label="Interface Name"
                value={homeNetworkSettings.interface}
                onChange={(e) => handleInterfaceChange(e.target.value)}
                placeholder="eth0"
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "#FFF",
                    "& fieldset": { borderColor: "#2B2B2B" },
                  },
                }}
              />

              {networkDetection?.interfaces && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ color: "#B0B0B0", mb: 1 }}>
                    Available Interfaces:
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {Object.keys(networkDetection.interfaces).map(
                      (interfaceName) => (
                        <Button
                          key={interfaceName}
                          variant={
                            homeNetworkSettings.interface === interfaceName
                              ? "contained"
                              : "outlined"
                          }
                          size="small"
                          onClick={() => handleInterfaceChange(interfaceName)}
                          sx={{
                            backgroundColor:
                              homeNetworkSettings.interface === interfaceName
                                ? "#FFD600"
                                : "transparent",
                            color:
                              homeNetworkSettings.interface === interfaceName
                                ? "#000"
                                : "#FFD600",
                            borderColor: "#FFD600",
                            "&:hover": {
                              backgroundColor:
                                homeNetworkSettings.interface === interfaceName
                                  ? "#F9A825"
                                  : "#FFD60020",
                            },
                          }}
                        >
                          {interfaceName}
                        </Button>
                      ),
                    )}
                  </Box>
                </Box>
              )}
            </Box>

            <Divider sx={{ borderColor: "#2B2B2B", my: 3 }} />

            {/* Port Groups */}
            <Box>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, color: "#FFD600", mb: 2 }}
              >
                🔌 Port Groups
              </Typography>

              <Typography variant="body2" sx={{ color: "#B0B0B0", mb: 2 }}>
                Configure port groups for different services. Separate multiple
                ports with commas.
              </Typography>

              {Object.entries(homeNetworkSettings.portGroups).map(
                ([groupName, ports]) => (
                  <Box key={groupName} sx={{ mb: 2 }}>
                    <TextField
                      label={groupName.replace("_", " ").toUpperCase()}
                      value={ports.join(", ")}
                      onChange={(e) => {
                        const portList = e.target.value
                          .split(",")
                          .map((p) => parseInt(p.trim(), 10))
                          .filter((p) => !Number.isNaN(p));
                        handlePortGroupChange(groupName, portList);
                      }}
                      placeholder="80, 443, 8080"
                      fullWidth
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          color: "#FFF",
                          "& fieldset": { borderColor: "#2B2B2B" },
                        },
                      }}
                    />
                  </Box>
                ),
              )}
            </Box>
          </Paper>

          {/* System Status */}
          <Paper
            sx={{
              backgroundColor: "#1A1A1A",
              border: "1px solid #2B2B2B",
              p: 3,
              mb: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#FFD600", mb: 3 }}
            >
              🖥️ System Status
            </Typography>

            {loadingStatus ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <CircularProgress size={20} sx={{ color: "#FFD600" }} />
                <Typography variant="body2" sx={{ color: "#B0B0B0" }}>
                  Checking system status...
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "#B0B0B0", mb: 0.5 }}
                    >
                      Database Status:
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: connectionState.supabaseConnected
                            ? "#4CAF50"
                            : "#F44336",
                          animation: connectionState.supabaseConnected
                            ? "pulse 2s infinite"
                            : "none",
                          "@keyframes pulse": {
                            "0%": { opacity: 1 },
                            "50%": { opacity: 0.5 },
                            "100%": { opacity: 1 },
                          },
                        }}
                      />
                      <Typography
                        variant="body1"
                        sx={{
                          color: connectionState.supabaseConnected
                            ? "#4CAF50"
                            : "#F44336",
                          fontWeight: 600,
                        }}
                      >
                        {connectionState.supabaseConnected
                          ? "Connected"
                          : "Disconnected"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "#B0B0B0", mb: 0.5 }}
                    >
                      API Status:
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: connectionState.backendConnected
                            ? "#4CAF50"
                            : "#F44336",
                          animation: connectionState.backendConnected
                            ? "pulse 2s infinite"
                            : "none",
                          "@keyframes pulse": {
                            "0%": { opacity: 1 },
                            "50%": { opacity: 0.5 },
                            "100%": { opacity: 1 },
                          },
                        }}
                      />
                      <Typography
                        variant="body1"
                        sx={{
                          color: connectionState.backendConnected
                            ? "#4CAF50"
                            : "#F44336",
                          fontWeight: 600,
                        }}
                      >
                        {connectionState.backendConnected
                          ? "Operational"
                          : "Disconnected"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "#B0B0B0", mb: 0.5 }}
                    >
                      Last Checked:
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: "#FFF", fontWeight: 600 }}
                    >
                      {connectionState.lastChecked
                        ? new Date(
                            connectionState.lastChecked,
                          ).toLocaleTimeString()
                        : "Never"}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "#B0B0B0", mb: 0.5 }}
                    >
                      Version:
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: "#FFF", fontWeight: 600 }}
                    >
                      {systemStatus?.version || "1.0.0"}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            )}

            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                onClick={fetchSystemStatus}
                disabled={loadingStatus}
                sx={{
                  borderColor: "#FFD600",
                  color: "#FFD600",
                  "&:hover": {
                    borderColor: "#F9A825",
                    backgroundColor: "#FFD60020",
                  },
                }}
              >
                {loadingStatus ? "Refreshing..." : "Refresh Status"}
              </Button>
            </Box>
          </Paper>

          {/* Suricata Integration */}
          <Paper
            sx={{
              backgroundColor: "#1A1A1A",
              border: "1px solid #2B2B2B",
              p: 3,
              mb: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#FFD600", mb: 3 }}
            >
              🔗 Suricata Integration
            </Typography>

            <Typography variant="body2" sx={{ color: "#B0B0B0", mb: 3 }}>
              Configure eve.json file processing
            </Typography>

            <Box sx={{ mb: 4 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, color: "#FFD600", mb: 2 }}
              >
                📄 EVE JSON Configuration
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    label="EVE JSON File Path"
                    value={suricataSettings.eveJsonPath}
                    onChange={(e) =>
                      setSuricataSettings({
                        ...suricataSettings,
                        eveJsonPath: e.target.value,
                      })
                    }
                    fullWidth
                    placeholder="/var/log/suricata/eve.json"
                    helperText="Path to your Suricata eve.json log file"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: "#FFF",
                        "& fieldset": { borderColor: "#2B2B2B" },
                      },
                      "& .MuiFormHelperText-root": {
                        color: "#B0B0B0",
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                        <Button
                          size="small"
                          onClick={handleBrowseEveJson}
                          sx={{
                            color: "#FFD600",
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            minWidth: "auto",
                            px: 1.5,
                            "&:hover": {
                              backgroundColor: "#FFD60020",
                            },
                          }}
                        >
                          Browse
                        </Button>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={suricataSettings.autoReload}
                        onChange={(e) =>
                          setSuricataSettings({
                            ...suricataSettings,
                            autoReload: e.target.checked,
                          })
                        }
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: "#FFD600",
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                            {
                              backgroundColor: "#FFD600",
                            },
                        }}
                      />
                    }
                    label={
                      <Box>
                        <Typography
                          variant="body1"
                          sx={{ color: "#FFF", fontWeight: 600 }}
                        >
                          Auto-Reload on Changes
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#B0B0B0", fontSize: "0.875rem" }}
                        >
                          Automatically process new alerts
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  variant="outlined"
                  onClick={saveSuricataConfiguration}
                  disabled={savingSuricata}
                  sx={{
                    borderColor: "#4CAF50",
                    color: "#4CAF50",
                    fontWeight: 700,
                    "&:hover": {
                      borderColor: "#45A049",
                      backgroundColor: "#4CAF5020",
                    },
                  }}
                >
                  {savingSuricata ? "Saving..." : "💾 Save Configuration"}
                </Button>
              </Box>
            </Box>
          </Paper>
          {/* Dashboard Preferences */}
          <Paper
            sx={{
              backgroundColor: "#1A1A1A",
              border: "1px solid #2B2B2B",
              p: 3,
              mb: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#FFD600", mb: 3 }}
            >
              Dashboard Preferences
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.autoRefresh}
                      onChange={(e) =>
                        handleSettingChange("autoRefresh", e.target.checked)
                      }
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#FFD600",
                        },
                      }}
                    />
                  }
                  label="Auto-refresh Dashboard"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Refresh Interval (seconds)"
                  type="number"
                  value={settings.refreshInterval}
                  onChange={(e) =>
                    handleSettingChange(
                      "refreshInterval",
                      parseInt(e.target.value, 10),
                    )
                  }
                  fullWidth
                  disabled={!settings.autoRefresh}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "#FFF",
                      "& fieldset": { borderColor: "#2B2B2B" },
                    },
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Alert Threshold"
                  select
                  value={settings.alertThreshold}
                  onChange={(e) =>
                    handleSettingChange("alertThreshold", e.target.value)
                  }
                  fullWidth
                  SelectProps={{
                    native: true,
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      color: "#FFF",
                      "& fieldset": { borderColor: "#2B2B2B" },
                    },
                  }}
                >
                  <option value="Critical">Critical Only</option>
                  <option value="High">High and Above</option>
                  <option value="Medium">Medium and Above</option>
                  <option value="Low">All Alerts</option>
                </TextField>
              </Grid>
            </Grid>

            <Divider sx={{ borderColor: "#2B2B2B", my: 3 }} />

            {/* Notifications */}
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#FFD600", mb: 2 }}
            >
              Notifications
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={(e) =>
                        handleSettingChange(
                          "emailNotifications",
                          e.target.checked,
                        )
                      }
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#FFD600",
                        },
                      }}
                    />
                  }
                  label="Email Notifications"
                />
              </Grid>

              {settings.emailNotifications && (
                <Grid item xs={12}>
                  <TextField
                    label="Email Address"
                    type="email"
                    value={settings.emailAddress}
                    onChange={(e) =>
                      handleSettingChange("emailAddress", e.target.value)
                    }
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: "#FFF",
                        "& fieldset": { borderColor: "#2B2B2B" },
                      },
                    }}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.slackNotifications}
                      onChange={(e) =>
                        handleSettingChange(
                          "slackNotifications",
                          e.target.checked,
                        )
                      }
                      sx={{
                        "& .MuiSwitch-switchBase.Mui-checked": {
                          color: "#FFD600",
                        },
                      }}
                    />
                  }
                  label="Slack Notifications"
                />
              </Grid>

              {settings.slackNotifications && (
                <Grid item xs={12}>
                  <TextField
                    label="Slack Webhook URL"
                    value={settings.slackWebhook}
                    onChange={(e) =>
                      handleSettingChange("slackWebhook", e.target.value)
                    }
                    fullWidth
                    type="password"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: "#FFF",
                        "& fieldset": { borderColor: "#2B2B2B" },
                      },
                    }}
                  />
                </Grid>
              )}
            </Grid>

            <Box sx={{ mt: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#FFD600",
                  color: "#000",
                  fontWeight: 700,
                }}
                onClick={handleSaveSettings}
              >
                Save Settings
              </Button>
              <Button
                variant="outlined"
                sx={{
                  borderColor: "#4CAF50",
                  color: "#4CAF50",
                  fontWeight: 700,
                }}
                onClick={handleExportSettings}
              >
                Export Settings
              </Button>
              <Button
                variant="outlined"
                component="label"
                sx={{
                  borderColor: "#2196F3",
                  color: "#2196F3",
                  fontWeight: 700,
                }}
              >
                Import Settings
                <input
                  type="file"
                  accept=".json"
                  hidden
                  onChange={handleImportSettings}
                />
              </Button>
              <Button
                variant="outlined"
                sx={{
                  borderColor: "#FF9800",
                  color: "#FF9800",
                  fontWeight: 700,
                }}
                onClick={handleResetSettings}
              >
                Reset to Default
              </Button>
            </Box>
          </Paper>

          {/* Database Section */}
          <Paper
            sx={{
              backgroundColor: "#1A1A1A",
              border: "1px solid #2B2B2B",
              p: 3,
              mb: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#FFD600", mb: 3 }}
            >
              🗄️ Database
            </Typography>
            <Button
              variant="outlined"
              fullWidth
              sx={{
                borderColor: "#FFD600",
                color: "#FFD600",
                fontWeight: 700,
                mb: 2,
                "&:hover": {
                  borderColor: "#FFD600",
                  backgroundColor: "#FFD60020",
                },
              }}
              onClick={handleTestConnection}
            >
              🔍 Test Connection
            </Button>
          </Paper>

          {/* App Info */}
          <Paper
            sx={{
              backgroundColor: "#1A1A1A",
              border: "1px solid #2B2B2B",
              p: 3,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#FFD600", mb: 3 }}
            >
              ℹ️ About
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: "#B0B0B0", mb: 0.5 }}
                  >
                    App Name:
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: "#FFF", fontWeight: 600 }}
                  >
                    Matseka Suricata
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: "#B0B0B0", mb: 0.5 }}
                  >
                    Version:
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: "#FFF", fontWeight: 600 }}
                  >
                    1.0.0
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: "#B0B0B0", mb: 0.5 }}
                  >
                    Description:
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: "#FFF", fontWeight: 600 }}
                  >
                    Network Intrusion Detection System Dashboard
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Container>

        {/* Loading Modal */}
        <Dialog
          open={loadingModal.open}
          maxWidth="sm"
          fullWidth
          disableEscapeKeyDown
        >
          <DialogTitle
            sx={{
              color: "#FFD600",
              fontWeight: 700,
              backgroundColor: "#1A1A1A",
            }}
          >
            {loadingModal.title}
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: "#1A1A1A" }}>
            <Box sx={{ textAlign: "center", py: 2 }}>
              <CircularProgress sx={{ color: "#FFD600", mb: 2 }} />
              <Typography variant="body1" sx={{ color: "#E0E0E0", mb: 2 }}>
                {loadingModal.message}
              </Typography>
              {loadingModal.showProgress && (
                <Box sx={{ width: "100%", mb: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={loadingModal.progress}
                    sx={{
                      backgroundColor: "#2B2B2B",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: "#FFD600",
                      },
                    }}
                  />
                  <Typography variant="body2" sx={{ color: "#B0B0B0", mt: 1 }}>
                    {loadingModal.progress}%
                  </Typography>
                </Box>
              )}
            </Box>
          </DialogContent>
        </Dialog>

        {/* Result Modal */}
        <Dialog open={resultModal.open} maxWidth="sm" fullWidth>
          <DialogTitle
            sx={{
              color:
                resultModal.type === "success"
                  ? "#4CAF50"
                  : resultModal.type === "error"
                    ? "#F44336"
                    : "#FF9800",
              fontWeight: 700,
              backgroundColor: "#1A1A1A",
            }}
          >
            {resultModal.title}
          </DialogTitle>
          <DialogContent sx={{ backgroundColor: "#1A1A1A" }}>
            <Box sx={{ py: 2 }}>
              <Typography variant="body1" sx={{ color: "#E0E0E0", mb: 2 }}>
                {resultModal.message}
              </Typography>
              {resultModal.details && (
                <Box
                  sx={{
                    backgroundColor: "#1A1A1A",
                    border: "1px solid #2B2B2B",
                    borderRadius: 1,
                    p: 2,
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#B0B0B0",
                      whiteSpace: "pre-line",
                      fontFamily: "monospace",
                      fontSize: "0.875rem",
                    }}
                  >
                    {resultModal.details}
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label={resultModal.type.toUpperCase()}
                  size="small"
                  sx={{
                    backgroundColor:
                      resultModal.type === "success"
                        ? "#4CAF50"
                        : resultModal.type === "error"
                          ? "#F44336"
                          : "#FF9800",
                    color: "#FFF",
                    fontWeight: 700,
                  }}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ backgroundColor: "#1A1A1A" }}>
            {resultModal.type === "warning" ? (
              <>
                <Button onClick={hideResultModal} sx={{ color: "#B0B0B0" }}>
                  Cancel
                </Button>
                <Button
                  onClick={
                    resultModal.title.includes("Clear Alerts")
                      ? confirmClearAlerts
                      : resultModal.title.includes("Clear Cache")
                        ? confirmClearCache
                        : confirmResetDB
                  }
                  variant="contained"
                  sx={{
                    backgroundColor: resultModal.title.includes("Clear Alerts")
                      ? "#F44336"
                      : resultModal.title.includes("Clear Cache")
                        ? "#F44336"
                        : "#FF9800",
                    color: "#FFF",
                    fontWeight: 700,
                  }}
                >
                  Confirm
                </Button>
              </>
            ) : (
              <Button
                onClick={hideResultModal}
                variant="contained"
                sx={{
                  backgroundColor:
                    resultModal.type === "success" ? "#4CAF50" : "#F44336",
                  color: "#FFF",
                  fontWeight: 700,
                }}
              >
                OK
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Layout>
    </Providers>
  );
}
