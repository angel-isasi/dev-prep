## En una frase

Una API REST organiza el servidor en **recursos** con URLs de sustantivos (`/tareas`, `/tareas/3`) y usa el **método HTTP** para decir la acción y el **código de estado** para decir cómo salió.

## Lo esencial

### La idea de REST

REST es un estilo, no una librería. Sus reglas prácticas:
- La URL nombra **qué** (un sustantivo en plural): `/tareas`, no `/obtenerTareas` ni `/borrarTarea`.
- El método dice **qué hacer** con eso.
- Cada petición trae todo lo necesario (el servidor no recuerda la petición anterior: es *stateless*).
- Se responde con JSON y con el código de estado adecuado.

### CRUD con métodos

CRUD = Create, Read, Update, Delete: las cuatro operaciones de casi cualquier pantalla.

| Acción | Método y ruta | Cuerpo que llega | Respuesta si sale bien |
|---|---|---|---|
| Listar | `GET /tareas` | | `200` + array |
| Ver una | `GET /tareas/3` | | `200` + objeto, o `404` |
| Crear | `POST /tareas` | `{ "titulo": "..." }` | `201` + el objeto creado (con su `id`) |
| Reemplazar | `PUT /tareas/3` | el objeto completo | `200` + objeto actualizado |
| Modificar parte | `PATCH /tareas/3` | `{ "hecha": true }` | `200` + objeto actualizado |
| Borrar | `DELETE /tareas/3` | | `204` sin cuerpo, o `404` |

### Leer el cuerpo: `express.json()`

Express no lee el cuerpo por su cuenta. Este middleware (lo verás en el siguiente tema) convierte el JSON que llega en `req.body`:

```js
const app = express();
app.use(express.json()); // sin esta línea, req.body es undefined
```

### Una API CRUD completa

```js
export function crearApp() {
  const app = express();
  app.use(express.json());

  let tareas = [{ id: 1, titulo: "Estudiar SQL", hecha: false }];
  let siguienteId = 2;

  app.get("/tareas", (req, res) => res.json(tareas));

  app.post("/tareas", (req, res) => {
    const { titulo } = req.body ?? {};
    if (typeof titulo !== "string" || titulo.trim() === "") {
      return res.status(400).json({ error: "El título es obligatorio" });
    }
    const nueva = { id: siguienteId++, titulo: titulo.trim(), hecha: false };
    tareas.push(nueva);
    res.status(201).json(nueva);
  });

  app.patch("/tareas/:id", (req, res) => {
    const tarea = tareas.find((t) => t.id === Number(req.params.id));
    if (!tarea) return res.status(404).json({ error: "Tarea no encontrada" });
    if (req.body?.hecha !== undefined) tarea.hecha = Boolean(req.body.hecha);
    res.json(tarea);
  });

  app.delete("/tareas/:id", (req, res) => {
    const antes = tareas.length;
    tareas = tareas.filter((t) => t.id !== Number(req.params.id));
    if (tareas.length === antes) return res.status(404).json({ error: "Tarea no encontrada" });
    res.sendStatus(204); // borrado, no hay nada que devolver
  });

  return app;
}
```

### Validar la entrada

**Nunca confíes en lo que llega**: el frontend puede tener un bug, o alguien puede llamar a tu API con lo que quiera. Antes de guardar:
- ¿Llegaron los campos obligatorios? ¿Son del tipo correcto (texto, número)?
- ¿Tienen valores razonables (precio mayor que 0, email con `@`)?
- Si algo falla: `400` con un mensaje claro y **no guardes nada**.

```js
function validarProducto(body) {
  const errores = [];
  if (typeof body?.nombre !== "string" || !body.nombre.trim()) errores.push("nombre es obligatorio");
  if (typeof body?.precio !== "number" || body.precio <= 0) errores.push("precio debe ser un número mayor que 0");
  return errores;
}
// en la ruta:
const errores = validarProducto(req.body);
if (errores.length) return res.status(400).json({ errores });
```

### Probar una API con `fetch`

Así prueban los tests de dev-prep tus APIs, y así llamaría tu frontend:

```js
// GET
const r1 = await fetch(`${url}/tareas`);
r1.status;        // 200
await r1.json();  // [{ id: 1, ... }]

// POST con cuerpo JSON
const r2 = await fetch(`${url}/tareas`, {
  method: "POST",
  headers: { "Content-Type": "application/json" }, // sin esto Express no lo lee como JSON
  body: JSON.stringify({ titulo: "Repasar REST" }), // el cuerpo va como texto
});
r2.status;        // 201

// DELETE
const r3 = await fetch(`${url}/tareas/1`, { method: "DELETE" });
r3.status;        // 204 (no llames r3.json(): no hay cuerpo)
```

## Errores típicos

**1. Verbos en la URL**

`POST /crearTarea`, `GET /borrarTarea?id=3`. En REST la acción la dice el método: `POST /tareas`, `DELETE /tareas/3`. Un `GET` nunca debe modificar datos.

**2. Olvidar `express.json()`**

```js
const { titulo } = req.body; // TypeError: Cannot destructure property 'titulo' of 'req.body' as it is undefined
```

**3. Enviar el cuerpo sin `JSON.stringify` o sin el header**

```js
fetch(url, { method: "POST", body: { titulo: "x" } }); // llega "[object Object]"
```
El cuerpo va como texto con `JSON.stringify` y con `"Content-Type": "application/json"`.

**4. Responder 200 a todo**

Crear debe dar `201`, borrar `204`, datos inválidos `400`, recurso inexistente `404`. El frontend decide qué mostrar según el código.

**5. Guardar antes de validar**

Si haces `push` y luego validas, ya quedó guardado un dato roto. Valida primero, guarda después.

**6. Pedir `.json()` a un 204**

`await r.json()` sobre una respuesta sin cuerpo lanza `SyntaxError: Unexpected end of JSON input`.

## Chuleta

- Recursos en plural: `/tareas`, `/tareas/:id`.
- `GET` leer (200), `POST` crear (201), `PUT`/`PATCH` actualizar (200), `DELETE` borrar (204).
- `400` datos inválidos, `404` no existe.
- `app.use(express.json())` para tener `req.body`.
- Valida tipo y valor de cada campo antes de guardar.
- `fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(datos) })`.
- `res.sendStatus(204)` para responder sin cuerpo.

## En la entrevista

**¿Qué es una API REST?**
Es una forma de diseñar APIs sobre HTTP donde cada recurso tiene una URL (por ejemplo `/usuarios/5`), las acciones se expresan con los métodos HTTP (GET, POST, PUT, PATCH, DELETE), el servidor no guarda estado entre peticiones y las respuestas usan códigos de estado y normalmente JSON.

**¿Qué diferencia hay entre PUT y PATCH?**
`PUT` reemplaza el recurso completo con lo que envías; `PATCH` modifica solo los campos que mandas y deja el resto igual.

**¿Qué código devuelves al crear y al borrar?**
Al crear, `201 Created` con el recurso creado (incluyendo su `id`). Al borrar, `204 No Content`, porque no hay nada que devolver. Si el recurso no existe, `404`.

**¿Por qué validar en el servidor si ya valido en el formulario?**
Porque la validación del frontend se puede saltar: cualquiera puede llamar a la API directamente con `fetch` o Postman. La del frontend es para la experiencia del usuario; la del servidor es la que protege los datos.
