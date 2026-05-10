# Hackathon Checklist

## Required submission assets

- Project title: Faultline: Synthetic Human Testing for Behavioral Failure Simulation
- Short description: available in `SUBMISSION.md`
- Long description: available in `SUBMISSION.md`
- Technology/category tags: available in `SUBMISSION.md`
- Public GitHub repository: `https://github.com/rik102/Faultline`
- Demo application: `demo.html` now, hosted URL after deployment
- Cover image: still needed
- Video presentation: still needed
- Slide presentation: still needed

## Track compliance

AI Agents & Agentic Workflows:

- Multiple persona agents with distinct goals, patience, trust, and risk biases.
- Agent output is not generic QA; it produces behavioral findings and recommendations.
- Workflow can scale into multi-agent batch runs across pages and flows.

Vision & Multimodal AI:

- Playwright captures screenshots in the Next.js path.
- Qwen-VL endpoint receives screenshot and DOM facts.
- Findings include visual hierarchy, overload, labels, forms, and heatmap coordinates.

Qwen Special Reward:

- Qwen text models can run persona reasoning.
- Qwen-VL can run screenshot reasoning.
- `SUBMISSION.md` explicitly highlights Qwen use.

Ship It + Build in Public:

- Two draft social posts are in `SUBMISSION.md`.
- AMD/ROCm feedback should be added after the first real AMD Developer Cloud setup.
- Project is MIT licensed.

## Demo talk track

1. "Faultline is not UI testing. It is synthetic human testing."
2. "Traditional QA asks if the button works. Faultline asks if different humans understand, trust, complete, or exploit the flow."
3. "Each persona is an agent with a behavioral model."
4. "The multimodal layer looks at UI screenshots and layout, then plots emotional failure hotspots."
5. "AMD GPUs matter because this becomes valuable at scale: hundreds of pages times hundreds of personas times multiple runs."
