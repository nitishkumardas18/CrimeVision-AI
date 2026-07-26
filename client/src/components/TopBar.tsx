import { useState, useEffect } from "react";
import { Bell, Search, ShieldAlert, LogOut, Sun, Moon } from "lucide-react";
import { NotificationPanel } from "./NotificationPanel";
import { notifications } from "@/lib/dummy-data";
import { useTheme } from "@/theme";

export function TopBar({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, setTheme } = useTheme();
  const unread = notifications.filter((n) => n.level !== "info").length;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-30 transition-all duration-300 ${
        scrolled 
          ? "bg-background/80 backdrop-blur-xl border-b border-border/80 shadow-sm" 
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6 md:px-8 py-5">
        <div className="min-w-0 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground/80 mb-1">
              <ShieldAlert className="h-3 w-3 text-primary" />
              <span>Karnataka State Police • Classified</span>
            </div>
            <h1 className="text-2xl md:text-[28px] font-bold tracking-tight text-foreground leading-none">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-[13px] text-muted-foreground/90 truncate">{subtitle}</p>
            )}
          </div>
          {action && <div className="hidden lg:block ml-6">{action}</div>}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {action && <div className="block lg:hidden mr-2">{action}</div>}
          
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-border/80 bg-input/40 px-3.5 py-2 w-72 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search cases, suspects, FIRs..."
              className="bg-transparent outline-none text-[13px] flex-1 placeholder:text-muted-foreground/70"
            />
            <kbd className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted/80 text-muted-foreground font-mono font-medium border border-border/50 shadow-sm">⌘K</kbd>
          </div>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-border/80 bg-card/50 hover:bg-accent/80 transition-all hover:scale-105 active:scale-95"
          >
            {theme === "dark" ? <Sun className="h-4.5 w-4.5 text-foreground/80" /> : <Moon className="h-4.5 w-4.5 text-foreground/80" />}
          </button>

          <button
            onClick={() => setOpen((v) => !v)}
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-border/80 bg-card/50 hover:bg-accent/80 transition-all hover:scale-105 active:scale-95"
          >
            <Bell className="h-4.5 w-4.5 text-foreground/80" />
            {unread > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-4.5 min-w-[18px] px-1 rounded-full bg-danger text-[10px] font-bold grid place-items-center text-white shadow-sm border border-background">
                {unread}
              </span>
            )}
          </button>

          <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-card/50 pl-2 pr-4 py-1.5 ml-1 transition-all hover:bg-accent/50 cursor-pointer">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-info text-primary-foreground text-xs font-bold shadow-inner">
              SA
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="text-[13px] font-semibold text-foreground">System Admin</div>
              <div className="text-[10.5px] text-muted-foreground/90 font-medium">Headquarters</div>
            </div>
          </div>
        </div>
      </div>

      <NotificationPanel open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
