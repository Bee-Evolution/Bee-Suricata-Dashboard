import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;
let currentConfig: { url: string; key: string } | null = null;

export function getSupabaseClient(customConfig?: {
  url: string;
  key: string;
}): SupabaseClient | null {
  // Use custom config if provided, otherwise try to get from context
  let supabaseUrl: string = "";
  let supabaseKey: string = "";

  if (customConfig) {
    supabaseUrl = customConfig.url;
    supabaseKey = customConfig.key;
  } else {
    // Try to get from localStorage first (dynamic config)
    if (typeof window !== "undefined") {
      const savedConfig = localStorage.getItem("dashboardConfig");
      if (savedConfig) {
        try {
          const config = JSON.parse(savedConfig);
          if (config.supabaseUrl && config.supabaseKey) {
            supabaseUrl = config.supabaseUrl;
            supabaseKey = config.supabaseKey;
          }
        } catch (error) {
          console.warn("Failed to parse saved config:", error);
        }
      }
    }

    // Fallback to environment variables
    if (!supabaseUrl || !supabaseKey) {
      supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    }
  }

  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      "Supabase URL and key not configured. Please set them in the settings or environment variables.",
    );
    return null;
  }

  // Check for placeholder values
  if (
    supabaseUrl === "your_supabase_url_here" ||
    supabaseKey === "your_supabase_anon_key_here" ||
    supabaseUrl === "https://your-project.supabase.co" ||
    supabaseKey === "your-anon-key"
  ) {
    console.warn(
      "Please configure actual Supabase credentials in settings or .env.local file",
    );
    return null;
  }

  // Check if we need to recreate the client (config changed)
  const newConfig = { url: supabaseUrl, key: supabaseKey };
  if (
    !currentConfig ||
    currentConfig.url !== newConfig.url ||
    currentConfig.key !== newConfig.key
  ) {
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    currentConfig = newConfig;
  }

  return supabaseClient;
}

export const supabase = {
  table: (name: string) => {
    const client = getSupabaseClient();
    if (!client) throw new Error("Supabase client not initialized");
    return client.from(name);
  },
  channel: (name: string) => {
    const client = getSupabaseClient();
    if (!client) throw new Error("Supabase client not initialized");
    return client.channel(name);
  },
  auth: {
    getSession: async () => {
      const client = getSupabaseClient();
      if (!client) return { data: { session: null }, error: null };
      return client.auth.getSession();
    },
  },
  // Test connection
  testConnection: async () => {
    const client = getSupabaseClient();
    if (!client) {
      return { connected: false, error: "Supabase client not initialized" };
    }

    try {
      const { data, error } = await client
        .from("security_alerts")
        .select("count")
        .limit(1);
      if (error) {
        return { connected: false, error: error.message };
      }
      return { connected: true, error: null };
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  },
};
