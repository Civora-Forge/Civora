# Civora AI Services

This folder contains Civora AI service logic. It exposes pure enrichment functions for transcription, translation, classification, severity estimation, and priority scoring.

## Responsibility

- Orchestrate AI enrichment pipeline for civic issues
- Provide adapter layers for Google Cloud AI services
- Run in stub mode by default (no credentials required)
- Support real Gemini, Translation, Speech-to-Text, and Vision when configured

## Project Structure

```
ai-services/
├── package.json
├── README.md
└── src/
    ├── enrichIssue.js                    # Main enrichment orchestrator
    ├── adapters/
    │   ├── geminiAdapter.js              # Gemini/Vertex AI classification
    │   ├── translationAdapter.js         # Google Cloud Translation
    │   ├── speechToTextAdapter.js        # Google Cloud Speech-to-Text
    │   └── visionAdapter.js              # Gemini Multimodal / Vision
    ├── prompts/
    │   └── issueClassificationPrompt.js  # Prompt template for Gemini
    └── test.js                           # Smoke test
```

## AI Adapter Architecture

Each adapter operates in two modes:

| Mode | Behavior | Credentials Required |
|------|----------|---------------------|
| **Stub** (default) | Returns safe placeholder data | No |
| **Real** | Calls Google Cloud API | Yes |

### Enrichment Pipeline

```
Raw Issue
  │
  ├──→ Speech-to-Text (if audioUrl provided)
  │      └── Returns transcript
  │
  ├──→ Translation (if language ≠ "en")
  │      └── Returns translated text
  │
  ├──→ Vision (if photoUrl provided)
  │      └── Returns photo findings
  │
  └──→ Gemini Classification
         └── Returns category, severity, project title, confidence
```

## Setup

### Install dependencies

```bash
cd ai-services
npm install
```

### Run smoke test

```bash
node src/test.js
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `GEMINI_API_KEY` | (empty) | API key for Gemini classification |
| `ENABLE_AI_ENRICHMENT` | `false` | Enable real AI calls (backend) |

**No credentials are required for local development.** All adapters run in stub mode by default.

## Google Cloud Integration (Future)

When ready to enable real AI:

1. Set `GEMINI_API_KEY` in your environment
2. Set `ENABLE_AI_ENRICHMENT=true` in backend
3. Adapters will automatically use real Google APIs

### Supported Services

| Service | Adapter | Status |
|---------|---------|--------|
| Gemini / Vertex AI | `geminiAdapter.js` | Stub ready |
| Cloud Translation | `translationAdapter.js` | Stub ready |
| Cloud Speech-to-Text | `speechToTextAdapter.js` | Stub ready |
| Gemini Multimodal / Vision | `visionAdapter.js` | Stub ready |
