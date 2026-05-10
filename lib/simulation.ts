import { chromium } from "playwright";
import { callOpenAICompatibleChat } from "./llm";
import { Persona, personas } from "./personas";

export type SimulationFinding = {
  persona: string;
  severity: "low" | "medium" | "high";
  theme: string;
  evidence: string;
  recommendation: string;
  x: number;
  y: number;
  emotion: "confused" | "anxious" | "frustrated" | "mistrustful" | "curious";
};

export type SimulationResult = {
  targetUrl: string;
  screenshot?: string;
  summary: string;
  scores: {
    confusion: number;
    trustRisk: number;
    abandonment: number;
    exploitability: number;
    visualOverload: number;
  };
  findings: SimulationFinding[];
  usedModel: boolean;
};

type PageFacts = {
  title: string;
  buttons: string[];
  links: string[];
  inputs: string[];
  headings: string[];
  textSample: string;
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function keywordScore(text: string, words: string[]) {
  const lower = text.toLowerCase();
  return words.reduce((score, word) => score + (lower.includes(word) ? 1 : 0), 0);
}

function fallbackFindings(facts: PageFacts, selectedPersonas: Persona[]): SimulationFinding[] {
  const text = `${facts.title} ${facts.headings.join(" ")} ${facts.buttons.join(" ")} ${facts.links.join(" ")} ${facts.inputs.join(" ")} ${facts.textSample}`;
  const buttonCount = facts.buttons.length;
  const inputCount = facts.inputs.length;
  const hasPriceOrPayment = keywordScore(text, ["pay", "price", "checkout", "card", "subscription"]) > 0;
  const hasVagueContinue = facts.buttons.some((label) => /continue|next|submit/i.test(label));
  const dense = facts.textSample.length > 1200 || buttonCount + facts.links.length > 24;

  return selectedPersonas.slice(0, 6).map((persona, index) => {
    if (persona.id === "scammer") {
      return {
        persona: persona.name,
        severity: hasPriceOrPayment ? "high" : "medium",
        theme: "Policy and authorization probing",
        evidence: hasPriceOrPayment
          ? "Payment or purchase language is visible, but the page needs explicit refund, authorization, and confirmation boundaries."
          : "The flow exposes decision points that should be checked for policy bypass and support manipulation.",
        recommendation: "Add explicit state transitions for irreversible actions and log suspicious repeated path exploration.",
        x: 78,
        y: 42,
        emotion: "mistrustful"
      };
    }

    if (persona.id === "visual-overload" || dense) {
      return {
        persona: persona.name,
        severity: dense ? "high" : "medium",
        theme: "Cognitive overload",
        evidence: `Detected ${buttonCount} buttons, ${facts.links.length} links, and ${inputCount} inputs in the first viewport context.`,
        recommendation: "Reduce competing calls to action, group secondary choices, and make the primary next action visually dominant.",
        x: 52,
        y: 34 + index * 5,
        emotion: "confused"
      };
    }

    if (hasVagueContinue) {
      return {
        persona: persona.name,
        severity: "medium",
        theme: "Ambiguous action wording",
        evidence: "A generic Continue/Next/Submit action can be interpreted as final confirmation by stressed or literal users.",
        recommendation: "Rename vague action labels to the concrete outcome, for example Review order, Create account, or Continue to payment.",
        x: 64,
        y: 58,
        emotion: "anxious"
      };
    }

    return {
      persona: persona.name,
      severity: "medium",
      theme: "Flow confidence risk",
      evidence: `${persona.name} is likely to scan for reassurance around ${persona.riskBias}.`,
      recommendation: "Add plain-language helper text near the decision point and preserve visible progress through the flow.",
      x: 44 + index * 6,
      y: 48,
      emotion: persona.trust < 45 ? "mistrustful" : "curious"
    };
  });
}

function fallbackSummary(facts: PageFacts, findings: SimulationFinding[]) {
  const high = findings.filter((finding) => finding.severity === "high").length;
  return `Synthetic agents found ${findings.length} behavioral risk signals in the first-pass analysis. ${high} are high severity. The strongest risks cluster around ${[
    ...new Set(findings.map((finding) => finding.theme.toLowerCase()))
  ]
    .slice(0, 3)
    .join(", ")}.`;
}

async function capturePage(targetUrl: string): Promise<{ screenshot: string; facts: PageFacts }> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const timeout = Number(process.env.PLAYWRIGHT_TIMEOUT_MS ?? 20000);

  await page.goto(targetUrl, { waitUntil: "networkidle", timeout });

  const facts = await page.evaluate(() => {
    const visibleText = (element: Element | null) =>
      (element?.textContent ?? "").replace(/\s+/g, " ").trim();

    const take = (selector: string, limit = 30) =>
      Array.from(document.querySelectorAll(selector))
        .map((element) => visibleText(element))
        .filter(Boolean)
        .slice(0, limit);

    return {
      title: document.title,
      buttons: take("button, [role='button'], input[type='submit']"),
      links: take("a"),
      inputs: Array.from(document.querySelectorAll("input, textarea, select"))
        .map((input) => {
          const element = input as HTMLInputElement;
          return element.placeholder || element.name || element.id || element.type;
        })
        .filter(Boolean)
        .slice(0, 30),
      headings: take("h1, h2, h3", 16),
      textSample: visibleText(document.body).slice(0, 2400)
    };
  });

  const screenshotBuffer = await page.screenshot({ fullPage: false, type: "png" });
  await browser.close();

  return {
    screenshot: `data:image/png;base64,${screenshotBuffer.toString("base64")}`,
    facts
  };
}

