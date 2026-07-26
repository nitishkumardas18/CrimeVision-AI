import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { Panel } from "@/components/Panel";
import { useState, useEffect, useRef } from "react";
import { User, Users, MapPin, Car, FileText, AlertCircle } from "lucide-react";
import { forceSimulation, forceManyBody, forceLink, forceCenter } from "d3-force";

export const Route = createFileRoute("/network")({
  head: () => ({
    meta: [
      { title: "Crime Network — CrimeVision AI" },
      { name: "description", content: "Interactive relationship graph of suspects, victims, locations, vehicles, and cases." },
    ],
  }),
  component: NetworkGraph,
});

type EntityType = "suspect" | "victim" | "location" | "vehicle" | "case";

const entityMeta: Record<string, { color: string; label: string; icon: typeof User }> = {
  suspect: { color: "oklch(0.65 0.23 25)", label: "Suspect", icon: User },
  victim: { color: "oklch(0.72 0.17 155)", label: "Victim", icon: Users },
  location: { color: "oklch(0.68 0.16 240)", label: "Location", icon: MapPin },
  vehicle: { color: "oklch(0.78 0.16 80)", label: "Vehicle", icon: Car },
  case: { color: "oklch(0.72 0.19 305)", label: "Case", icon: FileText },
  // Map API groups to EntityType
  Accused: { color: "oklch(0.65 0.23 25)", label: "Accused", icon: User },
  Case: { color: "oklch(0.72 0.19 305)", label: "Case", icon: FileText },
};

