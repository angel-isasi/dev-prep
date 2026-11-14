// Tu carpeta de trabajo: workspace/<id>/ con tu solucion.js, los tests y el enunciado.
// Los originales de content/ nunca se tocan.
import { access, copyFile, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";
import { sello } from "./fechas.js";

const existe = (ruta) => access(ruta).then(() => true, () => false);
const RESPALDOS_POR_EJERCICIO = 10;

// workspace/tsconfig.json: con esto VS Code marca los errores de tipos mientras escribes,
// con las mismas reglas que usa la app al revisar tus tipos (server/tipos.js).
const TSCONFIG = JSON.stringify(
  {
    compilerOptions: {
      strict: true,
      noEmit: true,
      target: "es2022",
      module: "esnext",
      moduleResolution: "bundler",
      jsx: "react-jsx",
      lib: ["es2023", "dom", "dom.iterable"],
      skipLibCheck: true,
    },
    include: ["*/solucion.ts", "*/solucion.tsx", "*/tests.test.ts", "*/tests.test.tsx"],
  },
  null,
  2,
);

/** @param {{ workspaceDir: string }} opciones */
export function crearWorkspace({ workspaceDir }) {
  const respaldosDir = path.join(workspaceDir, ".respaldos");

  const carpetaDe = (ej) => path.join(workspaceDir, ej.id);
  const archivoDe = (ej) => path.join(carpetaDe(ej), ej.archivos.solucion);
  const carpetaDeId = (id) => path.join(workspaceDir, id);
  /** Tu archivo de un ejercicio solo con su id (solucion.js, .jsx, .ts o .tsx). */
  const archivoDeId = (id) => {
    const carpeta = carpetaDeId(id);
    for (const ext of ["js", "jsx", "ts", "tsx"]) {
      const ruta = path.join(carpeta, `solucion.${ext}`);
      if (existsSync(ruta)) return ruta;
    }
    return null;
  };

  /** Copia solo si el destino no existe o es distinto (así Vitest no corre de más). */
  async function copiarSiCambio(origen, destino) {
    const [a, b] = await Promise.all([readFile(origen, "utf8"), readFile(destino, "utf8").catch(() => null)]);
    if (a !== b) await copyFile(origen, destino);
  }

  /** Copia (o actualiza) los tests y el enunciado. Tu solución no se toca. */
  async function copiarApoyo(ej) {
    await copiarSiCambio(path.join(ej.carpeta, ej.archivos.tests), path.join(carpetaDe(ej), ej.archivos.tests));
    await copiarSiCambio(path.join(ej.carpeta, "enunciado.md"), path.join(carpetaDe(ej), "enunciado.md"));
  }

  return {
    carpetaDe,
    archivoDe,
    carpetaDeId,
    archivoDeId,
    raiz: workspaceDir,

    existe: (ej) => existe(archivoDe(ej)),

    /**
     * Crea workspace/<id>/ la primera vez copiando el archivo de inicio.
     * Si ya existe, solo refresca tests y enunciado (por si el contenido cambió).
     * @returns {Promise<{ creado: boolean }>}
     */
    async preparar(ej) {
      await mkdir(carpetaDe(ej), { recursive: true });
      if (ej.ext === "ts" || ej.ext === "tsx") {
        const ruta = path.join(workspaceDir, "tsconfig.json");
        if ((await readFile(ruta, "utf8").catch(() => null)) !== TSCONFIG) await writeFile(ruta, TSCONFIG);
      }
      const creado = !(await existe(archivoDe(ej)));
      if (creado) await copyFile(path.join(ej.carpeta, ej.archivos.inicio), archivoDe(ej));
      await copiarApoyo(ej);
      return { creado };
    },

    /**
     * Vuelve al archivo de inicio. Antes guarda tu versión en
     * workspace/.respaldos/<id>/ (se conservan las últimas 10).
     * @returns {Promise<{ respaldo: string|null }>}
     */
    async reiniciar(ej) {
      let respaldo = null;
      if (await existe(archivoDe(ej))) {
        const dir = path.join(respaldosDir, ej.id);
        await mkdir(dir, { recursive: true });
        respaldo = path.join(dir, `solucion_${sello()}.${ej.ext}`);
        await copyFile(archivoDe(ej), respaldo);

        const viejos = (await readdir(dir)).sort().slice(0, -RESPALDOS_POR_EJERCICIO);
        await Promise.all(viejos.map((f) => rm(path.join(dir, f))));
      }
      await mkdir(carpetaDe(ej), { recursive: true });
      await copyFile(path.join(ej.carpeta, ej.archivos.inicio), archivoDe(ej));
      await copiarApoyo(ej);
      return { respaldo };
    },

    /** De la ruta de un archivo dentro de workspace/ saca el id del ejercicio. */
    idDeArchivo(ruta) {
      const relativa = path.relative(workspaceDir, ruta);
      if (relativa.startsWith("..") || path.isAbsolute(relativa)) return null;
      return relativa.split(path.sep)[0] || null;
    },
  };
}
