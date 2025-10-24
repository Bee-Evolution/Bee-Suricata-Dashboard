/**
 * API Service for Matseka Suricata Dashboard
 * Handles communication with the FastAPI backend
 */

import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import type {
  AlertStats,
  Alert as AlertType,
  AttackDistribution,
  TopIp,
} from "@/types/alerts";
import type { AuthResponse, LoginCredentials, User } from "@/types/auth";

// API Response types
interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

interface PaginatedResponse<T> {
  alerts: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

interface AnalyticsData {
  total_alerts: number;
  critical_alerts: number;
  high_alerts: number;
  medium_alerts: number;
  low_alerts: number;
  unique_attackers: number;
  hourly_data: { time: string; count: number }[];
  severity_distribution: { severity: string; count: number }[];
  attack_types: { type: string; count: number }[];
  top_countries: { country: string; count: number }[];
  top_protocols: { protocol: string; count: number }[];
}

interface TimelineData {
  counts: number[];
  labels: string[];
}

interface SeverityData {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  private getApiUrl(): string {
    // Get API URL from localStorage (dynamic config) or environment
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
          console.warn("Failed to parse saved config for API URL:", error);
        }
      }
    }

    // Ensure URL doesn't end with /api to avoid double /api
    if (apiUrl.endsWith("/api")) {
      apiUrl = apiUrl.replace("/api", "");
    }

    return `${apiUrl}/api`;
  }

  constructor() {
    this.baseURL = this.getApiUrl();
    
    console.log("🔗 API Service initialized");
    console.log(`📍 Base URL: ${this.baseURL}`);
    console.log("💡 If this URL is wrong, clear localStorage: localStorage.removeItem('dashboardConfig')");

    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // Increased to 30 seconds
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add auth token to requests if available
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem("matseka_auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        console.log(
          `API Request: ${config.method?.toUpperCase()} ${config.url}`,
        );
        return config;
      },
      (error) => {
        console.error("API Request Error:", error);
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        // Enhanced error logging for Network Errors
        if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
          console.error("❌ NETWORK ERROR - Cannot reach backend API");
          console.error(`Attempted URL: ${this.baseURL}`);
          console.error("Possible causes:");
          console.error("1. Backend server not running (expected: http://localhost:8000)");
          console.error("2. Wrong API URL in localStorage (check 'dashboardConfig')");
          console.error("3. CORS policy blocking the request");
          console.error("4. Firewall or network issue");
          console.error("\nTo fix: Run in browser console:");
          console.error("  localStorage.getItem('dashboardConfig')");
          console.error("  localStorage.removeItem('dashboardConfig') // if URL is wrong");
          console.error("  location.reload()");
        } else {
          console.error("API Response Error:", error);
          if (error.response?.status === 404) {
            console.warn("API endpoint not found - backend may not be running");
          }
        }
        return Promise.reject(error);
      },
    );
  }

  // Authentication
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log("API login called with:", credentials);
    const response = await this.api.post("/auth/login", credentials);
    console.log("API login response:", response.data);
    return response.data;
  }

  async validateToken(): Promise<ApiResponse<{ valid: boolean; user?: User }>> {
    const response = await this.api.post("/auth/validate");
    return response.data;
  }

  async logout(): Promise<ApiResponse<{ success: boolean; message: string }>> {
    const response = await this.api.post("/auth/logout");
    return response.data;
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await this.api.get("/auth/me");
    return response.data;
  }

  // Health and Status
  async getHealth(): Promise<
    ApiResponse<{ status: string; timestamp: string; database: string }>
  > {
    const response = await this.api.get("/health");
    return response.data;
  }

  async getStatus(): Promise<
    ApiResponse<{ status: string; uptime: string; version: string }>
  > {
    const response = await this.api.get("/status");
    return response.data;
  }

  // Alerts
  async getAlerts(
    filters: {
      severity?: string[];
      detection_type?: string[];
      timeRange?: string;
      search?: string;
    } = {},
    page: number = 1,
    limit: number = 50,
  ): Promise<PaginatedResponse<AlertType>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: limit.toString(),
    });

    if (filters.severity?.length) {
      params.append("severity", filters.severity.join(","));
    }
    if (filters.detection_type?.length) {
      params.append("detection_type", filters.detection_type.join(","));
    }
    if (filters.timeRange) {
      params.append("timeRange", filters.timeRange);
    }
    if (filters.search) {
      params.append("search", filters.search);
    }

    const response = await this.api.get(`/alerts?${params.toString()}`);
    return response.data;
  }

  async getAlertById(id: string): Promise<ApiResponse<AlertType>> {
    const response = await this.api.get(`/alerts/${id}`);
    return response.data;
  }

  async acknowledgeAlert(
    id: string,
  ): Promise<ApiResponse<{ success: boolean }>> {
    const response = await this.api.patch(`/alerts/${id}/acknowledge`);
    return response.data;
  }

  // Analytics
  async getDashboardStats(
    timeRange: string = "24hours",
  ): Promise<ApiResponse<AlertStats>> {
    // Backend exposes dashboard stats at /dashboard/stats
    const response = await this.api.get(
      `/dashboard/stats?time_range=${timeRange}`,
    );
    return response.data;
  }

  async getAnalytics(_timeRange: string = "7days"): Promise<ApiResponse<any>> {
    // Fetch all analytics data from different endpoints
    const [
      dashboardStats,
      timelineData,
      severityData,
      attackTypes,
      geographicData,
    ] = await Promise.all([
      this.api.get("/dashboard/stats"),
      this.api.get(`/analytics/timeline?days=7`),
      this.api.get("/analytics/severity-distribution"),
      this.api.get("/analytics/attack-types"),
      this.api.get("/analytics/geographic"),
    ]);

    // Combine all data into a single response
    const combinedData = {
      total_alerts: dashboardStats.data.totalAlerts || 0,
      critical_alerts: dashboardStats.data.criticalAlerts || 0,
      high_alerts: 0, // Will be calculated from severity data
      medium_alerts: 0, // Will be calculated from severity data
      unique_attackers: dashboardStats.data.uniqueAttackers || 0,
      hourly_data: timelineData.data || [],
      severity_breakdown: severityData.data || [],
      attack_types: attackTypes.data || [],
      top_countries: geographicData.data || [],
      top_protocols: [], // Will be added from protocol stats
    };

    return { data: combinedData, success: true };
  }

  async getAlertTimeline(
    timeRange: string = "7days",
  ): Promise<ApiResponse<TimelineData>> {
    // Backend expects `days` query param
    const days = parseInt(timeRange.replace(/[^0-9]/g, ""), 10) || 7;
    const response = await this.api.get(`/analytics/timeline?days=${days}`);
    return response.data;
  }

  async getSeverityDistribution(
    timeRange: string = "7days",
  ): Promise<ApiResponse<SeverityData>> {
    const response = await this.api.get(
      `/analytics/severity-distribution?time_range=${timeRange}`,
    );
    return response.data;
  }

  async getAttackDistribution(
    timeRange: string = "7days",
  ): Promise<ApiResponse<AttackDistribution[]>> {
    const response = await this.api.get(
      `/analytics/attack-types?time_range=${timeRange}`,
    );
    return response.data;
  }

  async getTopIps(
    _timeRange: string = "7days",
    limit: number = 10,
  ): Promise<ApiResponse<TopIp[]>> {
    // There isn't a dedicated top-ips endpoint; fall back to attack-types or protocol stats
    const response = await this.api.get(
      `/analytics/protocol-stats?limit=${limit}`,
    );
    return response.data;
  }

  // Data Management
  async generateSampleData(count: number = 100): Promise<
    ApiResponse<{
      success: boolean;
      generated: number;
      inserted: number;
      message: string;
    }>
  > {
    const response = await this.api.post("/database/generate-sample", {
      count,
    });
    return response.data;
  }

  async clearAlerts(): Promise<
    ApiResponse<{ success: boolean; deleted_count: number }>
  > {
    const response = await this.api.delete("/alerts");
    return response.data;
  }

  async testConnection(): Promise<
    ApiResponse<{ success: boolean; message: string; timestamp: string }>
  > {
    const response = await this.api.get("/database/test-connection");
    return response.data;
  }

  // Database Management
  async initializeDatabase(): Promise<
    ApiResponse<{ success: boolean; message: string }>
  > {
    const response = await this.api.post("/database/initialize");
    return response.data;
  }

  async seedDatabase(): Promise<
    ApiResponse<{ success: boolean; message: string; count: number }>
  > {
    // Backend seed endpoint is /api/db/seed or /api/db/seed?count=100
    const response = await this.api.post("/db/seed");
    return response.data;
  }

  async resetDatabase(): Promise<
    ApiResponse<{ success: boolean; message: string }>
  > {
    const response = await this.api.post("/db/reset");
    return response.data;
  }

  async getSystemStatus(): Promise<ApiResponse<any>> {
    const response = await this.api.get("/status");
    return response.data;
  }

  // Local database endpoints for real-time data
  async getRealtimeAlerts(
    limit: number = 100,
    hours: number = 24,
  ): Promise<ApiResponse<any>> {
    const response = await this.api.get(
      `/local/realtime/alerts?limit=${limit}&hours=${hours}`,
    );
    return response.data;
  }

  async getRealtimeStats(hours: number = 24): Promise<ApiResponse<any>> {
    const response = await this.api.get(`/local/realtime/stats?hours=${hours}`);
    return response.data;
  }

  async getLocalDatabaseInfo(): Promise<ApiResponse<any>> {
    const response = await this.api.get("/local/database/info");
    return response.data;
  }

  async parseSuricataLog(file: File): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append("log_file", file);
    const response = await this.api.post(
      "/local/suricata/parse-log",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  }

  async generateSampleSuricataLog(
    count: number = 100,
  ): Promise<ApiResponse<any>> {
    const response = await this.api.post(
      `/local/suricata/generate-sample?count=${count}`,
    );
    return response.data;
  }

  // Sync service endpoints
  async getSyncStatus(): Promise<ApiResponse<any>> {
    const response = await this.api.get("/sync/status");
    return response.data;
  }

  async startSyncService(): Promise<ApiResponse<any>> {
    const response = await this.api.post("/sync/start");
    return response.data;
  }

  async stopSyncService(): Promise<ApiResponse<any>> {
    const response = await this.api.post("/sync/stop");
    return response.data;
  }

  async forceSyncNow(): Promise<ApiResponse<any>> {
    const response = await this.api.post("/sync/force-sync");
    return response.data;
  }

  // Method to refresh API service with new configuration
  refreshApiService(): void {
    this.baseURL = this.getApiUrl();
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Re-add auth token interceptor
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem("matseka_auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // IP Management methods
  async getIPManagementStats(): Promise<AxiosResponse<any>> {
    return this.api.get("/ip-management/stats");
  }

  async getAllIPs(): Promise<AxiosResponse<any>> {
    return this.api.get("/ip-management/ips");
  }

  async getLoginAttempts(ip?: string): Promise<AxiosResponse<any>> {
    const url = ip
      ? `/ip-management/login-attempts?ip=${ip}`
      : "/ip-management/login-attempts";
    return this.api.get(url);
  }

  async getIPDetails(ip: string): Promise<AxiosResponse<any>> {
    return this.api.get(`/ip-management/ip/${ip}/details`);
  }

  async blockIP(request: any): Promise<AxiosResponse<any>> {
    return this.api.post("/ip-management/block", request);
  }

  async whitelistIP(request: any): Promise<AxiosResponse<any>> {
    return this.api.post("/ip-management/whitelist", request);
  }

  async unblockIP(request: any): Promise<AxiosResponse<any>> {
    return this.api.post("/ip-management/unblock", request);
  }

  async checkIPStatus(ip: string): Promise<AxiosResponse<any>> {
    return this.api.get(`/ip-management/check/${ip}`);
  }

  // Network Configuration methods
  async detectNetworkInfo(): Promise<AxiosResponse<any>> {
    return this.api.get("/network/detect");
  }

  async getSuricataConfig(): Promise<AxiosResponse<any>> {
    return this.api.get("/network/config");
  }

  async updateHomeNetworks(
    homeNetworks: string[],
  ): Promise<AxiosResponse<any>> {
    return this.api.put("/network/config/home-networks", homeNetworks);
  }

  async updateNetworkInterface(
    interfaceName: string,
  ): Promise<AxiosResponse<any>> {
    return this.api.put("/network/config/interface", interfaceName);
  }

  async updatePortGroups(
    portGroups: Record<string, number[]>,
  ): Promise<AxiosResponse<any>> {
    return this.api.put("/network/config/ports", portGroups);
  }

  async validateSuricataConfig(): Promise<AxiosResponse<any>> {
    return this.api.post("/network/config/validate");
  }

  async restoreSuricataConfig(): Promise<AxiosResponse<any>> {
    return this.api.post("/network/config/restore");
  }

  // Protocol Statistics
  async getProtocolStatistics(): Promise<AxiosResponse<any>> {
    return this.api.get("/analytics/protocol-details");
  }

  // Utility methods
  getBaseURL(): string {
    return this.baseURL;
  }

  isConnected(): boolean {
    return !!this.baseURL;
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
