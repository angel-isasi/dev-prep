import { describe, expect, test } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { crearZip } from "./zip.js";

describe("zip mínimo", () => {
  test("lo abre el descompresor del sistema y el contenido es igual", () => {
    const dir = mkdtempSync(path.join(os.tmpdir(), "zip-"));
    try {
      const texto = "export const handler = async () => 'hola';\n".repeat(50);
      writeFileSync(path.join(dir, "a.zip"), crearZip([{ nombre: "index.mjs", contenido: texto }]));
      // En Windows, el tar del sistema (bsdtar) sabe abrir .zip; el de Git Bash no
      const tar = process.platform === "win32" ? path.join(process.env.SystemRoot ?? "C:/Windows", "System32", "tar.exe") : "bsdtar";
      execFileSync(tar, ["-xf", "a.zip"], { cwd: dir });
      expect(readFileSync(path.join(dir, "index.mjs"), "utf8")).toBe(texto);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