async function modelFindings({
  targetUrl,
  screenshot,
  facts,
  selectedPersonas
}: {
  targetUrl: string;
  screenshot: string;
  facts: PageFacts;
  selectedPersonas: Persona[];
}) {
  const model = process.env.VISION_MODEL ?? "Qwen/Qwen2.5-VL-7B-Instruct";
  const content = await callOpenAICompatibleChat({
    model,
    messages: [
      {
        role: "system",
        content:
          "You are FailureLab, a behavioral failure simulation engine. Return concise JSON only. Identify UX, trust, accessibility, abandonment, and exploit risks from a screenshot and extracted DOM facts."
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: JSON.stringify({
              targetUrl,
              personas: selectedPersonas,
              pageFacts: facts,
              schema: {
                summary: "string",
                findings: [
                  {
                    persona: "string",
                    severity: "low|medium|high",
                    theme: "string",
                    evidence: "string",
                    recommendation: "string",
                    x: "0-100",
                    y: "0-100",
                    emotion: "confused|anxious|frustrated|mistrustful|curious"
                  }
                ]
              }
            })
          },
          { type: "image_url", image_url: { url: screenshot } }
        ]
      }
    ]
  });

  if (!content) return null;
  const jsonStart = content.indexOf("{");
  const jsonEnd = content.lastIndexOf("}");
  if (jsonStart < 0 || jsonEnd < jsonStart) return null;

  return JSON.parse(content.slice(jsonStart, jsonEnd + 1)) as {
    summary: string;
    findings: SimulationFinding[];
  };
}

export async function runSimulation(targetUrl: string): Promise<SimulationResult> {
  const selectedPersonas = personas;
  const { screenshot, facts } = await capturePage(targetUrl);

  let usedModel = false;
  let findings = fallbackFindings(facts, selectedPersonas);
  let summary = fallbackSummary(facts, findings);

  try {
    const modeled = await modelFindings({ targetUrl, screenshot, facts, selectedPersonas });
    if (modeled?.findings?.length) {
      usedModel = true;
      findings = modeled.findings.slice(0, 12);
      summary = modeled.summary || summary;
    }
  } catch (error) {
    console.warn("Falling back to heuristic simulation", error);
  }

  const high = findings.filter((finding) => finding.severity === "high").length;
  const medium = findings.filter((finding) => finding.severity === "medium").length;
  const text = `${facts.textSample} ${facts.buttons.join(" ")} ${facts.inputs.join(" ")}`;

  return {
    targetUrl,
    screenshot,
    summary,
    scores: {
      confusion: clampScore(34 + medium * 7 + high * 12),
      trustRisk: clampScore(25 + keywordScore(text, ["pay", "card", "refund", "confirm", "subscription"]) * 13 + high * 9),
      abandonment: clampScore(22 + facts.inputs.length * 5 + facts.buttons.length * 2),
      exploitability: clampScore(18 + keywordScore(text, ["refund", "promo", "support", "admin", "invite"]) * 15),
      visualOverload: clampScore(20 + facts.buttons.length * 3 + facts.links.length * 2 + Math.floor(facts.textSample.length / 120))
    },
    findings,
    usedModel
  };
}
