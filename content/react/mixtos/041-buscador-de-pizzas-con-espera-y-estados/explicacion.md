## Idea clave

Un solo `useEffect` que depende del texto hace todo: programa la búsqueda con `setTimeout` y su **limpieza** hace dos trabajos a la vez. `clearTimeout` cancela la espera si el usuario sigue escribiendo (debounce), y `vigente = false` descarta la respuesta si llega cuando ya se busca otra cosa (condición de carrera).

## Paso a paso

1. **Dos estados.** `texto` para el input controlado y `estado = { fase, resultados }` para lo que se muestra. Fase y resultados van juntos en un objeto porque siempre cambian a la vez; así nunca quedan desincronizados.
2. **El efecto depende de `[texto, buscar]`.** Cada tecla vuelve a ejecutarlo (y antes, la limpieza del anterior).
3. **Texto vacío.** Con `texto.trim()` vacío no se busca: vuelve a la fase `"inicial"` y sale con `return` (sin limpieza, no hay nada que limpiar).
4. **Bandera `vigente`.** `let vigente = true` es una variable local de **esta** ejecución del efecto. El callback del timeout la recuerda por closure.
5. **Programar la búsqueda.** `setTimeout(async () => { ... }, 300)`:
   - Pasa a `"cargando"` conservando los resultados anteriores (`...anterior`).
   - `await buscar(consulta)` dentro de `try/catch`.
   - Si salió bien y sigue vigente: fase `"listo"` con los resultados. Si falló y sigue vigente: fase `"error"`.
6. **La limpieza.** `vigente = false` y `clearTimeout(id)`. React la ejecuta antes de la siguiente ejecución del efecto y al desmontar.
7. **El JSX.** Un mensaje por fase con `&&`. El mensaje de vacío solo aparece si la fase es `"listo"` **y** no hay resultados.

