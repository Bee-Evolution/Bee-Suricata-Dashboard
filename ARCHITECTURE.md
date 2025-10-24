# 🏗️ Matsekasuricata Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         NETWORK TRAFFIC                             │
│                  (Raspberry Pi / Server)                            │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │    SURICATA     │
                    │  IDS ENGINE     │
                    │   (Port 22,     │
                    │   21, 110, etc) │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   eve.json      │
                    │  (Log File)     │
                    └────────┬────────┘
                             │
                    ┌────────▼───────────────┐
                    │   PYTHON BACKEND      │
                    │  (Log Processing)     │
                    │  • Parse EVE JSON     │
                    │  • Extract attack     │
                    │  • HTTP display       │
                    └────────┬───────────────┘
                             │
                ┌────────────▼────────────────┐
                │   SUPABASE CLOUD DB        │
                │  • PostgreSQL alerts       │
                │  • Real-time subscriptions │
                │  • REST API                │
                └────────────┬───────────────┘
                             │
                ┌────────────▼────────────────┐
                │    FRONTEND DASHBOARD      │
                │  • React + Next.js         │
                │  • Real-time updates       │
                │  • Visualization           │
                │  • Web UI                  │
                └────────────────────────────┘
```

## Frontend Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      NEXT.JS APP ROUTER                      │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              page.tsx (Client Component)            │    │
│  │         (Main Dashboard Container)                  │    │
│  └──────────────┬──────────────────────────────────────┘    │
│                 │                                            │
│   ┌─────────────┼─────────────┬─────────────┐               │
│   │             │             │             │               │
│   ▼             ▼             ▼             ▼               │
│ ┌─────┐  ┌──────────────┐  ┌─────────┐  ┌─────────┐       │
│ │ ... │  │   LAYOUT     │  │ TOPBAR  │  │SIDEBAR  │       │
│ └─────┘  │   (Routes)   │  │ (Header)│  │(Nav)    │       │
│          └──────────────┘  └─────────┘  └─────────┘       │
│                                                             │
│              DASHBOARD GRID LAYOUT                        │
│  ┌──────────────────────────────────────────────────┐     │
│  │           STATISTICS CARDS (4 KPIs)              │     │
│  ├──────────────────────────────────────────────────┤     │
│  │  ┌───────────────┐    ┌───────────────┐         │     │
│  │  │   PIE CHART   │    │  BAR CHART    │         │     │
│  │  │  Distribution │    │  Top IPs      │         │     │
│  │  └───────────────┘    └───────────────┘         │     │
│  ├──────────────────────────────────────────────────┤     │
│  │        ALERTS TABLE (with filtering)             │     │
│  │  ┌──────┬──────┬──────┬────────┬─────────┐      │     │
│  │  │ Time │  IP  │ Type │ Severity│Message  │      │     │
│  │  ├──────┼──────┼──────┼────────┼─────────┤      │     │
│  │  │ .... │ .... │ .... │  .... │  ....   │      │     │
│  │  └──────┴──────┴──────┴────────┴─────────┘      │     │
│  │      [Click row] ──> DETAIL DRAWER              │     │
│  └──────────────────────────────────────────────────┘     │
│                                                             │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌─────────────────────┐
│  Suricata detects   │
│   attack pattern    │
│   (e.g., SSH bru-   │
│    force on port 22)│
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────┐
│  Writes to eve.json:     │
│  {                       │
│    timestamp: ...,       │
│    src_ip: 192.168.1.1,  │
│    dest_ip: 10.0.0.50,   │
│    dest_port: 22,        │
│    alert: {...}          │
│  }                       │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Python Parser:          │
│  • Read eve.json         │
│  • Extract fields        │
│  • Categorize attack     │
│  • Assign severity       │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  POST to Supabase        │
│  INSERT alerts (...)     │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Database receives:      │
│  Alert record stored     │
│  RLS policy verified     │
│  Timestamp indexed       │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Real-time broadcast:    │
│  Supabase emits event    │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Frontend subscribed to  │
│  INSERT events on        │
│  alerts table            │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  React setState:         │
│  Add alert to top        │
│  Recalculate stats       │
│  Update charts           │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  User sees NEW ALERT     │
│  appear instantly in     │
│  dashboard (no refresh)  │
└──────────────────────────┘
```

## Detection Type Severity Mapping

