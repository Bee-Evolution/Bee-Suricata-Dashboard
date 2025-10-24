# Matsekasuricata - Real-time IDS Dashboard

A lightweight, cost-effective Intrusion Detection System (IDS) dashboard built with React, Next.js, and Supabase. Designed for monitoring network threats on Raspberry Pi and small networks with real-time alert visualization.

## 🎯 Project Objectives

- ✅ Develop a lightweight IDS prototype on Raspberry Pi 4
- ✅ Display real-time security alerts with attack detection
- ✅ Store intrusion data in Supabase cloud database
- ✅ Visualize alerts through an interactive React dashboard
- ✅ Provide cost-effective, portable security monitoring

## 🏗️ Project Architecture

```
matsekasuricata/
├── backend/              # Python middleware (Suricata → Supabase)
├── frontend/             # Next.js React dashboard
│   ├── src/
│   │   ├── app/         # Next.js App Router
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utilities (Supabase client)
│   │   └── types/       # TypeScript types
│   └── package.json
```

## 🚀 Supported Alert Types

The dashboard detects and visualizes these authentication attack patterns:

| Alert Type | Detection Method | Severity | Protocol |
|-----------|-----------------|----------|----------|
| **HTTP Basic Auth** | Authorization header inspection | High | HTTP |
| **HTTP Form Auth** | POST field detection | Medium | HTTP |
| **FTP Auth** | Cleartext credentials | High | FTP (21) |
| **POP3 Auth** | Email login attempts | High | POP3 (110) |
| **IMAP Auth** | Email login attempts | High | IMAP (143) |
| **Telnet Auth** | Cleartext telnet login | Critical | Telnet (23) |
| **SSH Brute-Force** | Port 22 connection attempts | Critical | SSH (22) |
| **SMB/NTLM Auth** | Windows auth detection | High | SMB (445) |

## 🎨 Design System

### Color Palette (Dark Theme)

| Name | Hex | Usage |
|------|-----|-------|
| **Bee Yellow** | `#FFD600` | Primary buttons, highlights, icons |
| **Dark Charcoal** | `#121212` | Main background |
| **Graphite Black** | `#1A1A1A` | Card backgrounds |
| **Off-White** | `#E0E0E0` | Primary text |
| **Accent Grey** | `#2B2B2B` | Borders, dividers |

### Typography

- **Font Family**: Inter, Roboto, Helvetica, Arial
- **Headlines**: Bold, geometric sans-serif
- **Weight Scale**: 400 (normal) → 700 (bold)

## 📊 Dashboard Features

### 1. **Statistics Dashboard**
- Total alerts count
- Critical alerts percentage
- Unique source IPs
- Most common attack type
- 24-hour alert trends

### 2. **Real-time Alert Monitoring**
- Live alert list with filtering
- Color-coded severity indicators
- Searchable by IP, message, timestamp
- Click for detailed alert information

### 3. **Data Visualization**
- **Attack Distribution Pie Chart**: Attack types breakdown
- **Top IPs Bar Chart**: Most active attacking IPs
- **Timeline View**: Historical alert trends

### 4. **Alert Detail Drawer**
Comprehensive alert information:
- Source/Destination IP and ports
- Protocol and detection type
- Severity level with description
- Event message and payload snippet
- Precise timestamps (event, created, updated)
- Acknowledge alert button

### 5. **Filtering & Search**
- **Text Search**: IP addresses, messages
- **Severity Filter**: Critical, High, Medium, Low, Info
- **Detection Type Filter**: All attack categories
- **Real-time Results**: Instant search feedback

## 🔧 Technology Stack

### Frontend
- **Framework**: Next.js 15.5.5 (App Router)
- **UI Library**: Material-UI (MUI) v5
- **Visualization**: Recharts
- **Database Client**: Supabase JS
- **Language**: TypeScript
- **Build Tool**: Turbopack

### Backend (Python)
- Suricata IDS engine
- EVE JSON log processing
- Supabase REST API integration
- Raspberry Pi deployment support

### Database
- **Supabase** (PostgreSQL)
- Real-time subscriptions
- REST API endpoints

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free tier available)

### Setup

1. **Clone and navigate to frontend**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

4. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:3000`

## 📊 Database Schema

### Alerts Table (`alerts`)

```sql
CREATE TABLE alerts (
  id UUID PRIMARY KEY,
  timestamp TIMESTAMP NOT NULL,
  source_ip INET NOT NULL,
  destination_ip INET NOT NULL,
  source_port INTEGER NOT NULL,
  destination_port INTEGER NOT NULL,
  protocol VARCHAR(20),
  detection_type VARCHAR(50),
  severity VARCHAR(20),
  message TEXT,
  payload_snippet TEXT,
  protocol_info TEXT,
  event_count INTEGER DEFAULT 1,
  is_acknowledged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Indices
```sql
CREATE INDEX idx_alerts_timestamp ON alerts(timestamp DESC);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_source_ip ON alerts(source_ip);
CREATE INDEX idx_alerts_detection_type ON alerts(detection_type);
```

## 🔄 Real-time Updates

The dashboard uses Supabase real-time subscriptions:

```typescript
// New alerts appear instantly
supabase
  .channel('alerts_channel')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'alerts' },
    (payload) => { /* Update UI */ }
  )
  .subscribe();
```

## 📝 Available Scripts

```bash
npm run dev      # Start dev server (with Turbopack)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run Biome linter
npm run format   # Format code with Biome
```

## 🛣️ Project Roadmap

### ✅ Completed
- Bee branding color scheme implementation
- Alert type definitions (8 detection types)
- Real-time dashboard with Supabase integration
- Statistics and KPI cards
- Attack distribution visualization
- Alert filtering and search
- Alert detail drawer

### 🔜 Upcoming
- [ ] Geographic IP location mapping
- [ ] Alert correlation and patterns
- [ ] Automated response rules
- [ ] Email/Slack notifications
- [ ] Report generation
- [ ] User authentication
- [ ] Multi-tenant support
- [ ] Mobile-responsive UI improvements
- [ ] Dark/Light theme toggle
- [ ] Alert export (CSV, JSON)

## ⚠️ Limitations & Caveats

### Encryption
- **TLS/SSL Traffic**: Encrypted payloads cannot be inspected for auth patterns
- **SSH Sessions**: Connection attempts detected, but credentials hidden
- **Solution**: Use packet analysis in DMZ or traffic mirroring

### Performance
- Designed for small networks (<1000 alerts/hour)
- Not suitable for enterprise-scale deployment
- Consider alert sampling for high-traffic networks

### Scope
- **Does NOT include**:
  - Intrusion Prevention (IPS)
  - Large-scale enterprise deployment
  - Machine learning/anomaly detection
  - SIEM integration

## 🛠️ Development

### Project Structure
```
src/
├── app/
│   ├── page.tsx           # Main dashboard
│   ├── layout.tsx         # Root layout
│   └── providers.tsx      # Theme provider
├── components/
│   ├── alerts/            # Alert components
│   ├── charts/            # Visualization charts
│   ├── stats/             # Statistics cards
│   ├── sidebar.tsx        # Navigation
│   └── topbar.tsx         # Header
├── hooks/
│   └── useAlerts.ts       # Data fetching hooks
├── lib/
│   └── supabase.ts        # Supabase client
└── types/
    └── alerts.ts          # TypeScript definitions
```

### Type Definitions

All alert types are strongly typed:

```typescript
interface Alert {
  id: string;
  timestamp: string;
  source_ip: string;
  destination_ip: string;
  detection_type: DetectionType;
  severity: AlertSeverity;
  message: string;
  // ... more fields
}
```

## 📚 References

### Suricata Documentation
- [EVE JSON Format](https://docs.suricata.io/en/suricata-7.0.0/file-formats/eve/eve.html)
- [Rule Writing](https://docs.suricata.io/en/suricata-7.0.0/rules/index.html)

### Supabase
- [Docs](https://supabase.com/docs)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)

### Next.js
- [App Router](https://nextjs.org/docs/app)
- [Dynamic Imports](https://nextjs.org/docs/pages/building-your-application/optimizing/dynamic-imports)

## 🐛 Troubleshooting

### "Cannot find module '@supabase/supabase-js'"
```bash
npm install @supabase/supabase-js
```

### "Attempted to call createTheme() from the server"
- Ensure all components using MUI theme are marked with `'use client'`
- Theme provider must be in a client component

### No alerts appearing
- Check Supabase credentials in `.env.local`
- Verify alerts table exists in database
- Check browser console for errors

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review Supabase documentation
3. Check Next.js App Router migration guide

## 📄 License

This project is open-source for educational and small-network security purposes.

---

**Built with ❤️ for Raspberry Pi and small-scale security monitoring**
