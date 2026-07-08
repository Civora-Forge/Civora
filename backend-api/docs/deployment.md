# Deployment Guide

Quick reference for deploying Civora backend to Render.

---

## Local Development

```powershell
cd backend-api
npm install
npm run dev
```

Server starts at `http://localhost:5001`.

## Render Deployment

### Environment Variables (set in Render dashboard)

| Variable | Value | Why |
|----------|-------|-----|
| `NODE_ENV` | `production` | Standard for Render |
| `PORT` | `5001` | Match backend default |
| `ISSUE_REPOSITORY` | `memory` | No Firestore credentials needed |
| `ENABLE_DEV_ROUTES` | `true` | Allows `/dev/seed` and `/dev/clear` on Render |
| `ENABLE_AI_ENRICHMENT` | `false` | Stub mode (no Gemini key needed) |
| `ENABLE_BIGQUERY_EXPORT` | `false` | No BigQuery export |
| `ENABLE_FIREBASE_AUTH` | `false` | No Firebase Auth (anonymous only) |

### After First Deploy

1. Seed demo data:
   ```
   POST https://civora-backend-2odl.onrender.com/dev/seed
   ```
2. Verify:
   ```
   GET https://civora-backend-2odl.onrender.com/summary
   GET https://civora-backend-2odl.onrender.com/hotspots
   GET https://civora-backend-2odl.onrender.com/wards
   ```

### Why ENABLE_DEV_ROUTES=true?

Render sets `NODE_ENV=production` by default. The `/dev/seed` and `/dev/clear` routes are normally disabled in production. Setting `ENABLE_DEV_ROUTES=true` re-enables them so you can seed demo data without needing a separate staging environment.

**Security note:** These routes are harmless in a hackathon demo — they only insert/delete test data in memory. For production, remove this flag.

---

## Smoke Test Commands

### Health check
```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5001/"
```

### Seed demo data
```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5001/dev/seed"
```

### Get summary
```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5001/summary"
```

### Get hotspots
```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5001/hotspots"
```

### Get ward profiles
```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5001/wards"
```

### Submit test issue
```powershell
Invoke-RestMethod -Method Post `
  -Uri "http://localhost:5001/issues" `
  -ContentType "application/json" `
  -Body '{"text":"Large pothole near the bus stop causing traffic issues","language":"en","latitude":8.5241,"longitude":76.9366,"createdAt":"2026-07-06T12:00:00Z","categoryHint":"roads"}'
```

### Get my submissions (auth disabled)
```powershell
Invoke-RestMethod -Uri "http://localhost:5001/issues/my"
# Returns 401 with AUTH_DISABLED error
```

### Get my submissions (auth enabled, with token)
```powershell
Invoke-RestMethod -Uri "http://localhost:5001/issues/my" `
  -Headers @{"Authorization"="Bearer <firebase-id-token>"}
```

---

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5001` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `ISSUE_REPOSITORY` | `memory` | `memory` or `firestore` |
| `GOOGLE_CLOUD_PROJECT` | (empty) | GCP project ID for Firestore |
| `FIRESTORE_DATABASE_ID` | `(default)` | Firestore database ID |
| `ENABLE_AI_ENRICHMENT` | `false` | Enable real Gemini calls |
| `ENABLE_BIGQUERY_EXPORT` | `false` | Enable BigQuery export |
| `ENABLE_DEV_ROUTES` | `false` | Enable `/dev/seed` and `/dev/clear` in production |
| `GEMINI_API_KEY` | (empty) | Gemini API key |
| `AI_ENRICHMENT_TIMEOUT_MS` | `3000` | AI enrichment timeout |
| `ENABLE_FIREBASE_AUTH` | `false` | Enable Firebase Auth (optional) |
| `FIREBASE_PROJECT_ID` | (empty) | Firebase project ID for auth |

---

## Troubleshooting

### CORS errors from frontend
- In development: frontend must be on `localhost:5173` or `localhost:3000`
- In production: all origins are allowed (hackathon demo mode)

### 404 on /dev/seed on Render
- Set `ENABLE_DEV_ROUTES=true` in Render dashboard

### Summary returns empty data
- Run `POST /dev/seed` first to populate demo data
- Memory storage resets on Render restart — re-seed after each restart

### Ward data
- Loaded from `data-infra/samples/ward_sample.csv` if available
- Falls back to hardcoded wards (7, 15, 21)

### Firebase Auth (optional)
- Set `ENABLE_FIREBASE_AUTH=true` and `FIREBASE_PROJECT_ID=<your-project>` on Render
- POST /issues still works without auth (anonymous submissions)
- POST /issues with `Authorization: Bearer <token>` attaches userId
- GET /issues/my requires a valid Firebase ID token
- firebase-admin is lazy-loaded — server starts without it when auth is disabled
