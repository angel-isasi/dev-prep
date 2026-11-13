## Idea clave

`lazy` convierte una función que **descarga un módulo** en un componente normal. La primera vez que se renderiza, ese componente **suspende** (le avisa a React que todavía no está listo) y el `<Suspense>` más cercano muestra su `fallback` hasta que el módulo llega. Si además lo montas solo cuando el usuario lo pide, el código del mapa no pesa en la carga inicial.

## Paso a paso

1. **Crea el componente diferido fuera de `Locales`**: `export const Mapa = lazy(descargarMapa)`. `descargarMapa` debe devolver una **promesa de un módulo con `default`**, que es justo lo que devuelve un `import()` dinámico.
2. **Estado para pedirlo**: `const [verMapa, setVerMapa] = useState(false)`. Mientras sea `false`, `<Mapa />` no se renderiza y `descargarMapa` nunca se llama.
3. **Botón** "Ver mapa" que pone `verMapa` en `true`.
4. **Envuelve `<Mapa />` en `<Suspense fallback={<p>Cargando mapa…</p>}>`**. El fallback es lo que se ve mientras el mapa suspende.
5. **Cuando la promesa se resuelve**, React vuelve a intentar el render, `Mapa` ya tiene su componente y se pinta "Mapa de locales".

```jsx
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
```

## Por qué funciona

| Momento | `verMapa` | Estado del `lazy` | Se pinta |
|---|---|---|---|
| Primer render | `false` | sin pedir | botón |
| Clic en "Ver mapa" | `true` | React renderiza `<Mapa />`, llama a `descargarMapa()`: **pendiente** | botón + Cargando mapa… |
| 200 ms después, la promesa se resuelve | `true` | **listo**, guarda `MapaDeLocales` | botón + Mapa de locales |
| Otra vez en otra pantalla | `true` | ya estaba listo: no descarga de nuevo | Mapa de locales al instante |

En un proyecto con Vite o Webpack, `lazy(() => import("./MapaDeLocales.jsx"))` hace que el empaquetador ponga ese archivo en un **paquete aparte** (*chunk*). El navegador solo lo descarga cuando se renderiza `<Mapa />`. Aquí lo simulamos con `setTimeout` porque el ejercicio vive en un solo archivo.

¿Por qué `lazy` fuera del componente? Porque `lazy` guarda en memoria el resultado de la descarga. Si lo crearas dentro de `Locales`, cada render crearía un `lazy` nuevo, sin memoria: volvería a descargar y a suspender una y otra vez.

## Errores comunes

- **Crear el `lazy` dentro del componente.** Cada render crea un componente distinto: se pierde el estado del mapa y vuelve a mostrarse "Cargando…". React además avisa en consola.
- **Olvidar el `<Suspense>`.** Cuando `Mapa` suspende, React busca un Suspense hacia arriba; si no hay ninguno, lanza un error.
- **La función de `lazy` no devuelve `{ default: Componente }`.** `lazy` espera un módulo con export por defecto. Si tu archivo exporta con nombre (`export function Mapa`), tienes que adaptarlo: `lazy(() => import("./Mapa").then((m) => ({ default: m.Mapa })))`.
- **Renderizar `<Mapa />` desde el inicio** sin el estado `verMapa`. Funciona, pero el mapa se descarga al abrir la página y pierdes la ventaja. Lo reconoces porque falla "al abrir la página el mapa no se carga".
- **Escribir "Cargando mapa..." con tres puntos** en vez del carácter `…`. Para el usuario se ve igual, pero `getByText` compara el texto exacto.

## Otra forma de resolverlo

**Precargar** el mapa cuando el usuario pasa el mouse por el botón, para que al hacer clic ya esté listo:

```jsx
import { lazy, Suspense, useState } from "react";

// MapaDeLocales y descargarMapa: igual que en la solución.

// Guarda la promesa para no descargar dos veces.
const promesaMapa = { actual: null };
function descargarUnaVez() {
  promesaMapa.actual ??= descargarMapa();
  return promesaMapa.actual;
}

export const Mapa = lazy(descargarUnaVez);

export function Locales() {
  const [verMapa, setVerMapa] = useState(false);
  return (
    <section>
      <button onMouseEnter={descargarUnaVez} onFocus={descargarUnaVez} onClick={() => setVerMapa(true)}>
        Ver mapa
      </button>
      {verMapa && (
        <Suspense fallback={<p>Cargando mapa…</p>}>
          <Mapa />
        </Suspense>
      )}
    </section>
  );
}
```

**¿Cuándo conviene?** Cuando el componente diferido es grande y quieres que el usuario casi nunca vea el "Cargando". Para la mayoría de los casos, `lazy` + `Suspense` simple es suficiente. Lo más común en apps reales es aplicar `lazy` a **páginas enteras** de las rutas (cada ruta en su propio paquete).

## Cómo explicarlo en la entrevista

> "Uso `lazy` para que el mapa se descargue en un paquete aparte solo cuando se necesita. `lazy` recibe una función que devuelve una promesa del módulo, normalmente un `import()` dinámico, y lo creo fuera del componente para que guarde el resultado. Envuelvo el componente en `Suspense` con un fallback, que se muestra mientras el código llega. Además lo monto solo cuando el usuario pulsa 'Ver mapa', así no pesa en la carga inicial. Es la técnica de code splitting, y lo típico es aplicarla por rutas."

## Conceptos

- **Code splitting**: dividir el código en paquetes que se cargan bajo demanda.
- **`import()` dinámico**: importa un módulo en tiempo de ejecución y devuelve una promesa.
- **`lazy(fn)`**: crea un componente que carga su código con `fn` la primera vez que se renderiza.
- **`Suspense` y `fallback`**: qué mostrar mientras un hijo no está listo.
- **Suspender**: la forma en que un componente le dice a React "todavía no puedo renderizar".
- **Caché del `lazy`**: se descarga una sola vez; por eso va fuera del componente.
- **Precarga**: empezar la descarga antes de que el usuario la necesite.
