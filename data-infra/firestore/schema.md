# Firestore Schema

## Collections

### `issues`

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Auto-generated document ID |
| `text` | string | Citizen description |
| `language` | string | ISO language code |
| `photoUrl` | string | Photo URL (optional) |
| `audioUrl` | string | Audio URL (optional) |
| `latitude` | number | GPS latitude |
| `longitude` | number | GPS longitude |
| `createdAt` | timestamp | Submission time |
| `categoryHint` | string | Citizen-suggested category |
| `finalCategory` | string | AI-determined category |
| `severity` | string | `low` / `medium` / `high` |
| `projectTitle` | string | Auto-generated title |
| `aiPriorityScore` | number | AI-assigned priority (0.0–1.0) |
| `backendPriorityScore` | number | Backend-calculated priority (0.0–1.0) |
| `priorityScore` | number | Final priority score (0.0–1.0) |
| `wardId` | string | Mapped ward ID |
| `clusterId` | string | Geo-cluster identifier |
| `duplicateCount` | number | Number of similar issues in cluster |
| `priorityExplanation` | array | Human-readable priority reasons |
| `aiSignals` | object | AI enrichment metadata |
| `status` | string | `pending` / `reviewed` / `resolved` |

**Indexes:**
- Composite index on `wardId` + `finalCategory`
- Composite index on `severity` + `priorityScore`
- Single index on `createdAt`
- Single index on `clusterId`

### `wards`

| Field | Type | Description |
|-------|------|-------------|
| `wardId` | string | Unique ward identifier |
| `wardName` | string | Human-readable name |
| `population` | number | Population count |
| `numSchools` | number | Number of schools |
| `numPHCs` | number | Number of primary health centers |
| `latitude` | number | Ward center latitude |
| `longitude` | number | Ward center longitude |

**Indexes:**
- Single index on `wardId`
