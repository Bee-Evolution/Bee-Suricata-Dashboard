"use client";

import AnalyticsIcon from "@mui/icons-material/Analytics";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MonitorIcon from "@mui/icons-material/Monitor";
import NetworkCheckIcon from "@mui/icons-material/NetworkCheck";
import SecurityIcon from "@mui/icons-material/Security";
import WarningIcon from "@mui/icons-material/Warning";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useConnection } from "@/contexts/ConnectionContext";
import { useSidebar } from "@/contexts/SidebarContext";

const drawerWidth = 280;
const collapsedWidth = 64;

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { collapsed, toggleCollapse } = useSidebar();
  const { connectionState } = useConnection();

  const navItems: NavItem[] = [
    { label: "Dashboard", href: "/", icon: <DashboardIcon /> },
    { label: "Alerts", href: "/alerts", icon: <WarningIcon /> },
    { label: "Real-time Monitor", href: "/monitor", icon: <MonitorIcon /> },
    { label: "Analytics", href: "/analytics", icon: <AnalyticsIcon /> },
    { label: "Protocols", href: "/protocols", icon: <NetworkCheckIcon /> },
    { label: "IP Management", href: "/ip-management", icon: <SecurityIcon /> },
  ];

  const isActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

  // Check database status

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? collapsedWidth : drawerWidth,
        flexShrink: 0,
        transition: "width 0.3s ease",
        "& .MuiDrawer-paper": {
          width: collapsed ? collapsedWidth : drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "#121212",
          borderRight: "1px solid #2B2B2B",
          transition: "width 0.3s ease",
          overflow: "hidden",
          position: "fixed",
          height: "100vh",
          top: 0,
          left: 0,
          margin: 0,
          padding: 0,
          "&::-webkit-scrollbar": {
            display: "none",
          },
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        },
      }}
    >
      <Toolbar
        sx={{
          backgroundColor: "#1A1A1A",
          borderBottom: "1px solid #2B2B2B",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          minHeight: "64px !important",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1 }}>
          <Box
            onClick={toggleCollapse}
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "#FFD600",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              color: "#000",
              fontSize: "14px",
              flexShrink: 0,
              cursor: "pointer",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "#F9A825",
                transform: "scale(1.05)",
              },
            }}
          >
            IDS
          </Box>
          {!collapsed && (
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: "#FFD600", lineHeight: 1 }}
              >
                Matseka
              </Typography>
              <Typography variant="caption" sx={{ color: "#B0B0B0" }}>
                Suricata
              </Typography>
            </Box>
          )}
        </Box>
      </Toolbar>

      {!collapsed && (
        <Box sx={{ p: 2, py: 3 }}>
          <Typography
            variant="caption"
            sx={{
              color: "#B0B0B0",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Main
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          "&::-webkit-scrollbar": {
            display: "none",
          },
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <List sx={{ p: collapsed ? "8px 4px" : "8px 12px" }}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{ textDecoration: "none" }}
            >
              <ListItemButton
                selected={isActive(item.href)}
                sx={{
                  mb: 1.5,
                  borderRadius: 1.5,
                  backgroundColor: isActive(item.href)
                    ? "#FFD600"
                    : "transparent",
                  color: isActive(item.href) ? "#000" : "#E0E0E0",
                  minHeight: 48,
                  justifyContent: collapsed ? "center" : "flex-start",
                  px: collapsed ? 1 : 2,
                  "&:hover": {
                    backgroundColor: isActive(item.href)
                      ? "#F9A825"
                      : "#2B2B2B",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "#FFD600",
                    "&:hover": { backgroundColor: "#F9A825" },
                  },
                  transition: "all 0.3s ease",
                }}
              >
                {collapsed ? (
                  <Tooltip title={item.label} placement="right" arrow>
                    <ListItemIcon
                      sx={{
                        color: isActive(item.href) ? "#000" : "#FFD600",
                        minWidth: "auto",
                        fontSize: "20px",
                        justifyContent: "center",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                  </Tooltip>
                ) : (
                  <>
                    <ListItemIcon
                      sx={{
                        color: isActive(item.href) ? "#000" : "#FFD600",
                        minWidth: 40,
                        fontSize: "20px",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      sx={{
                        "& .MuiTypography-root": {
                          fontWeight: isActive(item.href) ? 700 : 500,
                          fontSize: "0.95rem",
                        },
                      }}
                    />
                  </>
                )}
              </ListItemButton>
            </Link>
          ))}
        </List>
      </Box>

      {/* Database Status Footer */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          p: collapsed ? 1 : 2,
          borderTop: "1px solid #2B2B2B",
          backgroundColor: "#0D0D0D",
        }}
      >
        {collapsed ? (
          <Box sx={{ display: "flex", justifyContent: "center" }}>
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
          </Box>
        ) : (
          <>
            <Typography
              variant="caption"
              sx={{ color: "#B0B0B0", display: "block", mb: 1 }}
            >
              Database:
              <span
                style={{
                  color: connectionState.supabaseConnected
                    ? "#4CAF50"
                    : "#F44336",
                  marginLeft: "4px",
                }}
              >
                ● {connectionState.supabaseConnected ? "Online" : "Offline"}
              </span>
            </Typography>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="caption" sx={{ color: "#B0B0B0" }}>
                About
              </Typography>
              <Typography variant="caption" sx={{ color: "#B0B0B0" }}>
                v2.0.0
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
};

export default Sidebar;
