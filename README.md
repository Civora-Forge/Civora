# Civora

Civora is a multilingual civic-tech PWA where citizens submit local development issues (roads, sanitation, schools, health, livelihood). The backend uses Firebase, Google Cloud AI, BigQuery, Maps, and Gemini/Vertex AI to classify, rank, summarize, and map high-priority issues for MPs.

## Repository Structure

```
civora/
├── frontend-pwa/    # Citizen-facing PWA and MP dashboard UI
├── backend-api/     # HTTP APIs, Firestore/BigQuery access, business logic
├── ai-services/     # AI enrichment: transcription, translation, classification, scoring
├── data-infra/      # Firestore/BigQuery schemas, sample datasets
└── shared/          # Shared API contracts and schema definitions
```

## Folder Responsibilities

| Folder | Owner | Rules |
|--------|-------|-------|
| `frontend-pwa/` | Frontend team | Communicates only with `backend-api` via HTTP. Never access Firestore, BigQuery, or AI services directly. |
| `backend-api/` | Backend team | Owns API routes, validation, Firestore/BigQuery access. Calls `ai-services` for enrichment. |
| `ai-services/` | AI/ML team | Pure enrichment functions only. No API routes, no DB writes, no frontend code. |
| `data-infra/` | Data team | Schemas and sample data only. No application logic. |
| `shared/` | All | Single source of truth for API contracts and schemas. Edit only after team sync. |

## Git Workflow

**Never work directly on `main`.**

1. Create a feature or chore branch for each task:
   ```bash
   git checkout main
   git pull
   git checkout -b feature/your-feature-name
   ```
2. Make your changes, commit, and push:
   ```bash
   git add .
   git commit -m "feat: add your feature"
   git push -u origin feature/your-feature-name
   ```
3. Open a pull request into `main`.
4. Get at least one review before merging.

This keeps `main` stable and avoids merge conflicts across the team.

## Shared Contracts

`shared/contracts.md` is the single source of truth for API shapes and database schemas. Edit only after team sync.

## Local Development

### Frontend (Vite + React)

```bash
cd frontend-pwa
npm install
npm run dev
```

Runs at `http://localhost:5173` by default.

### Backend (Node.js + Express)

```bash
cd backend-api
npm install
npm run dev
```

Runs at `http://localhost:5001` by default.

### AI Services

```bash
cd ai-services
npm install
```

Import and use directly from backend — no standalone server.

## Team Assignment Guide

- **Frontend dev**: Work inside `frontend-pwa/` only.
- **Backend dev**: Work inside `backend-api/` only.
- **AI/ML dev**: Work inside `ai-services/` only.
- **Data/devops**: Work inside `data-infra/` only.
- **Shared contracts**: Edit `shared/contracts.md` only after team discussion.

## TODOs for Firebase/GCP Integration

- [ ] Set up Firebase project and service account credentials
- [ ] Configure Firestore security rules
- [ ] Connect `backend-api` to Firestore for issue storage
- [ ] Connect `backend-api` to BigQuery for analytics
- [ ] Implement Google Speech-to-Text in `ai-services/`
- [ ] Implement Google Translation API in `ai-services/`
- [ ] Implement Gemini/Vertex AI classification in `ai-services/`
- [ ] Implement priority scoring model in `ai-services/`
- [ ] Implement ward mapping logic in `ai-services/`
- [ ] Set up Firebase Hosting for `frontend-pwa`
- [ ] Configure Cloud Functions or Cloud Run for `backend-api`
- [ ] Add environment variable management for all services
