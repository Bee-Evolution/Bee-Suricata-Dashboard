# 🔌 Backend Integration Guide - Suricata to Supabase

This guide explains how to connect your Suricata IDS to the dashboard via the Python backend.

## 📋 Overview

```
Suricata (IDS) 
    ↓
eve.json (log file)
    ↓
Python Parser
    ↓
Supabase REST API
    ↓
React Dashboard
```

## 🔧 Python Backend Requirements

### Environment Setup

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install supabase-py python-dotenv
```

### Dependencies
```
supabase-py==2.4.0
python-dotenv==1.0.0
python-json-logger==2.0.7
requests==2.31.0
```

## 🔑 Configuration

### .env File
```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_service_role_key

# Suricata
EVE_LOG_PATH=/var/log/suricata/eve.json
ALERT_CHECK_INTERVAL=5  # seconds

# Alert Processing
BATCH_SIZE=10
RETENTION_DAYS=30
```

## 📝 Example Backend Script

Here's a Python script to parse Suricata EVE logs and send to Supabase:

```python
#!/usr/bin/env python3
"""
Suricata EVE Log Parser → Supabase Uploader
Monitors eve.json and sends alerts to dashboard
"""

import json
import os
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional, List
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# Configuration
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
EVE_LOG_PATH = os.getenv('EVE_LOG_PATH', '/var/log/suricata/eve.json')
CHECK_INTERVAL = int(os.getenv('ALERT_CHECK_INTERVAL', 5))
BATCH_SIZE = int(os.getenv('BATCH_SIZE', 10))

# Severity mapping from Suricata to our dashboard
SEVERITY_MAP = {
    1: 'critical',  # Priority 1
    2: 'high',      # Priority 2
    3: 'medium',    # Priority 3+
}

# Detection type mapping
DETECTION_TYPE_MAP = {
    'Basic Auth': 'http_basic_auth',
    'HTTP Authorization': 'http_basic_auth',
    'FTP USER': 'ftp_auth',
    'FTP PASS': 'ftp_auth',
    'POP3 USER': 'pop3_auth',
    'POP3 PASS': 'pop3_auth',
    'IMAP LOGIN': 'imap_auth',
    'Telnet': 'telnet_auth',
    'SSH': 'ssh_bruteforce',
    'SMB': 'smb_ntlm',
    'Suspicious': 'unknown',
}


