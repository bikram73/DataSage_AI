# 🏗️ DataSage AI — System Architecture & Design Document

<div align="center">

[![Architecture](https://img.shields.io/badge/System_Design-DataSage_AI-004ac6?style=for-the-badge)](./README.md)
[![Status](https://img.shields.io/badge/Status-Production_Ready-success?style=for-the-badge)](./README.md)

</div>

---

## 🏛️ 1. High-Level Architecture Overview

DataSage AI is designed around a **Hybrid Deterministic AI Architecture**. The system prevents hallucinations by using the LLM strictly as a **Code Planner and Intent Classifier**, while delegating all data math, group-by aggregations, and statistics to a **Deterministic In-Memory DataFrame Engine**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DataSage AI Frontend (React 19)                 │
│                                                                        │
│  [Top Navbar] ──> [Upload View] ──> [Dataset Explorer] ──> [Dashboard] │
│                           │                  ▲                         │
│                           ▼                  │                         │
│                    [AI Workspace] ───────────┘                         │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │ JSON Payloads
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    Express Backend API (Node.js / TS)                  │
│                                                                        │
│  ┌────────────────────────┐         ┌───────────────────────────────┐  │
│  │     Route Handlers     │ ──────> │   In-Memory Session Manager   │  │
│  │ (/upload, /query, etc) │         │       (Active Dataframe)      │  │
│  └───────────┬────────────┘         └───────────────┬───────────────┘  │
│              │                                      │                  │
│              ▼                                      ▼                  │
│  ┌────────────────────────┐         ┌───────────────────────────────┐  │
│  │   Gemini 3.6 Flash     │ ──────> │    Deterministic Analytics    │  │
│  │    (Intent / Code)     │  Schema │    Engine (JS/Pandas Logic)   │  │
│  └────────────────────────┘         └───────────────┬───────────────┘  │
│                                                     │                  │
│                                                     ▼                  │
│                                        ┌─────────────────────────┐     │
│                                        │  Results, Charts & Math │     │
│                                        └─────────────────────────┘     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 2. Data Processing Pipeline

1. **Ingestion & Validation**:
   - Files are parsed into memory via PapaParse (for CSV) or SheetJS (for Excel).
   - Column types (`Integer`, `Float`, `String`, `Date`) are inferred dynamically.
2. **Schema & Summary Grounding**:
   - When a user asks a question, only the **schema summary** and sample records are sent to Gemini.
   - Raw user data never leaves the local/server memory entirely.
3. **Deterministic Execution**:
   - Generated query strategies are validated and executed by `analyticsEngine.ts`.
   - Math results, rendered Recharts datasets, and Pandas execution traces are returned.

---

## 🔒 3. Security & Data Privacy

- **Zero Data Ingestion for Training**: Raw datasets are never used to train models.
- **In-Memory Volatility**: Datasets are kept in temporary process memory and can be cleared instantly via `/api/clear`.
- **Server-Side API Key Protection**: Gemini API keys remain strictly server-side.
