# Next Steps

## Already done in this repo

1. Local git repository initialized.
2. Faultline product concept turned into a working demo scaffold.
3. Interactive no-install demo added at `demo.html`.
4. Next.js implementation path added for live URL capture and model-backed analysis.
5. AMD Developer Cloud deployment notes added in `DEPLOY_AMD.md`.
6. Hackathon submission draft added in `SUBMISSION.md`.

## Do next before submission

1. Push and merge this PR into `main`.
2. Open `demo.html` in a browser and use it for the first pitch walkthrough.
3. Install Node/npm locally or use a cloud dev environment, then run:

```bash
npm install
npx playwright install chromium
cp .env.example .env.local
npm run dev
```

4. Start an AMD Developer Cloud MI300X instance.
5. Serve Qwen-VL through an OpenAI-compatible vLLM endpoint.
6. Add this to `.env.local`:

```bash
OPENAI_COMPAT_CHAT_URL=http://YOUR_AMD_INSTANCE:8000/v1/chat/completions
VISION_MODEL=Qwen/Qwen2.5-VL-7B-Instruct
TEXT_MODEL=Qwen/Qwen2.5-7B-Instruct
```

7. Record a 2-3 minute demo:

- 20 seconds: problem and category framing.
- 45 seconds: run synthetic agents in the demo.
- 45 seconds: explain findings and heatmap.
- 30 seconds: AMD/Qwen architecture.
- 20 seconds: business value and next roadmap.

8. Publish at least two build-in-public posts tagging lablab and AMD.
9. Create a Hugging Face Space if time allows; this helps with the special prize.

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
