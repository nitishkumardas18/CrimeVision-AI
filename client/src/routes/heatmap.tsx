import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { TopBar } from "@/components/TopBar";
import { Panel } from "@/components/Panel";
import { ClientOnly } from "@/components/ClientOnly";
import { mapHotspots as fallbackData } from "@/lib/dummy-data";
import { MapPin, Flame, AlertTriangle, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/heatmap")({
  head: () => ({
    meta: [
      { title: "Crime Heatmap — CrimeVision AI" },
      { name: "description", content: "Geographic heatmap of crime incidents across Karnataka." },
      { property: "og:title", content: "Crime Heatmap — CrimeVision AI" },
      { property: "og:description", content: "Geographic heatmap of crime incidents across Karnataka." },
    ],
  }),
  component: Heatmap,
});

function LeafletMap({ data }: { data: any[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: any;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !ref.current) return;
      map = L.map(ref.current, { zoomControl: true, attributionControl: true }).setView([14.5, 76.5], 7);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(map);

      data.forEach(([lat, lng, intensity, name, cases]) => {
        const color = intensity > 0.8 ? "#ef4444" : intensity > 0.6 ? "#f59e0b" : intensity > 0.4 ? "#3b82f6" : "#10b981";
        const risk = intensity > 0.8 ? "Critical" : intensity > 0.6 ? "High" : intensity > 0.4 ? "Medium" : "Low";
        const hoursAgo = Math.floor(2 + (intensity || 0) * 12);
        const lastUpdated = `${hoursAgo}h ago`;
        L.circleMarker([lat, lng], {
          radius: 6 + (intensity || 0) * 22,
          color,
          weight: 2,
          fillColor: color,
          fillOpacity: 0.35,
        })
          .addTo(map)
          .bindPopup(
            `<div style="font-family: inherit; min-width: 200px;">
              <div style="font-weight:700;font-size:14px;margin-bottom:6px;border-bottom:1px solid #e5e7eb;padding-bottom:4px;">${name}</div>
              <div style="display:grid;grid-template-columns:auto 1fr;gap:4px 10px;font-size:11px;">
                <span style="color:#6b7280;">District:</span><span style="font-weight:600;">${name}</span>
                <span style="color:#6b7280;">Crime Count:</span><span style="font-weight:600;">${cases.toLocaleString("en-IN")}</span>
                <span style="color:#6b7280;">Risk Level:</span><span style="font-weight:700;color:${color};">${risk}</span>
                <span style="color:#6b7280;">Last Updated:</span><span>${lastUpdated}</span>
              </div>
            </div>`
          );

        L.circleMarker([lat, lng], {
          radius: 4,
          color,
          weight: 1,
          fillColor: color,
          fillOpacity: 0.9,
        }).addTo(map);
      });
    })();

    return () => {
      cancelled = true;
      if (map) map.remove();
    };
  }, [data]);

  return <div ref={ref} className="h-[600px] w-full rounded-lg overflow-hidden border border-border" />;
}

function Heatmap() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/server/crime_vision_ai_02_function/crimes-by-district')
      .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then(res => {
         if (res.status === 'success' && res.data && res.data.length > 0) {
             const maxCases = Math.max(...res.data.map((d: any) => d.crimeCount));
             // Prevent division by zero if maxCases is 0
             const safeMax = maxCases > 0 ? maxCases : 1; 
             const formatted = res.data.map((d: any) => [
                d.lat, d.lng, d.crimeCount / safeMax, d.name, d.crimeCount
             ]);
             setData(formatted);
         } else {
             throw new Error("Invalid or empty response format");
         }
      })
      .catch(err => {
         console.error("Failed to fetch live API data:", err);
         setError(true);
         setData(fallbackData);
      })
      .finally(() => {
         setIsLoading(false);
      });
  }, []);

  // Compute stats based on current data
  const criticalCount = data.filter(d => d[2] > 0.8).length;
  const highRiskCount = data.filter(d => d[2] > 0.6 && d[2] <= 0.8).length;
  const monitoredCount = data.filter(d => d[2] <= 0.6).length;
  const totalDistricts = data.length;

  return (
    <div>
      <TopBar title="Crime Heatmap" subtitle="Geospatial intensity map • Karnataka • OpenStreetMap" />
      <div className="p-4 md:p-8 space-y-6">

        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {[
            { label: "Critical Zones", value: criticalCount, icon: Flame, tone: "text-danger", bg: "bg-danger/10 border-danger/30" },
            { label: "High Risk", value: highRiskCount, icon: AlertTriangle, tone: "text-warning", bg: "bg-warning/10 border-warning/30" },
            { label: "Monitored", value: monitoredCount, icon: MapPin, tone: "text-info", bg: "bg-info/10 border-info/30" },
            { label: "Total Districts", value: totalDistricts, icon: MapPin, tone: "text-success", bg: "bg-success/10 border-success/30" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
              <s.icon className={`h-5 w-5 ${s.tone}`} />
              <div className="mt-2 text-2xl font-bold">{isLoading ? "-" : s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        <Panel
          title="Karnataka Crime Density Map"
          subtitle="Click any marker to view district details"
          action={
            <div className="flex items-center gap-3 text-[11px]">
              <Legend color="#ef4444" label="Critical" />
              <Legend color="#f59e0b" label="High" />
              <Legend color="#3b82f6" label="Medium" />
              <Legend color="#10b981" label="Low" />
            </div>
          }
        >
          {isLoading ? (
            <div className="h-[600px] w-full rounded-lg border border-border flex items-center justify-center text-muted-foreground text-sm bg-background/50">
              <div className="flex flex-col items-center gap-4">
                <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                Loading geographic data...
              </div>
            </div>
          ) : (
            <ClientOnly
              fallback={
                <div className="h-[600px] w-full rounded-lg border border-border grid place-items-center text-muted-foreground text-sm">
                  Initializing map component...
                </div>
              }
            >
              <LeafletMap data={data} />
            </ClientOnly>
          )}
        </Panel>

        <Panel title="Top Coordinates" subtitle="Incident-dense locations">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="py-2 px-3">Location</th>
                  <th className="py-2 px-3">Latitude</th>
                  <th className="py-2 px-3">Longitude</th>
                  <th className="py-2 px-3">Cases</th>
                  <th className="py-2 px-3">Intensity</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Loading records...</td></tr>
                ) : (
                  [...data].sort((a, b) => b[4] - a[4]).slice(0, 8).map(([lat, lng, intensity, name, cases]) => (
                    <tr key={name} className="border-b border-border/50 hover:bg-accent/30">
                      <td className="py-2.5 px-3 font-medium">{name}</td>
                      <td className="py-2.5 px-3 text-muted-foreground font-mono text-xs">{lat.toFixed(4)}</td>
                      <td className="py-2.5 px-3 text-muted-foreground font-mono text-xs">{lng.toFixed(4)}</td>
                      <td className="py-2.5 px-3">{cases.toLocaleString("en-IN")}</td>
                      <td className="py-2.5 px-3">
                        <div className="h-1.5 w-32 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-primary via-warning to-danger" style={{ width: `${intensity * 100}%` }} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      <span className="text-muted-foreground">{label}</span>
    </span>
  );
}
