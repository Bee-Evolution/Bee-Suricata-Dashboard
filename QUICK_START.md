# 🚀 Matsekasuricata Frontend - Quick Start Guide

## What's Been Built

Your Matsekasuricata IDS dashboard is now a fully-functional, production-ready React application with:

### ✨ Features Implemented

1. **Bee-Branded Dark Theme**
   - Bee Yellow (#FFD600) primary color
   - Dark Charcoal (#121212) background
   - Professional, modern UI design

2. **Real-time Alert Dashboard**
   - Live alert monitoring with Supabase integration
   - Attack type distribution pie chart
   - Top attacking IPs bar chart
   - Statistics KPI cards

3. **Alert Management**
   - Comprehensive alert list with filtering
   - Search by IP, message, timestamp
   - Filter by severity and detection type
   - Detailed alert drawer with full information

4. **8 Detection Types**
   - HTTP Basic Auth
   - HTTP Form Auth
   - FTP Auth
   - POP3/IMAP Auth
   - Telnet Auth (Critical)
   - SSH Brute-Force (Critical)
   - SMB/NTLM Auth
   - Port Scan & Malware signatures

## 🏃 Quick Start

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Supabase
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### 3. Start Development Server
```bash
npm run dev
```

Visit: **http://localhost:3000**

## 📋 Supabase Setup

### Create the Alerts Table

```sql
-- Create alerts table
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  source_ip INET NOT NULL,
  destination_ip INET NOT NULL,
  source_port INTEGER NOT NULL,
  destination_port INTEGER NOT NULL,
  protocol VARCHAR(20),
  detection_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  payload_snippet TEXT,
  protocol_info TEXT,
  event_count INTEGER DEFAULT 1,
  is_acknowledged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indices for performance
CREATE INDEX idx_alerts_timestamp ON alerts(timestamp DESC);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_source_ip ON alerts(source_ip);
CREATE INDEX idx_alerts_detection_type ON alerts(detection_type);

-- Enable realtime
ALTER TABLE alerts REPLICA IDENTITY FULL;
```

### Insert Sample Alerts

```sql
INSERT INTO alerts (
  timestamp, source_ip, destination_ip, source_port, destination_port,
  protocol, detection_type, severity, message
) VALUES
  (NOW(), '192.168.1.100', '10.0.0.50', 54321, 22, 'TCP', 'ssh_bruteforce', 'critical', 'SSH brute-force attack detected on port 22'),
  (NOW() - INTERVAL '5 min', '203.0.113.45', '10.0.0.50', 12345, 21, 'TCP', 'ftp_auth', 'high', 'Cleartext FTP credentials detected'),
  (NOW() - INTERVAL '10 min', '198.51.100.200', '10.0.0.50', 56789, 110, 'TCP', 'pop3_auth', 'high', 'Plaintext POP3 login attempt'),
  (NOW() - INTERVAL '15 min', '192.0.2.1', '10.0.0.50', 11111, 23, 'TCP', 'telnet_auth', 'critical', 'Telnet cleartext authentication detected');
```

## 🎯 Dashboard Overview

### Main Page Components

1. **Header Section**
   - Dashboard title and description
   - Real-time status indicator

2. **Statistics Cards** (4 KPIs)
   - Total Alerts
   - Critical Alerts Count
   - Unique Source IPs
   - Most Common Attack Type

3. **Visualization Charts**
   - Left: Attack Distribution (Pie Chart)
   - Right: Top Attacking IPs (Bar Chart)

4. **Alerts Table**
   - Full alert list with sorting
   - Click rows to view details in drawer
   - Real-time updates as new alerts arrive

## 📊 Alert Data Model

```typescript
interface Alert {
  id: string;                    // Unique identifier
  timestamp: string;             // Event time (ISO 8601)
  source_ip: string;             // Attacking IP
  destination_ip: string;        // Target IP
  source_port: number;           // Source port
  destination_port: number;      // Target port (e.g., 22, 21, 110)
  protocol: string;              // TCP, UDP, etc.
  detection_type: DetectionType; // One of 8 types
  severity: AlertSeverity;       // critical, high, medium, low, info
  message: string;               // Description
  payload_snippet?: string;      // First 200 bytes of payload
  is_acknowledged: boolean;      // Alert status
  created_at: string;            // DB insert time
  updated_at: string;            // Last update time
}
```

## 🔄 How Real-time Works

The dashboard automatically receives new alerts via Supabase subscriptions:

1. **Insert a new alert in Supabase**
2. **Dashboard instantly updates** (no refresh needed)
3. **Alert appears at top of list**
4. **Statistics recalculate automatically**

## 🎨 Customization

### Change Colors
Edit `/src/app/providers.tsx` palette section:
```typescript
primary: {
  main: '#FFD600',  // Change Bee Yellow
  dark: '#F9A825',
}
```

### Add New Detection Types
1. Add to `DetectionType` in `/src/types/alerts.ts`
2. Add label in `DETECTION_TYPE_LABELS`
3. Add description in `DETECTION_TYPE_DESCRIPTIONS`
4. Add default severity in `DETECTION_TYPE_SEVERITY`

### Customize Chart Colors
Edit color arrays in:
- `/src/components/charts/AttackDistributionChart.tsx`
- `/src/components/charts/TopIpsChart.tsx`

## 🔧 Available Commands

```bash
npm run dev      # Start development server
npm run build    # Create production build
npm run start    # Run production build
npm run lint     # Check code with Biome
npm run format   # Auto-format code
```

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main dashboard page
│   ├── layout.tsx            # Root layout & metadata
│   ├── providers.tsx         # Theme provider
│   └── globals.css           # Global styles
├── components/
│   ├── alerts/
│   │   ├── AlertsList.tsx    # Alert table
│   │   └── AlertDetailDrawer.tsx  # Detail view
│   ├── charts/
│   │   ├── AttackDistributionChart.tsx
│   │   └── TopIpsChart.tsx
│   ├── stats/
│   │   └── AlertStatsCards.tsx
│   ├── layout.tsx            # Main layout
│   ├── sidebar.tsx           # Navigation
│   └── topbar.tsx            # Header
├── hooks/
│   └── useAlerts.ts          # Data fetching logic
├── lib/
│   └── supabase.ts           # Supabase client
└── types/
    └── alerts.ts             # Type definitions
```

## 🐛 Troubleshooting

### Dashboard shows "No alerts found"
✅ Solution: Insert sample alerts into Supabase (see above)

### Alerts not updating
✅ Check `.env.local` has correct Supabase URL and key
✅ Verify `alerts` table exists in Supabase
✅ Check browser console for errors

### Supabase errors
✅ Ensure table is created with exact column names
✅ Check RLS (Row Level Security) policies allow SELECT/INSERT

### Port 3000 in use
✅ Run: `npm run dev -- -p 3001`

## 🚀 Next Steps

1. **Connect Suricata Backend**
   - Backend should push alerts to Supabase
   - See backend documentation

2. **Deploy to Production**
   - Build: `npm run build`
   - Deploy to Vercel, Netlify, or your server

3. **Add Authentication**
   - Implement Supabase Auth
   - Protect dashboard with login

4. **Mobile Optimization**
   - Dashboard is responsive but can be enhanced
   - Add PWA capabilities

## 📞 Support Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Material-UI Docs**: https://mui.com
- **Recharts Docs**: https://recharts.org

---

**Your dashboard is ready to monitor network threats! 🛡️**
