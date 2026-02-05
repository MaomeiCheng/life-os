import fs from "node:fs";
import path from "node:path";

export function getSsoTRootAbsPath(): string {
  // SSOT_PATH is defined in apps/web/.env.local
  const rel = process.env.SSOT_PATH || "../../ssot";
  return path.resolve(process.cwd(), rel);
}

export function ssotStatus() {
  const root = getSsoTRootAbsPath();

  const exists = fs.existsSync(root);
  const isDir = exists ? fs.statSync(root).isDirectory() : false;

  let entries: string[] = [];
  if (isDir) {
    try {
      entries = fs.readdirSync(root).slice(0, 20);
    } catch {
      entries = [];
    }
  }

  return { root, exists, isDir, entries };
}
