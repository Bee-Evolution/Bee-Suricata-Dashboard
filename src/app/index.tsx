import { Grid, Paper, Typography } from "@mui/material";
import dynamic from "next/dynamic";
import type React from "react";
import Layout from "../components/layout";

// Dynamically import charts to avoid SSR issues
const LiveLineChart = dynamic(() => import("../components/liveLineChart"), {
  ssr: false,
});
const LivePieChart = dynamic(() => import("../components/livePieChart"), {
  ssr: false,
});

const DashboardPage: React.FC = () => {
  return (
    <Layout>
      <Typography variant="h4" gutterBottom>
        Real-time Dashboard
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Live Metrics (1s update)</Typography>
            <LiveLineChart />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6">Distribution</Typography>
            <LivePieChart />
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">KPI</Typography>
            <Typography>
              Users online: <strong>42</strong>
            </Typography>
            <Typography>
              Avg latency: <strong>120ms</strong>
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default DashboardPage;
