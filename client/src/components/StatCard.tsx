import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  tone = "primary",
  hint,
  isLoading = false,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  delta?: number;
  tone?: "primary" | "success" | "warning" | "danger" | "info";
  hint?: string;
  isLoading?: boolean;
}) {
  const toneClass = {
    primary: "from-primary/20 to-primary/0 text-primary border-primary/30",
    success: "from-success/20 to-success/0 text-success border-success/30",
    warning: "from-warning/20 to-warning/0 text-warning border-warning/30",
    danger: "from-danger/20 to-danger/0 text-danger border-danger/30",
    info: "from-info/20 to-info/0 text-info border-info/30",
  }[tone];

  return (
    <div className="gov-card rounded-2xl p-5 relative overflow-hidden group hover:border-primary/40 hover:shadow-lg transition-all animate-float-up">
      <div className={`absolute -top-12 -right-12 h-40 w-40 rounded-full bg-gradient-to-br ${toneClass} blur-3xl opacity-30 group-hover:opacity-50 transition-all duration-500`} />
      
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/80">{label}</div>
          
          <div className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            {isLoading ? (
              <div className="h-9 w-24 rounded-md skeleton mt-1" />
            ) : (
              typeof value === "number" ? value.toLocaleString("en-IN") : value
            )}
          </div>
          
          {hint && !isLoading && (
            <div className="mt-1.5 text-[11.5px] text-muted-foreground/80 leading-relaxed">{hint}</div>
          )}
          
          {typeof delta === "number" && !isLoading && (
            <div
              className={`mt-3.5 inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-bold tracking-wide ${
                delta >= 0 
                  ? "bg-success/10 text-success" 
                  : "bg-danger/10 text-danger"
              }`}
            >
              {delta >= 0 ? <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" /> : <ArrowDownRight className="h-3.5 w-3.5 stroke-[2.5]" />}
              {Math.abs(delta)}% <span className="opacity-70 font-medium normal-case tracking-normal">vs last month</span>
            </div>
          )}
        </div>
        
        <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl border bg-gradient-to-br ${toneClass} shadow-sm group-hover:scale-110 transition-transform duration-300 ease-out`}>
          <Icon className="h-5.5 w-5.5" />
        </div>
      </div>
    </div>
  );
}
