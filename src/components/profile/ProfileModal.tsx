"use client";

import {
  Close as CloseIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Security as SecurityIcon,
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
  Divider,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  onPasswordChange: () => void;
}

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  role: string;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  open,
  onClose,
  onPasswordChange,
}) => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: "",
    email: "",
    phone: "",
    role: "admin",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Fetch profile from backend API
      // For now, use user data from auth context
      setProfileData({
        fullName: user?.username || "",
        email: user?.email || "",
        phone: "",
        role: user?.role || "admin",
      });
    } catch (_err: any) {
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (open && user) {
      loadProfile();
    }
  }, [open, user, loadProfile]);

  const handleSave = async () => {
    // Validate required fields
    if (!profileData.fullName.trim()) {
      setError("Full Name is required");
      return;
    }

    if (!profileData.email.trim()) {
      setError("Email is required");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      // TODO: Call backend API to update profile
      // await apiService.updateProfile(profileData);

      setSuccess("Profile updated successfully");
      setTimeout(() => {
        setSuccess(null);
        onClose();
      }, 1500);
    } catch (_err: any) {
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange =
    (field: keyof ProfileData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setProfileData((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const handleClose = () => {
    setError(null);
    setSuccess(null);
    onClose();
  };

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
          <PersonIcon />
          <Typography variant="h6" component="div">
            Edit Profile
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
        ) : (
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

            {/* Username (Read-only) */}
            <TextField
              label="Username"
              value={user?.username || ""}
              disabled
              fullWidth
              InputProps={{
                startAdornment: <PersonIcon sx={{ color: "#FFD600", mr: 1 }} />,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#B0B0B0",
                  "& fieldset": { borderColor: "#2B2B2B" },
                },
                "& .MuiInputLabel-root": { color: "#B0B0B0" },
              }}
            />

            {/* Full Name */}
            <TextField
              label="Full Name"
              value={profileData.fullName}
              onChange={handleInputChange("fullName")}
              fullWidth
              required
              InputProps={{
                startAdornment: <PersonIcon sx={{ color: "#FFD600", mr: 1 }} />,
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

            {/* Email */}
            <TextField
              label="Email"
              type="email"
              value={profileData.email}
              onChange={handleInputChange("email")}
              fullWidth
              required
              InputProps={{
                startAdornment: <EmailIcon sx={{ color: "#FFD600", mr: 1 }} />,
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

            {/* Phone */}
            <TextField
              label="Phone"
              value={profileData.phone}
              onChange={handleInputChange("phone")}
              fullWidth
              InputProps={{
                startAdornment: <PhoneIcon sx={{ color: "#FFD600", mr: 1 }} />,
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

            {/* Role (Read-only) */}
            <TextField
              label="Role"
              value={profileData.role}
              disabled
              fullWidth
              InputProps={{
                startAdornment: (
                  <SecurityIcon sx={{ color: "#FFD600", mr: 1 }} />
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#B0B0B0",
                  "& fieldset": { borderColor: "#2B2B2B" },
                },
                "& .MuiInputLabel-root": { color: "#B0B0B0" },
              }}
            />

            <Divider sx={{ borderColor: "#2B2B2B", my: 2 }} />

            {/* Password Change Button */}
            <Button
              variant="outlined"
              startIcon={<SecurityIcon />}
              onClick={onPasswordChange}
              sx={{
                borderColor: "#FFD600",
                color: "#FFD600",
                "&:hover": {
                  borderColor: "#FFD600",
                  backgroundColor: "#FFD60020",
                },
              }}
            >
              Change Password
            </Button>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ backgroundColor: "#2B2B2B", p: 2, gap: 1 }}>
        <Button onClick={handleClose} sx={{ color: "#B0B0B0" }}>
          Cancel
        </Button>
        <Button
          onClick={handleSave}
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
            "Save Changes"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
