import { listen } from "@tauri-apps/api/event";
import { BarChart3, Eye, Film, Home as HomeIcon, Settings as SettingsIcon, Tv } from "lucide-react";
import { useEffect } from "react";
import { HashRouter, NavLink, Route, Routes } from "react-router-dom";
import { isTauri } from "./lib/api";
import { getStoredTheme, getSystemTheme, setTheme } from "./lib/theme";
import Comparison from "./pages/Comparison";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import Series from "./pages/Series";
import Watchlist from "./pages/Watchlist";

const nav = [
  { to: "/", label: "Películas", icon: HomeIcon },
  { to: "/series", label: "Series", icon: Tv },
  { to: "/watchlist", label: "Watchlist", icon: Eye },
  { to: "/comparacion", label: "Comparación", icon: BarChart3 },
  { to: "/ajustes", label: "Ajustes", icon: SettingsIcon },
];

function NavItem({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: typeof HomeIcon;
}) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-medium transition ${
          isActive
            ? "bg-pink text-accent-ink shadow-sm"
            : "text-ink-soft hover:bg-line/50 hover:text-ink"
        }`
      }
    >
      <Icon size={17} />
      {label}
    </NavLink>
  );
}

export default function App() {
  useEffect(() => {
    if (!isTauri()) return;
    let unlisten: (() => void) | undefined;
    let cancelled = false;
    void listen<string>("menu", (e) => {
      if (e.payload === "toggle-theme") {
        const current = getStoredTheme() ?? getSystemTheme();
        setTheme(current === "dark" ? "light" : "dark");
      } else if (e.payload === "add-movie") {
        window.dispatchEvent(
          new CustomEvent("libreta:add-movie", { detail: { kind: "movie" } })
        );
      } else if (e.payload === "add-serie") {
        window.dispatchEvent(
          new CustomEvent("libreta:add-movie", { detail: { kind: "series" } })
        );
      }
    }).then((fn) => {
      if (cancelled) fn();
      else unlisten = fn;
    });
    return () => {
      cancelled = true;
      unlisten?.();
    };
  }, []);

  return (
    <HashRouter>
      <div className="flex min-h-full">
        <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-line bg-paper/60 px-4 py-6">
          <div className="mb-8 flex items-center gap-2 px-2">
            <div className="rounded-xl bg-pink p-2 text-accent-ink">
              <Film size={20} />
            </div>
            <div>
              <p className="font-display text-sm font-bold leading-none text-ink">
                Libreta
              </p>
              <p className="font-handwritten text-base leading-none text-ink-soft">
                de pelis y series
              </p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {nav.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/series" element={<Series />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/comparacion" element={<Comparison />} />
            <Route path="/ajustes" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}
