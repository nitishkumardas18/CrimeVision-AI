import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { Panel } from "@/components/Panel";
import { predictions, hotspots } from "@/lib/dummy-data";
import { AlertTriangle, Sparkles, TrendingUp, Zap, Shield, Target } from "lucide-react";
import { useMemo, useState } from "react";
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";

export const Route = createFileRoute("/prediction")({
  head: () => ({
    meta: [
      { title: "Prediction — CrimeVision AI" },
      { name: "description", content: "AI-generated crime forecasts and risk predictions." },
      { property: "og:title", content: "Prediction — CrimeVision AI" },
      { property: "og:description", content: "AI-generated crime forecasts for Karnataka districts." },
    ],
  }),
  component: Prediction,
});

const districts = hotspots.map((h) => h.district);
const crimeTypes = ["Vehicle Theft", "Chain Snatching", "Burglary", "Assault", "Cybercrime", "Narcotics Trafficking", "Robbery", "Pickpocketing"];

function toneFor(p: number) {
  if (p >= 70) return { label: "HIGH", badge: "text-danger bg-danger/10 border-danger/30", bar: "oklch(0.65 0.23 25)" };
  if (p >= 45) return { label: "MEDIUM", badge: "text-warning bg-warning/10 border-warning/30", bar: "oklch(0.78 0.16 80)" };
  return { label: "LOW", badge: "text-success bg-success/10 border-success/30", bar: "oklch(0.72 0.17 155)" };
}

