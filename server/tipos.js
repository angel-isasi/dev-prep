// Revisión de tipos de los ejercicios de TypeScript.
// Vitest corre los .ts quitando los tipos, sin revisarlos: un error de tipos no falla
// ningún test. Por eso, después de cada corrida de un ejercicio .ts/.tsx, corremos el
// compilador (tsc, en modo estricto y con mensajes en español) sobre tu archivo y sus
// tests, y el resultado se agrega como un caso más: "Tus tipos compilan sin errores".
import { execFile } from "node:child_process";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TSC = path.join(RAIZ, "node_modules", "typescript", "bin", "tsc");

// Las mismas opciones que workspace/tsconfig.json (lo que ves en VS Code).
const OPCIONES = [
  // workspace/tsconfig.json (para VS Code) tiene estas mismas reglas; sin esta opción,
  // TypeScript 7 se niega a revisar archivos sueltos si encuentra un tsconfig.
  "--ignoreConfig",
  "--noEmit",
  "--strict",
  "--target", "es2022",
  "--module", "esnext",
  "--moduleResolution", "bundler",
  "--jsx", "react-jsx",
  "--lib", "es2023,dom,dom.iterable",
  "--skipLibCheck",
  "--pretty", "false",
  "--locale", "es",
];

export const NOMBRE_CASO_TIPOS = "Tus tipos compilan sin errores (tsc)";

export const esTypeScript = (archivo) => /\.tsx?$/.test(archivo);

/**
 * Corre tsc sobre los .ts/.tsx de una carpeta.
 * @param {string} carpeta
 * @returns {Promise<string[]>} errores legibles ("solucion.ts, línea 3: ..."); vacío si todo compila
 */
export async function revisarTipos(carpeta) {
  // Solo tu solución y los tests: en content/ la carpeta también tiene inicio.ts, que no compila a propósito.
  const archivos = (await readdir(carpeta))
    .filter((a) => esTypeScript(a) && /^(solucion|tests\.test)\./.test(a))
    .map((a) => path.join(carpeta, a));
  if (archivos.length === 0) return [];

  const salida = await new Promise((resolver) => {
    execFile(process.execPath, [TSC, ...OPCIONES, ...archivos], { cwd: carpeta, timeout: 30_000 }, (error, stdout, stderr) => {
      if (error && !stdout && error.code !== 1 && error.code !== 2) resolver(`No se pudo correr tsc: ${stderr || error.message}`);
      else resolver(stdout);
    });
  });

  // Cada error empieza con "ruta(línea,col): error TSxxxx: mensaje"; las líneas que
  // siguen con sangría son la continuación del mismo mensaje.
  const errores = [];
  for (const linea of salida.split(/\r?\n/)) {
    const m = linea.match(/^(.+?)\((\d+),\d+\): error TS\d+: (.*)$/);
    if (m) errores.push(`${path.basename(m[1])}, línea ${m[2]}: ${m[3]}`);
    else if (linea.trim() && errores.length) errores[errores.length - 1] += `\n  ${linea.trim()}`;
    else if (linea.trim()) errores.push(linea.trim());
  }
  return errores;
}

/** Agrega al resultado de un archivo de tests el caso de la revisión de tipos. */
export async function agregarCasoTipos(resultado) {
  const errores = await revisarTipos(path.dirname(resultado.archivo));
  const caso = {
    nombre: NOMBRE_CASO_TIPOS,
    ok: errores.length === 0,
    mensaje: errores.length ? errores.join("\n") : null,
    esperado: null,
    recibido: null,
  };
  const casos = [...resultado.casos, caso];
  return { ...resultado, casos, pasan: casos.filter((c) => c.ok).length, total: casos.length };
}
