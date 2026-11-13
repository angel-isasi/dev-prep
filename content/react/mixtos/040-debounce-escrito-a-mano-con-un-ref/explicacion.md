## Idea clave

El input se actualiza al instante; lo único que se retrasa es el **aviso** al padre. Cada tecla cancela el temporizador anterior y programa uno nuevo, así que solo sobrevive el de la última tecla. El id del temporizador vive en un **ref** porque no se muestra en pantalla y debe sobrevivir entre renders.

## Paso a paso

1. **Estado para el texto.** `const [texto, setTexto] = useState("")` y el input controlado con `value={texto}`. Así lo que escribes se ve sin demora.
2. **Ref para el temporizador.** `const temporizador = useRef(null)`. Guardará el número que devuelve `setTimeout`.
3. **En cada cambio:**
   - Lee el valor: `const valor = evento.target.value`.
   - Actualiza el estado: `setTexto(valor)`.
   - Cancela lo pendiente: `clearTimeout(temporizador.current)` (con `null` o un id ya vencido no hace nada, es seguro).
   - Programa el aviso nuevo y guarda su id: `temporizador.current = setTimeout(() => onBuscar(valor), espera)`.
4. **Limpieza al desmontar.** `useEffect(() => () => clearTimeout(temporizador.current), [])`. El efecto no hace nada al montar; solo devuelve la limpieza, que React ejecuta al desmontar.

```jsx
import { useEffect, useRef, useState } from "react";

export function BuscadorConEspera({ onBuscar, espera = 300 }) {
  const [texto, setTexto] = useState("");
  const temporizador = useRef(null);

  function cambiar(evento) {
    const valor = evento.target.value;
    setTexto(valor);
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => onBuscar(valor), espera);
  }

  useEffect(() => () => clearTimeout(temporizador.current), []);

  return <input aria-label="Buscar" value={texto} onChange={cambiar} />;
}
```

Fíjate que el `setTimeout` usa `valor` (la variable local) y no `texto` (el estado). `texto` todavía tiene el valor anterior en ese momento, porque `setTexto` no cambia la variable al instante: el nuevo valor llega en el próximo render.

## Por qué funciona

Recorrido escribiendo `m`, `ma`, `mar` a los 0, 50 y 100 ms:

| t | Evento | `clearTimeout` cancela | Nuevo temporizador | Se dispara en |
|---|---|---|---|---|
| 0 | `"m"` | (nada) | id 1 | 300 |
| 50 | `"ma"` | id 1 | id 2 | 350 |
| 100 | `"mar"` | id 2 | id 3 | 400 |
| 400 | | | id 3 se dispara | `onBuscar("mar")` |

Los temporizadores 1 y 2 se cancelaron antes de dispararse. Solo el 3, el de la última tecla, llega a ejecutarse. Si en vez de escribir el usuario cierra el buscador a los 200 ms, la limpieza del efecto cancela el id 3 y no se llama a `onBuscar` sobre un componente que ya no existe.

**¿Por qué un ref y no estado?** Si guardaras el id con `useState`, cada tecla provocaría un render extra, y además el `onChange` leería el id del render anterior (un closure viejo) y podría cancelar el temporizador equivocado. El ref siempre tiene el valor más reciente y no provoca renders.

## Errores comunes

- **No cancelar el temporizador anterior.** `onBuscar` se llama una vez por tecla, solo que más tarde. Lo reconoces porque falla "avisa una sola vez".
- **Guardar el id en una variable normal** (`let id;` dentro del componente). En cada render la variable se crea de nuevo vacía y pierdes el id para cancelar.
- **Usar `texto` dentro del `setTimeout`** en lugar de `valor`. Buscas lo que había **antes** de la última tecla: `"ma"` en vez de `"mar"`.
- **Retrasar también `setTexto`.** El input se siente trabado: las letras aparecen 300 ms después.
- **Olvidar la limpieza al desmontar.** El aviso llega después de cerrar el buscador; si el padre actualiza estado o hace una petición, es trabajo inútil o un bug.

## Otra forma de resolverlo

Con un **efecto** que dependa del texto, sin manejar ids a mano (la idea de `useDebounce`):

```jsx
export function BuscadorConEspera({ onBuscar, espera = 300 }) {
  const [texto, setTexto] = useState("");

  useEffect(() => {
    if (texto === "") return;
    const id = setTimeout(() => onBuscar(texto), espera);
    return () => clearTimeout(id);
  }, [texto, espera, onBuscar]);

  return <input aria-label="Buscar" value={texto} onChange={(e) => setTexto(e.target.value)} />;
}
```

Cada cambio de `texto` ejecuta la limpieza del efecto anterior (que cancela su temporizador) y programa uno nuevo. **¿Cuándo conviene?** Es más declarativo y es lo que suele escribirse en apps reales. Pero tiene una trampa: si el padre pasa `onBuscar` como una flecha nueva en cada render, el efecto se reinicia por esa dependencia. La versión con ref en el manejador no tiene ese problema, y además deja claro que el debounce responde a una acción del usuario.

## Cómo explicarlo en la entrevista

> "Separo lo que se ve de lo que se avisa: el input es controlado y se actualiza al instante, y lo que retraso es la llamada a `onBuscar`. En cada cambio cancelo el `setTimeout` anterior y programo uno nuevo, así solo se ejecuta el de la última tecla. El id del temporizador lo guardo en un `useRef`, porque tiene que sobrevivir entre renders y no quiero que provoque renders. En el timeout uso el valor del evento y no el estado, que todavía sería el anterior. Y al desmontar limpio con un efecto para no avisar sobre un componente que ya no existe."

## Conceptos

- **Debounce**: ejecutar una acción solo cuando los eventos se detienen por un tiempo.
- **`useRef`**: caja mutable que sobrevive entre renders sin provocarlos; ideal para ids de temporizadores.
- **`setTimeout` / `clearTimeout`**: programar y cancelar; `clearTimeout(null)` es seguro.
- **Input controlado**: `value` + `onChange` ligados al estado.
- **El estado no cambia al instante**: después de `setTexto`, la variable `texto` sigue con el valor viejo hasta el próximo render.
- **Limpieza al desmontar**: `useEffect(() => () => ..., [])`.
- **Valores por defecto en props**: `espera = 300` en la desestructuración.
