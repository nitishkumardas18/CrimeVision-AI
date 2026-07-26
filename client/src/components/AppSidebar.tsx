import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, BarChart3, Map, Network, Bot,
  FileText, Sparkles, Settings, ShieldCheck, ChevronRight,
} from "lucide-react";

const items = [
  { to: "/",           label: "Dashboard",      icon: LayoutDashboard },
  { to: "/analytics",  label: "Crime Analytics", icon: BarChart3 },
  { to: "/heatmap",    label: "Crime Heatmap",   icon: Map },
  { to: "/network",    label: "Crime Network",   icon: Network },
  { to: "/assistant",  label: "AI Assistant",    icon: Bot },
  { to: "/reports",    label: "Reports",         icon: FileText },
  { to: "/prediction", label: "Prediction",      icon: Sparkles },
  { to: "/settings",   label: "Settings",        icon: Settings },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="flex flex-col w-56 lg:w-64 shrink-0 bg-sidebar border-r border-sidebar-border h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-sidebar-border">
        <div className="relative shrink-0">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-info gov-glow-sm">
            <ShieldCheck className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-success border-2 border-sidebar animate-pulse-ring" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-bold gov-gradient-text leading-tight">CrimeVision AI</div>
          <div className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">
            Karnataka Police
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2.5 space-y-0.5">
        <div className="px-2.5 pt-1 pb-2.5 text-[9px] uppercase tracking-[0.18em] text-muted-foreground/70 font-semibold">
          Main Menu
        </div>
        {items.map((item) => {
          const isActive = pathname === item.to;
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-150 ${
                isActive
                  ? "bg-gradient-to-r from-primary/18 via-primary/10 to-transparent text-foreground"
                  : "text-sidebar-foreground/75 hover:bg-sidebar-accent/70 hover:text-foreground"
              }`}
            >
              {/* Active left bar */}
              {isActive && (
                <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r-full bg-primary" />
              )}

              <Icon
                className={`h-4 w-4 shrink-0 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground/70 group-hover:text-primary/80"
                }`}
              />
              <span className="truncate font-medium">{item.label}</span>
              {isActive && (
                <ChevronRight className="ml-auto h-3.5 w-3.5 text-primary/60 shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer status */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="rounded-xl border border-success/20 bg-success/5 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse flex-shrink-0" />
            <span className="text-[11px] font-semibold text-success">All Systems Operational</span>
          </div>
          <div className="text-[10px] text-muted-foreground mt-0.5 pl-3.5">
            AI Engine v4.2 • Encrypted Channel
          </div>
        </div>
      </div>
    </aside>
  );
}
