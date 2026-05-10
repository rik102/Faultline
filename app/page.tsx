"use client";

import { Activity, BrainCircuit, CheckCircle2, Cpu, ExternalLink, Play, ShieldAlert } from "lucide-react";
import { FormEvent, useState } from "react";
import { personas } from "@/lib/personas";
import type { SimulationResult } from "@/lib/simulation";

const demoTargets = [
  "/demo-flow",
  "https://www.amd.com/en/developer/resources/rocm-hub.html",
  "https://huggingface.co/spaces",
  "https://www.lablab.ai/"
];

function resolveTargetUrl(value: string) {
  return new URL(value, window.location.origin).toString();
}

function targetHost(value: string) {
  try {
    const url = new URL(value, "http://faultline.local");
    return value.startsWith("/") ? "Built-in checkout flow" : url.hostname;
  } catch {
    return value;
  }
}

export default function Home() {
  const [targetUrl, setTargetUrl] = useState(demoTargets[0]);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/simulate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ targetUrl: resolveTargetUrl(targetUrl) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Simulation failed");
      setResult(data);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Simulation failed");
    } finally {
      setLoading(false);
    }
  }

  const scores = result?.scores;
  const modeLabel = result?.analysisMode === "model" ? "Qwen-VL on AMD" : "Local heuristic fallback";

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="mark">FL</div>
          <div>
            <h1>Faultline</h1>
            <p>Failure simulation</p>
          </div>
        </div>

        <form className="form" onSubmit={submit}>
          <label className="label" htmlFor="targetUrl">
            Target URL
          </label>
          <input
            id="targetUrl"
            className="input"
            value={targetUrl}
            onChange={(event) => setTargetUrl(event.target.value)}
            placeholder="https://example.com/signup"
          />
          <button className="button" type="submit" disabled={loading}>
            <Play size={18} />
            {loading ? "Simulating agents" : "Run simulation"}
          </button>
          {error ? <div className="error">{error}</div> : null}
        </form>

        <div>
          <div className="label">Targets</div>
          <div className="personaList" style={{ marginTop: 8 }}>
            {demoTargets.map((url) => (
              <button
                className={`persona targetButton ${targetUrl === url ? "selected" : ""}`}
                key={url}
                type="button"
                onClick={() => setTargetUrl(url)}
                aria-pressed={targetUrl === url}
              >
                <strong>{targetHost(url)}</strong>
                <span>{url}</span>
                <em>{targetUrl === url ? "Selected" : "Use target"}</em>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="label">Agents</div>
          <div className="personaList" style={{ marginTop: 8 }}>
            {personas.map((persona) => (
              <div className="persona" key={persona.id}>
                <strong>{persona.name}</strong>
                <span>{persona.lens}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="amdBox">
          <div className="amdTop">
            <Cpu size={16} />
            <strong>AMD connection</strong>
          </div>
          <p>
            Add an MI300X vLLM endpoint to `.env.local` when the cloud instance is ready.
          </p>
          <code>OPENAI_COMPAT_CHAT_URL</code>
        </div>
      </aside>

      <main className="main">
        <div className="toolbar">
          <div>
            <h2>Simulation</h2>
          </div>
          <div className="status">
            <BrainCircuit size={16} />
            {result?.usedModel ? "Qwen-VL endpoint active" : "Heuristic mode"}
          </div>
        </div>

        <section className="runStrip" aria-label="Demo flow">
          <Step active={Boolean(result)} label="Capture" value={result ? "Screenshot ready" : "Waiting for URL"} />
          <Step active={Boolean(result)} label="Analyze" value={result ? modeLabel : "Fallback ready"} />
          <Step active={Boolean(result?.findings.length)} label="Report" value={result ? `${result.findings.length} findings` : "No run yet"} />
        </section>

        <div className="grid">
          <section className="panel">
            <div className="panelHeader">
              <h3>Visual confusion map</h3>
              <span className="badge">{result?.targetUrl ? new URL(result.targetUrl).hostname : "No run"}</span>
            </div>
            <div className="screenWrap">
              {result?.screenshot ? (
                <>
                  <img src={result.screenshot} alt="Analyzed page screenshot" />
                  <div className="mapListHeader">Map findings</div>
                  <ol className="mapList" aria-label="Visual map findings">
                    {result.findings.map((finding, index) => (
                      <li key={`${finding.persona}-${index}`}>
                        <span>{index + 1}</span>
                        <div>
                          <strong>{finding.theme}</strong>
                          <p>{finding.evidence}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </>
              ) : (
                <div className="empty">
                  <div>
                    <Activity size={36} />
                    <p>Run a simulation to capture a page screenshot and plot emotional failure hotspots.</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          <aside className="panel">
            <div className="panelHeader">
              <h3>Behavioral risk findings</h3>
              <ShieldAlert size={18} />
            </div>
            {result ? (
              <div className="resultMeta">
                <div>
                  <span>Mode</span>
                  <strong>{modeLabel}</strong>
                </div>
                <div>
                  <span>Page signals</span>
                  <strong>
                    {result.pageFacts.buttonCount} buttons / {result.pageFacts.linkCount} links / {result.pageFacts.inputCount} inputs
                  </strong>
                </div>
                <div>
                  <span>Inputs used</span>
                  <strong>{result.pageFacts.analysisInputs.join(" + ")}</strong>
                </div>
                <div>
                  <span>Button scan</span>
                  <strong>
                    {result.pageFacts.interaction.stressRisk} risk / {result.pageFacts.interaction.highImpactActions.length} high-impact /{" "}
                    {result.pageFacts.interaction.ambiguousActions.length} ambiguous
                  </strong>
                </div>
              </div>
            ) : null}
            {scores ? (
              <div className="scoreGrid">
                <Score label="Confusion" value={scores.confusion} description="How likely users are to misunderstand the page or next step." />
                <Score label="Trust risk" value={scores.trustRisk} description="Risk from billing, confirmation, refund, security, or credibility signals." />
                <Score label="Abandon" value={scores.abandonment} description="Chance users quit because the flow feels slow, unclear, or too demanding." />
                <Score label="Exploit" value={scores.exploitability} description="Risk that policy gaps, support language, or high-impact actions can be abused." />
                <Score label="Overload" value={scores.visualOverload} description="Cognitive load from text density, competing actions, fields, and layout pressure." />
              </div>
            ) : null}
            <div className="findings">
              {result ? <p className="summary">{result.summary}</p> : null}
              {result ? (
                <div className="interactionCard">
                  <h4>Interaction scan</h4>
                  <p>{result.pageFacts.interaction.note}</p>
                  <dl>
                    <div>
                      <dt>Button labels</dt>
                      <dd>{result.pageFacts.interaction.buttonLabels.join(", ") || "No buttons detected"}</dd>
                    </div>
                    <div>
                      <dt>High-impact actions</dt>
                      <dd>{result.pageFacts.interaction.highImpactActions.join(", ") || "None detected"}</dd>
                    </div>
                    <div>
                      <dt>Ambiguous actions</dt>
                      <dd>{result.pageFacts.interaction.ambiguousActions.join(", ") || "None detected"}</dd>
                    </div>
                  </dl>
                </div>
              ) : null}
              {(result?.findings ?? []).map((finding, index) => (
                <article className={`finding ${finding.severity}`} key={`${finding.persona}-${index}`}>
                  <div className="findingTop">
                    <span className="findingIndex">{index + 1}</span>
                    <div>
                      <h4>{finding.theme}</h4>
                      <p>{finding.persona} became {finding.emotion}.</p>
                    </div>
                    <span className="badge">{finding.severity}</span>
                  </div>
                  <p>{finding.evidence}</p>
                  <p><strong>Fix:</strong> {finding.recommendation}</p>
                </article>
              ))}
              {!result ? (
                <div className="emptyBrief">
                  <h4>Primary judging path</h4>
                  <p>Run the Next app, show live screenshot capture, then connect AMD/Qwen-VL when the MI300X endpoint is available.</p>
                  <a href="https://github.com/vllm-project/vllm" target="_blank" rel="noreferrer">
                    vLLM serves Qwen-VL as an OpenAI-compatible API <ExternalLink size={13} />
                  </a>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Score({ label, value, description }: { label: string; value: number; description: string }) {
  return (
    <div className="score" title={description}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{description}</small>
    </div>
  );
}

function Step({ active, label, value }: { active: boolean; label: string; value: string }) {
  return (
    <div className={`step ${active ? "active" : ""}`}>
      <CheckCircle2 size={17} />
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
