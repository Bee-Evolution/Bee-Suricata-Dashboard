"use client";

import type React from "react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getSupabaseClient } from "@/lib/supabase";

interface ConnectionState {
  supabaseConnected: boolean;
  backendConnected: boolean;
  lastChecked: Date | null;
  isChecking: boolean;
}

interface ConnectionContextType {
  connectionState: ConnectionState;
  checkConnections: () => Promise<void>;
  refreshConnectionStatus: () => void;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(
  undefined,
);

export const ConnectionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    supabaseConnected: false,
    backendConnected: false,
    lastChecked: null,
    isChecking: false,
  });

  const checkConnections = useCallback(async () => {
    setConnectionState((prev) => ({ ...prev, isChecking: true }));

    try {
      // Check Supabase connection
      let supabaseConnected = false;
      try {
        const supabase = getSupabaseClient();
        if (supabase) {
          const { error } = await supabase
            .from("security_alerts")
            .select("count")
            .limit(1);
          supabaseConnected = !error;
        }
      } catch (_error) {
        supabaseConnected = false;
      }

      // Check Backend connection
      let backendConnected = false;
      try {
        // Get API URL from localStorage or environment
        let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        if (typeof window !== "undefined") {
          const savedConfig = localStorage.getItem("dashboardConfig");
          if (savedConfig) {
            try {
              const config = JSON.parse(savedConfig);
              if (config.apiUrl) {
                apiUrl = config.apiUrl;
              }
            } catch (error) {
              console.warn(
                "Failed to parse saved config for connection check:",
                error,
              );
            }
          }
        }

        const response = await fetch(`${apiUrl}/api/status`, {
          method: "GET",
          timeout: 5000,
        } as any);
        backendConnected = response.ok;
      } catch (_error) {
        backendConnected = false;
      }

      setConnectionState({
        supabaseConnected,
        backendConnected,
        lastChecked: new Date(),
        isChecking: false,
      });
    } catch (_error) {
      setConnectionState((prev) => ({
        ...prev,
        isChecking: false,
        lastChecked: new Date(),
      }));
    }
  }, []);

  const refreshConnectionStatus = useCallback(() => {
    checkConnections();
  }, [checkConnections]);

  // Check connections on mount and every 30 seconds
  useEffect(() => {
    checkConnections();

    const interval = setInterval(checkConnections, 30000);

    return () => clearInterval(interval);
  }, [checkConnections]);

  return (
    <ConnectionContext.Provider
      value={{
        connectionState,
        checkConnections,
        refreshConnectionStatus,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error("useConnection must be used within a ConnectionProvider");
  }
  return context;
};
