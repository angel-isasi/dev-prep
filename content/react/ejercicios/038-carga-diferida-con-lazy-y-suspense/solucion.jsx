import { lazy, Suspense, useState } from "react";

// El componente "pesado" que no queremos en la carga inicial.
function MapaDeLocales() {
  return <p>Mapa de locales</p>;
}

// Simula la descarga de un archivo aparte: espera 200 ms y entrega el módulo.
// En un proyecto real escribirías: lazy(() => import("./MapaDeLocales.jsx"))
function descargarMapa() {
  return new Promise((resolver) => setTimeout(() => resolver({ default: MapaDeLocales }), 200));
}

// lazy va FUERA del componente: se crea una sola vez.
export const Mapa = lazy(descargarMapa);

export function Locales() {
  const [verMapa, setVerMapa] = useState(false);

  return (
    <section>
      <button onClick={() => setVerMapa(true)}>Ver mapa</button>
      {verMapa && (
        <Suspense fallback={<p>Cargando mapa…</p>}>
          <Mapa />
        </Suspense>
      )}
    </section>
  );
}
