import { BarChart3, Film, Home as HomeIcon, Settings as SettingsIcon } from "lucide-react";
import { HashRouter, NavLink, Route, Routes } from "react-router-dom";
import Comparison from "./pages/Comparison";
import Home from "./pages/Home";
import Settings from "./pages/Settings";

const nav = [
  { to: "/", label: "Inicio", icon: HomeIcon },
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
            ? "bg-pink text-ink shadow-sm"
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
  return (
    <HashRouter>
      <div className="flex min-h-full">
        <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-line bg-paper/60 px-4 py-6">
          <div className="mb-8 flex items-center gap-2 px-2">
            <div className="rounded-xl bg-pink p-2 text-ink">
              <Film size={20} />
            </div>
            <div>
              <p className="font-display text-sm font-bold leading-none text-ink">
                Libreta
              </p>
              <p className="font-handwritten text-base leading-none text-ink-soft">
                de películas
              </p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {nav.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
          </nav>

          <p className="mt-auto px-2 font-handwritten text-base text-ink-soft/70">
            para ustedes dos
          </p>
        </aside>

        <main className="min-w-0 flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/comparacion" element={<Comparison />} />
            <Route path="/ajustes" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}
