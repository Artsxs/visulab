import { access, cp, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = join(root, "public");

// Somente arquivos destinados ao navegador.
// Não incluir servidor, funções de IA, testes ou arquivos .env.
const publicEntries = [
  "index.html",
  "styles.css",
  "script.js",
  "favicon.svg",
  "assets",
  "js",
];

async function build() {
  // Verifica as entradas antes de limpar a saída anterior.
  for (const entry of publicEntries) {
    await access(join(root, entry));
  }

  // "public" passa a ser uma pasta gerada pelo build.
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });

  for (const entry of publicEntries) {
    await cp(join(root, entry), join(output, entry), {
      recursive: true,
    });
  }

  await access(join(output, "index.html"));

  console.log("Build concluído: arquivos da interface preparados em public/.");
}

build().catch((error) => {
  console.error("Falha ao preparar os arquivos públicos:", error.message);
  process.exitCode = 1;
});