class EveLOgParser:
    def __init__(self):
        self.supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        self.last_position = 0
        self.processed_events = set()

    def get_detection_type(self, alert_message: str) -> str:
        """Map Suricata alert message to detection type"""
        message_lower = alert_message.lower()
        
        for key, detection_type in DETECTION_TYPE_MAP.items():
            if key.lower() in message_lower:
                return detection_type
        
        return 'unknown'

    def get_severity(self, priority: int) -> str:
        """Map Suricata priority to severity level"""
        return SEVERITY_MAP.get(priority, 'low')

    def parse_eve_event(self, event: dict) -> Optional[dict]:
        """
        Parse EVE JSON event and convert to alert format
        
        EVE format reference:
        {
            "timestamp": "2024-10-15T10:30:45.123456+0000",
            "flow_id": 123,
            "pcap_cnt": 1,
            "event_type": "alert",
            "src_ip": "192.168.1.100",
            "dest_ip": "10.0.0.50",
            "src_port": 54321,
            "dest_port": 22,
            "proto": "TCP",
            "alert": {
                "action": "alert",
                "gid": 1,
                "signature_id": 123,
                "rev": 1,
                "signature": "SSH Brute Force Attempt",
                "category": "Attempted User Privilege Gain",
                "severity": 1
            }
        }
        """
        try:
            if event.get('event_type') != 'alert':
                return None

            alert_info = event.get('alert', {})
            
            # Create unique event ID to avoid duplicates
            event_id = f"{event.get('timestamp')}-{event.get('flow_id')}"
            if event_id in self.processed_events:
                return None
            
            self.processed_events.add(event_id)

            # Extract network information
            src_ip = event.get('src_ip', '0.0.0.0')
            dest_ip = event.get('dest_ip', '0.0.0.0')
            src_port = event.get('src_port', 0)
            dest_port = event.get('dest_port', 0)
            protocol = event.get('proto', 'unknown').upper()

            # Alert details
            signature = alert_info.get('signature', 'Unknown Alert')
            severity = alert_info.get('severity', 3)
            
            # Determine detection type
            detection_type = self.get_detection_type(signature)

            # Determine alert severity
            alert_severity = self.get_severity(severity)

            # Build payload snippet (first 200 chars of payload if available)
            payload = event.get('payload', '')
            payload_snippet = payload[:200] if payload else None

            return {
                'timestamp': datetime.fromisoformat(
                    event.get('timestamp', datetime.utcnow().isoformat())
                ).isoformat(),
                'source_ip': src_ip,
                'destination_ip': dest_ip,
                'source_port': src_port,
                'destination_port': dest_port,
                'protocol': protocol,
                'detection_type': detection_type,
                'severity': alert_severity,
                'message': signature,
                'payload_snippet': payload_snippet,
                'protocol_info': json.dumps(alert_info),
                'event_count': 1,
                'is_acknowledged': False,
            }

        except Exception as e:
            print(f"Error parsing event: {e}")
            return None

    def read_new_events(self) -> List[dict]:
        """Read new events from eve.json since last check"""
        alerts = []
        
        try:
            if not Path(EVE_LOG_PATH).exists():
                print(f"Warning: EVE log not found at {EVE_LOG_PATH}")
                return alerts

            with open(EVE_LOG_PATH, 'r') as f:
                # Seek to last position
                f.seek(self.last_position)
                
                for line in f:
                    line = line.strip()
                    if not line:
                        continue
                    
                    try:
                        event = json.loads(line)
                        parsed = self.parse_eve_event(event)
                        if parsed:
                            alerts.append(parsed)
                    except json.JSONDecodeError:
                        # Incomplete line, will be read next time
                        break
                
                # Save position for next read
                self.last_position = f.tell()

        except Exception as e:
            print(f"Error reading EVE log: {e}")

        return alerts

    def upload_alerts(self, alerts: List[dict]) -> bool:
        """Upload alerts to Supabase"""
        if not alerts:
            return True

        try:
            # Insert alerts in batches
            for i in range(0, len(alerts), BATCH_SIZE):
                batch = alerts[i:i + BATCH_SIZE]
                response = self.supabase.table('alerts').insert(batch).execute()
                print(f"Uploaded {len(batch)} alerts")

            return True

        except Exception as e:
            print(f"Error uploading alerts: {e}")
            return False

    def cleanup_old_alerts(self):
        """Delete alerts older than retention period"""
        try:
            retention_date = (
                datetime.utcnow() - timedelta(days=int(os.getenv('RETENTION_DAYS', 30)))
            ).isoformat()

            self.supabase.table('alerts').delete().lt('timestamp', retention_date).execute()
            print(f"Cleaned up old alerts")

        except Exception as e:
            print(f"Error cleaning up alerts: {e}")

    def run(self):
        """Main loop - continuously monitor EVE log"""
        print(f"Starting EVE log parser...")
        print(f"Monitoring: {EVE_LOG_PATH}")
        print(f"Check interval: {CHECK_INTERVAL}s")

        try:
            while True:
                # Read new events
                alerts = self.read_new_events()
                
                if alerts:
                    print(f"Found {len(alerts)} new alert(s)")
                    self.upload_alerts(alerts)
                
                # Cleanup old alerts periodically
                if int(time.time()) % 3600 == 0:
                    self.cleanup_old_alerts()
                
                time.sleep(CHECK_INTERVAL)

        except KeyboardInterrupt:
            print("Parser stopped")
        except Exception as e:
            print(f"Fatal error: {e}")


if __name__ == '__main__':
    parser = EveLogParser()
    parser.run()
```

## 🚀 Running the Backend

### As Standalone Script
```bash
python3 eve_parser.py
```

### As Systemd Service (Raspberry Pi)
Create `/etc/systemd/system/matsekasuricata.service`:

```ini
[Unit]
Description=Matsekasuricata Backend - EVE Log Parser
After=network.target suricata.service

