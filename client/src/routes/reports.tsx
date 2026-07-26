import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { Panel } from "@/components/Panel";
import { reports, stats, hotspots, crimeByMonth } from "@/lib/dummy-data";
import { FileText, Download, Eye, Filter, Plus, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import jsPDF from "jspdf";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — CrimeVision AI" },
      { name: "description", content: "Generated intelligence and statistical reports." },
      { property: "og:title", content: "Reports — CrimeVision AI" },
      { property: "og:description", content: "Generated intelligence and statistical reports." },
    ],
  }),
  component: Reports,
});

const statusColor: Record<string, string> = {
  Published: "text-success bg-success/10 border-success/30",
  Draft: "text-warning bg-warning/10 border-warning/30",
  Confidential: "text-danger bg-danger/10 border-danger/30",
};

function Reports() {
  const [generating, setGenerating] = useState(false);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const runGenerate = () => {
    setGenerating(true);
    setGeneratedAt(null);
    setTimeout(() => {
      setGenerating(false);
      setGeneratedAt(new Date().toLocaleString("en-IN"));
      setToast("Report generated successfully");
      setTimeout(() => setToast(null), 2500);
    }, 1400);
  };

  const downloadPdf = (reportTitle?: string) => {
    const title = reportTitle || "Intelligence_Dossier";
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text("Karnataka State Police", 20, 20);
    
    doc.setFontSize(16);
    doc.text(title, 20, 30);
    
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleString("en-IN")}`, 20, 40);
    doc.text("CONFIDENTIAL - FOR OFFICIAL USE ONLY", 20, 50);
    doc.text("This is an auto-generated intelligence dossier.", 20, 65);
    
    doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
    
    setToast("PDF downloaded successfully");
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div>
      <TopBar title="Intelligence Reports" subtitle="Auto-generated dossiers and analytical briefings" />
      <div className="p-4 md:p-8 space-y-6">
        {toast && (
          <div className="fixed top-20 right-6 z-50 rounded-lg border border-success/40 bg-success/10 text-success px-4 py-2 text-sm flex items-center gap-2 shadow-lg">
            <CheckCircle2 className="h-4 w-4" /> {toast}
          </div>
        )}

        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {[
            { label: "Total Reports", value: 342, color: "text-primary" },
            { label: "Published", value: 218, color: "text-success" },
            { label: "Draft", value: 84, color: "text-warning" },
            { label: "Confidential", value: 40, color: "text-danger" },
          ].map((s) => (
            <div key={s.label} className="gov-card rounded-xl p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
              <div className={`mt-2 text-2xl font-bold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        <Panel
          title="Generate New Report"
          subtitle="Compile a fresh intelligence dossier from live data"
          action={
            <div className="flex items-center gap-2">
              <button
                onClick={runGenerate}
                disabled={generating}
                className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
              >
                {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                {generating ? "Generating…" : "Generate Report"}
              </button>
              <button
                onClick={() => downloadPdf("Live_Intelligence_Report")}
                disabled={!generatedAt}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs hover:bg-accent disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5" /> Download PDF
              </button>
            </div>
          }
        >
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
            <div className="rounded-lg border border-border bg-card/40 p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Crime Summary</div>
              <dl className="space-y-2 text-sm">
                <Row k="Total Crimes" v={stats.totalCrimes.toLocaleString("en-IN")} />
                <Row k="Today's Crimes" v={stats.todayCrimes.toString()} />
                <Row k="Active Cases" v={stats.activeCases.toLocaleString("en-IN")} />
                <Row k="Solved Cases" v={stats.solvedCases.toLocaleString("en-IN")} />
                <Row k="Repeat Offenders" v={stats.repeatOffenders.toString()} />
                <Row k="High-Risk Districts" v={stats.highRiskDistricts.toString()} />
              </dl>
            </div>

            <div className="rounded-lg border border-border bg-card/40 p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Top Hotspots</div>
              <ol className="space-y-2 text-sm">
                {hotspots.slice(0, 6).map((h, i) => (
                  <li key={h.district} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="grid h-5 w-5 place-items-center rounded-md bg-primary/15 text-[10px] font-bold text-primary">{i + 1}</span>
                      <span className="truncate">{h.district}</span>
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">{h.crimes.toLocaleString("en-IN")}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="rounded-lg border border-border bg-card/40 p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Monthly Trend</div>
              <div className="h-40">
                <ResponsiveContainer>
                  <LineChart data={crimeByMonth} margin={{ top: 6, right: 6, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="oklch(0.3 0.04 250 / 0.3)" strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fill: "oklch(0.7 0.02 250)", fontSize: 10 }} />
                    <YAxis tick={{ fill: "oklch(0.7 0.02 250)", fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "oklch(0.18 0.03 250)", border: "1px solid oklch(0.3 0.04 250)", borderRadius: 8, fontSize: 12 }} />
                    <Line type="monotone" dataKey="crimes" stroke="oklch(0.65 0.23 25)" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="solved" stroke="oklch(0.72 0.17 155)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            {generatedAt ? (
              <span className="inline-flex items-center gap-2 text-success">
                <CheckCircle2 className="h-3.5 w-3.5" /> Latest report generated at {generatedAt}. Ready to download.
              </span>
            ) : (
              <span>No report generated yet in this session.</span>
            )}
          </div>
        </Panel>

        <Panel
          title="Report Library"
          subtitle="All intelligence deliverables"
          action={
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs hover:bg-accent">
                <Filter className="h-3.5 w-3.5" /> Filter
              </button>
            </div>
          }
        >
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-2 px-3">Report</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} className="border-b border-border/50 hover:bg-accent/30">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/15 border border-primary/25 text-primary">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{r.title}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">{r.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-muted-foreground">{r.type}</td>
                    <td className="py-3 px-3 text-muted-foreground font-mono text-xs">{r.date}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-md border text-[10px] uppercase tracking-wider font-semibold ${statusColor[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1">
                        <button className="grid h-8 w-8 place-items-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => downloadPdf(r.title)}
                          className="grid h-8 w-8 place-items-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/40 pb-1.5 last:border-0">
      <dt className="text-muted-foreground text-xs uppercase tracking-wider">{k}</dt>
      <dd className="font-semibold">{v}</dd>
    </div>
  );
}
