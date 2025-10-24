"use client";

import {
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
  TextField,
  Typography,
} from "@mui/material";
import type React from "react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import type { LoginCredentials } from "@/types/auth";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ open, onClose }) => {
  const { login, loading, error, clearError } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Clear errors when modal opens/closes
  useEffect(() => {
    if (open) {
      setLocalError(null);
      setCredentials({ username: "", password: "" });
    }
  }, [open]);

  const handleInputChange =
    (field: keyof LoginCredentials) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setCredentials((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
      // Clear errors when user starts typing
      if (error || localError) {
        clearError();
        setLocalError(null);
      }
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!credentials.username.trim() || !credentials.password.trim()) {
      setLocalError("Please enter both username and password");
      return;
    }

    const success = await login(credentials);
    if (success) {
      // Close modal and let AuthContext handle navigation
      onClose();
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSubmit(event as any);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const displayError = error || localError;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: "#1A1A1A",
          border: "1px solid #2B2B2B",
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SecurityIcon sx={{ color: "#FFD600", fontSize: "1.5rem" }} />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: "#FFD600",
            }}
          >
            Admin Login
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: "#B0B0B0",
            "&:hover": { color: "#FFD600" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Typography
          variant="body2"
          sx={{
            color: "#B0B0B0",
            mb: 3,
            textAlign: "center",
          }}
        >
          Enter your credentials to access the Matseka Suricata Dashboard
        </Typography>

        {displayError && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              backgroundColor: "#2D1B1B",
              color: "#F44336",
              "& .MuiAlert-icon": { color: "#F44336" },
            }}
          >
            {displayError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            value={credentials.username}
            onChange={handleInputChange("username")}
            onKeyPress={handleKeyPress}
            disabled={loading}
            autoFocus
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                color: "#FFF",
                "& fieldset": { borderColor: "#2B2B2B" },
                "&:hover fieldset": { borderColor: "#FFD600" },
                "&.Mui-focused fieldset": { borderColor: "#FFD600" },
              },
              "& .MuiInputLabel-root": {
                color: "#B0B0B0",
                "&.Mui-focused": { color: "#FFD600" },
              },
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            value={credentials.password}
            onChange={handleInputChange("password")}
            onKeyPress={handleKeyPress}
            disabled={loading}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={togglePasswordVisibility}
                    edge="end"
                    sx={{ color: "#B0B0B0" }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
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
              "& .MuiInputLabel-root": {
                color: "#B0B0B0",
                "&.Mui-focused": { color: "#FFD600" },
              },
            }}
          />

          <Box
            sx={{
              backgroundColor: "#0D0D0D",
              border: "1px solid #2B2B2B",
              borderRadius: 1,
              p: 2,
              mb: 3,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "#B0B0B0",
                display: "block",
                mb: 1,
                fontWeight: 600,
              }}
            >
              Default Credentials:
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "#FFD600",
                fontFamily: "monospace",
                display: "block",
              }}
            >
              Username: admin
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "#FFD600",
                fontFamily: "monospace",
                display: "block",
              }}
            >
              Password: suricata2024
            </Typography>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{
            color: "#B0B0B0",
            "&:hover": { backgroundColor: "#2B2B2B" },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={
            loading ||
            !credentials.username.trim() ||
            !credentials.password.trim()
          }
          variant="contained"
          sx={{
            backgroundColor: "#FFD600",
            color: "#000",
            fontWeight: 700,
            minWidth: 120,
            "&:hover": { backgroundColor: "#F9A825" },
            "&:disabled": {
              backgroundColor: "#2B2B2B",
              color: "#666",
            },
          }}
        >
          {loading ? (
            <CircularProgress size={20} sx={{ color: "#000" }} />
          ) : (
            "Login"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
