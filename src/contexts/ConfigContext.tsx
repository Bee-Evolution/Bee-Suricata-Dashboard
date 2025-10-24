"use client";

import type React from "react";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface ConfigState {
  supabaseUrl: string;
  supabaseKey: string;
  apiUrl: string;
  isConfigured: boolean;
}

interface ConfigContextType {
  config: ConfigState;
  updateConfig: (newConfig: Partial<ConfigState>) => void;
  resetToDefaults: () => void;
  testConnection: () => Promise<{ success: boolean; message: string }>;
  isTesting: boolean;
  saveConfig: () => void;
  refreshServices: () => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

// Default configuration
const DEFAULT_CONFIG: ConfigState = {
  supabaseUrl:
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co",
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  isConfigured: false,
};

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [config, setConfig] = useState<ConfigState>(DEFAULT_CONFIG);
  const [isTesting, setIsTesting] = useState(false);

  // Load configuration from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedConfig = localStorage.getItem("dashboardConfig");
      if (savedConfig) {
        try {
          const parsedConfig = JSON.parse(savedConfig);
          setConfig((prevConfig) => ({
            ...prevConfig,
            ...parsedConfig,
            isConfigured: true,
          }));
        } catch (error) {
          console.error("Failed to parse saved config:", error);
        }
      }
    }
  }, []);

  // Save configuration to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined" && config.isConfigured) {
      localStorage.setItem("dashboardConfig", JSON.stringify(config));
    }
  }, [config]);

  const updateConfig = (newConfig: Partial<ConfigState>) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      ...newConfig,
      isConfigured: true,
    }));
  };

  const resetToDefaults = () => {
    setConfig(DEFAULT_CONFIG);
    if (typeof window !== "undefined") {
      localStorage.removeItem("dashboardConfig");
    }
  };

  const saveConfig = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "dashboardConfig",
        JSON.stringify({
          ...config,
          isConfigured: true,
        }),
      );
    }
  };

  const refreshServices = () => {
    // Refresh API service with new configuration
    if (typeof window !== "undefined") {
      // Trigger a page reload to refresh all services with new config
      window.location.reload();
    }
  };

  const testConnection = async (): Promise<{
    success: boolean;
    message: string;
  }> => {
    setIsTesting(true);

    try {
      // Test Supabase connection
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(config.supabaseUrl, config.supabaseKey);

      const { data, error } = await supabase
        .from("security_alerts")
        .select("count")
        .limit(1);

      if (error) {
        return {
          success: false,
          message: `Supabase connection failed: ${error.message}`,
        };
      }

      // Test backend API connection
      try {
        const response = await fetch(`${config.apiUrl}/api/status`, {
          method: "GET",
          timeout: 5000,
        } as any);

        if (!response.ok) {
          return {
            success: false,
            message: `Backend API connection failed: ${response.status} ${response.statusText}`,
          };
        }
      } catch (apiError) {
        return {
          success: false,
          message: `Backend API connection failed: ${apiError instanceof Error ? apiError.message : "Unknown error"}`,
        };
      }

      return {
        success: true,
        message: "Both Supabase and Backend API connections successful!",
      };
    } catch (error) {
      return {
        success: false,
        message: `Connection test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <ConfigContext.Provider
      value={{
        config,
        updateConfig,
        resetToDefaults,
        testConnection,
        isTesting,
        saveConfig,
        refreshServices,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
};
