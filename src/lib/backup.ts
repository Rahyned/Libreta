import { open, save } from "@tauri-apps/plugin-dialog";
import type { BackupResult } from "../types";
import { api, isTauri } from "./api";

export interface ExportReport {
  path: string | null;
}

export type ImportReport = BackupResult;

const pad = (n: number): string => String(n).padStart(2, "0");

function defaultName(): string {
  const d = new Date();
  return `libreta-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(
    d.getDate()
  )}.json`;
}

export async function exportBackup(): Promise<ExportReport> {
  const contents = await api.exportBackup();

  if (isTauri()) {
    const path = await save({
      title: "Exportar respaldo",
      defaultPath: defaultName(),
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
    if (!path) return { path: null };
    await api.writeBackupFile(path, contents);
    return { path };
  }

  const blob = new Blob([contents], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = defaultName();
  a.click();
  URL.revokeObjectURL(url);
  return { path: null };
}

function pickFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";
    input.onchange = () => resolve(input.files?.[0] ?? null);
    input.click();
  });
}

export async function importBackup(): Promise<ImportReport | null> {
  if (isTauri()) {
    const path = await open({
      title: "Restaurar respaldo",
      multiple: false,
      directory: false,
      filters: [{ name: "JSON", extensions: ["json"] }],
    });
    if (!path) return null;
    const contents = await api.readBackupFile(path);
    return api.importBackup(contents);
  }

  const file = await pickFile();
  if (!file) return null;
  const contents = await file.text();
  return api.importBackup(contents);
}