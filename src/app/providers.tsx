"use client";

import { CssBaseline, createTheme, ThemeProvider } from "@mui/material";
import type { ReactNode } from "react";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#FFD600", // Bee Yellow
      light: "#FFE54C",
      dark: "#F9A825",
      contrastText: "#000000",
    },
    secondary: {
      main: "#E0E0E0", // Off-White / Light Grey
      contrastText: "#121212",
    },
    background: {
      default: "#121212", // Dark Charcoal
      paper: "#1A1A1A", // Graphite Black
    },
    text: {
      primary: "#E0E0E0",
      secondary: "#B0B0B0",
    },
    success: {
      main: "#4CAF50",
    },
    warning: {
      main: "#FF9800",
    },
    error: {
      main: "#F44336",
    },
    info: {
      main: "#2196F3",
    },
    divider: "#2B2B2B", // Accent Grey
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
    },
    body1: {
      fontSize: "0.95rem",
      fontWeight: 400,
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
      letterSpacing: "0.5px",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          transition: "all 0.2s ease-in-out",
        },
        contained: {
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 8px 16px rgba(255, 214, 0, 0.3)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#1A1A1A",
          borderRadius: "12px",
          border: "1px solid #2B2B2B",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: "0.85rem",
        },
      },
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
