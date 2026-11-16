# Etapa 5: crear, editar y borrar contra la API

Hasta ahora crear y marcar solo cambiaban el estado local: si recargas, se pierde. Ahora cada acción pasa por el "servidor" (`src/api.js`) y el estado se actualiza con lo que este responde.

## Qué hacer

1. **Crear**: `addTask` llama a `createTask({ title, topic })` y agrega al estado la tarea que devuelve la API (con su `id` real). Devuelve `true` si salió bien y `false` si falló.
2. **Marcar**: `toggleTask(id)` llama a `updateTask(id, { done: !task.done })` y reemplaza la tarea con la respuesta.
3. **Editar**: en `TaskItem`, un botón `Editar` (con `aria-label` `Editar <título>`) cambia la fila a modo edición:
   - Un campo con `aria-label="Editar título"` con el título actual, y los botones `Guardar` (submit) y `Cancelar`.
   - `Guardar` llama a la prop `onEdit(task.id, nuevoTitulo)` (título sin espacios extra; si queda vacío, no guardes). Si `onEdit` no devuelve `false`, sale del modo edición.
   - `Cancelar` sale sin cambiar nada.
   - En `App`, `editTask(id, title)` llama a `updateTask(id, { title })`.
4. **Borrar**: un botón `Borrar` (con `aria-label` `Borrar <título>`) llama a `onDelete(task.id)`. En `App`, `removeTask(id)` llama a `deleteTask(id)` y, solo si sale bien, quita la tarea del estado.
5. **Errores**: si una acción falla, muestra un párrafo con `role="alert"`:
   - `No se pudo crear la tarea. Intenta de nuevo.`
   - `No se pudo actualizar la tarea. Intenta de nuevo.`
   - `No se pudo borrar la tarea. Intenta de nuevo.`

   Borra el mensaje al empezar la siguiente acción. Nunca quites del estado algo que el servidor no confirmó.
6. `TaskList` pasa `onEdit` y `onDelete` a cada `TaskItem`.

## Conceptos que practicas

- CRUD contra una API: POST, PATCH y DELETE.
- Actualizar el estado con la respuesta del servidor (la fuente de verdad).
- Estado local de un componente (modo edición) frente a estado compartido (las tareas).
- Manejo de errores de red sin perder los datos del usuario.

## Pistas

1. El modo edición es estado **del** `TaskItem` (`const [editing, setEditing] = useState(false)`): a nadie más le importa. Las tareas, en cambio, siguen viviendo en `App`.
2. El `aria-label` en los botones (`` aria-label={`Borrar ${task.title}`} ``) hace que el lector de pantalla diga qué tarea se borra, no solo "Borrar, Borrar, Borrar". Los tests buscan los botones así.
