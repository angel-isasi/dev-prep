Crea el componente `NuevaTarea`: un formulario que **crea una tarea** enviándola con `POST` a **`/api/practica/tareas`**. Recibe la prop opcional `alCrear(tarea)`, que llamas con la tarea que devuelve el servidor.

Hasta ahora solo **leías** datos. Enviar es distinto: tienes que armar la petición (método, encabezados, cuerpo), evitar que el usuario la mande dos veces por impaciencia, y mostrar lo que el servidor rechaza.

La API de práctica:

- Responde `201` con la tarea creada: `{ "id": 4, "titulo": "Estudiar fetch", "hecha": false }`.
- Responde `400` con `{ "error": "El título es obligatorio" }` o `{ "error": "El título no puede pasar de 120 caracteres" }`.

## Reglas

- Un `<form>` con un `<input>` dentro de un `<label>` con el texto **Título** y un botón de envío **Agregar** (ya vienen en el inicio). Usa el evento `onSubmit` del formulario y `preventDefault()`.
- Si el título (sin espacios a los lados) está vacío: **no** llames al servidor y muestra `<p role="alert">Escribe un título</p>`.
- Si no, haz `fetch("/api/practica/tareas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ titulo }) })` con el título ya recortado (`trim`).
- **Mientras envía:** el botón dice **`Guardando...`** y está **deshabilitado**. No debe salir una segunda petición aunque se intente enviar otra vez.
- **Si sale bien** (`ok`): vacía el campo, muestra `<p role="status">Tarea creada: <titulo></p>` y llama `alCrear(tarea)` con el objeto que devolvió el servidor (que trae el `id`).
- **Si el servidor responde con error** (por ejemplo `400`): muestra `<p role="alert">` con el `error` que viene en el cuerpo, **sin borrar** lo que escribió el usuario.
- **Sin conexión** (`fetch` se rechaza): `<p role="alert">No se pudo conectar con el servidor</p>`.
- Al terminar (bien o mal), el botón vuelve a decir **Agregar** y se habilita.

## Ejemplo

| Pasa esto | Se ve |
|---|---|
| escribes `  Estudiar fetch  ` y envías | botón `Guardando...` deshabilitado; se envía `{"titulo":"Estudiar fetch"}` |
| el servidor responde `201` | campo vacío, `Tarea creada: Estudiar fetch` |
| el servidor responde `400` con un mensaje | ese mensaje en una alerta, y tu texto sigue ahí |
| envías con el campo vacío | `Escribe un título`, sin petición |

## Pruébalo con la API de práctica

Un `POST` no se puede hacer escribiendo la URL en el navegador. Abre la consola (F12) en la app y pega:

```js
fetch("http://localhost:4321/api/practica/tareas", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ titulo: "" }),
}).then(async (r) => console.log(r.status, await r.json()));
```

Verás `400 { error: "El título es obligatorio" }`. Cambia el título y verás el `201`. Luego abre `http://localhost:4321/api/practica/tareas` para ver tu tarea en la lista. Con `?retraso=2000` en la URL del POST podrás ver tu botón "Guardando..." un buen rato.

## Por qué importa

Formularios que envían datos hay en todas partes: registro, contacto, checkout. El doble envío (el usuario hace dos clics y se crean dos pedidos) es un bug clásico que en una entrevista te preguntan cómo evitar. Y mostrar el mensaje de validación del servidor es lo que separa un formulario profesional de uno que solo dice "Error".