```
CRITICAL (Red #F44336)
├── SSH Brute-Force (Port 22)
└── Telnet Auth (Port 23)

HIGH (Orange #FF6F00)
├── HTTP Basic Auth
├── FTP Auth (Port 21)
├── POP3 Auth (Port 110)
├── IMAP Auth (Port 143)
└── SMB/NTLM Auth (Port 445)

MEDIUM (Amber #FFA726)
├── HTTP Form Auth
└── Port Scan

LOW (Yellow #FDD835)
└── [Custom signatures]

INFO (Blue #42A5F5)
└── [Informational events]
```

## Component Hierarchy

```
Providers (Theme)
└── Layout
    ├── Sidebar
    │   └── Navigation Items
    ├── Topbar
    │   ├── Logo
    │   ├── Live Status
    │   └── User Menu
    └── Main Content
        ├── Header
        ├── AlertStatsCards
        │   ├── StatCard (Total)
        │   ├── StatCard (Critical)
        │   ├── StatCard (IPs)
        │   └── StatCard (Most Common)
        ├── Grid Row 1 (Charts)
        │   ├── AttackDistributionChart
        │   │   └── Pie Chart (Recharts)
        │   └── TopIpsChart
        │       └── Bar Chart (Recharts)
        └── Alerts Section
            ├── AlertsList (Table)
            │   ├── Filters (Search, Severity, Type)
            │   └── Table with Rows
            └── AlertDetailDrawer
                ├── Alert Info
                ├── Network Details
                ├── Payload Preview
                └── Acknowledge Button
```

## State Management Flow

```
┌─────────────────────────────────┐
│  useAlerts()                    │
│  • Fetches initial alerts       │
│  • Subscribes to INSERT events  │
│  • Returns [alerts, loading]    │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  AlertsList Component           │
│  • Local state: filters         │
│  • useMemo: filtered results    │
│  • Row click: select alert      │
└──────────┬──────────────────────┘
           │
           ├──────────────────────────────┐
           │                              │
           ▼                              ▼
┌──────────────────────┐    ┌──────────────────────┐
│ Alert Table renders  │    │ Detail Drawer opens  │
│ • Colored chips      │    │ • Full alert info    │
│ • Click handlers     │    │ • Network details    │
│ • Sort/filter       │    │ • Payload preview    │
└──────────────────────┘    └──────────────────────┘

┌──────────────────────────────────┐
│  useAlertStats()                 │
│  • Calculates stats              │
│  • Returns [stats, loading]      │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  AlertStatsCards Component       │
│  • Renders 4 KPI cards          │
│  • Color-coded by metric        │
│  • Shows percentages            │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  useAttackDistribution()         │
│  • Groups alerts by type        │
│  • Calculates percentages       │
│  • Returns [distribution]       │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  AttackDistributionChart         │
│  • Pie chart render              │
│  • Bee Yellow colors             │
│  • Legend & labels               │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  useTopIps()                     │
│  • Aggregates by source IP      │
│  • Counts alerts                 │
│  • Returns top 10                │
└──────────┬───────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  TopIpsChart                     │
│  • Bar chart render              │
│  • Sorted by count               │
│  • Responsive sizing             │
└──────────────────────────────────┘
```

## Database Query Patterns

### Real-time Subscription
```typescript
supabase.channel('alerts_channel')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'alerts' },
    (payload) => updateDashboard(payload.new)
  )
  .subscribe()
```

### Initial Load
```typescript
const { data } = await supabase
  .from('alerts')
  .select('*')
  .order('timestamp', { ascending: false })
  .limit(100)
```

### Statistics Calculation
```typescript
// Total alerts
const { count: total } = await supabase
  .from('alerts')
  .select('*', { count: 'exact', head: true })

// Critical only
const { count: critical } = await supabase
  .from('alerts')
  .select('*', { count: 'exact', head: true })
  .eq('severity', 'critical')
```

## Performance Considerations

### Optimizations
- ✅ Indexed queries on `timestamp`, `severity`, `source_ip`
- ✅ Limit to 100 recent alerts
- ✅ Recharts memoization
- ✅ Component lazy loading
- ✅ CSS-in-JS (MUI) for dynamic theming

### Scalability
- Current design: ~1,000 alerts/hour
- For higher load: Implement alert aggregation
- Consider: Elasticsearch for large deployments

---

**This architecture is designed for small networks and educational use cases while remaining scalable for future enhancements.**