[Service]
Type=simple
User=suricata
WorkingDirectory=/home/bee/matsekasuricata/backend
Environment="PATH=/home/bee/matsekasuricata/backend/venv/bin"
ExecStart=/home/bee/matsekasuricata/backend/venv/bin/python3 eve_parser.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable matsekasuricata
sudo systemctl start matsekasuricata
sudo systemctl status matsekasuricata
```

## 📊 EVE JSON Format Examples

### SSH Brute-Force Detection
```json
{
  "timestamp": "2024-10-15T10:30:45.123456+0000",
  "event_type": "alert",
  "src_ip": "192.168.1.100",
  "dest_ip": "10.0.0.50",
  "src_port": 54321,
  "dest_port": 22,
  "proto": "TCP",
  "alert": {
    "action": "alert",
    "gid": 1,
    "signature_id": 2200045,
    "signature": "SSH Brute Force Attempt",
    "category": "Attempted User Privilege Gain",
    "severity": 1
  }
}
```

### HTTP Basic Auth Detection
```json
{
  "timestamp": "2024-10-15T10:31:20.456789+0000",
  "event_type": "alert",
  "src_ip": "203.0.113.45",
  "dest_ip": "10.0.0.50",
  "src_port": 12345,
  "dest_port": 80,
  "proto": "TCP",
  "alert": {
    "action": "alert",
    "gid": 1,
    "signature_id": 2000100,
    "signature": "HTTP Authorization Header Detected",
    "category": "Suspicious Activity",
    "severity": 2
  },
  "payload": "GET / HTTP/1.1\r\nHost: example.com\r\nAuthorization: Basic dXNlcjpwYXNz\r\n"
}
```

### FTP Credentials Detection
```json
{
  "timestamp": "2024-10-15T10:32:10.789012+0000",
  "event_type": "alert",
  "src_ip": "198.51.100.200",
  "dest_ip": "10.0.0.50",
  "src_port": 56789,
  "dest_port": 21,
  "proto": "TCP",
  "alert": {
    "action": "alert",
    "gid": 1,
    "signature_id": 2210100,
    "signature": "FTP USER Command with Credentials",
    "category": "Protocol Based Detection",
    "severity": 2
  },
  "payload": "USER admin\r\nPASS password123\r\n"
}
```

## 🔍 Testing Backend

### Manual Test
```bash
# Test Supabase connection
python3 -c "
from dotenv import load_dotenv
from supabase import create_client
import os
load_dotenv()
client = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))
result = client.table('alerts').select('count', count='exact').execute()
print(f'Total alerts: {result.count}')
"
```

### Insert Test Alert
```bash
python3 -c "
from dotenv import load_dotenv
from supabase import create_client
import os
from datetime import datetime
load_dotenv()
client = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))
test_alert = {
    'timestamp': datetime.utcnow().isoformat(),
    'source_ip': '192.168.1.1',
    'destination_ip': '10.0.0.50',
    'source_port': 12345,
    'destination_port': 22,
    'protocol': 'TCP',
    'detection_type': 'ssh_bruteforce',
    'severity': 'critical',
    'message': 'Test SSH brute-force alert'
}
result = client.table('alerts').insert([test_alert]).execute()
print('Test alert inserted successfully!')
"
```

## 📈 Monitoring Backend Health

### Check Service Status
```bash
sudo systemctl status matsekasuricata
sudo journalctl -u matsekasuricata -f  # Follow logs
```

### Monitor Alert Flow
```bash
# Watch for new alerts in Supabase
watch -n 5 'curl -s "YOUR_SUPABASE_URL/rest/v1/alerts?select=count()&head=true" \
  -H "apikey: YOUR_ANON_KEY" | jq'
```

## 🛠️ Troubleshooting

### Alerts not appearing
1. Check EVE log path: `ls -la /var/log/suricata/eve.json`
2. Verify Supabase credentials
3. Check parser logs: `sudo journalctl -u matsekasuricata -n 50`

### Connection errors
```bash
# Test Supabase connectivity
curl https://YOUR_PROJECT.supabase.co/rest/v1/alerts \
  -H "apikey: YOUR_KEY" \
  -H "Content-Type: application/json"
```

### Parser crashes
- Check Python dependencies: `pip install -r requirements.txt`
- Verify eve.json format: `tail /var/log/suricata/eve.json | jq`
- Check disk space: `df -h`

## 📚 References

- [Suricata EVE Format](https://docs.suricata.io/en/suricata-7.0.0/file-formats/eve/eve.html)
- [Supabase Python SDK](https://github.com/supabase/supabase-py)
- [JSON Lines Format](https://jsonlines.org/)

---

**Your backend is ready to feed alerts to the dashboard!** 🚀