function computeRisk(district: string, type: string, date: string, time: string) {
  // Deterministic pseudo-score from inputs
  const s = `${district}|${type}|${date}|${time}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  const base = 30 + (h % 65);
  const hour = parseInt(time.split(":")[0] || "0", 10);
  const nightBoost = hour >= 20 || hour < 5 ? 10 : 0;
  return Math.min(97, base + nightBoost);
}

function recommendationsFor(type: string, tone: string) {
  const rec: string[] = [];
  if (tone === "HIGH") {
    rec.push("Deploy additional patrol units to the target area for the predicted window.");
    rec.push("Activate CCTV escalation and license-plate recognition feeds.");
  } else if (tone === "MEDIUM") {
    rec.push("Increase visible presence during peak-risk hours.");
    rec.push("Brief beat officers on the predicted crime profile.");
  } else {
    rec.push("Maintain standard patrol cadence with routine spot checks.");
  }
  if (/theft|snatch|robbery|pickpocket/i.test(type)) rec.push("Coordinate with jewellery shops and ATM operators for advisories.");
  if (/cyber/i.test(type)) rec.push("Alert the district Cyber Cell to monitor known indicators.");
  if (/narcotics/i.test(type)) rec.push("Cross-check known distribution nodes and informant network.");
  if (/assault/i.test(type)) rec.push("Prepare rapid-response teams and hospital liaisons.");
  return rec;
}

function Prediction() {
  const [district, setDistrict] = useState(districts[0]);
  const [type, setType] = useState(crimeTypes[0]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("21:00");
  const [submitted, setSubmitted] = useState<{ district: string; type: string; date: string; time: string } | null>(null);

  const score = useMemo(() => (submitted ? computeRisk(submitted.district, submitted.type, submitted.date, submitted.time) : 0), [submitted]);
  const tone = toneFor(score);
  const gauge = [{ name: "risk", value: score, fill: tone.bar }];
  const recs = submitted ? recommendationsFor(submitted.type, tone.label) : [];

  return (
    <div>
      <TopBar title="Crime Prediction" subtitle="Forecast risk for a district, crime type, date and time" />
      <div className="p-4 md:p-8 space-y-6">
        <div className="grid gap-6 grid-cols-1 xl:grid-cols-[380px_1fr]">
          <Panel title="Prediction Query" subtitle="Configure the forecast parameters">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted({ district, type, date, time });
              }}
              className="space-y-4"
            >
              <Field label="District">
                <select value={district} onChange={(e) => setDistrict(e.target.value)} className="gov-input">
                  {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Crime Type">
                <select value={type} onChange={(e) => setType(e.target.value)} className="gov-input">
                  {crimeTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date">
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="gov-input" />
                </Field>
                <Field label="Time">
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="gov-input" />
                </Field>
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
              >
                <Target className="h-4 w-4" /> Run Prediction
              </button>
            </form>
          </Panel>

          <Panel title="Prediction Result" subtitle={submitted ? `${submitted.district} • ${submitted.type}` : "Run a prediction to see the risk score"}>
            {!submitted ? (
              <div className="grid place-items-center h-64 text-sm text-muted-foreground text-center">
                <div>
                  <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary/60" />
                  Configure a query on the left and press <span className="text-foreground font-medium">Run Prediction</span>.
                </div>
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-[240px_1fr] items-center">
                <div className="relative h-56">
                  <ResponsiveContainer>
                    <RadialBarChart innerRadius="70%" outerRadius="100%" data={gauge} startAngle={210} endAngle={-30}>
                      <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                      <RadialBar dataKey="value" cornerRadius={12} background={{ fill: "oklch(0.26 0.03 250)" }} />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 grid place-items-center pointer-events-none">
                    <div className="text-center">
                      <div className="text-4xl font-bold" style={{ color: tone.bar }}>{score}%</div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Risk Score</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className={`inline-flex px-2.5 py-1 rounded-md border text-[11px] uppercase tracking-wider font-semibold ${tone.badge}`}>
                      {tone.label} RISK
                    </span>
                  </div>
                  <dl className="grid grid-cols-2 gap-3 text-xs">
                    <Info label="District" value={submitted.district} />
                    <Info label="Crime Type" value={submitted.type} />
                    <Info label="Date" value={submitted.date} />
                    <Info label="Time" value={submitted.time} />
                  </dl>
                  <div className="rounded-lg border border-border bg-card/40 p-3">
                    <div className="flex items-center gap-2 text-primary mb-2">
                      <Shield className="h-4 w-4" />
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">Recommendations</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-foreground/90 list-disc list-inside">
                      {recs.map((r) => <li key={r}>{r}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </Panel>
        </div>

        <Panel title="Model Diagnostics" subtitle="Active prediction pipeline">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Sparkles, label: "Base Model Accuracy", value: "94.2%", desc: "Trained on 2019-2026 FIR corpus" },
              { icon: TrendingUp, label: "Weekly Precision", value: "88.7%", desc: "Verified against outcomes" },
              { icon: Zap, label: "Signals Processed", value: "1.2M/day", desc: "FIRs, CCTV, informants" },
              { icon: AlertTriangle, label: "False Positive Rate", value: "3.4%", desc: "Below national benchmark" },
            ].map((m) => (
              <div key={m.label} className="rounded-lg border border-border p-4 bg-card/30">
                <div className="flex items-center gap-2 text-primary">
                  <m.icon className="h-4 w-4" />
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">{m.label}</span>
                </div>
                <div className="mt-2 text-2xl font-bold">{m.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{m.desc}</div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Forecast Queue" subtitle="Predicted incidents ranked by probability">
          <div className="space-y-3">
            {predictions.map((p) => {
              const t = toneFor(p.probability);
              return (
                <div key={p.area + p.type} className="rounded-xl border border-border p-4 hover:border-primary/40 transition group">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 items-center">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="text-sm font-semibold truncate">{p.type}</div>
                        <span className={`inline-flex px-2 py-0.5 rounded-md border text-[10px] uppercase tracking-wider font-semibold ${t.badge}`}>
                          {p.window}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{p.area}</div>
                      <div className="mt-2.5 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full transition-all group-hover:brightness-125" style={{ width: `${p.probability}%`, background: t.bar }} />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-bold">{p.probability}%</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Confidence</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background/40 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-medium truncate">{value}</div>
    </div>
  );
}
