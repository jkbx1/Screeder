# Screeder

A modern, high-performance web app for recording, sharing, and analyzing screen captures — powered by **Mux** for video infrastructure and **OpenAI** for AI summaries.

> **Live Demo:** [github.com/jkbx1/screeder](https://github.com/jkbx1/screeder)

---

## Features

- 🎥 **Live Screen & Audio Recording** — Capture screen + microphone directly in the browser
- ☁️ **Mux Cloud Upload** — Videos are encoded and hosted automatically via Mux
- 🔐 **Signed Playback** — Secure video delivery using JWT-signed Mux tokens
- 📝 **AI Transcripts** — Auto-generated captions powered by Mux AI
- 🤖 **AI Summaries** — Concise summaries generated via OpenAI GPT-4o-mini
- 🖥️ **High-Performance Player** — Smooth HLS playback via `@mux/mux-player-react`
- 🌓 **Light / Dark Mode** — Premium glassmorphism design with theme toggle

---

## Mock Mode (No Keys Required)

The app works **without any API keys** in a graceful fallback mode:

| Feature | With Keys | Without Keys (Mock Mode) |
|---|---|---|
| Video recording | Uploads to Mux | Downloads locally as `.webm` |
| Transcription | Mux AI captions | Placeholder message shown |
| AI Summary | OpenAI GPT-4o-mini | Demo placeholder text |

This makes it easy to explore the UI and code without needing a Mux or OpenAI account.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/jkbx1/screeder.git
cd screeder
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your credentials:

| Variable | Where to get it |
|---|---|
| `MUX_TOKEN_ID` | [Mux Dashboard → Access Tokens](https://dashboard.mux.com) |
| `MUX_TOKEN_SECRET` | Same as above |
| `MUX_SIGNING_KEY_ID` | [Mux Dashboard → Signing Keys](https://dashboard.mux.com) |
| `MUX_SIGNING_KEY_PRIVATE` | Same as above (base64 private key) |
| `OPENAI_API_KEY` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |

### 4. Start the dev server

```bash
npm run dev
```

Open and start recording!

---

## Tech Stack

| Technology | Role |
|---|---|
| [Next.js 14](https://nextjs.org/) | React framework (App Router, Server Actions) |
| [Mux](https://mux.com/) | Video upload, encoding, signed playback & AI transcripts |
| [OpenAI API](https://platform.openai.com/) | GPT-4o-mini for AI video summaries |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling |
| [Lucide React](https://lucide.dev/) | Icon library |

---

## Security

- All API keys are accessed **only on the server** via Next.js Server Actions (`app/actions.ts`)
- No secrets are ever exposed to the client bundle

---
