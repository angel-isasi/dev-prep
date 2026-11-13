// Corre los tests de workspace/ con Vitest en modo watch: cuando guardas tu
// archivo, Vitest vuelve a correr solo los tests de ese ejercicio.
// Si una corrida no termina (por ejemplo, un bucle infinito), la corta y
// reinicia Vitest para que la app siga funcionando.
import { mkdir, stat } from "node:fs/promises";
import { crearVitest, correrUnaVez } from "./vitest-comun.js";

const MAX_LOGS = 200; // líneas de consola guardadas por corrida
// Una corrida que empieza hasta 2 s después de que la app la pidió (o de que la app
// copió archivos) no cuenta como intento. Nadie guarda tan rápido tras hacer clic.
const VENTANA_MANUAL_MS = 2000;
// Tiempo máximo de una corrida. React en frío puede tardar, por eso es generoso.
const LIMITE_CORRIDA_MS = 20_000;

const MENSAJE_BUCLE =
  "Los tests no terminaron en 20 segundos y se detuvieron. Lo más probable es un bucle infinito " +
  "(un while o for cuya condición nunca se vuelve falsa) o una recursión sin caso base.";

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
  /** id -> último resultado completo (para mostrarlo al volver a la página) */
  const ultimos = new Map();
  /** id -> temporizador del vigilante de bucles */
  const vigilantes = new Map();

  let vitest = null;
  let reiniciando = false;

  function entregar(id, resultado) {
    const esIntento = !corridaManual.has(id);
    ultimos.set(id, resultado);
    alResultado(id, resultado, { esIntento });
  }

  /** Corta la corrida colgada: avisa del posible bucle y vuelve a crear Vitest. */
  async function cortarCorrida(id) {
    if (!corriendo.has(id) || reiniciando) return;
    reiniciando = true;
    console.warn(`[corredor] ${id}: la corrida no terminó, se reinicia Vitest`);
    for (const otro of corriendo) {
      clearTimeout(vigilantes.get(otro));
      entregar(otro, { casos: [], pasan: 0, total: 0, error: MENSAJE_BUCLE, bucle: true, consola: consolas.get(otro) ?? [] });
    }
    const cortados = [...corriendo];
    const cortadoEn = Date.now();
    corriendo.clear();
    const viejo = vitest;
    vitest = null;
    // Si el proceso de tests está trabado, close() puede no volver: no lo esperamos más de 5 s.
    await Promise.race([viejo?.close().catch(() => {}), new Promise((r) => setTimeout(r, 5000))]);
    vitest = await iniciarVitest();
    reiniciando = false;

    // Si guardaste mientras Vitest se reiniciaba, ese cambio no se vio: lo corremos ahora.
    for (const id of cortados) {
      const archivo = workspace.archivoDeId(id);
      const cambiado = archivo && (await stat(archivo).catch(() => null))?.mtimeMs > cortadoEn;
      if (!cambiado) continue;
      pedidos.set(id, Date.now()); // no cuenta como intento extra
      correrUnaVez(vitest, [workspace.carpetaDeId(id)]).catch(() => {});
    }
  }

  async function iniciarVitest() {
    const instancia = await crearVitest({
      raiz: workspace.raiz,
      include: ["*/tests.test.{js,jsx}"],
      watch: true,

      alEmpezar(archivos) {
        const ids = archivos.map((a) => workspace.idDeArchivo(a)).filter(Boolean);
        for (const id of ids) {
          corriendo.add(id);
          consolas.set(id, []);
          const pedido = pedidos.get(id);
          if (pedido && Date.now() - pedido < VENTANA_MANUAL_MS) corridaManual.add(id);
          else corridaManual.delete(id);
          clearTimeout(vigilantes.get(id));
          vigilantes.set(id, setTimeout(() => cortarCorrida(id), LIMITE_CORRIDA_MS));
        }
        if (ids.length) alEmpezar?.(ids);
      },

      alTerminar(resultados) {
        for (const r of resultados) {
          const id = workspace.idDeArchivo(r.archivo);
          if (!id || !corriendo.has(id)) continue;
          corriendo.delete(id);
          clearTimeout(vigilantes.get(id));
          // No se borra la marca manual: si al abrir corren dos corridas a la vez, la
          // segunda también debe saber que fue manual. Cada corrida nueva lo decide al empezar.
          const { archivo, ...resto } = r; // la ruta de disco no viaja al navegador
          entregar(id, { ...resto, consola: consolas.get(id) ?? [] });
        }
      },

      alLog({ archivo, tipo, texto }) {
        const id = archivo && workspace.idDeArchivo(archivo);
        const lista = id && consolas.get(id);
        if (lista && lista.length < MAX_LOGS) lista.push({ tipo, texto });
      },
    });
    // Arranca a vigilar sin correr nada todavía.
    await instancia.standalone();
    return instancia;
  }

  vitest = await iniciarVitest();

  return {
    estaCorriendo: (id) => corriendo.has(id),
    ultimoResultado: (id) => ultimos.get(id) ?? null,

    /**
     * Las corridas que empiecen en los próximos 2 s las provoca la app (p. ej. al
     * reiniciar, que cambia el archivo y Vitest lo detecta solo): no cuentan como intento.
     */
    marcarManual(id) {
      pedidos.set(id, Date.now());
    },

    /** Corre ya los tests de un ejercicio (al abrirlo o con el botón). */
    correr(ej) {
      pedidos.set(ej.id, Date.now());
      if (!vitest) return; // se está reiniciando; el próximo guardado correrá
      correrUnaVez(vitest, [workspace.carpetaDe(ej)]).catch((error) => {
        console.error(`[corredor] ${ej.id}:`, error.message);
      });
    },

    cerrar: () => vitest?.close(),
  };
}
