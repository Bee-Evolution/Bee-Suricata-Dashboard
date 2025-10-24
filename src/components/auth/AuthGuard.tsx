"use client";

import { Box, CircularProgress, Typography } from "@mui/material";
import dynamic from "next/dynamic";
import type React from "react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LoginModal } from "./LoginModal";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuardComponent: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    console.log("AuthGuard state:", {
      loading,
      isAuthenticated,
      showLoginModal,
    });
    if (!loading && !isAuthenticated) {
      setShowLoginModal(true);
    } else if (isAuthenticated) {
      setShowLoginModal(false);
    }
  }, [isAuthenticated, loading]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#0D0D0D",
          gap: 2,
        }}
      >
        <CircularProgress
          size={60}
          sx={{
            color: "#FFD600",
          }}
        />
        <Typography
          variant="h6"
          sx={{
            color: "#B0B0B0",
            fontWeight: 500,
          }}
        >
          Loading Matseka Suricata Dashboard...
        </Typography>
      </Box>
    );
  }

  // Show login modal if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            backgroundColor: "#0D0D0D",
            gap: 3,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 2,
            }}
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: "50%",
                backgroundColor: "#FFD600",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                color: "#000",
                fontSize: "1.5rem",
              }}
            >
              IDS
            </Box>
            <Box>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: "#FFD600",
                  lineHeight: 1,
                }}
              >
                Matseka
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  color: "#B0B0B0",
                  fontWeight: 500,
                }}
              >
                Suricata Dashboard
              </Typography>
            </Box>
          </Box>

          <Typography
            variant="h6"
            sx={{
              color: "#B0B0B0",
              textAlign: "center",
              maxWidth: 500,
              mb: 2,
            }}
          >
            Network Intrusion Detection System
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#666",
              textAlign: "center",
              maxWidth: 400,
            }}
          >
            Secure access required. Please authenticate to continue.
          </Typography>
        </Box>

        <LoginModal
          open={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      </>
    );
  }

  // Render protected content if authenticated
  return <>{children}</>;
};

// Export with dynamic import to prevent hydration issues
export const AuthGuard = dynamic(() => Promise.resolve(AuthGuardComponent), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#0D0D0D",
        gap: 2,
      }}
    >
      <CircularProgress
        size={60}
        sx={{
          color: "#FFD600",
        }}
      />
      <Typography
        variant="h6"
        sx={{
          color: "#B0B0B0",
          fontWeight: 500,
        }}
      >
        Loading Matseka Suricata Dashboard...
      </Typography>
    </Box>
  ),
});
