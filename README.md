# Failure DNA — An AI That Learns From Your Mistakes

> An intelligent learning system that analyzes a user's past mistakes, identifies recurring failure patterns, discovers possible root causes, and generates personalized strategies to prevent those mistakes from happening again.

---

## 🌟 Core Concept & Architecture

Traditional developer tools log exceptions; **Failure DNA** conducts forensic cognitive postmortems. It treats past mistakes not as isolated bugs, but as expressions of an individual's **Failure DNA** — recurring behavioral traits, environmental triggers (such as late-night deploys or demo anxiety), and defensive programming omissions.

### 🧬 Key Capabilities

1. **Smart Mistake Logger**: Structured capture of goal, breakdown, expected vs actual outcome, suspected reason, remediation attempt, and final outcome.
2. **AI Failure Analysis**: Objective causal postmortems via Google Gemini (`gemini-3.8-flash`). Rigorously distinguishes between *substantiated facts* and *inferred hypotheses*, provides confidence levels, and generates practical verification tests.
3. **Failure DNA Pattern Detection**: Scans the collective mistake corpus to detect recurring habits (e.g. *Rushed Execution Under Pressure*, *Overlooking Boundary & Edge Conditions*), recurring environmental triggers, warning signs, and which fixes worked vs failed.
4. **Personal Prevention Engine**: Generates personalized action checklists, recommended micro-habits, 1-week safety experiments, and tracked outcome evaluations (*Prevented Recurrence*, *Partial*, *Recurred*).
5. **AI Failure Investigator**: Cross-incident forensic workbench allowing users to select 2+ past mistakes and investigate common roots, comparing which solution was truly durable.
6. **Chronological Failure Timeline**: Visual trajectory mapping showing how remedies and recidivism rates evolve over time.
7. **Failure Intelligence Dashboard**: Real-time KPI metrics, category breakdowns, temporal trend charts, proven fixes leaderboard, and Failure Immunity Index.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, pure SVG responsive data visualizations
- **AI Engine**: Google Gen AI SDK (`@google/genai`) utilizing model `gemini-3.8-flash`
- **Backend**: Express server (`server.ts`) with integrated Vite middleware
- **Data Persistence**: LocalStorage with schema validation, JSON export/import, and CSV table export

---

## 🚀 Setup & Local Development

### 1. Prerequisites
- Node.js 20+ installed
- A Google Gemini API key from [Google AI Studio](https://aistudio.google.com/)

### 2. Environment Configuration
Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your `.env` file:
```env
# GEMINI_API_KEY: Injected by AI Studio or set manually
GEMINI_API_KEY="your_gemini_api_key_here"

# PORT: Default local development port
PORT=3000
```

### 3. Installation
Install project dependencies:

```bash
npm install
```

### 4. Running the Application
Start the full-stack development server:

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

### 5. Production Build
Build client assets:

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
├── .env.example                # Template environment variables
├── index.html                  # HTML entry point with title and OG metadata
├── metadata.json               # Application metadata and server capabilities
├── package.json                # Project dependencies & full-stack scripts
├── server.ts                   # Express backend + Gemini SDK routes + Vite middleware
├── src/
│   ├── App.tsx                 # Root application component and view orchestrator
│   ├── main.tsx                # Client bootstrap
│   ├── index.css               # Global Tailwind CSS imports
│   ├── types/
│   │   └── index.ts            # MistakeRecord, AIAnalysisResult, Pattern, Task models
│   ├── services/
│   │   └── api.ts              # API client handling server Gemini endpoints
│   ├── context/
│   │   └── FailureDNAContext.tsx # State management, persistence, and action dispatchers
│   ├── data/
│   │   └── demoData.ts         # High-fidelity realistic sample dataset
│   └── components/
│       ├── common/
│       │   ├── Sidebar.tsx     # Navigation sidebar with status badge
│       │   ├── Header.tsx      # Top bar with tab descriptions and quick actions
│       │   └── ChartWidgets.tsx# Category progress bars, trendline SVG, badges, and health meter
│       ├── dashboard/
│       │   └── DashboardView.tsx # Overview statistics, metrics, and quick actions
│       ├── logger/
│       │   └── LogMistakeView.tsx# Smart Mistake Logger with validation & AI postmortem
│       ├── history/
│       │   └── MistakesListView.tsx # Search, filter, sorting, and full postmortem modal
│       ├── dna/
│       │   └── FailureDNAView.tsx   # Signature pattern detection and user corrections
│       ├── investigate/
│       │   └── InvestigatorView.tsx # Multi-mistake cross-incident investigator
│       ├── prevention/
│       │   └── PreventionTasksView.tsx # Prevention tasks and outcome feedback loop
│       ├── timeline/
│       │   └── FailureTimelineView.tsx # Chronological evolution and trajectory status
│       └── settings/
│           └── SettingsView.tsx     # Backup, CSV/JSON export, restore, and diagnostics
└── tsconfig.json               # TypeScript compiler configuration
```

---

## 🔒 Security & Privacy Rules

- **Zero Client API Key Exposure**: The `@google/genai` client is strictly invoked in `server.ts`. No API keys or authorization headers ever enter the client bundle.
- **Client Session Isolation**: User mistakes and patterns remain stored in the user's private browser storage. No user data is sent across multiple user sessions.
- **Empirical Grounding**: Gemini postmortems strictly separate *observed facts* from *hypothetical deductions*, refusing to assert unverified certainty.
