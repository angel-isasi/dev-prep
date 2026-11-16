// Avisos de la app instalada:
// - "Lista para usar sin internet": la primera vez, cuando terminó de guardar todo el contenido.
// - "Hay contenido nuevo": cuando subiste algo nuevo (git push) y el celular lo descargó.
//   No se recarga sola: tú eliges cuándo (así no se corta un quiz).
import { useRegisterSW } from "virtual:pwa-register/react";
import { AnimatePresence, motion } from "motion/react";
import estilos from "./AvisoPWA.module.css";

const UNA_HORA = 60 * 60 * 1000;

export function AvisoPWA() {
  const {
    offlineReady: [listaOffline, setListaOffline],
    needRefresh: [hayNuevo, setHayNuevo],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registro) {
      // Mientras la app está abierta, revisa cada hora si hay contenido nuevo (solo con internet).
      if (registro) setInterval(() => navigator.onLine && registro.update().catch(() => {}), UNA_HORA);
    },
  });

  const aviso = hayNuevo
    ? { texto: "Hay contenido nuevo.", accion: "Actualizar", alAccion: () => updateServiceWorker(true), cerrar: () => setHayNuevo(false) }
    : listaOffline
      ? { texto: "Lista para usar sin internet.", accion: "Entendido", alAccion: () => setListaOffline(false) }
      : null;

  return (
    <AnimatePresence>
      {aviso && (
        <motion.div
          className={estilos.aviso}
          role="status"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
        >
          <span>{aviso.texto}</span>
          {aviso.cerrar && (
            <button type="button" className={estilos.secundario} onClick={aviso.cerrar}>
              Luego
            </button>
          )}
          <button type="button" className={estilos.principal} onClick={aviso.alAccion}>
            {aviso.accion}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
