# 📚 Matsekasuricata Documentation Index

Welcome! Here's a complete guide to all available documentation and how to use each one.

## 🎯 Start Here

### For First-Time Setup
**→ [QUICK_START.md](./QUICK_START.md)**
- Installation steps
- Environment configuration
- Running the dashboard
- Sample data for testing

### For Project Understanding
**→ [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)**
- What's been built
- Feature checklist
- File structure
- Next steps

## 📖 Complete Documentation

### 1. Frontend Dashboard Guide
**→ [README_DASHBOARD.md](./README_DASHBOARD.md)**

**Contents:**
- Project objectives and architecture
- Supported alert types (8 detection types)
- Design system and color palette
- Dashboard features overview
- Technology stack
- Installation & setup
- Database schema
- Available scripts
- Project roadmap
- Limitations and caveats

**When to read:** Full feature documentation and system design

### 2. Technical Architecture
**→ [ARCHITECTURE.md](./ARCHITECTURE.md)**

**Contents:**
- System-level architecture diagram
- Frontend component hierarchy
- Data flow visualization
- State management patterns
- Component structure
- Database query patterns
- Performance considerations
- Scalability details

**When to read:** Understanding how components work together

### 3. Backend Integration
**→ [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)**

**Contents:**
- Backend requirements
- Python dependencies
- Configuration (.env setup)
- Complete backend script (copy-paste ready)
- Systemd service setup for Raspberry Pi
- EVE JSON format examples
- Testing the backend
- Monitoring health
- Troubleshooting

**When to read:** Connecting Suricata to the dashboard

## 🗂️ Quick Navigation by Use Case

### "I just want to get it running"
1. Read: [QUICK_START.md](./QUICK_START.md)
2. Run: `npm install && npm run dev`
3. Done!

### "I need to understand what this does"
1. Read: [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)
2. Skim: [README_DASHBOARD.md](./README_DASHBOARD.md)

### "I want to understand the architecture"
1. Read: [ARCHITECTURE.md](./ARCHITECTURE.md)
2. Explore: `/src` folder

### "I need to connect my Suricata backend"
1. Read: [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)
2. Copy the Python script
3. Configure environment
4. Run as systemd service

### "I want to customize the dashboard"
1. Read: [README_DASHBOARD.md](./README_DASHBOARD.md) (Customization section)
2. Edit: `/src/app/providers.tsx` (colors)
3. Edit: `/src/types/alerts.ts` (types)

### "I'm deploying to production"
1. Read: [QUICK_START.md](./QUICK_START.md) (Production section)
2. Follow deployment guide
3. Configure environment variables
4. Set up backend service

## 📋 File Reference

### Frontend Files

#### Configuration
```
package.json              - Dependencies & scripts
tsconfig.json            - TypeScript config
next.config.ts           - Next.js settings
biome.json               - Code formatter config
.env.example             - Environment template
```

#### Application Source
```
src/app/
  ├── page.tsx           - Main dashboard
  ├── layout.tsx         - Root layout
  ├── providers.tsx      - Theme provider
  └── globals.css        - Global styles

src/components/
  ├── layout.tsx         - Main wrapper
  ├── sidebar.tsx        - Navigation
  ├── topbar.tsx         - Header
  ├── alerts/
  │   ├── AlertsList.tsx - Alert table
  │   └── AlertDetailDrawer.tsx
  ├── charts/
  │   ├── AttackDistributionChart.tsx
  │   └── TopIpsChart.tsx
  └── stats/
      └── AlertStatsCards.tsx

src/hooks/
  └── useAlerts.ts       - Data fetching logic

src/lib/
  └── supabase.ts        - Database client

src/types/
  └── alerts.ts          - Type definitions
```

#### Documentation
```
QUICK_START.md           - Get started in 5 minutes
IMPLEMENTATION_SUMMARY.md - What's been built
README_DASHBOARD.md      - Full feature guide
ARCHITECTURE.md          - Technical deep-dive
BACKEND_INTEGRATION.md   - Connect your backend
```

## 🎯 Quick Reference

### Common Tasks

#### Start Development Server
```bash
npm run dev
```
→ Visit http://localhost:3000

#### Build for Production
```bash
npm run build
npm run start
```

#### Format Code
```bash
npm run format
```

#### Check for Errors
```bash
npm run lint
```

#### Update Dependencies
```bash
npm install
```

### Supabase Setup

