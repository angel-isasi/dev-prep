# Tablero kanban con diálogo de confirmación accesible

## Contexto

**Kallpa Studio** es una agencia web de Arequipa con seis personas que hacen páginas y tiendas en línea para negocios locales. Hoy organizan su trabajo en una hoja de cálculo que nadie actualiza. Quieren un tablero kanban simple, hecho en casa, que se pueda usar **solo con el teclado** (una de sus diseñadoras usa lector de pantalla), y te piden la primera versión.

Las tareas de ejemplo están en `src/data.js`. Cada tarea es `{ id, title, status }`, con `status` igual a `"todo"`, `"doing"` o `"done"`. Las columnas ya están definidas en `COLUMNS` (`src/lib/board.js`). No hace falta servidor ni `localStorage`: el tablero vive en memoria.

Tiempo estimado: **4 horas**.

## Requisitos

### Columnas y contador

- [ ] El título principal (`<h1>`) es **Tablero de Kallpa Studio**.
- [ ] Hay tres columnas: **Por hacer**, **En curso** y **Hecho**. Cada una es una `<section>` cuyo nombre accesible es su título (`<h2>` unido con `aria-labelledby`).
- [ ] Cada tarea es un `<li>` con su título en un `<h3>`, dentro de la lista de su columna, en el orden del estado.
- [ ] Cada columna muestra su contador: `3 tareas`, `1 tarea` o `0 tareas`.
- [ ] Una columna sin tareas dice `Sin tareas`.

### Crear

- [ ] Un campo con la etiqueta **Nueva tarea** y un botón **Agregar** (también con Enter). La tarea nueva va al **final de Por hacer**, con el título sin espacios en los extremos.
- [ ] Si el título está vacío (o solo tiene espacios) se muestra `Escribe un título para la tarea.`; si ya existe otra tarea con el mismo título (sin importar mayúsculas ni tildes), `Ya existe una tarea con ese título.`; si pasa de 80 caracteres, `El título no puede pasar de 80 caracteres.`. Los errores van con `role="alert"`, y el campo con `aria-invalid="true"` y `aria-describedby` apuntando al error.
- [ ] Después de crear, el campo queda vacío y con el foco.

### Mover

- [ ] Cada tarjeta tiene botones para moverla a la columna de al lado, con el nombre accesible `Mover <título> a <columna>`: desde Por hacer solo a En curso, desde En curso a Por hacer y a Hecho, desde Hecho solo a En curso.
- [ ] La tarea movida aparece **al final** de la columna de destino y el foco queda en su tarjeta (el `<li>`, con `tabIndex={-1}`), para que quien usa teclado no pierda su lugar.

### Editar

- [ ] Cada tarjeta tiene un botón `Editar <título>` que cambia el título por un campo con el nombre accesible **Editar título**, con el foco en él, y los botones **Guardar** y **Cancelar**.
- [ ] Guardar valida con las mismas reglas que crear (puede quedarse con su propio título). Con error, muestra el mensaje con `role="alert"` y sigue en edición.
- [ ] **Escape** o **Cancelar** dejan el título como estaba. Al guardar o cancelar, el foco vuelve al botón `Editar <título>` de esa tarjeta.

### Borrar con confirmación

- [ ] Cada tarjeta tiene un botón `Borrar <título>`. **No** uses `window.confirm`: abre un diálogo propio con `role="dialog"`, `aria-modal="true"`, el nombre accesible **¿Borrar la tarea?** (`aria-labelledby`) y una descripción (`aria-describedby`) que incluye el título de la tarea.
- [ ] El diálogo tiene los botones **Cancelar** y **Borrar**. Al abrirse, el foco va a **Cancelar** (lo seguro). Tab y Shift+Tab no salen del diálogo.
- [ ] **Cancelar** o **Escape** cierran el diálogo sin borrar y devuelven el foco al botón `Borrar <título>` que lo abrió.
- [ ] **Borrar** quita la tarea, cierra el diálogo y lleva el foco al título de la columna donde estaba (con `tabIndex={-1}`).

### Filtro y anuncios

- [ ] Un campo de búsqueda (`type="search"`) con la etiqueta **Buscar tareas** filtra las tarjetas de todas las columnas por título, sin importar mayúsculas, tildes ni espacios en los extremos.
- [ ] Con un filtro activo, el contador dice cuántas se ven del total de la columna: `1 de 3 tareas`, y una columna sin resultados dice `Sin coincidencias`.
- [ ] Un párrafo con `role="status"` (siempre en la página, visible solo para lectores de pantalla) anuncia lo que pasa: `Tarea "<título>" creada en Por hacer.`, `"<título>" se movió a <columna>.` y `Tarea "<título>" borrada.`.

## Lo que se valora

- Que los tests de `tests/` pasen.
- Un reducer (`useReducer`) con acciones claras y sin mutar el estado; las columnas, los contadores y el filtro se calculan, no se guardan.
- La lógica en funciones puras (`src/lib/board.js`), fáciles de probar.
- Un diálogo reutilizable (`ConfirmDialog`) que no sabe nada de tareas.
- Que el foco nunca se pierda: después de cada acción, quien usa teclado sabe dónde está.
- Componentes pequeños: columna, tarjeta, formulario, buscador y diálogo.

## Entrega

1. Completa los archivos con `// TODO` de `src/`.
2. Verifica que pasan todos los tests de `tests/kanban.test.jsx`.
3. Prueba el tablero solo con el teclado (Tab, Shift+Tab, Enter, Escape) en el navegador.
4. Actualiza el `README.md` con tus decisiones y qué mejorarías.
5. Prepárate para explicar en la entrevista por qué no usaste `window.confirm`, qué hace `aria-modal` y adónde va el foco después de borrar.
