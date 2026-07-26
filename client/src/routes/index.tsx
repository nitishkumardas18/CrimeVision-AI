import { createFileRoute } from "@tanstack/react-router";
import {
  Activity, AlertCircle, Users, MapPin, ShieldCheck, FileWarning,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { StatCard } from "@/components/StatCard";
import { TopBar } from "@/components/TopBar";
import { Panel } from "@/components/Panel";
import {
  stats, crimeByMonth, crimeByCategory, crimeTrend, hotspots,
} from "@/lib/dummy-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — CrimeVision AI" },
      { name: "description", content: "Real-time crime intelligence overview for Karnataka State Police." },
      { property: "og:title", content: "Dashboard — CrimeVision AI" },
      { property: "og:description", content: "Real-time crime intelligence overview." },
    ],
  }),
  component: Dashboard,
});

const tooltipStyle = {
  contentStyle: {
    background: "var(--color-card)",
    border: "1px solid var(--color-border)",
    borderRadius: 12,
    fontSize: 12,
    boxShadow: "0 8px 32px -8px rgba(0,0,0,0.3)",
    padding: "8px 12px",
    color: "var(--color-foreground)",
  },
  labelStyle: { color: "var(--color-foreground)", fontWeight: 700, marginBottom: 4 },
  itemStyle: { color: "var(--color-foreground)", fontSize: 12, padding: "2px 0" }
};

function riskBadge(risk: string) {
  const map: Record<string, string> = {
    critical: "bg-danger/10 text-danger border-danger/20",
    high: "bg-warning/10 text-warning border-warning/20",
    medium: "bg-info/10 text-info border-info/20",
    low: "bg-success/10 text-success border-success/20",
  };
  return `inline-flex px-2 py-0.5 rounded-md border text-[10px] uppercase tracking-[0.1em] font-bold ${map[risk]}`;
}

