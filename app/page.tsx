"use client";

import { Activity, BrainCircuit, Play, ShieldAlert } from "lucide-react";
import { FormEvent, useState } from "react";
import { personas } from "@/lib/personas";
import type { SimulationResult } from "@/lib/simulation";

const demoTargets = [
  "https://www.amd.com/en/developer/resources/rocm-hub.html",
  "https://huggingface.co/spaces",
  "https://www.lablab.ai/"
];

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
        body: JSON.stringify({ targetUrl })
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

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="mark">FL</div>
          <div>
            <h1>Faultline</h1>
            <p>Behavioral Failure Simulation</p>
          </div>
        </div>

        <form className="form" onSubmit={submit}>
          <label className="label" htmlFor="targetUrl">
            Target flow URL
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
          <div className="label">Demo targets</div>
          <div className="personaList" style={{ marginTop: 8 }}>
            {demoTargets.map((url) => (
              <button
                className="persona"
                key={url}
                type="button"
                onClick={() => setTargetUrl(url)}
              >
                <strong>{new URL(url).hostname}</strong>
                <span>{url}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="label">Synthetic agents</div>
          <div className="personaList" style={{ marginTop: 8 }}>
            {personas.map((persona) => (
              <div className="persona" key={persona.id}>
                <strong>{persona.name}</strong>
                <span>{persona.lens}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="toolbar">
          <div>
            <h2>Pre-release human failure lab</h2>
            <p className="summary">
              Agents inspect live UI screenshots, DOM signals, trust language, and decision density before real users suffer through the flow.
            </p>
          </div>
          <div className="status">
            <BrainCircuit size={16} />
            {result?.usedModel ? "Qwen-VL endpoint active" : "Heuristic mode"}
          </div>
        </div>

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
                  {result.findings.map((finding, index) => (
                    <span
                      className="hotspot"
                      key={`${finding.persona}-${index}`}
                      title={`${finding.persona}: ${finding.theme}`}
                      style={{ left: `${finding.x}%`, top: `${finding.y}%` }}
                    />
                  ))}
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
            {scores ? (
              <div className="scoreGrid">
                <Score label="Confusion" value={scores.confusion} />
                <Score label="Trust risk" value={scores.trustRisk} />
                <Score label="Abandon" value={scores.abandonment} />
                <Score label="Exploit" value={scores.exploitability} />
                <Score label="Overload" value={scores.visualOverload} />
              </div>
            ) : null}
            <div className="findings">
              {result ? <p className="summary">{result.summary}</p> : null}
              {(result?.findings ?? []).map((finding, index) => (
                <article className={`finding ${finding.severity}`} key={`${finding.persona}-${index}`}>
                  <div className="findingTop">
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
                <p className="summary">
                  This MVP is wired for Playwright screenshots plus Qwen/Qwen-VL running behind an AMD Developer Cloud vLLM endpoint.
                </p>
              ) : null}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="score">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
