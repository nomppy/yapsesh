# YapSesh

Live-generates an interactive flowchart of discussion topics from voice input. Start a conversation, and YapSesh listens, transcribes, extracts topics via LLM, and renders a growing flowchart showing how topics flow and connect.

## Getting Started

```bash
npm install
npm run dev
```

Create a `.env.local` with your LLM API key:

```
ANTHROPIC_API_KEY=sk-...
```

Open [http://localhost:3000](http://localhost:3000) and click Record.

## LLM Providers

Configure in Settings. Supports Claude, OpenAI, DeepSeek, and local Ollama.

## Deploy

```bash
vercel
```
