# Civora Backend API

This folder contains Civora backend HTTP APIs. It owns request validation, Firestore/BigQuery access, and calls ai-services for issue enrichment.

## Responsibility

- Receive and validate incoming API requests (Zod-based validation)
- Call `ai-services` for issue enrichment (classification, severity, project title)
- Calculate transparent priority scores for each issue
- Detect nearby duplicate/similar issues via geo-clustering
- Generate human-readable explanations for priority scores
- Store enriched issues (in-memory or Firestore, configurable)
- Export issues to BigQuery for analytics
- Serve aggregated dashboard summaries and map hotspot data

## Project Structure

```
backend-api/
├── package.json
├── .env.example
├── README.md
└── src/
    ├── index.js                          # Express app, health route, middleware
    ├── config/
    │   └── env.js                        # Environment-based configuration
    ├── routes/
    │   ├── issues.js                     # POST /issues handler
    │   ├── summary.js                    # GET /summary handler
    │   └── hotspots.js                   # GET /hotspots handler
    ├── schemas/
    │   └── issueSchema.js                # Zod validation schema
    ├── middleware/
    │   ├── errorHandler.js               # Global error handler
    │   └── requestLogger.js              # Request/response logging
    ├── services/
    │   ├── issueService.js               # Issue submission orchestration
    │   ├── summaryService.js             # Dashboard summary aggregation
    │   ├── hotspotService.js             # Map hotspot aggregation
    │   ├── priorityScoring.js            # Weighted priority score calculation
    │   ├── issueClustering.js            # Geo-based duplicate detection
    │   ├── priorityExplanation.js        # Human-readable priority reasons
    │   └── bigQueryExportService.js      # BigQuery export helper
    ├── repositories/
    │   ├── issueRepository.js            # Repository selector
    │   ├── inMemoryIssueRepository.js    # In-memory storage
    │   └── firestoreIssueRepository.js   # Firestore storage
    ├── utils/
    │   ├── geo.js                        # Haversine distance calculation
    │   ├── ids.js                        # ID generation
    │   └── dates.js                      # Date utility functions
    └── validators/
        └── issueValidator.js             # Validation adapter
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

## Environment Variables

Copy `.env.example` to `.env` and configure as needed.

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5001` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `ISSUE_REPOSITORY` | `memory` | Storage backend: `memory` or `firestore` |
| `GOOGLE_CLOUD_PROJECT` | (empty) | GCP project ID (for Firestore) |
| `FIRESTORE_DATABASE_ID` | `(default)` | Firestore database ID |
| `ENABLE_AI_ENRICHMENT` | `false` | Enable real Gemini AI calls |
| `ENABLE_BIGQUERY_EXPORT` | `false` | Enable BigQuery export |
| `GEMINI_API_KEY` | (empty) | API key for Gemini |

**Default mode uses in-memory storage and stub AI adapters. No Google Cloud credentials are required for local development.**

## Repository Modes

| Mode | Storage | Credentials Required |
|------|---------|---------------------|
| `memory` (default) | In-memory array | No |
| `firestore` | Google Cloud Firestore | Yes |

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Health check with system status |
| `POST` | `/issues` | Submit a new civic issue with priority scoring |
| `GET` | `/summary` | Get aggregated dashboard statistics |
| `GET` | `/hotspots` | Get map-ready hotspot data with explanations |

## Priority Scoring

Each issue receives a priority score (0.0–1.0) calculated using a weighted formula:

```
priorityScore =
  0.35 * severityScore
+ 0.25 * duplicateClusterScore
+ 0.20 * populationImpactScore
+ 0.10 * infraScarcityScore
+ 0.10 * recencyScore
```

## Manual Verification

### 1. Health check

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5001/"
```

### 2. Submit issue with photo/audio placeholders

```powershell
Invoke-RestMethod -Method Post `
  -Uri "http://localhost:5001/issues" `
  -ContentType "application/json" `
  -Body '{"text":"Large pothole near the bus stop causing traffic issues","language":"en","photoUrl":"https://example.com/photo.jpg","audioUrl":"","latitude":8.5241,"longitude":76.9366,"createdAt":"2026-07-06T12:00:00Z","categoryHint":"roads"}'
```

### 3. Submit nearby duplicate issue

```powershell
Invoke-RestMethod -Method Post `
  -Uri "http://localhost:5001/issues" `
  -ContentType "application/json" `
  -Body '{"text":"Road broken near bus stop, difficult for vehicles","language":"en","photoUrl":"","audioUrl":"","latitude":8.5243,"longitude":76.9368,"createdAt":"2026-07-06T13:00:00Z","categoryHint":"roads"}'
```

### 4. Get summary

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5001/summary"
```

### 5. Get hotspots

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5001/hotspots"
```

## Accessibility and Low-Connectivity Design

Civora is designed for inclusive, low-connectivity civic participation:

- **Multilingual text intake** — citizens can submit issues in their local language
- **Voice intake** — future Speech-to-Text integration for illiterate users
- **Photo-based reporting** — Gemini multimodal for visual issue documentation
- **Lightweight API payloads** — optimized for slow mobile networks
- **Maps-ready hotspot data** — clean geospatial data for MP dashboard
- **Future SMS/WhatsApp/Dialogflow integration** — reach citizens without smartphones

## Known Limitations

- In-memory storage does not persist across restarts
- Ward reference data is hardcoded
- AI enrichment returns stub values by default
- No authentication or rate limiting yet
- No real photo/audio upload processing

## What Google Tools Are Now Prepared

| Tool | Status | Activation |
|------|--------|------------|
| Firestore | Adapter ready | Set `ISSUE_REPOSITORY=firestore` |
| BigQuery | Export helper ready | Set `ENABLE_BIGQUERY_EXPORT=true` |
| Gemini | Classification adapter ready | Set `GEMINI_API_KEY` |
| Translation | Adapter ready | Set `ENABLE_AI_ENRICHMENT=true` |
| Speech-to-Text | Adapter ready | Set `ENABLE_AI_ENRICHMENT=true` |
| Vision | Adapter ready | Set `ENABLE_AI_ENRICHMENT=true` |

## Future Google Cloud Setup

1. Create Firebase project
2. Enable Firestore, BigQuery, Cloud Functions
3. Set service account credentials
4. Configure environment variables
5. Deploy to Cloud Run or Firebase Functions
