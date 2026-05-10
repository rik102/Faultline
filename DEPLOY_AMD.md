# AMD Developer Cloud Deployment Notes

These are the pieces to connect when your AMD credits are active.

## 1. Start an AMD GPU instance

Use an MI300X instance if available. Choose an image with ROCm/PyTorch support where possible.

## 2. Serve Qwen or Qwen-VL

Preferred demo model:

- `Qwen/Qwen2.5-VL-7B-Instruct` for screenshot analysis.

Text-only fallback:

- `Qwen/Qwen2.5-7B-Instruct`.

Run:

```bash
chmod +x scripts/amd-vllm-qwen.sh
VISION_MODEL=Qwen/Qwen2.5-VL-7B-Instruct ./scripts/amd-vllm-qwen.sh
```

If vLLM ROCm installation is not present on the image, install the ROCm-compatible vLLM build recommended by AMD for that image. Exact package commands vary by base image, so keep notes for the Build in Public challenge.

## 3. Point FailureLab at the model

In `.env.local`:

```bash
OPENAI_COMPAT_CHAT_URL=http://YOUR_INSTANCE_IP:8000/v1/chat/completions
VISION_MODEL=Qwen/Qwen2.5-VL-7B-Instruct
```

Restart the app.

## 4. Demo path

1. Run FailureLab against a signup or checkout page.
2. Show the screenshot heatmap.
3. Show persona-specific findings.
4. Make one UI improvement in the target flow.
5. Re-run and compare lower confusion/trust-risk scores.

## 5. What to say about AMD

FailureLab becomes more valuable as scale increases: many pages, many personas, multiple runs per persona, and multimodal screenshot reasoning. AMD Developer Cloud GPUs make that batch simulation practical without owning hardware.
