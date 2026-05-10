# Faultline Hackathon Submission Draft

## Project title

Faultline: Synthetic Human Testing for Behavioral Failure Simulation

## Short description

Faultline uses multimodal AI agents to simulate realistic user confusion, trust collapse, cognitive overload, abandonment, and exploit-seeking before software ships.

## Long description

Software teams usually discover broken UX after launch through analytics, session replay, A/B tests, support tickets, and customer complaints. Faultline moves that learning earlier.

The system runs synthetic user agents against a target flow. Each agent has a different behavioral model: distracted parent, low-tech older adult, impatient shopper, non-native English speaker, visually overwhelmed user, and adversarial scammer. Agents inspect the live UI, reason about screenshots and DOM signals, and produce concrete failure findings: ambiguous labels, overloaded decision points, trust-breaking wording, abandonment triggers, and abuse paths.

This is not classic QA automation. Cypress, Selenium, and Playwright can confirm whether a button works. Faultline asks whether different humans would understand, trust, complete, or exploit the flow.

For the AMD hackathon, Faultline uses an agentic workflow backed by Qwen/Qwen-VL. The multimodal layer analyzes screenshots for layout hierarchy, visual density, form ambiguity, and emotional hotspots. The AMD Developer Cloud path runs Qwen-VL with vLLM on MI300X GPUs, allowing many persona simulations to run in parallel across pages and product flows.

## Track

Primary track: AI Agents & Agentic Workflows.

Secondary fit: Vision & Multimodal AI.

## Technology tags

AI agents, multimodal AI, Qwen, Qwen-VL, AMD Developer Cloud, ROCm, vLLM, Playwright, Next.js, UX testing, accessibility, trust and safety, synthetic users.

## Demo application

The repo includes two demo paths:

- `demo.html`: no-install interactive demo for judging and live presentation.
- Next.js app: Playwright-based URL capture and OpenAI-compatible model endpoint integration.

## Repository

https://github.com/rik102/Faultline

## Why AMD matters

Faultline gets more valuable at scale: many personas, many pages, multiple runs per persona, and screenshot-level multimodal reasoning. AMD Developer Cloud MI300X GPUs make high-throughput behavioral simulation practical without local hardware.

## Qwen usage

Qwen handles persona reasoning and failure analysis. Qwen-VL analyzes UI screenshots and layout signals, making the system a real multimodal application rather than a text-only testing wrapper.

## Build in public posts

Post 1:

> Building Faultline for the AMD Developer Hackathon: synthetic human testing that simulates confused, distracted, low-tech, and adversarial users before launch. Classic QA asks if the button works. Faultline asks if humans will trust it. @lablab @AIatAMD

Post 2:

> Faultline now turns UI screenshots into emotional failure heatmaps. Qwen-VL can flag confusing labels, overloaded forms, trust collapse, and abuse paths. Next step: run persona swarms on AMD Developer Cloud MI300X. @lablab @AIatAMD

## Product story

Faultline is a seed-stage style category idea: pre-release human failure simulation. It can expand into conversion optimization, accessibility review, enterprise onboarding, trust and safety, fraud hardening, and game/tutorial testing.
