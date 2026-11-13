## Idea clave

Los datos llegan **por partes y de forma asíncrona**. Guardas lo acumulado, la última página cargada, si hay más y si estás cargando. Cada página nueva se **agrega** al final con spread (sin mutar), y el estado `cargando` deshabilita el botón para no pedir dos veces lo mismo.

## Paso a paso

1. **Cuatro estados.** `items` (lo acumulado), `pagina` (la última cargada, empieza en 0), `hayMas` (si mostrar el botón) y `cargando` (empieza en `true` porque al montar ya vamos a pedir la página 1).
2. **Primera página en un efecto.** `useEffect(() => { obtenerPagina(1).then(...) }, [obtenerPagina])`. Pedir datos al montar es un efecto secundario: va en `useEffect`, nunca en el cuerpo del componente (se pediría en cada render).
3. **La bandera `activo`.** Si el componente se desmonta antes de que llegue la respuesta, la limpieza pone `activo = false` y el `.then` no toca el estado. En modo estricto de desarrollo, React monta, desmonta y vuelve a montar: por eso aquí usamos `setItems(datos)` (reemplazar) en vez de agregar, así nunca se duplica la página 1.
4. **Cargar la siguiente.** Una función `async`:
   - Si ya está cargando, sale (protección extra contra dobles clics).
   - `setCargando(true)` para que el botón cambie a "Cargando…".
   - `await obtenerPagina(pagina + 1)`.
   - `setItems((anteriores) => [...anteriores, ...datos])`: copia lo anterior y agrega lo nuevo al final.
   - Actualiza `hayMas`, `pagina` y apaga `cargando`.
5. **El botón** solo se pinta si `hayMas`, está `disabled={cargando}` y su texto depende de `cargando`.

```jsx
import { useEffect, useState } from "react";

export function CargarMas({ obtenerPagina }) {
  const [items, setItems] = useState([]);
  const [pagina, setPagina] = useState(0); // última página cargada
  const [hayMas, setHayMas] = useState(true);
  const [cargando, setCargando] = useState(true); // empieza cargando la página 1

  // Primera página: al montar.
  useEffect(() => {
    let activo = true;
    obtenerPagina(1).then(({ datos, siguiente }) => {
      if (!activo) return; // el componente se desmontó o el efecto se repitió
      setItems(datos); // reemplaza: si el efecto corre dos veces, no se duplica
      setHayMas(siguiente);
      setPagina(1);
      setCargando(false);
    });
    return () => {
      activo = false;
    };
  }, [obtenerPagina]);

  async function cargarSiguiente() {
    if (cargando) return; // evita dobles clics
    setCargando(true);
    const { datos, siguiente } = await obtenerPagina(pagina + 1);
    setItems((anteriores) => [...anteriores, ...datos]); // agrega al final
    setHayMas(siguiente);
    setPagina((p) => p + 1);
    setCargando(false);
  }

  return (
    <div>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      {hayMas && (
        <button onClick={cargarSiguiente} disabled={cargando}>
          {cargando ? "Cargando…" : "Cargar más"}
        </button>
      )}
    </div>
  );
}
```

## Por qué funciona

Con 2 páginas (`n1, n2` con `siguiente: true` y `n3` con `siguiente: false`):

| Momento | `items` | `pagina` | `hayMas` | `cargando` | Se pinta |
|---|---|---|---|---|---|
| primer render | `[]` | 0 | true | true | lista vacía · "Cargando…" deshabilitado |
| responde la página 1 | `[n1, n2]` | 1 | true | false | n1, n2 · "Cargar más" |
| clic | `[n1, n2]` | 1 | true | true | n1, n2 · "Cargando…" deshabilitado |
| responde la página 2 | `[n1, n2, n3]` | 2 | false | false | n1, n2, n3 · sin botón |

Entre `setCargando(true)` y el `await` React vuelve a pintar, así el usuario ve "Cargando…" de inmediato. Todo lo que va después del `await` corre cuando la promesa se resuelve.

## Errores comunes

- **Mutar la lista**: `items.push(...datos); setItems(items)`. Es el mismo arreglo, React no ve el cambio y no re-renderiza. Usa spread.
- **`setItems([...items, ...datos])` sin la forma funcional.** Después del `await`, `items` es el del render en que empezó la función. Si algo cambió en medio, lo pisas. La forma funcional siempre parte del valor actual.
- **No deshabilitar el botón.** Dos clics rápidos piden la página 2 dos veces y ves `n3, n3` (además de un warning por `key` repetida). Lo detecta el test de "Cargando…".
- **Pedir la primera página en el cuerpo del componente** (sin `useEffect`): cada render vuelve a pedirla, en bucle.
- **Agregar en el efecto de la página 1** (`setItems((prev) => [...prev, ...datos])`). En modo estricto de desarrollo el efecto corre dos veces y la página 1 aparece duplicada.
- **Dependencias del efecto.** Si el padre crea `obtenerPagina` en cada render (una flecha en el JSX) y el padre se re-renderiza, el efecto se repite. El padre debería pasar una función estable (definida fuera o con `useCallback`).

## Otra forma de resolverlo

**Scroll infinito** con `IntersectionObserver`: en lugar de un botón, un elemento "centinela" al final de la lista que dispara la carga cuando se vuelve visible:

```jsx
const centinela = useRef(null);

useEffect(() => {
  if (!hayMas) return;
  const observador = new IntersectionObserver(([entrada]) => {
    if (entrada.isIntersecting) cargarSiguiente();
  });
  observador.observe(centinela.current);
  return () => observador.disconnect();
}, [hayMas, cargarSiguiente]);

// ...
<ul>{/* items */}</ul>
<div ref={centinela} />
```

**¿Cuándo conviene?** En feeds donde el usuario solo hace scroll (redes sociales). El botón "Cargar más" es mejor cuando hay un pie de página que el usuario quiere alcanzar, y es más accesible. En proyectos reales, librerías como TanStack Query (`useInfiniteQuery`) manejan páginas, caché y errores por ti.

## Cómo explicarlo en la entrevista

> "Guardo los items acumulados, la última página, si hay más y si estoy cargando. La primera página la pido en un `useEffect` con una bandera para ignorar respuestas si el componente se desmontó. Al hacer clic pido la siguiente y la agrego al final con spread usando la forma funcional, sin mutar el arreglo. Mientras carga deshabilito el botón para evitar dobles clics que traigan la misma página dos veces, y cuando la API dice que no hay más, lo oculto. Para scroll infinito cambiaría el botón por un `IntersectionObserver` al final de la lista."

## Conceptos

- **`useEffect` para pedir datos al montar**, con bandera `activo` en la limpieza.
- **`async` / `await`** en un manejador de eventos.
- **Acumular sin mutar**: `[...anteriores, ...nuevos]`.
- **Actualización funcional** para no usar valores viejos después de un `await`.
- **Estado de carga** (`cargando`) para deshabilitar y dar feedback.
- **Renderizado condicional** con `&&`: el botón solo existe si `hayMas`.
- **Modo estricto**: en desarrollo React ejecuta los efectos dos veces para detectar errores.
- **`IntersectionObserver`**: detecta cuándo un elemento entra en pantalla (scroll infinito).
