# Building History Analyzer (Serverless Node.js + TypeScript MVP)

A fast, modern, and beautiful Web MVP to estimate a building's construction timeline and latest urban change using **Google Earth Engine (GEE)** and **Sentinel-2 Harmonized Satellite Imagery (2016-2026)**.

The analysis is based on the **Normalized Difference Built-Up Index (NDBI)**, which tracks changes in urban and building concrete densities within a user-defined 4-point geographic polygon.

---

## 🚀 Architecture Overview

*   **Frontend**: Next.js (TypeScript, React, Tailwind CSS, App Router)
*   **Backend (Serverless API Route)**: A Next.js API Route Handler (`/api/analyze-building`)
    *   Authenticates with Google Earth Engine using Service Account credentials.
    *   Runs the remote Sentinel-2 query and computes NDBI mean over a polygon.
    *   **Performance Optimized**: Executes entirely server-side in GEE in a single evaluation roundtrip.
    *   Applies a double-threshold analysis algorithm to estimate the appearance year and last detected change year.
    *   **Zero Python**: Completely written in Node.js / TypeScript.

---

## 🔑 Environment Configuration

Create a `.env` file in the root directory by copying the example:

```bash
cp .env.example .env
```

Open `.env` and fill in the service account credentials:

```env
EARTH_ENGINE_PROJECT_ID="your-google-cloud-project-id"
EARTH_ENGINE_CLIENT_EMAIL="gee-analyzer-sa@your-gcp-project.iam.gserviceaccount.com"
EARTH_ENGINE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
```

*Note: Make sure to escape newline characters (`\n`) in the private key.*

---

## 💻 Local Development Setup

Make sure you have Node.js 18+ installed.

### 1. Install Dependencies
Navigate to the root directory and install npm packages:

```bash
npm install
```

### 2. Start the Development Server
Start the Next.js development server:

```bash
npm run dev
```

Open `http://localhost:3000` in your web browser.

---

## 🧪 Verification and Testing

### Test Backend API directly (with cURL)
Open your terminal and run this request to verify the server handles polygon coordinates, runs Earth Engine, and outputs the correct JSON contract:

```bash
curl -X POST http://localhost:3000/api/analyze-building \
  -H "Content-Type: application/json" \
  -d '{
    "coordinates": [
      [31.2331, 30.0431],
      [31.2335, 30.0431],
      [31.2335, 30.0435],
      [31.2331, 30.0435]
    ]
  }'
```

Response structure if successful:
```json
{
  "success": true,
  "estimated_construction_year": 2018,
  "estimated_last_change_year": 2023,
  "timeline": [
    {
      "year": 2016,
      "ndbi": 0.0410
    },
    ...
  ]
}
```

### Test Frontend
Visit `http://localhost:3000` in your web browser.
1. Enter four latitude/longitude coordinate points.
2. Click **Analyze Building**.
3. Verify that the loading state is shown and inputs are disabled.
4. Verify the results card and timeline table appear once the request completes.

---

## 🛡️ Security

*   Google Earth Engine credentials are kept strictly server-side.
*   No secrets are exposed to client-side bundles (e.g. no `NEXT_PUBLIC_*` prefixes).
*   `.env` is ignored by git to avoid credentials leakage.
*   Request coordinates are strictly validated on the server before query construction.
