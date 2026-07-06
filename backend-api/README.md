# Civora Backend API

This folder contains Civora backend HTTP APIs. It owns request validation, Firestore/BigQuery access, and calls ai-services for issue enrichment.

**For frontend integration, use [`docs/frontend-handoff.md`](docs/frontend-handoff.md) as the primary reference.**

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
├── docs/
│   ├── frontend-handoff.md    # Frontend integration guide (primary reference)
│   └── api-examples.md        # PowerShell test commands and expected outputs
└── src/
    ├── index.js                          # Express app, CORS, health route, middleware
    ├── config/
    │   └── env.js                        # Environment-based configuration
    ├── routes/
    │   ├── issues.js                     # POST /issues handler
    │   ├── summary.js                    # GET /summary handler
    │   ├── hotspots.js                   # GET /hotspots handler
    │   └── dev.js                        # POST /dev/seed, DELETE /dev/clear (dev only)
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

## CORS Configuration

The backend allows requests from local frontend development servers:

| Origin | Status |
|--------|--------|
| `http://localhost:5173` | Allowed (Vite default) |
| `http://localhost:3000` | Allowed (React default) |

Allowed methods: `GET`, `POST`, `DELETE`, `OPTIONS`
Allowed headers: `Content-Type`, `Authorization`

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

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Health check with system status |
| `POST` | `/issues` | Submit a new civic issue with priority scoring |
| `GET` | `/summary` | Get aggregated dashboard statistics |
| `GET` | `/hotspots` | Get map-ready hotspot data with explanations |
| `POST` | `/dev/seed` | Seed 10 demo issues (dev only) |
| `DELETE` | `/dev/clear` | Clear all issues (dev only) |

## Development Seed Routes

Quickly populate demo data for testing:

```powershell
# Seed 10 demo issues
Invoke-RestMethod -Method Post -Uri "http://localhost:5001/dev/seed"

# Clear all issues
Invoke-RestMethod -Method Delete -Uri "http://localhost:5001/dev/clear"
```

These routes are only available when `NODE_ENV !== "production"`.

## Google Tools Architecture

| Tool | Civora Use | Current Status | Owner |
|------|-----------|----------------|-------|
| Firebase/Firestore | Persistent issue storage | Prepared, not enabled | backend |
| Gemini/Vertex AI | Issue classification | Adapter-ready | ai-services |
| Translation API | Multilingual text normalization | Adapter-ready | ai-services |
| Speech-to-Text | Voice intake | Adapter-ready | ai-services |
| Vision/Gemini multimodal | Photo understanding | Adapter-ready | ai-services |
| BigQuery | Analytics/reporting | Export mapping ready | backend/data |
| Google Maps | Hotspot display | Backend payload ready | frontend |

**No Google Cloud credentials are required for local development.**

## Documentation

| Document | Purpose |
|----------|---------|
| [`docs/frontend-handoff.md`](docs/frontend-handoff.md) | Frontend integration guide — single source of truth |
| [`docs/api-examples.md`](docs/api-examples.md) | PowerShell test commands and expected outputs |
| `../shared/contracts.md` | Shared API contracts and schemas |
| `../ai-services/README.md` | AI adapter architecture |

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

## Future Google Cloud Setup

1. Create Firebase project
2. Enable Firestore, BigQuery, Cloud Functions
3. Set service account credentials
4. Configure environment variables
5. Deploy to Cloud Run or Firebase Functions
