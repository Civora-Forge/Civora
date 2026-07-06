# Civora

Civora is a multilingual civic-tech PWA where citizens submit local development issues such as roads, sanitation, schools, health, and livelihood needs. The backend uses Firebase, Google Cloud AI, BigQuery, Maps, and Gemini/Vertex AI to classify, rank, summarize, and map high-priority issues for MPs.

---

## Table of Contents

- [Repository Structure](#repository-structure)
- [Folder Responsibilities](#folder-responsibilities)
- [Prerequisites](#prerequisites)
- [Git Workflow](#git-workflow)
- [Getting Started](#getting-started)
  - [Clone and Install](#clone-and-install)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
  - [AI Services](#ai-services)
  - [Data Infrastructure](#data-infrastructure)
- [Running Locally](#running-locally)
- [API Endpoints](#api-endpoints)
- [Shared Contracts](#shared-contracts)
- [Team Assignment Guide](#team-assignment-guide)
- [Environment Variables](#environment-variables)
- [Firebase and GCP Setup](#firebase-and-gcp-setup)
- [Deployment](#deployment)
- [Project Roadmap and TODOs](#project-roadmap-and-todos)

---

## Repository Structure

```
civora/
├── .gitignore
├── README.md
│
├── frontend-pwa/          # Citizen-facing PWA and MP dashboard UI
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── README.md
│   ├── public/
│   │   ├── manifest.json
│   │   └── service-worker.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       └── components/
│           └── ReportIssue.jsx
│
├── backend-api/           # HTTP APIs, Firestore/BigQuery access, business logic
│   ├── package.json
│   ├── README.md
│   └── src/
│       └── index.js
│
├── ai-services/           # AI enrichment: transcription, translation, classification, scoring
│   ├── package.json
│   ├── README.md
│   └── src/
│       ├── enrichIssue.js
│       └── test.js
│
├── data-infra/            # Firestore/BigQuery schemas, sample datasets
│   ├── README.md
│   ├── firestore/
│   │   └── schema.md
│   ├── bigquery/
│   │   └── schema.md
│   └── samples/
│       └── ward_sample.csv
│
└── shared/                # Shared API contracts and schema definitions
    └── contracts.md
```

---

## Folder Responsibilities

| Folder | Owner | Rules |
|--------|-------|-------|
| `frontend-pwa/` | Frontend team | Communicates only with `backend-api` via HTTP. Never access Firestore, BigQuery, or AI services directly. |
| `backend-api/` | Backend team | Owns API routes, validation, Firestore/BigQuery access. Calls `ai-services` for enrichment. |
| `ai-services/` | AI/ML team | Pure enrichment functions only. No API routes, no DB writes, no frontend code. |
| `data-infra/` | Data team | Schemas and sample data only. No application logic. |
| `shared/` | All | Single source of truth for API contracts and schemas. Edit only after team sync. |

---

## Prerequisites

- **Node.js** v18 or higher ([download](https://nodejs.org/))
- **npm** v9 or higher (comes with Node.js)
- **Git** ([download](https://git-scm.com/))
- A GitHub account with access to the Civora repository

Optional (for later phases):
- Firebase CLI (`npm install -g firebase-tools`)
- Google Cloud SDK (`gcloud` CLI)

---

## Git Workflow

**Never work directly on `main`.**

### Starting a new task

```bash
# Always start from an up-to-date main
git checkout main
git pull

# Create a branch for your task
git checkout -b feature/your-feature-name
```

### Branch naming conventions

| Prefix | Use for |
|--------|---------|
| `feature/` | New features (e.g., `feature/photo-upload`) |
| `fix/` | Bug fixes (e.g., `fix/form-validation`) |
| `chore/` | Repo setup, tooling, configs (e.g., `chore/initial-civora-structure`) |
| `docs/` | Documentation changes |

### Making changes

```bash
# Make your changes inside your assigned folder only
git add .
git commit -m "feat: add photo upload placeholder"
git push -u origin feature/your-feature-name
```

### Opening a pull request

1. Push your branch to origin.
2. Open a pull request (PR) into `main` on GitHub.
3. Fill in the PR description with what changed and why.
4. Get at least one review before merging.
5. After merge, delete your feature branch.

### Conflict avoidance

- Each team member works **only** inside their assigned folder.
- `shared/contracts.md` edits require team sync first.
- Pull `main` frequently to stay up to date:
  ```bash
  git checkout main
  git pull
  git checkout feature/your-branch
  git merge main
  ```

---

## Getting Started

### Clone and Install

```bash
git clone <repository-url>
cd civora
```

### Frontend Setup

```bash
cd frontend-pwa
npm install
```

**Tech stack:** Vite + React 18

**Available scripts:**

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server at `http://localhost:5173` |
| `npm run build` | Build production bundle to `dist/` |
| `npm run preview` | Preview production build locally |

**Key files:**

| File | Purpose |
|------|---------|
| `src/App.jsx` | Root component, renders `ReportIssue` |
| `src/components/ReportIssue.jsx` | Issue submission form with fields for text, language, photo, audio, location, category |
| `public/manifest.json` | PWA manifest for installability |
| `public/service-worker.js` | Service worker stub for offline caching |
| `vite.config.js` | Vite configuration with React plugin |

### Backend Setup

```bash
cd backend-api
npm install
```

**Tech stack:** Node.js + Express

**Available scripts:**

| Command | Description |
|---------|-------------|
| `npm run dev` | Start server at `http://localhost:5001` |
| `npm start` | Start server in production mode |

**Key files:**

| File | Purpose |
|------|---------|
| `src/index.js` | Express server with all API routes |

**Endpoints:**

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/issues` | Submit a new civic issue |
| `GET` | `/summary` | Get aggregated issue statistics |
| `GET` | `/hotspots` | Get geographic hotspots |

### AI Services

```bash
cd ai-services
npm install
```

This is a library package, not a standalone server. Import functions directly in the backend.

**Available scripts:**

| Command | Description |
|---------|-------------|
| `node src/test.js` | Run a quick smoke test for `enrichIssue` |

**Key files:**

| File | Purpose |
|------|---------|
| `src/enrichIssue.js` | Exports `enrichIssue(rawIssue)` — returns AI-enriched fields |

### Data Infrastructure

No installation required. This folder contains only documentation and sample data.

**Key files:**

| File | Purpose |
|------|---------|
| `firestore/schema.md` | Firestore collection schemas (`issues`, `wards`) |
| `bigquery/schema.md` | BigQuery table schemas (`issues`, `wards`, `infra_stats`) |
| `samples/ward_sample.csv` | Sample ward data (3 wards) |

---

## Running Locally

### Full local development (3 terminals)

**Terminal 1 — Backend:**

```bash
cd backend-api
npm install
npm run dev
```

Server starts at `http://localhost:5001`.

**Terminal 2 — Frontend:**

```bash
cd frontend-pwa
npm install
npm run dev
```

Dev server starts at `http://localhost:5173`.

**Terminal 3 — AI Services smoke test (optional):**

```bash
cd ai-services
node src/test.js
```

### Testing the API

Submit an issue via curl:

```bash
curl -X POST http://localhost:5001/issues \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Road is damaged near the bus stop",
    "language": "en",
    "photoUrl": "",
    "audioUrl": "",
    "latitude": 8.5241,
    "longitude": 76.9366,
    "createdAt": "2026-07-06T12:00:00Z",
    "categoryHint": "roads"
  }'
```

Expected response:

```json
{
  "ok": true,
  "issueId": "issue_1"
}
```

Get summary:

```bash
curl http://localhost:5001/summary
```

Get hotspots:

```bash
curl http://localhost:5001/hotspots
```

---

## API Endpoints

Full API contracts are defined in [`shared/contracts.md`](shared/contracts.md).

### POST /issues

Submit a new civic issue.

**Request body:**

```json
{
  "text": "Road is damaged near the bus stop",
  "language": "en",
  "photoUrl": "",
  "audioUrl": "",
  "latitude": 8.5241,
  "longitude": 76.9366,
  "createdAt": "2026-07-06T12:00:00Z",
  "categoryHint": "roads"
}
```

**Response:**

```json
{
  "ok": true,
  "issueId": "issue_1"
}
```

**Validation rules:**

- `text` — required, non-empty string
- `language` — required, ISO language code
- `latitude` — required, number
- `longitude` — required, number
- `createdAt` — optional, defaults to current timestamp
- `photoUrl`, `audioUrl`, `categoryHint` — optional, default to empty string

### GET /summary

Get aggregated issue statistics.

**Response:**

```json
{
  "totalIssues": 123,
  "byCategory": [
    { "category": "roads", "count": 50 },
    { "category": "schools", "count": 30 }
  ],
  "topWards": [
    { "wardId": "15", "issues": 20 },
    { "wardId": "7", "issues": 18 }
  ]
}
```

### GET /hotspots

Get geographic hotspots of high-priority issues.

**Response:**

```json
{
  "hotspots": [
    {
      "wardId": "15",
      "latitude": 8.5241,
      "longitude": 76.9366,
      "category": "roads",
      "count": 10
    }
  ]
}
```

---

## Shared Contracts

`shared/contracts.md` is the single source of truth for API shapes and database schemas.

### Issue Schema

**Raw fields (submitted by citizen):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | yes | Citizen description of the issue |
| `language` | string | yes | ISO language code (e.g., `en`, `ml`) |
| `photoUrl` | string | no | URL to uploaded photo |
| `audioUrl` | string | no | URL to uploaded audio |
| `latitude` | number | yes | GPS latitude |
| `longitude` | number | yes | GPS longitude |
| `createdAt` | string | yes | ISO timestamp |
| `categoryHint` | string | no | Citizen-suggested category |

**AI-enriched fields (added by backend):**

| Field | Type | Description |
|-------|------|-------------|
| `finalCategory` | string | AI-determined category |
| `severity` | string | Estimated severity level |
| `projectTitle` | string | Auto-generated project title |
| `priorityScore` | number | 0.0–1.0 priority score |
| `wardId` | string | Mapped ward identifier |

**System fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Auto-generated unique ID |

### Shared Enums

```
category = roads | schools | health | sanitation | livelihood | other
severity = low | medium | high
```

---

## Team Assignment Guide

| Team Member | Work In | Never Touch |
|-------------|---------|-------------|
| Frontend dev | `frontend-pwa/` only | `backend-api/`, `ai-services/`, `data-infra/` |
| Backend dev | `backend-api/` only | `frontend-pwa/`, `ai-services/`, `data-infra/` |
| AI/ML dev | `ai-services/` only | `frontend-pwa/`, `backend-api/`, `data-infra/` |
| Data/DevOps | `data-infra/` only | `frontend-pwa/`, `backend-api/`, `ai-services/` |
| Shared contracts | `shared/contracts.md` only | All other files |

**Rules:**

- Stay inside your folder.
- If you need a change in another folder, open a GitHub issue or discuss with the team.
- Never edit `shared/contracts.md` without team sync.

---

## Environment Variables

Create `.env` files in each folder as needed. These are gitignored.

### backend-api/.env.example

```
PORT=5001
FIRESTORE_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
```

### frontend-pwa/.env.example

```
VITE_API_BASE_URL=http://localhost:5001
```

---

## Firebase and GCP Setup

This section is for the team member handling infrastructure.

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Click "Add project" and name it `civora`.
3. Enable Google Analytics (optional).

### 2. Enable Required Services

In the Firebase console:

| Service | Where | Purpose |
|---------|-------|---------|
| Firestore Database | Build > Firestore | Store issues and ward data |
| Authentication | Build > Authentication | Citizen and admin login (later) |
| Hosting | Build > Hosting | Deploy frontend PWA |
| Cloud Functions | Build > Functions | Run backend API |
| Storage | Build > Storage | Store uploaded photos and audio |

### 3. Create Firestore Collections

Create two collections matching the schema in `data-infra/firestore/schema.md`:

- `issues` — for all submitted civic issues
- `wards` — for ward reference data

### 4. Service Account

1. Go to Project Settings > Service accounts.
2. Generate a new private key.
3. Save as `backend-api/service-account.json` (gitignored).
4. Set `GOOGLE_APPLICATION_CREDENTIALS` in `backend-api/.env`.

### 5. BigQuery (Optional, for analytics)

1. Enable BigQuery API in Google Cloud Console.
2. Create dataset `civora_analytics`.
3. Create tables `issues`, `wards`, `infra_stats` matching `data-infra/bigquery/schema.md`.

---

## Deployment

### Frontend (Firebase Hosting)

```bash
cd frontend-pwa
npm run build
firebase deploy --only hosting
```

### Backend (Cloud Functions or Cloud Run)

**Option A — Firebase Cloud Functions:**

```bash
cd backend-api
firebase deploy --only functions
```

**Option B — Cloud Run:**

```bash
cd backend-api
gcloud run deploy civora-api --source .
```

---

## Project Roadmap and TODOs

### Phase 1 — MVP (Current)

- [x] Monorepo structure with clear folder boundaries
- [x] Frontend PWA with issue submission form
- [x] Backend API with stub endpoints
- [x] AI enrichment stub function
- [x] Firestore and BigQuery schema documentation
- [x] Shared API contracts
- [x] Sample ward data

### Phase 2 — Core Integrations

- [ ] Firebase project setup and credentials
- [ ] Connect `backend-api` to Firestore for issue storage
- [ ] Photo and audio upload to Firebase Storage
- [ ] Geolocation auto-fill in the frontend form
- [ ] PWA offline caching and background sync

### Phase 3 — AI Pipeline

- [ ] Google Speech-to-Text for audio transcription
- [ ] Google Translation API for multilingual support
- [ ] Gemini/Vertex AI for issue classification and project title generation
- [ ] Severity estimation model
- [ ] Priority scoring based on severity, frequency, and infrastructure data
- [ ] Ward mapping from GPS coordinates

### Phase 4 — Analytics and Dashboard

- [ ] BigQuery integration for analytics
- [ ] MP dashboard with summary views
- [ ] Hotspot map using Google Maps API
- [ ] Category-wise and ward-wise breakdowns

### Phase 5 — Production

- [ ] Firebase Hosting deployment
- [ ] Cloud Functions or Cloud Run deployment
- [ ] Authentication for citizens and admins
- [ ] Security rules for Firestore
- [ ] Monitoring and error tracking
