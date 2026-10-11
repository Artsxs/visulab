import { cp, access, readdir } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const backupDir = join(root, "backup_versao_funcional");

async function restore() {
  console.log("Restaurando arquivos a partir de:", backupDir);
  await access(backupDir);

  const items = await readdir(backupDir);
  for (const item of items) {
    const src = join(backupDir, item);
    const dest = join(root, item);
    await cp(src, dest, { recursive: true, force: true });
    console.log(`✓ Restaurado: ${item}`);
  }

  console.log("Restauração concluída com sucesso!");
}

restore().catch((err) => {
  console.error("Falha na restauração:", err);
  process.exit(1);
});
