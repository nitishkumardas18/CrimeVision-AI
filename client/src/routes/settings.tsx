import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { Panel } from "@/components/Panel";
import { useState } from "react";
import { Shield, Bell, Globe, Database, User, Key } from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — CrimeVision AI" },
      { name: "description", content: "Configure your CrimeVision AI dashboard." },
      { property: "og:title", content: "Settings — CrimeVision AI" },
      { property: "og:description", content: "Configure your CrimeVision AI dashboard." },
    ],
  }),
  component: Settings,
});

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`toggle-track ${on ? "toggle-track-on" : "toggle-track-off"}`}
      aria-pressed={on}
    >
      <span
        className={`toggle-thumb ${on ? "translate-x-5" : "translate-x-0.5"}`}
      />
    </button>
  );
}

function Row({ icon: Icon, title, desc, control }: any) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 py-4 border-b border-border/50 last:border-b-0">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 border border-primary/25 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      {control}
    </div>
  );
}

function Settings() {
  const [alerts, setAlerts] = useState(true);
  const [predict, setPredict] = useState(true);
  const [twofa, setTwofa] = useState(true);
  const [share, setShare] = useState(false);

  return (
    <div>
      <TopBar title="Settings" subtitle="Personal preferences, security, and system configuration" />
      <div className="p-4 md:p-8 grid gap-6 grid-cols-1 xl:grid-cols-3">
        <Panel title="Profile" subtitle="Officer identity" className="xl:col-span-1">
          <div className="flex flex-col items-center text-center py-4">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-primary to-info text-primary-foreground text-2xl font-bold gov-glow">
              SA
            </div>
            <div className="mt-3 text-base font-semibold">System Admin</div>
            <div className="text-xs text-muted-foreground">Authorized Administrator</div>
            <div className="mt-1 text-[11px] uppercase tracking-widest text-primary">Headquarters • Zone 1</div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs w-full">
              <Stat label="Cases" value="248" />
              <Stat label="Solved" value="192" />
              <Stat label="Rank" value="#3" />
            </div>
          </div>
        </Panel>

        <Panel title="Preferences" subtitle="Notifications and interaction" className="xl:col-span-2">
          <Row icon={Bell} title="Live Alert Notifications" desc="Push critical alerts to this device"
            control={<Toggle on={alerts} onToggle={() => setAlerts(v => !v)} />} />
          <Row icon={Shield} title="AI Predictions" desc="Show predictive insights across the dashboard"
            control={<Toggle on={predict} onToggle={() => setPredict(v => !v)} />} />
          <Row icon={Globe} title="Cross-District Data" desc="Share telemetry with neighboring districts"
            control={<Toggle on={share} onToggle={() => setShare(v => !v)} />} />
        </Panel>

        <Panel title="Security" subtitle="Access and credentials" className="xl:col-span-2">
          <Row icon={Key} title="Two-Factor Authentication" desc="Government e-Auth (KSP-Secure)"
            control={<Toggle on={twofa} onToggle={() => setTwofa(v => !v)} />} />
          <Row icon={User} title="Active Sessions" desc="3 devices signed in"
            control={<button className="text-xs text-primary hover:underline">Revoke all</button>} />
          <Row icon={Database} title="Data Retention" desc="Local cache purge every 24h"
            control={<span className="text-xs text-muted-foreground">Enabled</span>} />
        </Panel>

        <Panel title="System" subtitle="Version and status" className="xl:col-span-1">
          <div className="space-y-3 text-sm">
            <Line label="Version" value="v4.2.1" />
            <Line label="AI Engine" value="Operational" tone="success" />
            <Line label="Data Sync" value="Just now" />
            <Line label="Server" value="ksp-secure-01" />
            <Line label="Region" value="Karnataka" />
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-2">
      <div className="text-base font-bold">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
function Line({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex justify-between items-center text-xs border-b border-border/50 pb-2 last:border-b-0">
      <span className="text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className={`font-medium ${tone === "success" ? "text-success" : ""}`}>{value}</span>
    </div>
  );
}
