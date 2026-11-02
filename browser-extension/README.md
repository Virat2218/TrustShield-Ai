# TrustShield AI – Chrome Browser Extension

Real-time browser security extension that integrates directly with TrustShield AI's backend to analyze URLs, detect phishing attempts, identify malicious domains, and provide instant safety ratings.

---

## 🚀 Features

- **Instant Active Tab Analysis:** Automatically detects the current page URL.
- **One-Click AI Scam & Phishing Scan:** Queries TrustShield AI's backend API (`/api/analyze-url`).
- **Dynamic Risk Score Gauge:** Visual score (0–100) and severity rating (Safe, Suspicious, Dangerous).
- **Security Red Flags:** Displays suspicious domain heuristics, brand impersonation signs, and IP flags.
- **Direct Web App Integration:** 
  - One-click button to open the full Deep Scan analysis in the TrustShield web app.
  - One-click button to report malicious sites directly to the community scam registry.
- **Configurable Settings:** Custom backend API URL (`http://localhost:8000` default) and Web App URL (`http://localhost:5173` default).

---

## 🛠️ Installation Guide (Chrome / Brave / Edge)

1. Open your browser and navigate to:
   - **Google Chrome:** `chrome://extensions`
   - **Brave Browser:** `brave://extensions`
   - **Microsoft Edge:** `edge://extensions`
2. In the top-right corner, enable **"Developer mode"**.
3. Click the **"Load unpacked"** button.
4. Select the `browser-extension` folder located inside your local `TrustShield-Ai` project directory (e.g., `<path-to-TrustShield-Ai>/browser-extension`).
5. The extension **"TrustShield AI – Real-Time URL Scam Guard"** will appear in your extensions list.
6. Click the Extensions puzzle piece icon on your browser toolbar and pin **TrustShield AI**.

---

## 🧪 Testing the Extension

1. Ensure the TrustShield AI backend is running:
   ```bash
   cd backend
   ./venv/bin/uvicorn main:app --reload --port 8000
   ```
2. Navigate to any website in your browser (e.g., `https://google.com` or a test suspicious link).
3. Click the TrustShield AI extension icon in your toolbar.
4. Click **"Analyze Website Safety"**.
5. Observe the risk gauge, severity badge, and threat indicators calculated directly by TrustShield AI!