function NetworkGraph() {
  const [hover, setHover] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [graphData, setGraphData] = useState<{ nodes: any[]; edges: any[] }>({ nodes: [], edges: [] });
  const simulationRef = useRef<any>(null);

  useEffect(() => {
    fetch("/server/crime_vision_ai_02_function/network-graph")
      .then((res) => {
        if (!res.ok) throw new Error("API failed");
        return res.json();
      })
      .then((res) => {
        if (res.status === "success" && res.data) {
          // Calculate node degrees to prioritize highly connected nodes (Repeat Offenders)
          const degrees: Record<string, number> = {};
          res.data.links.forEach((l: any) => {
            degrees[l.source] = (degrees[l.source] || 0) + 1;
            degrees[l.target] = (degrees[l.target] || 0) + 1;
          });

          // Sort nodes by degree (descending) so hubs are kept
          const sortedNodes = [...res.data.nodes].sort((a: any, b: any) => {
            const degA = degrees[a.id] || 0;
            const degB = degrees[b.id] || 0;
            return degB - degA;
          });

          // Limit nodes to prevent browser freeze, keeping the most connected ones
          const MAX_NODES = 250;
          const apiNodes = sortedNodes.slice(0, MAX_NODES).map((n: any) => ({
            ...n,
            type: n.group,
            x: 400 + (Math.random() - 0.5) * 100,
            y: 230 + (Math.random() - 0.5) * 100,
          }));
          
          const validIds = new Set(apiNodes.map((n: any) => n.id));
          const apiEdges = res.data.links
            .filter((l: any) => validIds.has(l.source) && validIds.has(l.target))
            .map((l: any) => ({
              source: l.source,
              target: l.target,
              rel: "Linked",
            }));

          // Run D3 force simulation to calculate positions
          const simulation = forceSimulation(apiNodes)
            .force("link", forceLink(apiEdges).id((d: any) => d.id).distance(60))
            .force("charge", forceManyBody().strength(-100))
            .force("center", forceCenter(400, 260))
            .on("tick", () => {
              setGraphData({ nodes: [...apiNodes], edges: [...apiEdges] });
            });

          simulationRef.current = simulation;
        } else {
          throw new Error("Invalid format");
        }
      })
      .catch((err) => {
        console.error("Network Fetch error, using fallback data:", err);
        const fbNodes = [
          { id: "A_101", type: "Accused", name: "Ravi Kumar (Kingpin)", x: 350, y: 200 },
          { id: "A_102", type: "Accused", name: "Suresh M.", x: 260, y: 120 },
          { id: "A_103", type: "Accused", name: "Anil P.", x: 500, y: 130 },
          { id: "A_104", type: "Accused", name: "Vikram S.", x: 200, y: 280 },
          { id: "A_105", type: "Accused", name: "Deepak R.", x: 580, y: 290 },
          { id: "C_201", type: "Case", name: "FIR 8421: Cyber Fraud", x: 300, y: 180 },
          { id: "C_202", type: "Case", name: "FIR 8422: Vehicle Theft", x: 420, y: 120 },
          { id: "C_203", type: "Case", name: "FIR 8423: Burglary Ring", x: 220, y: 250 },
          { id: "C_204", type: "Case", name: "FIR 8424: Narcotics Seizure", x: 520, y: 220 },
          { id: "C_205", type: "Case", name: "FIR 8425: Extortion", x: 380, y: 320 },
        ];
        const fbEdges = [
          { source: "A_101", target: "C_201", rel: "Linked" },
          { source: "A_101", target: "C_202", rel: "Linked" },
          { source: "A_101", target: "C_205", rel: "Linked" },
          { source: "A_102", target: "C_201", rel: "Linked" },
          { source: "A_102", target: "C_203", rel: "Linked" },
          { source: "A_103", target: "C_202", rel: "Linked" },
          { source: "A_103", target: "C_204", rel: "Linked" },
          { source: "A_104", target: "C_203", rel: "Linked" },
          { source: "A_105", target: "C_204", rel: "Linked" },
          { source: "A_105", target: "C_205", rel: "Linked" },
        ];

        const simulation = forceSimulation(fbNodes)
          .force("link", forceLink(fbEdges).id((d: any) => d.id).distance(80))
          .force("charge", forceManyBody().strength(-120))
          .force("center", forceCenter(400, 260))
          .on("tick", () => {
            setGraphData({ nodes: [...fbNodes], edges: [...fbEdges] });
          });

        simulationRef.current = simulation;
      })
      .finally(() => {
        setIsLoading(false);
      });

    return () => {
      if (simulationRef.current) simulationRef.current.stop();
    };
  }, []);

  const counts = graphData.nodes.reduce<Record<string, number>>((acc, n) => {
    acc[n.type] = (acc[n.type] ?? 0) + 1;
    return acc;
  }, {});

  const displayedNodeMap = new Map(graphData.nodes.map((n) => [n.id, n]));

  return (
    <div>
      <TopBar title="Crime Network" subtitle="Live multi-entity relationship graph • Cases & Accused" />
      <div className="p-4 md:p-8 space-y-6">

        <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
          {["Accused", "Case"].map((t) => {
            const M = entityMeta[t];
            return (
              <div key={t} className="gov-card rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <M.icon className="h-4 w-4" style={{ color: M.color }} />
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">{M.label}</span>
                </div>
                <div className="mt-2 text-2xl font-bold">{isLoading ? "-" : (counts[t] || 0)}</div>
              </div>
            );
          })}
        </div>

        <Panel title="Network Topology" subtitle={isLoading ? "Loading data..." : "Hover a node to trace connections"}>
          {isLoading ? (
             <div className="h-[520px] w-full rounded-2xl border border-border flex items-center justify-center bg-background/50 text-muted-foreground skeleton">
               <div className="flex flex-col items-center gap-4">
                 <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                 <span className="font-semibold tracking-wider text-xs uppercase">Resolving Network Edges...</span>
               </div>
             </div>
          ) : (
            <div className="rounded-lg border border-border bg-background/30 overflow-hidden relative">
              <svg viewBox="0 0 800 520" className="w-full h-[520px]">
                {graphData.edges.map((edge, i) => {
                  const na = edge.source.x !== undefined ? edge.source : displayedNodeMap.get(edge.source);
                  const nb = edge.target.x !== undefined ? edge.target : displayedNodeMap.get(edge.target);
                  if (!na || !nb) return null;
                  const active = hover === na.id || hover === nb.id;
                  const mx = (na.x + nb.x) / 2;
                  const my = (na.y + nb.y) / 2;
                  return (
                    <g key={i}>
                      <line
                        x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                        stroke={active ? "oklch(0.78 0.16 80)" : "oklch(0.4 0.05 250)"}
                        strokeWidth={active ? 2 : 1}
                        strokeDasharray={active ? "0" : "4 4"}
                        opacity={hover && !active ? 0.05 : 0.6}
                      />
                    </g>
                  );
                })}

                {graphData.nodes.map((n) => {
                  const M = entityMeta[n.type] || entityMeta.case;
                  const isCase = n.type === "Case";
                  const r = isCase ? 12 : 8;
                  const active = hover === n.id;
                  return (
                    <g
                      key={n.id}
                      onMouseEnter={() => setHover(n.id)}
                      onMouseLeave={() => setHover(null)}
                      style={{ cursor: "pointer" }}
                    >
                      <circle
                        cx={n.x} cy={n.y} r={r + (active ? 4 : 0)}
                        fill={M.color}
                        fillOpacity={0.25}
                        stroke={M.color}
                        strokeWidth={2}
                        style={{ transition: "all 0.2s" }}
                      />
                      <circle cx={n.x} cy={n.y} r={r - 3} fill={M.color} />
                      {active && (
                        <>
                          <rect x={n.x - 40} y={n.y + r + 4} width="80" height="18" fill="#111" rx="4" />
                          <text x={n.x} y={n.y + r + 16} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="500">
                            {n.name}
                          </text>
                        </>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </Panel>

        <Panel title="Entity Registry" subtitle="Active nodes in topology (Top 100)">
          <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {graphData.nodes.length === 0 && !isLoading && (
              <div className="col-span-full text-center py-12 text-muted-foreground/80 text-[13px]">
                No entities found. The network may be offline or the dataset is empty.
              </div>
            )}
            {graphData.nodes.slice(0, 100).map((n) => {
              const M = entityMeta[n.type] || entityMeta.case;
              return (
                <div key={n.id} className="flex items-center gap-3 rounded-xl border border-border/80 bg-card/50 p-3 hover:border-primary/40 hover:bg-accent/40 transition-all cursor-pointer">
                  <div
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-primary-foreground shadow-sm"
                    style={{ background: M.color }}
                  >
                    <M.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold truncate text-foreground">{n.name}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground/90 font-medium">
                      {M.label}
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
