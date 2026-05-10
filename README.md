# Faultline

Synthetic Human Testing for pre-release UX, trust, accessibility, and abuse-risk discovery.

Faultline is an AMD hackathon project for the AI Agents & Agentic Workflows track, with a legitimate Vision & Multimodal AI angle. It simulates psychologically distinct user agents against a live web flow, captures a screenshot with Playwright, and asks a multimodal model such as Qwen-VL to identify where users become confused, anxious, mistrustful, overloaded, or adversarial.

## Why it matters

Most teams discover UX failures after launch through analytics, session replay, support tickets, and customer complaints. Faultline moves that learning earlier by running synthetic behavioral simulations before real users hit the broken flow.

This is not classic QA. The question is not only whether the button works. The question is whether stressed, distracted, low-tech, non-native, visually overloaded, or adversarial users understand and trust the flow.

## Features

- No-install interactive pitch demo in `demo.html`.
- Live URL capture with Playwright.
- Synthetic persona agents for distracted, low-tech, impatient, non-native, visually overloaded, and adversarial users.
- Multimodal screenshot reasoning through any OpenAI-compatible endpoint.
- AMD Developer Cloud friendly: run Qwen/Qwen-VL with vLLM on MI300X and point the app at that endpoint.
- Emotional heatmap hotspots plotted over the analyzed page.
- Trust, confusion, abandonment, exploitability, and visual overload scoring.
- Heuristic fallback mode when no model endpoint is configured.

## Run the no-install demo

Open `demo.html` directly in a browser, or run:

```bash
chmod +x scripts/serve-demo.sh
./scripts/serve-demo.sh
```

Then open `http://localhost:8080/demo.html`.

## Run the Next.js app

```bash
npm install
npx playwright install chromium
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Connect AMD Developer Cloud

1. Create an AMD Developer Cloud MI300X instance.
2. Install ROCm-compatible PyTorch/vLLM or use an AMD-ready image if available.
3. Serve Qwen/Qwen-VL with an OpenAI-compatible `/v1/chat/completions` endpoint.
4. Set these in `.env.local`:

```bash
OPENAI_COMPAT_CHAT_URL=http://YOUR_AMD_INSTANCE:8000/v1/chat/completions
OPENAI_COMPAT_API_KEY=anything-if-your-server-requires-it
VISION_MODEL=Qwen/Qwen2.5-VL-7B-Instruct
TEXT_MODEL=Qwen/Qwen2.5-7B-Instruct
```

5. Restart `npm run dev`.

## Hackathon positioning

Primary track: AI Agents & Agentic Workflows.

Secondary track: Vision & Multimodal AI, because the agent engine uses screenshots and layout understanding to reason about visual confusion, cognitive overload, and trust collapse.

Partner angle: Qwen can be used as both the text reasoning model and Qwen-VL as the screenshot/layout model.

AMD angle: run many persona simulations in parallel on AMD Developer Cloud GPUs, especially when scaling beyond the local MVP to hundreds or thousands of page/persona runs.

## Submission title

Faultline: Synthetic Human Testing for Behavioral Failure Simulation

## Short description

Faultline uses multimodal AI agents to simulate realistic human confusion, mistrust, fatigue, and adversarial behavior against software flows before launch.
