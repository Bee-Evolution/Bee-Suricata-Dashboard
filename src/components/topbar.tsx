"use client";

import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { PasswordModal } from "@/components/profile/PasswordModal";
import { ProfileModal } from "@/components/profile/ProfileModal";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/contexts/SidebarContext";

const Topbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { toggleCollapse } = useSidebar();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfile = () => {
    handleClose();
    setShowProfileModal(true);
  };

  const handleSettings = () => {
    handleClose();
    router.push("/settings");
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const handlePasswordChange = () => {
    setShowProfileModal(false);
    setShowPasswordModal(true);
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#1A1A1A",
        borderBottom: "1px solid #2B2B2B",
        elevation: 0,
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          onClick={toggleCollapse}
          sx={{
            mr: 2,
            color: "#FFD600",
            "&:hover": {
              backgroundColor: "#FFD60020",
            },
          }}
        >
          <MenuIcon />
        </IconButton>
        <Typography
          variant="h6"
          onClick={toggleCollapse}
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            color: "#FFD600",
            cursor: "pointer",
            "&:hover": {
              color: "#F9A825",
            },
          }}
        >
          Real-time IDS Dashboard
        </Typography>
        <Chip
          icon={<NotificationsIcon />}
          label="Live"
          sx={{
            backgroundColor: "#4CAF50",
            color: "#fff",
            fontWeight: 600,
            mr: 2,
          }}
        />
        <Box
          onClick={handleClick}
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
            cursor: "pointer",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "#F9A825",
              transform: "scale(1.05)",
            },
          }}
        >
          {user ? user.username.charAt(0).toUpperCase() : "U"}
        </Box>

        {/* User Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
              mt: 1.5,
              backgroundColor: "#1A1A1A",
              border: "1px solid #2B2B2B",
              borderRadius: 2,
              minWidth: 200,
              "& .MuiAvatar-root": {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              "&:before": {
                content: '""',
                display: "block",
                position: "absolute",
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: "#1A1A1A",
                transform: "translateY(-50%) rotate(45deg)",
                zIndex: 0,
                border: "1px solid #2B2B2B",
                borderBottom: "none",
                borderRight: "none",
              },
            },
          }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          {/* User Info Header */}
          {user && (
            <MenuItem disabled sx={{ opacity: 1, cursor: "default" }}>
              <Avatar
                sx={{
                  backgroundColor: "#FFD600",
                  color: "#000",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                }}
              >
                {user.username.charAt(0).toUpperCase()}
              </Avatar>
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    sx={{ color: "#FFF", fontWeight: 600 }}
                  >
                    {user.username}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" sx={{ color: "#B0B0B0" }}>
                    {user.email}
                  </Typography>
                }
              />
            </MenuItem>
          )}

          {user && <Divider sx={{ borderColor: "#2B2B2B" }} />}

          {/* Profile Menu Item */}
          <MenuItem onClick={handleProfile} sx={{ color: "#FFF" }}>
            <ListItemIcon>
              <PersonIcon sx={{ color: "#FFD600" }} />
            </ListItemIcon>
            <ListItemText>Profile</ListItemText>
          </MenuItem>

          {/* Settings Menu Item */}
          <MenuItem onClick={handleSettings} sx={{ color: "#FFF" }}>
            <ListItemIcon>
              <SettingsIcon sx={{ color: "#FFD600" }} />
            </ListItemIcon>
            <ListItemText>Settings</ListItemText>
          </MenuItem>

          <Divider sx={{ borderColor: "#2B2B2B" }} />

          {/* Logout Menu Item */}
          <MenuItem onClick={handleLogout} sx={{ color: "#FFF" }}>
            <ListItemIcon>
              <LogoutIcon sx={{ color: "#f44336" }} />
            </ListItemIcon>
            <ListItemText>Logout</ListItemText>
          </MenuItem>
        </Menu>

        {/* Profile Modal */}
        <ProfileModal
          open={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onPasswordChange={handlePasswordChange}
        />

        {/* Password Modal */}
        <PasswordModal
          open={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
        />
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