function Dashboard() {
  return (
    <div>
      <TopBar
        title="Command Overview"
        subtitle="Real-time crime intelligence • Karnataka State • Updated just now"
      />
      <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto">
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Total Crimes" value={stats.totalCrimes} icon={FileWarning} tone="primary" delta={-4.2} />
          <StatCard label="Today's Crimes" value={stats.todayCrimes} icon={Activity} tone="warning" delta={2.1} hint="Since 00:00 IST" />
          <StatCard label="Active Cases" value={stats.activeCases} icon={AlertCircle} tone="danger" delta={-1.4} />
          <StatCard label="Repeat Offenders" value={stats.repeatOffenders} icon={Users} tone="info" delta={0.8} />
          <StatCard label="High Risk Districts" value={stats.highRiskDistricts} icon={MapPin} tone="warning" hint="Under close monitoring" />
          <StatCard label="Solved Cases" value={stats.solvedCases} icon={ShieldCheck} tone="success" delta={6.5} />
        </div>

        <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
          <Panel title="Crime by Month" subtitle="Reported vs Solved (12 months)" className="xl:col-span-2">
            <div className="h-72 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={crimeByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gCrimes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.65 0.18 242)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="oklch(0.65 0.18 242)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gSolved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.70 0.16 158)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.70 0.16 158)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="oklch(0.3 0.04 250 / 0.3)" vertical={false} strokeDasharray="4 4" />
                  <XAxis dataKey="month" stroke="oklch(0.65 0.018 242)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="oklch(0.65 0.018 242)" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} iconType="circle" />
                  <Area type="monotone" dataKey="crimes" stroke="oklch(0.65 0.18 242)" strokeWidth={3} fill="url(#gCrimes)" activeDot={{ r: 6, strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="solved" stroke="oklch(0.70 0.16 158)" strokeWidth={3} fill="url(#gSolved)" activeDot={{ r: 6, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Crime by Category" subtitle="Distribution across categories">
            <div className="h-72 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <Pie
                    data={crimeByCategory}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    stroke="none"
                    cornerRadius={4}
                  >
                    {crimeByCategory.map((e) => (
                      <Cell key={e.name} fill={e.color} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} cursor={{ fill: 'transparent' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <div className="text-2xl font-bold text-foreground">12.4k</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Total</div>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs border-t border-border/50 pt-4">
              {crimeByCategory.map((c) => (
                <div key={c.name} className="flex items-center gap-2 px-1 py-1 rounded-md hover:bg-accent/30 transition-colors">
                  <span className="h-2.5 w-2.5 rounded-sm shadow-sm" style={{ background: c.color }} />
                  <span className="text-muted-foreground/90 truncate font-medium">{c.name}</span>
                  <span className="ml-auto font-bold text-foreground">{c.value.toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
          <Panel title="Crime Trend" subtitle="Last 30 days • Incidents vs Arrests" className="xl:col-span-2">
            <div className="h-72 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={crimeTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="oklch(0.3 0.04 250 / 0.3)" vertical={false} strokeDasharray="4 4" />
                  <XAxis dataKey="day" stroke="oklch(0.65 0.018 242)" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="oklch(0.65 0.018 242)" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} iconType="circle" />
                  <Line type="monotone" dataKey="incidents" stroke="oklch(0.62 0.22 27)" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0, fill: "oklch(0.62 0.22 27)" }} />
                  <Line type="monotone" dataKey="arrests" stroke="oklch(0.70 0.16 158)" strokeWidth={2.5} dot={false} activeDot={{ r: 5, strokeWidth: 0, fill: "oklch(0.70 0.16 158)" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Crime Hotspots" subtitle="Top districts by incidents">
            <div className="h-72 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hotspots} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid stroke="oklch(0.3 0.04 250 / 0.3)" horizontal={false} strokeDasharray="4 4" />
                  <XAxis type="number" stroke="oklch(0.65 0.018 242)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis dataKey="district" type="category" stroke="oklch(0.88 0.012 242)" fontSize={11} width={100} tickLine={false} axisLine={false} fontWeight={500} />
                  <Tooltip {...tooltipStyle} cursor={{ fill: 'oklch(0.26 0.038 252 / 0.4)' }} />
                  <Bar dataKey="crimes" radius={[0, 4, 4, 0]} barSize={16}>
                    {hotspots.map((h) => (
                      <Cell
                        key={h.district}
                        fill={
                          h.risk === "critical" ? "oklch(0.62 0.22 27)" :
                          h.risk === "high" ? "oklch(0.76 0.15 82)" :
                          h.risk === "medium" ? "oklch(0.70 0.12 222)" : "oklch(0.70 0.16 158)"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        <Panel title="District Risk Register" subtitle="Live risk classification based on dynamic thresholds">
          <div className="overflow-x-auto scrollbar-thin mt-2 pb-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.1em] text-muted-foreground/80 border-b border-border font-bold">
                  <th className="pb-3 px-4">District</th>
                  <th className="pb-3 px-4">Incidents (YTD)</th>
                  <th className="pb-3 px-4">Risk Level</th>
                  <th className="pb-3 px-4 w-48">Trend Indicator</th>
                </tr>
              </thead>
              <tbody>
                {hotspots.map((h, i) => (
                  <tr key={h.district} className="border-b border-border/40 hover:bg-accent/40 transition-colors group">
                    <td className="py-3.5 px-4 font-semibold text-foreground group-hover:text-primary transition-colors">{h.district}</td>
                    <td className="py-3.5 px-4 font-medium">{h.crimes.toLocaleString("en-IN")}</td>
                    <td className="py-3.5 px-4"><span className={riskBadge(h.risk)}>{h.risk}</span></td>
                    <td className="py-3.5 px-4">
                      <div className="h-1.5 w-full rounded-full bg-input overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-info rounded-full relative"
                          style={{ width: `${Math.min(100, (h.crimes / 4820) * 100)}%` }}
                        >
                          <div className="absolute top-0 right-0 bottom-0 w-8 bg-gradient-to-l from-white/30 to-transparent" />
                        </div>
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
