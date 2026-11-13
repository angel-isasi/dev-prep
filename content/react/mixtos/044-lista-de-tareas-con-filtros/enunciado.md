Crea una lista de tareas (to-do) con filtros. Exporta dos piezas:

- `FILTROS`: un objeto con tres funciones que reciben una tarea y devuelven `true` si debe verse:
  - `todas`: siempre `true`.
  - `pendientes`: las que **no** están hechas.
  - `hechas`: las que sí.
- `TareasConFiltro()`: el componente.

Cada tarea es `{ id, texto, hecha }`.

## Reglas

- Un formulario con un input de etiqueta **"Nueva tarea"** y un botón **"Agregar"**. Al enviarlo se agrega la tarea (sin espacios a los lados) al final y el input queda vacío. Si el texto está vacío o solo tiene espacios, no se agrega nada.
- Tres botones de filtro con los textos exactos **"todas"**, **"pendientes"** y **"hechas"** (las claves de `FILTROS`). El activo lleva `aria-pressed="true"`; los demás, `"false"`. Al inicio el activo es "todas".
- Una lista `<ul>` con un `<li>` por tarea **visible** según el filtro. Dentro, un checkbox con un `<label>` cuyo texto es el de la tarea (así `getByLabelText("Amasar")` encuentra el checkbox). Marcarlo o desmarcarlo cambia `hecha`.
- Un contador de pendientes: **"Queda 1 tarea"** si es una, **"Quedan N tareas"** en cualquier otro caso (incluido 0).
- Un botón **"Borrar las hechas"** que elimina todas las tareas hechas.

## Ejemplo

| Acción | Lista visible | Contador |
|---|---|---|
| Agregar "Amasar" y "Hornear" | Amasar, Hornear | Quedan 2 tareas |
| Marcar "Amasar" | Amasar, Hornear | Queda 1 tarea |
| Filtro "pendientes" | Hornear | Queda 1 tarea |
| Filtro "todas" y "Borrar las hechas" | Hornear | Queda 1 tarea |

## Por qué importa

El to-do con filtros es casi un rito de paso en las entrevistas junior. Combina agregar, actualizar y borrar de forma inmutable, ids estables para las `key`, estado derivado (la lista visible y el contador no se guardan) y una buena idea de diseño: los filtros como **datos** (un objeto de funciones) en vez de un montón de `if`.
