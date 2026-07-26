import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { Panel } from "@/components/Panel";
import { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { AlertTriangle, Flame, Users, TrendingUp, AlertCircle, BrainCircuit, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Crime Analytics — CrimeVision AI" },
      { name: "description", content: "AI-driven sociological & predictive analytics on Karnataka crime patterns." },
      { property: "og:title", content: "Crime Analytics — CrimeVision AI" },
      { property: "og:description", content: "AI-driven sociological & predictive analytics on Karnataka crime patterns." },
    ],
  }),
  component: Analytics,
});

const tooltipStyle = {
  contentStyle: {
    background: "var(--color-card)",
    border: "1px solid var(--color-border)",
    borderRadius: 10,
    fontSize: 12,
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
    padding: "8px 12px",
    color: "var(--color-foreground)",
  },
  labelStyle: { color: "var(--color-foreground)", fontWeight: 700, marginBottom: 4 },
  itemStyle: { color: "var(--color-foreground)", fontSize: 12, padding: "2px 0" },
};

const GENDER_COLORS = ["oklch(0.65 0.23 240)", "oklch(0.65 0.23 25)", "oklch(0.65 0.18 155)"];
const AGE_COLOR = "oklch(0.68 0.16 240)";

// ─── Skeleton Loader ────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded-lg ${className}`} />;
}

const MOCK_DEMOGRAPHICS = {
  total: "24,856",
  ageData: [
    { band: "< 18", count: 1240 },
    { band: "18-25", count: 6850 },
    { band: "26-35", count: 9420 },
    { band: "36-50", count: 5120 },
    { band: "50+", count: 2226 },
  ],
  genderData: [
    { name: "Male", value: 82 },
    { name: "Female", value: 16 },
    { name: "Other / Unknown", value: 2 },
  ],
};

const MOCK_ANOMALIES = [
  { district: "Bengaluru City", severity: "Critical", month: "2026-01", crime: "Cyber Crime", zScore: "2.8", count: 480, description: "Spike in online phishing & financial fraud FIRs." },
  { district: "Mysuru", severity: "High", month: "2026-01", crime: "Vehicle Theft", zScore: "2.1", count: 215, description: "Increase in two-wheeler thefts near tourist hubs." },
  { district: "Hubballi-Dharwad", severity: "High", month: "2026-01", crime: "Burglary", zScore: "1.9", count: 142, description: "Residential break-ins reported during festival week." },
  { district: "Mangaluru", severity: "Critical", month: "2026-01", crime: "Narcotics", zScore: "2.5", count: 98, description: "Major seizure & NDPS arrests coastal corridor." },
];

const MOCK_FORECAST = {
  method: "moving_average",
  chartData: [
    { month: "Jan", actual: 1820, forecast: null },
    { month: "Feb", actual: 1650, forecast: null },
    { month: "Mar", actual: 1920, forecast: null },
    { month: "Apr", actual: 2140, forecast: null },
    { month: "May", actual: 2380, forecast: null },
    { month: "Jun", actual: 2210, forecast: null },
    { month: "Jul", actual: 2540, forecast: null },
    { month: "Aug", actual: 2310, forecast: null },
    { month: "Sep", actual: 2180, forecast: null },
    { month: "Oct", actual: 2420, forecast: null },
    { month: "Nov", actual: 2290, forecast: null },
    { month: "Dec", actual: 1996, forecast: null },
    { month: "Jan (Pred)", actual: null, forecast: 2480 },
  ],
};

