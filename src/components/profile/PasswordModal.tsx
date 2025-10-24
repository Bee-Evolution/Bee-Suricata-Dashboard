"use client";

import {
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon,
  Security as SecurityIcon,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import type React from "react";
import { useState } from "react";

interface PasswordModalProps {
  open: boolean;
  onClose: () => void;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  open,
  onClose,
}) => {
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleInputChange =
    (field: keyof PasswordData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPasswordData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    switch (field) {
      case "current":
        setShowCurrentPassword(!showCurrentPassword);
        break;
      case "new":
        setShowNewPassword(!showNewPassword);
        break;
      case "confirm":
        setShowConfirmPassword(!showConfirmPassword);
        break;
    }
  };

  const validatePassword = () => {
    const errors: string[] = [];

    if (!passwordData.currentPassword) {
      errors.push("Current password is required");
    }

    if (!passwordData.newPassword) {
      errors.push("New password is required");
    }

    if (!passwordData.confirmPassword) {
      errors.push("Confirm password is required");
    }

    if (passwordData.newPassword.length < 6) {
      errors.push("New password must be at least 6 characters long");
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.push("New passwords do not match");
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      errors.push("New password must be different from current password");
    }

    return errors;
  };

  const handleChangePassword = async () => {
    const errors = validatePassword();
    if (errors.length > 0) {
      setError(errors[0]);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      // TODO: Call backend API to change password
      // await apiService.changePassword(passwordData);

      setSuccess("Password changed successfully");
      setTimeout(() => {
        setSuccess(null);
        handleClose();
      }, 1500);
    } catch (_err: any) {
      setError("Failed to change password. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setError(null);
    setSuccess(null);
    onClose();
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: "", color: "" };
    if (password.length < 6)
      return { strength: 1, label: "Weak", color: "#f44336" };
    if (password.length < 8)
      return { strength: 2, label: "Fair", color: "#ff9800" };
    if (password.length < 12)
      return { strength: 3, label: "Good", color: "#ffeb3b" };
    return { strength: 4, label: "Strong", color: "#4caf50" };
  };

  const passwordStrength = getPasswordStrength(passwordData.newPassword);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "#1A1A1A",
          color: "#FFF",
          border: "1px solid #2B2B2B",
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
            Change Password
          </Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: "#FFD600" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {error && (
            <Alert
              severity="error"
              sx={{ backgroundColor: "#2B2B2B", color: "#FFF" }}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert
              severity="success"
              sx={{ backgroundColor: "#2B2B2B", color: "#FFF" }}
            >
              {success}
            </Alert>
          )}

          {/* Current Password */}
          <TextField
            label="Current Password"
            type={showCurrentPassword ? "text" : "password"}
            value={passwordData.currentPassword}
            onChange={handleInputChange("currentPassword")}
            fullWidth
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => togglePasswordVisibility("current")}
                    edge="end"
                    sx={{ color: "#FFD600" }}
                  >
                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#FFF",
                "& fieldset": { borderColor: "#2B2B2B" },
                "&:hover fieldset": { borderColor: "#FFD600" },
                "&.Mui-focused fieldset": { borderColor: "#FFD600" },
              },
              "& .MuiInputLabel-root": { color: "#B0B0B0" },
            }}
          />

          {/* New Password */}
          <TextField
            label="New Password"
            type={showNewPassword ? "text" : "password"}
            value={passwordData.newPassword}
            onChange={handleInputChange("newPassword")}
            fullWidth
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => togglePasswordVisibility("new")}
                    edge="end"
                    sx={{ color: "#FFD600" }}
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#FFF",
                "& fieldset": { borderColor: "#2B2B2B" },
                "&:hover fieldset": { borderColor: "#FFD600" },
                "&.Mui-focused fieldset": { borderColor: "#FFD600" },
              },
              "& .MuiInputLabel-root": { color: "#B0B0B0" },
            }}
          />

          {/* Password Strength Indicator */}
          {passwordData.newPassword && (
            <Box>
              <Typography variant="body2" sx={{ color: "#B0B0B0", mb: 1 }}>
                Password Strength:{" "}
                <span style={{ color: passwordStrength.color }}>
                  {passwordStrength.label}
                </span>
              </Typography>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                {[1, 2, 3, 4].map((level) => (
                  <Box
                    key={level}
                    sx={{
                      height: 4,
                      flex: 1,
                      backgroundColor:
                        level <= passwordStrength.strength
                          ? passwordStrength.color
                          : "#2B2B2B",
                      borderRadius: 1,
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Confirm Password */}
          <TextField
            label="Confirm New Password"
            type={showConfirmPassword ? "text" : "password"}
            value={passwordData.confirmPassword}
            onChange={handleInputChange("confirmPassword")}
            fullWidth
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => togglePasswordVisibility("confirm")}
                    edge="end"
                    sx={{ color: "#FFD600" }}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#FFF",
                "& fieldset": { borderColor: "#2B2B2B" },
                "&:hover fieldset": { borderColor: "#FFD600" },
                "&.Mui-focused fieldset": { borderColor: "#FFD600" },
              },
              "& .MuiInputLabel-root": { color: "#B0B0B0" },
            }}
          />

          {/* Password Requirements */}
          <Box>
            <Typography
              variant="body2"
              sx={{ color: "#B0B0B0", mb: 1, fontWeight: 600 }}
            >
              Password Requirements:
            </Typography>
            <List dense sx={{ py: 0 }}>
              <ListItem sx={{ py: 0.5, px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {passwordData.newPassword.length >= 6 ? (
                    <CheckIcon sx={{ color: "#4caf50", fontSize: 16 }} />
                  ) : (
                    <CancelIcon sx={{ color: "#f44336", fontSize: 16 }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary="At least 6 characters"
                  primaryTypographyProps={{
                    variant: "body2",
                    color: "#B0B0B0",
                  }}
                />
              </ListItem>
              <ListItem sx={{ py: 0.5, px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {passwordData.newPassword !== passwordData.currentPassword &&
                  passwordData.newPassword ? (
                    <CheckIcon sx={{ color: "#4caf50", fontSize: 16 }} />
                  ) : (
                    <CancelIcon sx={{ color: "#f44336", fontSize: 16 }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary="Different from current password"
                  primaryTypographyProps={{
                    variant: "body2",
                    color: "#B0B0B0",
                  }}
                />
              </ListItem>
              <ListItem sx={{ py: 0.5, px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  {passwordData.newPassword === passwordData.confirmPassword &&
                  passwordData.confirmPassword ? (
                    <CheckIcon sx={{ color: "#4caf50", fontSize: 16 }} />
                  ) : (
                    <CancelIcon sx={{ color: "#f44336", fontSize: 16 }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary="Passwords match"
                  primaryTypographyProps={{
                    variant: "body2",
                    color: "#B0B0B0",
                  }}
                />
              </ListItem>
            </List>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ backgroundColor: "#2B2B2B", p: 2, gap: 1 }}>
        <Button onClick={handleClose} sx={{ color: "#B0B0B0" }}>
          Cancel
        </Button>
        <Button
          onClick={handleChangePassword}
          variant="contained"
          disabled={saving}
          sx={{
            backgroundColor: "#FFD600",
            color: "#000",
            fontWeight: 700,
            "&:hover": { backgroundColor: "#F9A825" },
            "&:disabled": { backgroundColor: "#666" },
          }}
        >
          {saving ? (
            <CircularProgress size={20} sx={{ color: "#000" }} />
          ) : (
            "Change Password"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
