import { notifications } from "@/lib/dummy-data";
import { AlertTriangle, Info, Bell, X } from "lucide-react";

const iconFor = (level: string) =>
  level === "critical" ? AlertTriangle : level === "warning" ? Bell : Info;

const colorFor = (level: string) =>
  level === "critical"
    ? "text-danger bg-danger/10 border-danger/30"
    : level === "warning"
    ? "text-warning bg-warning/10 border-warning/30"
    : "text-info bg-info/10 border-info/30";

export function NotificationPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="absolute right-4 md:right-8 top-full mt-2 w-[360px] max-w-[calc(100vw-2rem)] gov-card rounded-xl overflow-hidden animate-float-up z-40">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <div className="text-sm font-semibold">Live Notifications</div>
          <div className="text-[10px] text-muted-foreground">Real-time alerts feed</div>
        </div>
        <button onClick={onClose} className="grid h-7 w-7 place-items-center rounded-md hover:bg-accent">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="max-h-[420px] overflow-y-auto scrollbar-thin divide-y divide-border">
        {notifications.map((n) => {
          const Icon = iconFor(n.level);
          return (
            <div key={n.id} className="flex gap-3 p-3 hover:bg-accent/40 transition-colors">
              <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border ${colorFor(n.level)}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium truncate">{n.title}</div>
                  <div className="text-[10px] text-muted-foreground shrink-0">{n.time}</div>
                </div>
                <div className="text-xs text-muted-foreground line-clamp-2">{n.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="px-4 py-2 border-t border-border text-center">
        <button className="text-xs text-primary hover:underline">View all notifications</button>
      </div>
    </div>
  );
}
