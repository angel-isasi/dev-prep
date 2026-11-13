## Idea clave

El estado es un **arreglo de objetos** y se trata como **inmutable**: cada cambio crea un arreglo nuevo. Agregar es spread, marcar es `map`, eliminar es `filter`. Lo que se puede contar (las pendientes) se calcula, no se guarda.

## Paso a paso

1. **Dos estados.** `tareas` (arreglo de `{ id, texto, hecha }`) y `texto` (lo que se escribe en el input controlado).
2. **Formulario con `onSubmit`.** El input y el botón van dentro de un `<form>`. Así el envío funciona con clic **y** con Enter. En `agregar` llamas a `evento.preventDefault()` para que el navegador no recargue la página.
3. **Validar antes de agregar.** `texto.trim()` quita espacios; si queda vacío, sales con `return`.
4. **Agregar sin mutar.** `setTareas((anteriores) => [...anteriores, nueva])` crea un arreglo nuevo con todo lo anterior más la nueva tarea. Luego `setTexto("")` limpia el input.
5. **Marcar sin mutar.** `map` recorre todas: a la que tiene el `id` buscado le devuelves una **copia** con `hecha` invertido (`{ ...tarea, hecha: !tarea.hecha }`); a las demás las devuelves tal cual.
6. **Eliminar sin mutar.** `filter` se queda con todas menos la del `id`.
7. **`key` estable.** Cada `<li>` usa `key={tarea.id}`, un id único creado con `crypto.randomUUID()` al agregarla.
8. **Pendientes derivadas.** `tareas.filter((t) => !t.hecha).length`, calculado en cada render.

```jsx
import { useState } from "react";

export function Tareas() {
  const [tareas, setTareas] = useState([]);
  const [texto, setTexto] = useState("");

  function agregar(evento) {
    evento.preventDefault();
    const limpio = texto.trim();
    if (!limpio) return;
    setTareas((anteriores) => [
      ...anteriores,
      { id: crypto.randomUUID(), texto: limpio, hecha: false },
    ]);
    setTexto("");
  }

  function alternar(id) {
    setTareas((anteriores) =>
      anteriores.map((tarea) => (tarea.id === id ? { ...tarea, hecha: !tarea.hecha } : tarea))
    );
  }

  function eliminar(id) {
    setTareas((anteriores) => anteriores.filter((tarea) => tarea.id !== id));
  }

  const pendientes = tareas.filter((tarea) => !tarea.hecha).length;

  return (
    <div>
      <form onSubmit={agregar}>
        <input
          aria-label="Nueva tarea"
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
        />
        <button>Agregar</button>
      </form>

      <ul>
        {tareas.map((tarea) => (
          <li key={tarea.id}>
            <label>
              <input type="checkbox" checked={tarea.hecha} onChange={() => alternar(tarea.id)} />
              <span style={{ textDecoration: tarea.hecha ? "line-through" : "none" }}>
                {tarea.texto}
              </span>
            </label>
            <button onClick={() => eliminar(tarea.id)} aria-label={`Eliminar ${tarea.texto}`}>
              ×
            </button>
          </li>
        ))}
      </ul>

      <p>{pendientes} pendientes</p>
    </div>
  );
}
```

El `<button>Agregar</button>` no lleva `type`, así que dentro del `<form>` es `submit`: justo lo que queremos aquí.

## Por qué funciona

| Acción | Estado `tareas` | Lo que se pinta |
|---|---|---|
| (inicio) | `[]` | lista vacía, `0 pendientes` |
| agregar `Estudiar React` | `[{ id: "a1", texto: "Estudiar React", hecha: false }]` | 1 `<li>`, `1 pendientes` |
| agregar `   ` | sin cambios (sale en el `return`) | igual |
| marcar el checkbox | `[{ id: "a1", ..., hecha: true }]` (objeto **nuevo**) | texto tachado, `0 pendientes` |
| eliminar | `[]` (arreglo **nuevo**) | lista vacía |

React decide si renderizar comparando **referencias**: `anterior === nuevo`. Si mutaras el arreglo con `push`, la referencia sería la misma y React podría no enterarse del cambio. Por eso cada operación devuelve un arreglo (y un objeto) nuevo.

## Errores comunes

- **Mutar el estado:** `tareas.push(nueva); setTareas(tareas)` o `tarea.hecha = true`. La referencia no cambia y la pantalla no se actualiza (o se actualiza tarde y raro). Lo reconoces porque haces clic y "no pasa nada".
- **Usar el índice como `key`.** Al eliminar la primera tarea, todas las demás cambian de índice y React puede dejar marcado el checkbox equivocado. Usa un id único que no cambie.
- **Olvidar `preventDefault()`** en el `onSubmit`. El navegador envía el formulario y recarga la página: se pierde todo el estado.
- **Guardar `pendientes` en otro `useState`.** Tienes que recordarlo al agregar, marcar y eliminar; si olvidas uno, el número miente. Contarlo en cada render es más simple y siempre exacto.
- **No hacer `trim()`.** Se cuelan tareas vacías o con espacios.

## Otra forma de resolverlo

Con **`useReducer`**, que junta toda la lógica de cambios en una función pura:

```jsx
import { useReducer, useState } from "react";

function tareasReducer(tareas, accion) {
  switch (accion.tipo) {
    case "agregar":
      return [...tareas, { id: crypto.randomUUID(), texto: accion.texto, hecha: false }];
    case "alternar":
      return tareas.map((t) => (t.id === accion.id ? { ...t, hecha: !t.hecha } : t));
    case "eliminar":
      return tareas.filter((t) => t.id !== accion.id);
    default:
      return tareas;
  }
}

// En el componente:
const [tareas, dispatch] = useReducer(tareasReducer, []);
// dispatch({ tipo: "agregar", texto: limpio });
// dispatch({ tipo: "alternar", id: tarea.id });
```

**¿Cuándo conviene?** Cuando el estado tiene muchas formas de cambiar (editar, reordenar, filtrar, deshacer). El reducer se prueba sin renderizar nada, solo llamándolo con un estado y una acción. Para tres acciones, `useState` está bien.

## Cómo explicarlo en la entrevista

> "Guardo las tareas en un arreglo de objetos con id, texto y si está hecha. Nunca lo modifico directamente: para agregar uso spread, para marcar uso `map` devolviendo una copia del objeto y para eliminar uso `filter`, porque React detecta cambios comparando referencias. Cada tarea tiene un id único como `key`; no uso el índice porque al borrar se movería el estado de las filas. Uso un `form` con `onSubmit` para que funcione con Enter, valido con `trim` y las pendientes las calculo, no las guardo."

## Conceptos

- **Inmutabilidad**: crear copias (`[...arr]`, `{ ...obj }`) en vez de modificar.
- **`map` / `filter`** para cambiar o quitar elementos de un arreglo en el estado.
- **`key`** única y estable en listas; evita el índice si la lista cambia.
- **Formulario con `onSubmit`** y `preventDefault()`.
- **Input controlado**: `value` + `onChange`.
- **Estado derivado**: las pendientes se cuentan en cada render.
- **`crypto.randomUUID()`**: genera ids únicos en el navegador.
- **`useReducer`**: alternativa a `useState` cuando hay muchas acciones.