// ─── Analytics Page ──────────────────────────────────────────────────────────
function Analytics() {
  const [demographics, setDemographics] = useState<any>(null);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any>(null);
  const [isLoading, setIsLoading] = useState({ demographics: true, anomalies: true, forecast: true });

  useEffect(() => {
    // Fetch all three APIs concurrently with fallback
    fetch("/server/crime_vision_ai_02_function/demographic-stats")
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(res => { if (res.status === "success") setDemographics(res.data); else throw new Error(); })
      .catch(() => setDemographics(MOCK_DEMOGRAPHICS))
      .finally(() => setIsLoading(l => ({ ...l, demographics: false })));

    fetch("/server/crime_vision_ai_02_function/anomalies")
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(res => { if (res.status === "success") setAnomalies(res.data); else throw new Error(); })
      .catch(() => setAnomalies(MOCK_ANOMALIES))
      .finally(() => setIsLoading(l => ({ ...l, anomalies: false })));

    fetch("/server/crime_vision_ai_02_function/forecast")
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(res => {
        if (res.status === "success") {
          const { historical, predicted } = res.data;
          const chartData = [
            ...historical.map((d: any) => ({ month: d.month, actual: d.count, forecast: null })),
          ];
          if (predicted) chartData.push({ month: predicted.month, actual: null, forecast: predicted.count });
          setForecast({ chartData, method: res.method });
        } else throw new Error();
      })
      .catch(() => setForecast(MOCK_FORECAST))
      .finally(() => setIsLoading(l => ({ ...l, forecast: false })));
  }, []);

  return (
    <div>
      <TopBar title="Crime Analytics" subtitle="AI-driven sociological & predictive analysis • Karnataka" />
      <div className="p-4 md:p-8 space-y-6">

        {/* ── Summary Stats ── */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {[
            { label: "Total Accused", value: demographics?.total ?? "—", icon: Users, tone: "text-info", bg: "bg-info/10 border-info/30" },
            { label: "Anomalies Detected", value: isLoading.anomalies ? "—" : anomalies.length, icon: AlertTriangle, tone: "text-warning", bg: "bg-warning/10 border-warning/30" },
            { label: "Critical Anomalies", value: isLoading.anomalies ? "—" : anomalies.filter(a => a.severity === "Critical").length, icon: Flame, tone: "text-danger", bg: "bg-danger/10 border-danger/30" },
            { label: "Forecast Model", value: forecast?.method === "linear_regression" ? "OLS Regression" : forecast?.method === "moving_average" ? "Mov. Average" : "—", icon: BrainCircuit, tone: "text-success", bg: "bg-success/10 border-success/30" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
              <s.icon className={`h-5 w-5 ${s.tone}`} />
              <div className="mt-2 text-xl font-bold truncate">{isLoading.demographics && s.label === "Total Accused" ? "—" : s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Demographics Row ── */}
        <div className="grid gap-6 grid-cols-1 xl:grid-cols-2">

          {/* Age Band Bar Chart */}
          <Panel title="Age Distribution" subtitle="Accused persons by age band">
            {isLoading.demographics ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <div className="h-72">
                <ResponsiveContainer>
                  <BarChart data={demographics?.ageData ?? []}>
                    <CartesianGrid stroke="oklch(0.3 0.04 250 / 0.4)" vertical={false} />
                    <XAxis dataKey="band" stroke="oklch(0.7 0.02 240)" fontSize={11} />
                    <YAxis stroke="oklch(0.7 0.02 240)" fontSize={11} />
                    <Tooltip cursor={{ fill: "oklch(0.65 0.18 242 / 0.08)" }} {...tooltipStyle} />
                    <Bar dataKey="count" name="Accused Count" fill={AGE_COLOR} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>

          {/* Gender Pie Chart */}
          <Panel title="Gender Distribution" subtitle="Male vs Female accused breakdown">
            {isLoading.demographics ? (
              <Skeleton className="h-72 w-full" />
            ) : (
              <div className="h-72 flex items-center justify-center">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={demographics?.genderData ?? []}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      innerRadius={55}
                      paddingAngle={3}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {(demographics?.genderData ?? []).map((_: any, i: number) => (
                        <Cell key={i} fill={GENDER_COLORS[i % GENDER_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Panel>
        </div>

        {/* ── Forecast Chart ── */}
        <Panel
          title="Crime Forecast"
          subtitle={forecast?.method === "linear_regression" ? "OLS Linear Regression — solid line: historical · dashed: predicted" : "Moving Average Forecast (regression R² too low) — solid: historical · dashed: predicted"}
          action={
            forecast?.method && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${forecast.method === "linear_regression" ? "bg-success/15 text-success border border-success/30" : "bg-info/15 text-info border border-info/30"}`}>
                {forecast.method === "linear_regression" ? "AI: OLS Regression" : "AI: Moving Average Fallback"}
              </span>
            )
          }
        >
          {isLoading.forecast ? (
            <Skeleton className="h-80 w-full" />
          ) : (
            <div className="h-80">
              <ResponsiveContainer>
                <LineChart data={forecast?.chartData ?? []}>
                  <CartesianGrid stroke="oklch(0.3 0.04 250 / 0.4)" vertical={false} />
                  <XAxis dataKey="month" stroke="oklch(0.7 0.02 240)" fontSize={10} />
                  <YAxis stroke="oklch(0.7 0.02 240)" fontSize={11} />
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    name="Historical"
                    stroke="oklch(0.68 0.16 240)"
                    strokeWidth={2.5}
                    dot={false}
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="forecast"
                    name="Predicted (Next Month)"
                    stroke="oklch(0.78 0.16 80)"
                    strokeWidth={2.5}
                    strokeDasharray="6 4"
                    dot={{ r: 6, fill: "oklch(0.78 0.16 80)" }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        {/* ── Anomaly Alerts ── */}
        <Panel
          title="Anomaly Detection"
          subtitle="Monthly time-series Z-Score per district — each district's own baseline • threshold: mean + 1.5σ"
          action={
            !isLoading.anomalies && anomalies.length > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-danger/15 text-danger border border-danger/30 font-semibold uppercase tracking-wider">
                {anomalies.length} anomalies flagged
              </span>
            )
          }
        >
          {isLoading.anomalies ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : anomalies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-12 w-12 rounded-full bg-success/10 text-success grid place-items-center mb-4 border border-success/20">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h4 className="text-foreground font-semibold mb-1">No Anomalies Detected</h4>
              <p className="text-muted-foreground text-sm max-w-[300px]">All district crime volumes are within normal Z-Score thresholds (1.5σ).</p>
            </div>
          ) : (
            <div className="space-y-3">
              {anomalies.map((a, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-4 rounded-xl border p-4 transition-all hover:scale-[1.01] ${a.severity === "Critical" ? "bg-danger/5 border-danger/30" : "bg-warning/5 border-warning/30"}`}
                >
                  <div className={`mt-0.5 rounded-full p-1.5 ${a.severity === "Critical" ? "bg-danger/20" : "bg-warning/20"}`}>
                    {a.severity === "Critical"
                      ? <Flame className="h-4 w-4 text-danger" />
                      : <AlertTriangle className="h-4 w-4 text-warning" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{a.district}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${a.severity === "Critical" ? "bg-danger/20 text-danger" : "bg-warning/20 text-warning"}`}>
                        {a.severity}
                      </span>
                      {a.month && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/15 text-primary border border-primary/20 font-mono">{a.month}</span>}
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{a.crime}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-lg font-bold ${a.severity === "Critical" ? "text-danger" : "text-warning"}`}>Z={a.zScore}</div>
                    <div className="text-[10px] text-muted-foreground">{a.count} cases</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

      </div>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="alert-inline alert-inline-warning mt-2 mb-2">
      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
      <div>
        <strong className="block mb-0.5">Connection Suboptimal</strong>
        <span>{message} Retrying in background.</span>
      </div>
    </div>
  );
}
