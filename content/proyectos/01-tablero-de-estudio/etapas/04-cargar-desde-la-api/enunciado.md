# Etapa 4: cargar desde la API con estados de carga y error

En una app real las tareas vienen de un servidor. `src/api.js` simula uno: `getTasks()` devuelve una promesa que tarda un poco y a veces falla (los tests lo fuerzan con `failNextRequest()`).

## Qué hacer

1. En `App`, el estado empieza vacío (`useState([])`) y hay un estado de la carga: `"loading"`, `"error"` o `"ready"`.
2. Escribe `loadTasks()`: pone `"loading"`, llama a `getTasks()` y, según el resultado, guarda las tareas y pone `"ready"`, o pone `"error"`.
3. Llama a `loadTasks()` al montar el componente, con `useEffect`.
4. Muestra según el estado:
   - `"loading"`: un párrafo `Cargando tareas...`.
   - `"error"`: un bloque con `role="alert"` que dice `No se pudieron cargar las tareas.` y un botón `Reintentar` que vuelve a llamar a `loadTasks()`. No muestres la lista.
   - `"ready"`: el resumen y la lista (si la API devuelve `[]`, la lista ya muestra `No hay tareas`).
5. Crear y marcar siguen cambiando solo el estado local. En la etapa 5 los conectas a la API.

## Conceptos que practicas

- `useEffect` con dependencias para efectos al montar.
- Promesas con `async`/`await` y `try`/`catch`.
- Modelar los estados de una petición: cargando, error, datos y vacío (lo que más miran en una prueba técnica).
- Dar una salida al error (reintentar) en vez de dejar la pantalla rota.

## Pistas

1. Un solo estado `status` con tres valores es más claro que dos booleanos (`isLoading` y `hasError`), que pueden quedar en combinaciones imposibles.
2. Si `loadTasks` vive dentro del componente y la usas en el `useEffect`, envuélvela en `useCallback(..., [])` para que no cambie en cada render y el efecto no se repita sin fin.
