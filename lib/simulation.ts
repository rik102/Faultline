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
  analysisMode: "heuristic" | "model";
  pageFacts: {
    buttonCount: number;
    linkCount: number;
    inputCount: number;
    headingCount: number;
  };
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
  const actionLabels = facts.buttons.join(", ") || "no button labels";
  const hasPriceOrPayment = keywordScore(text, ["pay", "price", "checkout", "card", "subscription"]) > 0;
  const hasRefundOrPolicy = keywordScore(text, ["refund", "policy", "cancel", "renewal", "support"]) > 0;
  const hasVagueContinue = facts.buttons.some((label) => /continue|next|submit/i.test(label));
  const dense = facts.textSample.length > 1200 || buttonCount + facts.links.length > 24;

  return selectedPersonas.slice(0, 6).map((persona, index) => {
    if (persona.id === "elderly-low-tech") {
      return {
        persona: persona.name,
        severity: inputCount > 2 || hasVagueContinue ? "high" : "medium",
        theme: "Form confidence risk",
        evidence: `The first viewport contains ${inputCount} form controls and action labels including ${actionLabels}. This user needs clear field expectations and a single safe next step.`,
        recommendation: "Add inline helper text for sensitive fields, mark what is optional, and replace vague secondary actions with explicit outcomes.",
        x: 52,
        y: 43,
        emotion: "confused"
      };
    }

    if (persona.id === "distracted-parent") {
      return {
        persona: persona.name,
        severity: hasPriceOrPayment ? "high" : "medium",
        theme: "Surprise charge anxiety",
        evidence: hasPriceOrPayment
          ? "Billing, card, subscription, or renewal language appears while the user is trying to scan quickly."
          : "The flow asks for commitment before the cost and consequence language is easy to compare.",
        recommendation: "Place renewal timing, cancellation terms, and total cost directly beside the primary confirmation action.",
        x: 79,
        y: 40,
        emotion: "anxious"
      };
    }

    if (persona.id === "impatient-shopper") {
      return {
        persona: persona.name,
        severity: buttonCount > 2 ? "high" : "medium",
        theme: "Competing next actions",
        evidence: `Detected ${buttonCount} buttons in the first viewport. Multiple similarly weighted choices slow a user who wants one obvious path.`,
        recommendation: "Make one primary action dominant, demote secondary paths, and move sales/help options away from checkout confirmation.",
        x: 44,
        y: 66,
        emotion: "frustrated"
      };
    }

    if (persona.id === "non-native-speaker") {
      return {
        persona: persona.name,
        severity: hasVagueContinue ? "high" : "medium",
        theme: "Literal-language ambiguity",
        evidence: hasVagueContinue
          ? "A generic Continue action does not say whether it saves, charges, submits, or advances to review."
          : "Important decision copy may require careful interpretation rather than plain outcome-oriented labels.",
        recommendation: "Use concrete verbs on every action, such as Review billing, Start free trial, or Confirm paid subscription.",
        x: 51,
        y: 66,
        emotion: "confused"
      };
    }

    if (persona.id === "visual-overload") {
      return {
        persona: persona.name,
        severity: dense || buttonCount > 2 ? "high" : "medium",
        theme: "Cognitive overload",
        evidence: `Detected ${buttonCount} buttons, ${facts.links.length} links, ${inputCount} inputs, and ${facts.headings.length} headings in the first viewport context.`,
        recommendation: "Group secondary choices, reduce simultaneous decision points, and anchor the primary path with stronger visual hierarchy.",
        x: 57,
        y: 52,
        emotion: "confused"
      };
    }

    if (persona.id === "scammer") {
      return {
        persona: persona.name,
        severity: hasPriceOrPayment || hasRefundOrPolicy ? "high" : "medium",
        theme: "Policy and authorization probing",
        evidence: hasPriceOrPayment || hasRefundOrPolicy
          ? "Payment or purchase language is visible, but the page needs explicit refund, authorization, and confirmation boundaries."
          : "The flow exposes decision points that should be checked for policy bypass and support manipulation.",
        recommendation: "Add explicit state transitions for irreversible actions and log suspicious repeated path exploration.",
        x: 78,
        y: 42,
        emotion: "mistrustful"
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

  try {
    await page.goto(targetUrl, { waitUntil: "networkidle", timeout });
  } catch (error) {
    if (!(error instanceof Error) || !error.message.toLowerCase().includes("timeout")) {
      throw error;
    }
    await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout });
  }

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
          "You are Faultline, a behavioral failure simulation engine. Return concise JSON only. Identify UX, trust, accessibility, abandonment, and exploit risks from a screenshot and extracted DOM facts."
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
    analysisMode: usedModel ? "model" : "heuristic",
    pageFacts: {
      buttonCount: facts.buttons.length,
      linkCount: facts.links.length,
      inputCount: facts.inputs.length,
      headingCount: facts.headings.length
    },
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
