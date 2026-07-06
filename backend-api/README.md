# Civora Backend API

This folder contains Civora backend HTTP APIs. It owns request validation, Firestore/BigQuery access, and calls ai-services for issue enrichment.

## Responsibility

- Receive and validate incoming API requests
- Call `ai-services` for issue enrichment (classification, severity, priority scoring)
- Store enriched issues
- Serve aggregated data for summary and hotspot endpoints

## Project Structure

```
backend-api/
├── package.json
├── README.md
└── src/
    ├── index.js              # Express app, health route, route mounting
    ├── routes/
    │   ├── issues.js         # POST /issues handler
    │   ├── summary.js        # GET /summary handler
    │   └── hotspots.js       # GET /hotspots handler
    ├── services/
    │   └── issueStore.js     # In-memory issue storage
    └── validators/
        └── issueValidator.js # Request validation logic
```

## Setup

### Install dependencies

```bash
cd backend-api
npm install
```

### Run locally

```bash
npm run dev
```

Server starts at `http://localhost:5001`.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/issues` | Submit a new civic issue |
| `GET` | `/summary` | Get aggregated issue statistics |
| `GET` | `/hotspots` | Get map-ready hotspot data |

## Manual Verification

### Health check

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5001/"
```

Expected:

```json
{
  "ok": true,
  "service": "Civora backend API",
  "endpoints": ["POST /issues", "GET /summary", "GET /hotspots"]
}
```

### Submit a valid issue

```powershell
Invoke-RestMethod -Method Post `
  -Uri "http://localhost:5001/issues" `
  -ContentType "application/json" `
  -Body '{"text":"Road is damaged near the bus stop","language":"en","photoUrl":"","audioUrl":"","latitude":8.5241,"longitude":76.9366,"createdAt":"2026-07-06T12:00:00Z","categoryHint":"roads"}'
```

Expected:

```json
{
  "ok": true,
  "issueId": "issue_1"
}
```

### Submit an invalid issue (missing text)

```powershell
Invoke-RestMethod -Method Post `
  -Uri "http://localhost:5001/issues" `
  -ContentType "application/json" `
  -Body '{"language":"en","latitude":8.5241,"longitude":76.9366,"createdAt":"2026-07-06T12:00:00Z"}'
```

Expected: `400` with `"error": "text is required"`

### Get summary

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5001/summary"
```

Expected:

```json
{
  "totalIssues": 1,
  "byCategory": [{ "category": "roads", "count": 1 }],
  "topWards": [{ "wardId": "15", "issues": 1 }]
}
```

### Get hotspots

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5001/hotspots"
```

Expected:

```json
{
  "hotspots": [
    {
      "wardId": "15",
      "latitude": 8.5241,
      "longitude": 76.9366,
      "category": "roads",
      "count": 1
    }
  ]
}
```

## Storage Note

Currently uses **in-memory storage**. Issues are lost when the server restarts. This is intentional for the hackathon MVP.

## TODOs

- [ ] Replace in-memory storage with Firestore
- [ ] Add BigQuery analytics integration
- [ ] Add stronger input validation (sanitization, length limits)
- [ ] Add Firebase Functions deployment config
- [ ] Add authentication and rate limiting
- [ ] Add request logging middleware
- [ ] Add error handling middleware
