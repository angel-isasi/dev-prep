## Idea clave

Solo dos cosas son estado: **las tareas** y **el nombre del filtro**. Todo lo demás (la lista visible, el contador) se deriva. Y los filtros son **datos**: un objeto de funciones que alimenta a la vez los botones, la lista, el contador y el botón de borrar.

## Paso a paso

1. **`FILTROS`** fuera del componente: `todas`, `pendientes` y `hechas`, cada una `(tarea) => boolean`. Como no dependen de props ni estado, no tiene sentido recrearlas en cada render.
2. **Estado mínimo**: `tareas` (arreglo) y `filtro` (texto, empieza en `"todas"`).
3. **Ids con `useRef`**: `siguienteId.current++` da 1, 2, 3... Un ref sobrevive entre renders y cambiarlo **no** provoca un render. No uses el índice: al borrar tareas, los índices se corren.
4. **Agregar con el formulario**: `onSubmit` + `preventDefault()`. El input es **no controlado** (sin `value`): lees su valor con `new FormData(formulario).get("texto")`, haces `trim()`, ignoras vacíos y al final `formulario.reset()` lo deja en blanco. Guarda `evento.currentTarget` en una variable antes de usarlo.
5. **Marcar** con `map`: copia solo la tarea tocada con `{ ...tarea, hecha: !tarea.hecha }`.
6. **Derivar**: `visibles = tareas.filter(FILTROS[filtro])` y `pendientes = tareas.filter(FILTROS.pendientes).length`.
7. **Botones de filtro** con `Object.keys(FILTROS)`; `aria-pressed` indica cuál está activo (un botón que funciona como interruptor).
8. **Borrar las hechas** es simplemente quedarse con las pendientes: `lista.filter(FILTROS.pendientes)`.

```jsx
import { useRef, useState } from "react";

export const FILTROS = {
  todas: () => true,
  pendientes: (tarea) => !tarea.hecha,
  hechas: (tarea) => tarea.hecha,
};

export function TareasConFiltro() {
  const [tareas, setTareas] = useState([]);
  const [filtro, setFiltro] = useState("todas");
  const siguienteId = useRef(1);

  function agregar(evento) {
    evento.preventDefault();
    const formulario = evento.currentTarget;
    const texto = new FormData(formulario).get("texto").trim();
    if (!texto) return;
    const id = siguienteId.current++;
    setTareas((lista) => [...lista, { id, texto, hecha: false }]);
    formulario.reset();
  }

  function alternar(id) {
    setTareas((lista) =>
      lista.map((tarea) => (tarea.id === id ? { ...tarea, hecha: !tarea.hecha } : tarea)),
    );
  }

  const visibles = tareas.filter(FILTROS[filtro]);
  const pendientes = tareas.filter(FILTROS.pendientes).length;

  return (
    <div>
      <form onSubmit={agregar}>
        <input name="texto" aria-label="Nueva tarea" />
        <button type="submit">Agregar</button>
      </form>

      {Object.keys(FILTROS).map((nombre) => (
        <button key={nombre} aria-pressed={filtro === nombre} onClick={() => setFiltro(nombre)}>
          {nombre}
        </button>
      ))}

      <ul>
        {visibles.map((tarea) => (
          <li key={tarea.id}>
            <label>
              <input type="checkbox" checked={tarea.hecha} onChange={() => alternar(tarea.id)} />
              {tarea.texto}
            </label>
          </li>
        ))}
      </ul>

      <p>{pendientes === 1 ? "Queda 1 tarea" : `Quedan ${pendientes} tareas`}</p>
      <button onClick={() => setTareas((lista) => lista.filter(FILTROS.pendientes))}>
        Borrar las hechas
      </button>
    </div>
  );
}
```

## Por qué funciona

Recorrido del ejemplo:

