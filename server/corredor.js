// Corre los tests de workspace/ con Vitest en modo watch: cuando guardas tu
// archivo, Vitest vuelve a correr solo los tests de ese ejercicio.
import { mkdir } from "node:fs/promises";
import { crearVitest, correrUnaVez } from "./vitest-comun.js";

const MAX_LOGS = 200; // líneas de consola guardadas por corrida
const VENTANA_MANUAL_MS = 5000; // si la corrida pedida no empieza en 5 s, se olvida

/**
 * @param {object} opciones
 * @param {ReturnType<import("./workspace.js").crearWorkspace>} opciones.workspace
 * @param {(ids: string[]) => void} [opciones.alEmpezar]
 * @param {(id: string, resultado: object, info: { esIntento: boolean }) => void} opciones.alResultado
 */
export async function crearCorredor({ workspace, alEmpezar, alResultado }) {
  await mkdir(workspace.raiz, { recursive: true });

  const corriendo = new Set();
  /** id -> momento en que la app pidió correrlo. Esa corrida no cuenta como intento. */
  const pedidos = new Map();
  /** ids cuya corrida actual la pidió la app (al abrir, reiniciar o con el botón) */
  const corridaManual = new Set();
  /** id -> console.log de la corrida actual */
  const consolas = new Map();

  const vitest = await crearVitest({
    raiz: workspace.raiz,
    include: ["*/tests.test.{js,jsx}"],
    watch: true,

    alEmpezar(archivos) {
      const ids = archivos.map((a) => workspace.idDeArchivo(a)).filter(Boolean);
      for (const id of ids) {
        corriendo.add(id);
        consolas.set(id, []);
        const pedido = pedidos.get(id);
        pedidos.delete(id);
        if (pedido && Date.now() - pedido < VENTANA_MANUAL_MS) corridaManual.add(id);
        else corridaManual.delete(id);
      }
      if (ids.length) alEmpezar?.(ids);
    },

    alTerminar(resultados) {
      for (const r of resultados) {
        const id = workspace.idDeArchivo(r.archivo);
        if (!id) continue;
        corriendo.delete(id);
        const esIntento = !corridaManual.has(id);
        corridaManual.delete(id);
        const { archivo, ...resto } = r; // la ruta de disco no viaja al navegador
        alResultado(id, { ...resto, consola: consolas.get(id) ?? [] }, { esIntento });
      }
    },

    alLog({ archivo, tipo, texto }) {
      const id = archivo && workspace.idDeArchivo(archivo);
      const lista = id && consolas.get(id);
      if (lista && lista.length < MAX_LOGS) lista.push({ tipo, texto });
    },
  });

  // Arranca a vigilar sin correr nada todavía.
  await vitest.standalone();

  return {
    estaCorriendo: (id) => corriendo.has(id),

    /**
     * La próxima corrida de este ejercicio la provoca la app (p. ej. al reiniciar,
     * que cambia el archivo y Vitest lo detecta solo): no cuenta como intento.
     */
    marcarManual(id) {
      pedidos.set(id, Date.now());
    },

    /** Corre ya los tests de un ejercicio (al abrirlo o con el botón). */
    correr(ej) {
      pedidos.set(ej.id, Date.now());
      correrUnaVez(vitest, [workspace.carpetaDe(ej)]).catch((error) => {
        console.error(`[corredor] ${ej.id}:`, error.message);
      });
    },

    cerrar: () => vitest.close(),
  };
}
