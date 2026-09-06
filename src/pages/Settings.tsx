import { Download, KeyRound, Moon, Save, Sun, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { exportBackup, importBackup } from "../lib/backup";
import { USER_COLORS } from "../lib/constants";
import { getInitialTheme, setTheme, type Theme } from "../lib/theme";
import { useMovieStore } from "../store/useMovieStore";

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e);
}

function UserEditor({
  id,
  initialName,
  initialColor,
  onSave,
}: {
  id: string;
  initialName: string;
  initialColor: string;
  onSave: (id: string, name: string, color: string) => Promise<void>;
}) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(initialName);
    setColor(initialColor);
  }, [initialName, initialColor]);

  const save = async () => {
    await onSave(id, name.trim() || initialName, color);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="paper-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <span
          className="h-4 w-4 rounded-full"
          style={{ backgroundColor: color }}
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-line bg-paper px-3 py-1.5 text-sm font-medium text-ink outline-none transition focus:border-pink"
        />
      </div>

      <p className="mb-2 text-xs font-medium text-ink-soft">Color</p>
      <div className="mb-4 flex flex-wrap gap-2">
        {USER_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            className={`h-7 w-7 rounded-full transition ${
              color === c ? "ring-2 ring-ink/30 ring-offset-2 ring-offset-paper" : ""
            }`}
            style={{ backgroundColor: c }}
            aria-label={`Color ${c}`}
          />
        ))}
      </div>

      <button
        onClick={save}
        className="inline-flex items-center gap-1.5 rounded-full bg-blue px-4 py-2 text-sm font-semibold text-accent-ink shadow-sm transition hover:bg-blue-deep"
      >
        <Save size={14} />
        {saved ? "Guardado" : "Guardar"}
      </button>
    </div>
  );
}

function TmdbKeyEditor() {
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getSetting("tmdb_api_key").then((k) => setKey(k ?? ""));
  }, []);

  const save = async () => {
    await api.setSetting("tmdb_api_key", key.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="paper-card p-5">
      <div className="mb-2 flex items-center gap-2">
        <KeyRound size={16} className="text-ink-soft" />
        <h3 className="font-display text-sm font-semibold text-ink">
          Clave de TMDB (pósters)
        </h3>
      </div>
      <p className="mb-3 text-sm text-ink-soft">
        Búsqueda automática de pósters al escribir el título. Consigue la clave
        gratis en{" "}
        <a
          href="https://www.themoviedb.org/settings/api"
          target="_blank"
          rel="noreferrer"
          className="text-pink-deep underline"
        >
          themoviedb.org/settings/api
        </a>
        . Sin clave, se usa Wikipedia como respaldo.
      </p>
      <div className="flex gap-2">
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="pej. bb39857c…"
          className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none transition placeholder:text-ink-soft/50 focus:border-pink"
        />
        <button
          onClick={save}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-blue px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:bg-blue-deep"
        >
          <Save size={14} />
          {saved ? "Guardado" : "Guardar"}
        </button>
      </div>
    </div>
  );
}

export default function Settings() {
  const { users, updateUser, load } = useMovieStore();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(
    null
  );
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onTheme = (e: Event) =>
      setThemeState((e as CustomEvent<Theme>).detail);
    window.addEventListener("libreta:theme", onTheme);
    return () => window.removeEventListener("libreta:theme", onTheme);
  }, []);

  const handleTheme = (next: Theme) => {
    setTheme(next);
    setThemeState(next);
  };

  const handleExport = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const { path } = await exportBackup();
      if (path) {
        setMessage({ text: `Respaldo guardado en ${path}`, error: false });
      }
    } catch (e) {
      setMessage({ text: errMsg(e), error: true });
    } finally {
      setBusy(false);
    }
  };

  const handleImport = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const report = await importBackup();
      if (!report) return;
      await load();
      setMessage({
        text: `Importación lista: ${report.movies_imported} películas nuevas, ${report.movies_merged} ya existían, ${report.ratings_imported} valoraciones importadas.`,
        error: false,
      });
    } catch (e) {
      setMessage({ text: errMsg(e), error: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <header className="mb-6">
        <h1 className="font-display text-3xl font-bold text-ink">Ajustes</h1>
        <p className="font-handwritten text-xl text-ink-soft">
          personaliza su libreta
        </p>
      </header>

      <h2 className="mb-3 font-display text-lg font-semibold text-ink">
        Quiénes somos
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {users.map((u) => (
          <UserEditor
            key={u.id}
            id={u.id}
            initialName={u.name}
            initialColor={u.color}
            onSave={updateUser}
          />
        ))}
      </div>

      <h2 className="mb-3 mt-8 font-display text-lg font-semibold text-ink">
        Tema
      </h2>
      <div className="paper-card flex items-center gap-2 p-4">
        <button
          onClick={() => handleTheme("light")}
          className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
            theme === "light"
              ? "bg-pink text-accent-ink shadow-sm"
              : "text-ink-soft hover:bg-peach"
          }`}
        >
          <Sun size={15} />
          Claro
        </button>
        <button
          onClick={() => handleTheme("dark")}
          className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
            theme === "dark"
              ? "bg-pink text-accent-ink shadow-sm"
              : "text-ink-soft hover:bg-peach"
          }`}
        >
          <Moon size={15} />
          Oscuro
        </button>
      </div>

      <h2 className="mb-3 mt-8 font-display text-lg font-semibold text-ink">
        Pósters
      </h2>
      <TmdbKeyEditor />

      <h2 className="mb-3 mt-8 font-display text-lg font-semibold text-ink">
        Datos
      </h2>
      <div className="paper-card p-5">
        <p className="mb-3 text-sm text-ink-soft">
          Exporta la libreta como JSON para respaldarla. Restaurar combina un
          respaldo previo: no borra nada, solo suma lo que falte (por id o por
          título).
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleExport}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full bg-peach px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:brightness-95 disabled:opacity-60"
          >
            <Download size={15} />
            Exportar respaldo
          </button>
          <button
            onClick={handleImport}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full bg-blue px-4 py-2 text-sm font-semibold text-accent-ink shadow-sm transition hover:bg-blue-deep disabled:opacity-60"
          >
            <Upload size={15} />
            Restaurar respaldo
          </button>
        </div>
        {message && (
          <p
            className={`mt-3 text-sm ${
              message.error ? "text-error" : "text-ink-soft"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}