```jsx
import { useEffect, useState } from "react";

export function BuscadorPizzas({ buscar }) {
  const [texto, setTexto] = useState("");
  const [estado, setEstado] = useState({ fase: "inicial", resultados: [] });

  useEffect(() => {
    const consulta = texto.trim();
    if (!consulta) {
      setEstado({ fase: "inicial", resultados: [] });
      return;
    }

    let vigente = true;

    const id = setTimeout(async () => {
      setEstado((anterior) => ({ ...anterior, fase: "cargando" }));
      try {
        const resultados = await buscar(consulta);
        if (vigente) setEstado({ fase: "listo", resultados });
      } catch {
        if (vigente) setEstado({ fase: "error", resultados: [] });
      }
    }, 300);

    return () => {
      vigente = false;
      clearTimeout(id);
    };
  }, [texto, buscar]);

  return (
    <div>
      <input aria-label="Buscar pizza" value={texto} onChange={(evento) => setTexto(evento.target.value)} />

      {estado.fase === "inicial" && <p>Escribe el nombre de una pizza.</p>}
      {estado.fase === "cargando" && <p>Buscando…</p>}
      {estado.fase === "error" && <p role="alert">No pudimos buscar. Revisa tu conexión.</p>}
      {estado.fase === "listo" && estado.resultados.length === 0 && <p>No hay pizzas con “{texto.trim()}”.</p>}

      <ul>
        {estado.resultados.map((pizza) => (
          <li key={pizza}>{pizza}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Por qué funciona

**El debounce.** Escribiendo `m`, `ma`, `mar` seguido:

| Tecla | Limpieza del efecto anterior | Nuevo timeout |
|---|---|---|
| `m` | (no hay) | A, para buscar `"m"` |
| `ma` | cancela A | B, para buscar `"ma"` |
| `mar` | cancela B | C, para buscar `"mar"` |
| 300 ms después | | C se dispara: `buscar("mar")` una sola vez |

**La condición de carrera.** Supón que `"ma"` tarda 1000 ms en responder y `"mar"` solo 100 ms:

| t (ms) | Qué pasa | `vigente` de "ma" | `vigente` de "mar" | Pantalla |
|---|---|---|---|---|
| 300 | empieza `buscar("ma")` | true | | Buscando… |
| 300 | el usuario escribe `mar`: limpieza de "ma" | **false** | true | Buscando… |
| 600 | empieza `buscar("mar")` | false | true | Buscando… |
| 700 | responde "mar": vigente, se guarda | false | true | resultado de mar |
| 1300 | responde "ma": **no** vigente, se ignora | false | true | resultado de mar |

Sin la bandera, a los 1300 ms la respuesta vieja pisaría a la nueva y el usuario vería resultados de `"ma"` con `"mar"` escrito.

Cada ejecución del efecto tiene **su propio** `vigente`: son variables distintas aunque se llamen igual. La limpieza solo apaga la bandera de su propia búsqueda.

## Errores comunes

- **No cancelar el timeout.** Se hace una petición por cada tecla. Lo reconoces porque `buscar` se llama 3 veces en vez de 1.
- **No ignorar respuestas viejas.** Funciona en tu máquina (respuestas rápidas y en orden) y falla en producción con red lenta. Lo detecta el test de la búsqueda vieja.
- **Poner `async` directamente en el efecto:** `useEffect(async () => { ... })`. Una función `async` devuelve una promesa, y React espera que el efecto devuelva una función de limpieza o nada. Usa la función `async` **dentro** (aquí, en el timeout).
- **Tres estados separados** (`cargando`, `error`, `resultados`) que se actualizan por separado. Es fácil terminar con `cargando` y `error` en `true` a la vez. Un objeto con `fase` hace imposibles esas combinaciones.
- **Olvidar el `trim`.** Buscar `"   "` llama a la API con espacios y muestra "No hay pizzas con “”".

## Otra forma de resolverlo

Si `buscar` usa `fetch`, en lugar de la bandera puedes **cancelar la petición de verdad** con `AbortController`:

```jsx
useEffect(() => {
  const consulta = texto.trim();
  if (!consulta) {
    setEstado({ fase: "inicial", resultados: [] });
    return;
  }
  const controlador = new AbortController();
  const id = setTimeout(async () => {
    setEstado((anterior) => ({ ...anterior, fase: "cargando" }));
    try {
      const respuesta = await fetch(`/api/pizzas?q=${encodeURIComponent(consulta)}`, { signal: controlador.signal });
      const resultados = await respuesta.json();
      setEstado({ fase: "listo", resultados });
    } catch (error) {
      if (error.name !== "AbortError") setEstado({ fase: "error", resultados: [] });
    }
  }, 300);
  return () => {
    controlador.abort();
    clearTimeout(id);
  };
}, [texto]);
```

**¿Cuándo conviene?** Cuando controlas el `fetch`: además de ignorar la respuesta, el navegador corta la descarga y ahorras datos. La bandera `vigente` sirve con **cualquier** promesa (una función que te pasan, una librería), por eso es la opción de este ejercicio. En proyectos grandes, librerías como TanStack Query resuelven todo esto por ti.

## Cómo explicarlo en la entrevista

> "Tengo dos estados: el texto del input y un objeto con la fase y los resultados, para que no haya combinaciones imposibles como cargando y error a la vez. Un efecto que depende del texto programa la búsqueda con un `setTimeout` de 300 ms. La limpieza del efecto hace dos cosas: cancela el timeout si el usuario sigue escribiendo, que es el debounce, y pone en `false` una bandera `vigente`, para que si una respuesta vieja llega tarde no pise a la nueva; eso evita la condición de carrera. Si usara `fetch` directamente, lo cambiaría por un `AbortController` para cancelar la petición de verdad."

## Conceptos

- **Debounce con `useEffect`**: cada cambio limpia el timeout anterior y programa otro.
- **Condición de carrera**: respuestas que llegan en distinto orden del que se pidieron.
- **Bandera de vigencia**: variable local del efecto que la limpieza apaga.
- **Closure**: el callback del timeout recuerda `vigente` y `consulta` de su ejecución.
- **Limpieza de `useEffect`**: corre antes de la siguiente ejecución y al desmontar.
- **`async/await` con `try/catch`**: manejar el éxito y el error de una promesa.
- **Estado como máquina de fases**: `inicial`, `cargando`, `listo`, `error` en un solo valor.
- **`AbortController`**: cancela un `fetch` en curso.
- **`role="alert"`**: los lectores de pantalla anuncian el error en cuanto aparece.
