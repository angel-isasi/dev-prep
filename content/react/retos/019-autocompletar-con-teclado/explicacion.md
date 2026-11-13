## Idea clave

Guarda solo lo que el usuario decide: **el texto**, **qué sugerencia está resaltada** (un índice) y **si la lista está abierta**. Las sugerencias son **estado derivado** del texto. El teclado se maneja en un solo `onKeyDown` que mira `evento.key`.

## Paso a paso

1. **Tres estados.** `texto` (input controlado), `indice` (`-1` = ninguna resaltada) y `abierto`. Este último hace falta porque, al elegir "Pueblo Nuevo", el texto sigue coincidiendo con "Pueblo Nuevo" y sin él la lista volvería a mostrarse.
2. **Sugerencias derivadas.** `opciones.filter((o) => o.toLowerCase().startsWith(buscado))`, y `[]` si el texto está vacío. `startsWith` (no `includes`) porque al autocompletar se espera que coincida el inicio.
3. **Escribir.** `onChange` actualiza el texto, reinicia el índice a `-1` (las sugerencias cambiaron, el índice viejo ya no sirve) y abre la lista.
4. **Teclado.** En `onKeyDown`:
   - `ArrowDown`: `Math.min(i + 1, sugerencias.length - 1)` para no pasar de la última.
   - `ArrowUp`: `Math.max(i - 1, 0)` para no bajar de la primera.
   - `Enter`: si hay una resaltada, la elige.
   - `Escape`: borra y cierra.
   - `preventDefault()` en las flechas evita que el cursor del input salte al inicio o al final.
5. **Elegir** (por Enter o clic) en una sola función: pone el texto, reinicia el índice, cierra la lista y llama a `onElegir(opcion)`.
6. **Accesibilidad.** `role="combobox"` en el input, `aria-expanded` dice si la lista está abierta, `role="listbox"` en la lista y `role="option"` con `aria-selected` en cada sugerencia. Así un lector de pantalla anuncia "Pueblo Nuevo, seleccionado, 2 de 2".