#### SQL Table Creation
See [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) → "Create the Alerts Table"

#### Insert Test Data
See [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) → "Insert Test Alert"

### Alert Types Supported

| Type | Protocol | Port | Severity |
|------|----------|------|----------|
| HTTP Basic Auth | HTTP | 80 | High |
| HTTP Form Auth | HTTP | 80 | Medium |
| FTP Auth | FTP | 21 | High |
| POP3 Auth | POP3 | 110 | High |
| IMAP Auth | IMAP | 143 | High |
| Telnet Auth | Telnet | 23 | **Critical** |
| SSH Brute-Force | SSH | 22 | **Critical** |
| SMB/NTLM | SMB | 445 | High |

## 🎨 Design System

### Colors
- **Primary**: #FFD600 (Bee Yellow)
- **Background**: #121212 (Dark Charcoal)
- **Cards**: #1A1A1A (Graphite Black)
- **Text**: #E0E0E0 (Off-White)
- **Borders**: #2B2B2B (Accent Grey)

### Severity Colors
- **Critical**: #F44336 (Red)
- **High**: #FF6F00 (Orange)
- **Medium**: #FFA726 (Amber)
- **Low**: #FDD835 (Yellow)
- **Info**: #42A5F5 (Blue)

## 🔧 Configuration

### Environment Variables
See [QUICK_START.md](./QUICK_START.md) → "Configure Supabase"

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 🚀 Deployment

### Recommended Platforms
1. **Vercel** (recommended for Next.js)
   - See [README_DASHBOARD.md](./README_DASHBOARD.md)
2. **Netlify**
3. **Docker Container**
4. **Raspberry Pi** (direct)

## 🐛 Troubleshooting

### Common Issues

**"Cannot find module"**
→ Run: `npm install`

**"Port 3000 in use"**
→ Run: `npm run dev -- -p 3001`

**"No alerts appearing"**
→ Check [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) → "Testing Backend"

**"Supabase errors"**
→ Verify credentials in `.env.local`
→ Check table was created

See individual docs for more troubleshooting.

## 📞 Support Resources

### Official Documentation
- **Next.js**: https://nextjs.org/docs
- **Supabase**: https://supabase.com/docs
- **Material-UI**: https://mui.com/docs
- **Recharts**: https://recharts.org

### Included in This Project
- In-code comments
- Type definitions with JSDoc
- Component prop documentation
- Database schema documentation

## 📊 Architecture Overview

```
┌─────────────────────────────────────┐
│   Your Security Monitoring Stack    │
├─────────────────────────────────────┤
│                                     │
│  Suricata IDS → eve.json file       │
│       ↓                             │
│  Python Backend (parser script)     │
│       ↓                             │
│  Supabase PostgreSQL Database       │
│       ↓                             │
│  React Dashboard (this project)     │
│       ↓                             │
│  Your Browser (viewing alerts)      │
│                                     │
└─────────────────────────────────────┘
```

## ✅ Verification Checklist

- [ ] Read QUICK_START.md
- [ ] Run `npm install`
- [ ] Configure .env.local
- [ ] Create Supabase table
- [ ] Run `npm run dev`
- [ ] Visit http://localhost:3000
- [ ] Insert test alert in Supabase
- [ ] See alert appear in dashboard
- [ ] Read BACKEND_INTEGRATION.md
- [ ] Deploy backend parser

## 🎯 Next Steps

1. **Quick Setup** (5 mins)
   - Follow QUICK_START.md

2. **Understand Dashboard** (10 mins)
   - Skim README_DASHBOARD.md

3. **Connect Backend** (30 mins)
   - Follow BACKEND_INTEGRATION.md

4. **Deploy** (varies)
   - See README_DASHBOARD.md → Deployment

5. **Customize** (as needed)
   - Edit components in `/src`
   - Modify colors in providers.tsx
   - Add new detection types

## 📈 Success Metrics

**Dashboard is working when:**
- ✓ Page loads without errors
- ✓ Statistics cards show numbers
- ✓ Charts render without errors
- ✓ Alerts table displays data
- ✓ Filters work and update results
- ✓ Real-time updates work
- ✓ Detail drawer opens on click

## 🎉 You're All Set!

Everything you need is documented. Start with:

### 👉 **[QUICK_START.md](./QUICK_START.md)**

---

**Happy monitoring! 🛡️**

*Matsekasuricata - Real-time IDS for Raspberry Pi and Small Networks*
