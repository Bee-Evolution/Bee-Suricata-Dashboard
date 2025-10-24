"use client";

import { Box } from "@mui/material";
import type React from "react";
import { useSidebar } from "@/contexts/SidebarContext";
import Sidebar from "./sidebar";
import Topbar from "./topbar";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { collapsed } = useSidebar();
  const drawerWidth = 280;
  const collapsedWidth = 64;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        overflow: "hidden",
        "&::-webkit-scrollbar": {
          display: "none",
        },
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <Sidebar />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          marginLeft: collapsed ? `${collapsedWidth}px` : `${drawerWidth}px`,
          transition: "margin-left 0.3s ease",
          minHeight: "100vh",
          overflow: "hidden",
          "&::-webkit-scrollbar": {
            display: "none",
          },
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <Topbar />
        <Box
          component="main"
          sx={{
            p: 3,
            flex: 1,
            overflow: "auto",
            "&::-webkit-scrollbar": {
              display: "none",
            },
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