```jsx
import { useState } from "react";

export function Autocompletar({ opciones, onElegir }) {
  const [texto, setTexto] = useState("");
  const [indice, setIndice] = useState(-1); // -1 = ninguna resaltada
  const [abierto, setAbierto] = useState(false);

  // Estado derivado: las sugerencias salen del texto en cada render.
  const buscado = texto.toLowerCase();
  const sugerencias = buscado
    ? opciones.filter((opcion) => opcion.toLowerCase().startsWith(buscado))
    : [];
  const mostrarLista = abierto && sugerencias.length > 0;

  function escribir(evento) {
    setTexto(evento.target.value);
    setIndice(-1);
    setAbierto(true);
  }

  function elegir(opcion) {
    setTexto(opcion);
    setIndice(-1);
    setAbierto(false);
    onElegir(opcion);
  }

  function alPresionarTecla(evento) {
    if (evento.key === "ArrowDown") {
      evento.preventDefault(); // que el cursor no salte al final del input
      setIndice((i) => Math.min(i + 1, sugerencias.length - 1));
    } else if (evento.key === "ArrowUp") {
      evento.preventDefault();
      setIndice((i) => Math.max(i - 1, 0));
    } else if (evento.key === "Enter" && mostrarLista && indice >= 0) {
      elegir(sugerencias[indice]);
    } else if (evento.key === "Escape") {
      setTexto("");
      setIndice(-1);
      setAbierto(false);
    }
  }

  return (
    <div>
      <input
        role="combobox"
        aria-label="Distrito"
        aria-expanded={mostrarLista}
        aria-autocomplete="list"
        value={texto}
        onChange={escribir}
        onKeyDown={alPresionarTecla}
      />

      {mostrarLista && (
        <ul role="listbox">
          {sugerencias.map((opcion, i) => (
            <li
              key={opcion}
              role="option"
              aria-selected={i === indice}
              onClick={() => elegir(opcion)}
            >
              {opcion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Por qué funciona

Con `opciones = ["Ica", "Ica Norte", "Parcona", "Pueblo Nuevo"]`:

| Acción | `texto` | `indice` | `abierto` | `sugerencias` (derivadas) | Se pinta |
|---|---|---|---|---|---|
| escribe `p` | "p" | -1 | true | Parcona, Pueblo Nuevo | lista, nada resaltado |
| ↓ | "p" | 0 | true | igual | **Parcona** |
| ↓ | "p" | 1 | true | igual | **Pueblo Nuevo** |
| ↓ | "p" | 1 (`Math.min` con 1) | true | igual | **Pueblo Nuevo** |
| Enter | "Pueblo Nuevo" | -1 | false | Pueblo Nuevo | input lleno, sin lista |

En la última fila, `sugerencias` todavía tiene "Pueblo Nuevo", pero `abierto` es `false`, así que `mostrarLista` es `false` y la lista no se pinta.

## Errores comunes

- **Guardar las sugerencias en el estado** y recalcularlas en un `useEffect`. Hay un render con datos viejos y más código. Se calculan.
- **No reiniciar el índice al escribir.** Si tenías resaltada la 3.ª y escribes algo que deja 1 sugerencia, `sugerencias[2]` es `undefined` y Enter llama a `onElegir(undefined)`.
- **Salirse de los extremos**: sin `Math.min`/`Math.max`, el índice llega a 5 o a -3 y nada aparece resaltado.
- **Dejar la lista abierta después de elegir.** Como el texto elegido coincide consigo mismo, la lista reaparece con una sola opción. Por eso el estado `abierto`.
- **Usar el índice como `key`**: las sugerencias cambian con cada tecla; usa el texto de la opción.
- **Manejar el teclado en cada `<li>`**: el foco está en el input, así que es el input el que recibe `onKeyDown`.

## Otra forma de resolverlo

Usar el elemento nativo **`<datalist>`** de HTML:

```jsx
<input list="distritos" aria-label="Distrito" onChange={(e) => onElegir(e.target.value)} />
<datalist id="distritos">
  {opciones.map((opcion) => (
    <option key={opcion} value={opcion} />
  ))}
</datalist>
```

**¿Cuándo conviene?** Cuando solo necesitas sugerencias simples: el navegador maneja teclado, filtro y accesibilidad gratis. Pero no puedes controlar el estilo ni el filtro (cada navegador lo hace distinto) y no hay un evento claro de "eligió una opción". Para algo con diseño propio o que pide datos a una API (con debounce), se hace a mano como en la solución, o con una librería como Downshift.

## Cómo explicarlo en la entrevista

> "Guardo el texto, el índice resaltado y si la lista está abierta. Las sugerencias las derivo del texto filtrando las opciones que empiezan igual, sin mayúsculas. En el `onKeyDown` del input muevo el índice con las flechas, limitado con `Math.min` y `Math.max`, Enter elige la resaltada y Escape limpia. Al escribir reinicio el índice porque las sugerencias cambiaron. Uso los roles `combobox`, `listbox` y `option` con `aria-selected` para que un lector de pantalla anuncie las opciones. Si las opciones vinieran de una API, agregaría un debounce."

## Conceptos

- **Input controlado** (`value` + `onChange`).
- **Estado derivado**: las sugerencias se calculan del texto.
- **`onKeyDown` y `evento.key`**: detectar `ArrowDown`, `ArrowUp`, `Enter`, `Escape`.
- **`preventDefault()`**: cancela el comportamiento por defecto del navegador.
- **`Math.min` / `Math.max`**: mantener un índice dentro de un rango.
- **`startsWith`**: comprobar si un texto empieza con otro.
- **Roles ARIA** `combobox`, `listbox`, `option`, y atributos `aria-expanded` y `aria-selected`.
- **`<datalist>`**: autocompletar nativo de HTML.
