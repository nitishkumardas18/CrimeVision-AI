# CrimeVision AI — Karnataka State Police Intelligence & Predictive Analytics Platform

> **Datathon 2026 Submission** | **Hosted exclusively on Zoho Catalyst Serverless Platform**  
> **Live Deployed Prototype:** [CrimeVision AI Live Prototype](https://crime-vision-ai-02-60080081365.development.catalystserverless.in/app/index.html#/)

---

## 📌 Executive Summary

**CrimeVision AI** is an end-to-end, AI-powered crime analytics, geospatial mapping, relationship graph, and risk prediction engine designed specifically for the **Karnataka State Police**. The platform aggregates FIR datasets, suspect master registers, demographic distributions, and temporal crime trends to empower police commanders with actionable predictive intelligence.

---

## ✨ Key Features & Capabilities

1. **Command Dashboard**
   - Real-time crime volume metrics (Total FIRs, Active Cases, Repeat Offenders, Solved Cases).
   - Monthly crime trends (Reported vs. Solved) and category-wise crime distribution charts.

2. **Geospatial Crime Heatmap**
   - High-density interactive GIS map of Karnataka districts built on Leaflet & OpenStreetMap.
   - Real-time district risk classification (*Critical, High, Monitored, Low*) with popups displaying crime counts and timestamps.

3. **Crime Analytics & Z-Score Anomaly Detection**
   - Age band distribution (`<18`, `18-25`, `26-35`, `36-50`, `50+`) and gender demographic breakdown.
   - Automated time-series **Z-Score Anomaly Detection** ($Z > 1.5\sigma$) to flag abnormal crime spikes per district.
   - Dual-model forecasting using **OLS Linear Regression** and **Moving Average** trend smoothing.

4. **Multi-Entity Crime Network Graph**
   - D3 force-directed relationship graph linking repeat offenders, suspects, FIR numbers, vehicles, and locations.
   - Dynamic hub highlight identifying gang kingpins and multi-case offender networks.

5. **AI Risk Prediction Engine**
   - District-level predictive risk scoring based on crime type, target date, and time window (e.g., night patrol risk boost).
   - Generates tactical operational advisories for beat officers and patrol deployment.

6. **AI Command Assistant & Reports**
   - Conversational AI assistant for querying FIR data.
   - Automated PDF report generation with canvas export.

---

## 🛠️ Technology Stack

- **Frontend Core:** React 18, TypeScript, Vite (Configured as a pure Static Single Page Application)
- **Routing:** TanStack Router (`createHashHistory` for seamless static web client hosting)
- **Styling:** TailwindCSS v4 with OkLCH color tokens, glassmorphism UI, dual Dark/Light mode theme system
- **Data Visualizations:** Recharts (Area, Bar, Line, Pie), D3-Force (Network Graph), Leaflet JS (Geospatial Mapping)
- **Cloud & Serverless Hosting:** **Zoho Catalyst Platform**
  - **Catalyst Web Client:** Hosting static frontend bundle
  - **Catalyst Advanced I/O Functions:** Node.js Express microservices integrated with ZCQL Data Store

---

## 🚀 Setup & Local Execution Instructions

### Prerequisites
- Node.js `v18.x` or higher
- npm `v9.x` or higher
- Zoho Catalyst CLI (`npm install -g zcatalyst-cli`)

### Installation & Local Development

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Datathon_2026.git
   cd Datathon_2026
   ```

2. **Install Frontend Dependencies:**
   ```bash
   cd client
   npm install
   ```

3. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Access local dashboard at `http://localhost:5173/app/index.html#/`

4. **Build Production Bundle:**
   ```bash
   npm run build
   ```
   Outputs static assets to `client/.output/public`.

5. **Deploy to Zoho Catalyst:**
   ```bash
   npx zcatalyst-cli deploy
   ```

---

## 🔗 Live Solution Link

- **Deployed Application:** [https://crime-vision-ai-02-60080081365.development.catalystserverless.in/app/index.html#/](https://crime-vision-ai-02-60080081365.development.catalystserverless.in/app/index.html#/)
