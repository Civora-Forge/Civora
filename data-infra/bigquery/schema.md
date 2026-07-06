# BigQuery Schema

## Datasets

### `civora_analytics`

#### Table: `issues`

| Column | Type | Description |
|--------|------|-------------|
| `issue_id` | STRING | Unique issue ID |
| `text` | STRING | Citizen description |
| `language` | STRING | ISO language code |
| `final_category` | STRING | AI-determined category |
| `severity` | STRING | `low` / `medium` / `high` |
| `ward_id` | STRING | Mapped ward ID |
| `latitude` | FLOAT64 | GPS latitude |
| `longitude` | FLOAT64 | GPS longitude |
| `created_at` | TIMESTAMP | Submission time |
| `priority_score` | FLOAT64 | Final priority score (0.0–1.0) |
| `cluster_id` | STRING | Geo-cluster identifier |
| `duplicate_count` | INT64 | Number of similar issues in cluster |
| `classification_confidence` | FLOAT64 | AI classification confidence |
| `model_provider` | STRING | AI model used (`stub` / `gemini` / `vertex`) |
| `ingested_at` | TIMESTAMP | When record was added to BigQuery |

**Partitioning:** By `created_at` (day)
**Clustering:** By `final_category`, `ward_id`

#### Table: `wards`

| Column | Type | Description |
|--------|------|-------------|
| `ward_id` | STRING | Unique ward identifier |
| `ward_name` | STRING | Human-readable name |
| `population` | INT64 | Population count |
| `num_schools` | INT64 | Number of schools |
| `num_phcs` | INT64 | Number of primary health centers |
| `latitude` | FLOAT64 | Ward center latitude |
| `longitude` | FLOAT64 | Ward center longitude |

#### Table: `infra_stats`

| Column | Type | Description |
|--------|------|-------------|
| `ward_id` | STRING | Ward identifier |
| `category` | STRING | Issue category |
| `total_issues` | INT64 | Total issues in category for ward |
| `avg_priority` | FLOAT64 | Average priority score |
| `high_count` | INT64 | Count of high-severity issues |
| `period_start` | DATE | Aggregation period start |
| `period_end` | DATE | Aggregation period end |

**Partitioning:** By `period_start` (month)
**Clustering:** By `ward_id`, `category`
