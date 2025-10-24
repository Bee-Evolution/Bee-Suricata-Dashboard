# API Connection Debugging Guide

## Current Issue: Network Error from Browser

The backend is running correctly on `http://localhost:8000`, but the frontend browser is getting "Network Error" when trying to reach it.

## Possible Causes & Solutions

### 1. Check Browser Console for the Actual Request URL

Open browser DevTools (F12) → Network tab → Look for failed requests to see what URL is being called.

**Check for:**
- Is it trying to reach `http://localhost:8000/api/...` or something else?
- Any CORS errors in console?
- Check the request details (URL, headers, etc.)

### 2. Clear localStorage (Most Common Fix)

The API service checks `localStorage.getItem("dashboardConfig")` which might have a wrong API URL saved.

**In Browser Console, run:**
```javascript
// Check current config
console.log(localStorage.getItem("dashboardConfig"));

// Clear it if it's wrong
localStorage.removeItem("dashboardConfig");

// Then refresh the page
location.reload();
```

### 3. Set Environment Variable

Create `frontend/.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Then restart the Next.js dev server.

### 4. Check if Frontend is Running

The frontend should be running on http://localhost:3000 (or another port).

**Verify with:**
```bash
cd frontend
npm run dev
```

### 5. Test Backend API Directly

From terminal, verify backend works:
```bash
# Test protocol endpoint (no auth required)
curl http://localhost:8000/api/analytics/protocol-details

# Test with auth token
TOKEN="your-token-here"
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/ip-management/stats
```

### 6. Check CORS in Backend

Backend should have CORS enabled (already configured in main.py):
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Quick Fix Command Sequence

```bash
# 1. Ensure backend is running
cd /home/bee/Desktop/matsekasuricata/backend
source venv/bin/activate
python main.py

# 2. In another terminal, ensure frontend is running  
cd /home/bee/Desktop/matsekasuricata/frontend
npm run dev

# 3. In browser console (F12), clear localStorage:
localStorage.removeItem("dashboardConfig");
location.reload();
```

## Expected Behavior

- Backend API: http://localhost:8000/api/
- Frontend App: http://localhost:3000
- Browser makes requests from localhost:3000 → localhost:8000
- CORS allows cross-origin requests

## If Still Not Working

1. Check browser console for actual error details
2. Check Network tab for failed request URL
3. Verify frontend dev server port
4. Try accessing backend directly: http://localhost:8000/docs (should show Swagger UI)
