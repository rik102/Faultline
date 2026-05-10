#!/usr/bin/env bash
set -euo pipefail

# Run this on an AMD Developer Cloud ROCm instance after installing vLLM with ROCm support.
# Adjust the model if your instance size requires a smaller Qwen variant.

export HIP_VISIBLE_DEVICES="${HIP_VISIBLE_DEVICES:-0}"
export VLLM_USE_ROCM=1

python -m vllm.entrypoints.openai.api_server \
  --host 0.0.0.0 \
  --port 8000 \
  --model "${VISION_MODEL:-Qwen/Qwen2.5-VL-7B-Instruct}" \
  --served-model-name "${VISION_MODEL:-Qwen/Qwen2.5-VL-7B-Instruct}" \
  --trust-remote-code
