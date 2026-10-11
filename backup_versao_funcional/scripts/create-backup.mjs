import { cp, mkdir, rm, access } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const backupDir = join(root, "backup_versao_funcional");

const entriesToBackup = [
  "index.html",
  "styles.css",
  "script.js",
  "404.html",
  "manifest.webmanifest",
  "favicon.svg",
  "metadata.json",
  "package.json",
  "server.js",
  "vercel.json",
  "netlify.toml",
  "AGENTS.md",
  "README.md",
  ".env.example",
  ".gitignore",
  "api",
  "assets",
  "components",
  "js",
  "scripts",
  "tests",
  "netlify"
];

async function backup() {
  console.log("Iniciando backup em:", backupDir);
  await rm(backupDir, { recursive: true, force: true });
  await mkdir(backupDir, { recursive: true });

  for (const entry of entriesToBackup) {
    const src = join(root, entry);
    const dest = join(backupDir, entry);
    try {
      await access(src);
      await cp(src, dest, { recursive: true });
      console.log(`✓ Copiado: ${entry}`);
    } catch (err) {
      console.warn(`! Item não encontrado ou erro ao copiar: ${entry} (${err.message})`);
    }
  }

  console.log("Backup concluído com sucesso em backup_versao_funcional/");
}

backup().catch((err) => {
  console.error("Falha no backup:", err);
  process.exit(1);
});
