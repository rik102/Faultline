# Next Steps

## Already done in this repo

1. Local git repository initialized.
2. Faultline product concept turned into a working demo scaffold.
3. Interactive no-install demo added at `demo.html`.
4. Next.js implementation path added for live URL capture and model-backed analysis.
5. AMD Developer Cloud deployment notes added in `DEPLOY_AMD.md`.
6. Hackathon submission draft added in `SUBMISSION.md`.

## Do next before submission

1. Use the Next.js app as the primary demo. `demo.html` is only the backup if the live app or network fails.
2. Install Node/npm locally or use a cloud dev environment, then run:

```bash
npm install
npx playwright install chromium
cp .env.example .env.local
npm run dev
```

3. Open `http://localhost:3000` and run the default local target, `http://localhost:3000/demo-flow`, through the simulation.
4. Keep `http://localhost:8080/demo.html` ready as a no-install backup.
5. Start an AMD Developer Cloud MI300X instance when the local demo flow feels solid.
6. Serve Qwen-VL through an OpenAI-compatible vLLM endpoint.
7. Add this to `.env.local`:

```bash
OPENAI_COMPAT_CHAT_URL=http://YOUR_AMD_INSTANCE:8000/v1/chat/completions
VISION_MODEL=Qwen/Qwen2.5-VL-7B-Instruct
TEXT_MODEL=Qwen/Qwen2.5-7B-Instruct
```

8. Record a 2-3 minute demo:

- 20 seconds: problem and category framing.
- 45 seconds: run synthetic agents in the Next app.
- 45 seconds: explain screenshot, findings, risk scores, and heatmap.
- 30 seconds: AMD/Qwen architecture: Faultline captures the page, AMD MI300X runs Qwen-VL through vLLM, and the app displays the analysis.
- 20 seconds: business value and next roadmap.

9. Publish at least two build-in-public posts tagging lablab and AMD.
10. Create a Hugging Face Space if time allows; this helps with the special prize.

## Why AMD is in the architecture

Faultline itself is the web app. The AMD MI300X instance is the GPU-backed model server. It runs Qwen-VL, the multimodal model that can read screenshots and DOM context. vLLM is the serving layer that exposes Qwen-VL as an OpenAI-compatible `/v1/chat/completions` API so the Next app can call it.

Without AMD configured, the app still works in heuristic fallback mode. With AMD configured, the app becomes a real multimodal agent demo.

## What to connect for AMD

Send the following once your AMD instance is running:

- Public instance IP or HTTPS endpoint.
- Whether port `8000` is open.
- Which base image you chose.
- Whether vLLM is already installed.
- Which model you want first: Qwen-VL for multimodal or Qwen text-only for faster setup.

## MVP polish after the PR

1. Add saved run history.
2. Add before/after comparison.
3. Add PDF report export.
4. Add batch mode from sitemap URLs.
5. Add real browser recording upload for private flows.
6. Deploy a public demo URL.