| Acción | `tareas` | `filtro` | `visibles` | `pendientes` |
|---|---|---|---|---|
| Agregar "Amasar", "Hornear" | `[{1, Amasar, false}, {2, Hornear, false}]` | todas | ambas | 2 |
| Marcar Amasar | `[{1, Amasar, true}, {2, Hornear, false}]` | todas | ambas | 1 |
| Clic "pendientes" | (igual) | pendientes | `[Hornear]` | 1 |
| Clic "todas" + Borrar las hechas | `[{2, Hornear, false}]` | todas | `[Hornear]` | 1 |

Fíjate que cambiar el filtro **no toca** `tareas`: solo cambia qué función se pasa a `filter`. Por eso al volver a "todas" reaparece Amasar (hasta que la borras de verdad).

¿Por qué `FILTROS[filtro]` funciona? `filtro` vale `"pendientes"`, así que `FILTROS["pendientes"]` es la función `(t) => !t.hecha`, y `filter` la llama con cada tarea.

## Errores comunes

- **Guardar `visibles` en otro estado** y actualizarlo cuando cambia el filtro o las tareas. Te olvidas de un caso (por ejemplo, al marcar) y la lista muestra datos viejos.
- **Filtrar `tareas` al cambiar de filtro** (`setTareas(tareas.filter(...))`): ¡borras las que no se ven! Lo reconoces porque al volver a "todas" faltan tareas.
- **Usar el índice como `key` o como id**: al borrar las hechas, los checkboxes de otras filas quedan marcados mal.
- **Mutar al marcar**: `tarea.hecha = !tarea.hecha; setTareas(tareas)`. Es la misma referencia y React no re-renderiza.
- **Usar `evento.currentTarget` dentro del callback de `setTareas`**: React lo pone en `null` después del evento. Guárdalo en una variable o usa el valor ya leído.

## Otra forma de resolverlo

Con el input **controlado** y un `if` por filtro:

```jsx
const [texto, setTexto] = useState("");

function agregar(evento) {
  evento.preventDefault();
  const limpio = texto.trim();
  if (!limpio) return;
  setTareas((lista) => [...lista, { id: crypto.randomUUID(), texto: limpio, hecha: false }]);
  setTexto("");
}

let visibles = tareas;
if (filtro === "pendientes") visibles = tareas.filter((t) => !t.hecha);
if (filtro === "hechas") visibles = tareas.filter((t) => t.hecha);
```

**¿Cuándo conviene?** El input controlado es mejor si necesitas reaccionar a cada tecla (validar en vivo, contar caracteres, deshabilitar el botón si está vacío). Para un simple "escribir y enviar", `FormData` evita un estado extra. Los `if` son más directos, pero cada filtro nuevo obliga a tocar varios lugares (los ifs y los botones); con el objeto `FILTROS` agregas una línea y todo lo demás se adapta. `crypto.randomUUID()` es otra forma válida de generar ids únicos.

## Cómo explicarlo en la entrevista

> "Solo guardo en el estado las tareas y el nombre del filtro. La lista visible y el contador los derivo en cada render. Los filtros los modelé como un objeto de funciones: con `Object.keys` pinto los botones, con `FILTROS[filtro]` filtro la lista y con `FILTROS.pendientes` cuento y borro las hechas; así agregar un filtro nuevo es una línea. Todas las actualizaciones son inmutables, con spread, `map` y `filter`, y los ids salen de un contador en un `useRef`, no del índice, para que las `key` sean estables cuando borro."

## Conceptos

- **Estado mínimo y estado derivado**: guarda lo indispensable, calcula el resto.
- **Objeto de funciones** (tabla de estrategias): reemplaza cadenas de `if` y centraliza la lógica.
- **`useRef` como contador**: valor que persiste entre renders sin causar renders.
- **Inmutabilidad**: `[...lista, nueva]`, `map` con spread, `filter`.
- **`FormData` y `form.reset()`**: leer y limpiar un formulario no controlado.
- **`key` estable**: un id único, nunca el índice en listas que cambian.
- **`aria-pressed`**: indica el estado de un botón tipo interruptor.
- **Checkbox con `<label>` envolvente**: el texto de la etiqueta nombra al checkbox.
