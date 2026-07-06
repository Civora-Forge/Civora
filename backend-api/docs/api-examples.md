# API Examples

Technical reference for testing all backend endpoints.

---

## Health Check

**Command:**

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5001/"
```

**Expected output:**

```json
{
  "ok": true,
  "service": "Civora backend API",
  "version": "0.3.0",
  "environment": "development",
  "repository": "memory",
  "aiEnrichment": "stub",
  "bigqueryExport": "disabled",
  "endpoints": ["POST /issues", "GET /summary", "GET /hotspots"]
}
```

---

## Submit Invalid Issue

**Command:**

```powershell
Invoke-RestMethod -Method Post `
  -Uri "http://localhost:5001/issues" `
  -ContentType "application/json" `
  -Body '{"language":"en","latitude":8.5241,"longitude":76.9366,"createdAt":"2026-07-06T12:00:00Z"}'
```

**Expected output (400):**

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid issue payload",
    "details": [
      { "field": "text", "message": "Invalid input" }
    ]
  }
}
```

---

## Submit Valid Issue

**Command:**

```powershell
Invoke-RestMethod -Method Post `
  -Uri "http://localhost:5001/issues" `
  -ContentType "application/json" `
  -Body '{"text":"Large pothole near the bus stop causing traffic issues","language":"en","photoUrl":"https://example.com/photo.jpg","audioUrl":"","latitude":8.5241,"longitude":76.9366,"createdAt":"2026-07-06T12:00:00Z","categoryHint":"roads"}'
```

**Expected output (201):**

```json
{
  "ok": true,
  "issueId": "issue_1",
  "priorityScore": 0.56,
  "clusterId": "cluster_1"
}
```

---

## Submit Nearby Duplicate Issue

**Command:**

```powershell
Invoke-RestMethod -Method Post `
  -Uri "http://localhost:5001/issues" `
  -ContentType "application/json" `
  -Body '{"text":"Road broken near bus stop, difficult for vehicles","language":"en","photoUrl":"","audioUrl":"","latitude":8.5243,"longitude":76.9368,"createdAt":"2026-07-06T13:00:00Z","categoryHint":"roads"}'
```

**Expected output (201):**

```json
{
  "ok": true,
  "issueId": "issue_2",
  "priorityScore": 0.64,
  "clusterId": "cluster_1"
}
```

Note: Same `clusterId` because both issues are nearby roads in the same ward.

---

## Seed Demo Data

**Command:**

```powershell
Invoke-RestMethod -Method Post -Uri "http://localhost:5001/dev/seed"
```

**Expected output:**

```json
{
  "ok": true,
  "inserted": 10,
  "message": "Demo issues seeded successfully"
}
```

---

## Get Summary

**Command:**

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5001/summary"
```

**Expected output:**

```json
{
  "totalIssues": 10,
  "highPriorityIssues": 3,
  "byCategory": [
    { "category": "roads", "count": 4 },
    { "category": "sanitation", "count": 2 },
    { "category": "schools", "count": 2 },
    { "category": "health", "count": 1 },
    { "category": "livelihood", "count": 1 }
  ],
  "bySeverity": [
    { "severity": "medium", "count": 6 },
    { "severity": "high", "count": 3 },
    { "severity": "low", "count": 1 }
  ],
  "topWards": [
    { "wardId": "15", "issues": 10 }
  ],
  "topProjects": [
    {
      "clusterId": "cluster_1",
      "projectTitle": "Road repair request near reported location",
      "category": "roads",
      "wardId": "15",
      "priorityScore": 0.72,
      "issueCount": 3
    }
  ]
}
```

---

## Get Hotspots

**Command:**

```powershell
Invoke-RestMethod -Method Get -Uri "http://localhost:5001/hotspots"
```

**Expected output:**

```json
{
  "hotspots": [
    {
      "clusterId": "cluster_1",
      "wardId": "15",
      "latitude": 8.5241,
      "longitude": 76.9366,
      "category": "roads",
      "severity": "medium",
      "count": 3,
      "priorityScore": 0.72,
      "projectTitle": "Road repair request near reported location",
      "explanation": [
        "Severity is marked as medium",
        "Multiple similar reports were found nearby",
        "Ward population impact is considered"
      ]
    }
  ]
}
```

---

## Clear Demo Data

**Command:**

```powershell
Invoke-RestMethod -Method Delete -Uri "http://localhost:5001/dev/clear"
```

**Expected output:**

```json
{
  "ok": true,
  "message": "Demo issues cleared successfully"
}
```

---

## Full Test Sequence

Run these commands in order to verify the complete backend:

```powershell
# 1. Start backend
cd backend-api
npm run dev

# 2. Health check
Invoke-RestMethod -Method Get -Uri "http://localhost:5001/"

# 3. Seed demo data
Invoke-RestMethod -Method Post -Uri "http://localhost:5001/dev/seed"

# 4. Check summary
Invoke-RestMethod -Method Get -Uri "http://localhost:5001/summary"

# 5. Check hotspots
Invoke-RestMethod -Method Get -Uri "http://localhost:5001/hotspots"

# 6. Clear data
Invoke-RestMethod -Method Delete -Uri "http://localhost:5001/dev/clear"

# 7. Verify empty summary
Invoke-RestMethod -Method Get -Uri "http://localhost:5001/summary"
```
