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
| `priorityScore` | number | 0.0–1.0 score |
| `wardId` | string | Mapped ward ID |
| `status` | string | `pending` / `reviewed` / `resolved` |

**Indexes:**
- Composite index on `wardId` + `finalCategory`
- Composite index on `severity` + `priorityScore`
- Single index on `createdAt`

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
