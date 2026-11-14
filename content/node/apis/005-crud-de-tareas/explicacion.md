## Idea clave

Un CRUD REST son cinco rutas sobre el mismo recurso: la URL nombra **qué** (`/tareas` o `/tareas/:id`) y el método dice **qué hacer** (`GET` leer, `POST` crear, `PUT` reemplazar, `DELETE` borrar). Casi todas repiten "buscar por id o 404", así que conviene una función ayudante. Los datos viven **dentro** de `crearApp`, por eso cada app tiene los suyos.

## Paso a paso

1. **Datos dentro de `crearApp`.** El arreglo `tareas` y el contador `siguienteId` se crean en cada llamada. Si los pusieras fuera (a nivel de módulo), todas las apps compartirían la misma lista y un test podría romper al siguiente.
2. **Ayudantes.** `buscar(idTexto)` convierte el id y busca; `noEncontrada(res)` responde el 404. Evitas copiar lo mismo cinco veces.
3. **Los dos GET.** Lista completa y una tarea (o 404). Igual que en el ejercicio 002.
4. **POST.** Valida el título, crea `{ id: siguienteId++, titulo: titulo.trim(), hecha: false }`, haz `push` y responde `201`.
5. **PUT.** Primero `buscar` (si no existe, 404: no tiene sentido validar un cuerpo para algo que no está). Luego valida que `titulo` sea texto no vacío y `hecha` sea booleano. Como `find` te devolvió **el mismo objeto** que está en el arreglo, cambiar `tarea.titulo` cambia la tarea guardada.
6. **DELETE.** Para quitar un elemento necesitas su **posición**: `findIndex` da el índice o `-1`. Con `splice(indice, 1)` lo quitas del arreglo, y `res.sendStatus(204)` responde sin cuerpo.

```js
app.put("/tareas/:id", (req, res) => {
  const tarea = buscar(req.params.id);
  if (!tarea) return noEncontrada(res);
  const { titulo, hecha } = req.body ?? {};
  if (!esTituloValido(titulo) || typeof hecha !== "boolean") {
    return res.status(400).json({ error: "Envía titulo (texto) y hecha (true o false)" });
  }
  tarea.titulo = titulo.trim();
  tarea.hecha = hecha;
  res.json(tarea);
});

app.delete("/tareas/:id", (req, res) => {
  const indice = tareas.findIndex((t) => t.id === Number(req.params.id));
  if (indice === -1) return noEncontrada(res);
  tareas.splice(indice, 1);
  res.sendStatus(204);
});
```

## Por qué funciona

Una secuencia sobre la misma app:

| Petición | Estado de `tareas` después | Respuesta |
|---|---|---|
| `POST /tareas` `{ titulo: "Leer sobre REST" }` | 1, 2, **3** | `201` `{ id: 3, ..., hecha: false }` |
| `PUT /tareas/1` `{ titulo: "Estudiar Express 5", hecha: true }` | **1 cambiada**, 2, 3 | `200` con la tarea 1 nueva |
| `PUT /tareas/1` `{ titulo: "Algo", hecha: "si" }` | sin cambios | `400` (`"si"` es texto, no booleano) |
| `DELETE /tareas/2` | 1, 3 | `204`, cuerpo vacío |
| `GET /tareas/2` | 1, 3 | `404` |
| `DELETE /tareas/2` | 1, 3 | `404` (ya no existe) |

En el PUT, `find` devuelve una **referencia** al objeto del arreglo, no una copia. Por eso `tarea.hecha = true` actualiza lo guardado y el `GET` siguiente ya lo ve.

El último test crea una **segunda** app: como su `tareas` se creó en otra llamada a `crearApp`, sigue teniendo 2 tareas aunque la primera tenga 3.

## Errores comunes

- **Declarar `tareas` fuera de `crearApp`**: los datos se comparten entre apps y falla "cada crearApp() tiene sus propios datos".
- **Usar `filter` para borrar y reasignar** (`tareas = tareas.filter(...)`) con `const tareas`: da "Assignment to constant variable". Con `let tareas` sí funciona (las funciones ayudantes leen la variable, así que ven el arreglo nuevo); `splice` es la otra opción: modifica el mismo arreglo sin reasignar.
- **Comprobar `if (!indice)`** después de `findIndex`: el índice `0` es falsy y nunca podrías borrar la primera tarea. Compara con `-1`.
- **Responder `res.status(204).json({ ok: true })`**: el 204 por definición no lleva cuerpo; Express lo descarta y el cliente puede confundirse.
- **Validar `hecha` con `if (!hecha)`**: rechazarías `false`, que es un valor válido.
- **Validar antes de buscar en PUT**: `PUT /tareas/99` con cuerpo malo daría 400 en vez de 404. Los dos son defendibles, pero el enunciado pide 404 primero.

## Otra forma de resolverlo

**Con `Map` en vez de arreglo**, usando el id como clave:

```js
const tareas = new Map([
  [1, { id: 1, titulo: "Estudiar Express", hecha: false }],
  [2, { id: 2, titulo: "Practicar SQL", hecha: true }],
]);
app.get("/tareas", (req, res) => res.json([...tareas.values()]));
app.delete("/tareas/:id", (req, res) => {
  if (!tareas.delete(Number(req.params.id))) return noEncontrada(res);
  res.sendStatus(204);
});
```

Buscar y borrar son O(1) en vez de O(n), y `delete` ya te dice si existía. El arreglo es más simple de leer y de devolver como JSON. Con pocos datos da igual; en una base real esto lo resuelve la base de datos (ejercicio 010).

**PATCH en vez de PUT**: `PATCH` es actualización **parcial** (mandas solo `{ hecha: true }`). `PUT` reemplaza el recurso completo, por eso aquí se exigen los dos campos. En entrevistas preguntan esta diferencia.

## Cómo explicarlo en la entrevista

> "Diseño el CRUD con rutas REST: la URL identifica el recurso y el método la acción. GET para leer la lista o una tarea, POST para crear con 201, PUT para reemplazar completo con 200 y DELETE con 204 sin cuerpo. Las rutas con id comparten el paso de buscar y responder 404, así que lo saco a una función. Valido el cuerpo en POST y PUT con 400. Los datos los creo dentro de crearApp para que cada instancia tenga su propio estado, lo que hace los tests independientes. Si me preguntan, PUT reemplaza todo y PATCH actualiza solo lo que mandas."

## Conceptos

- **CRUD**: crear, leer, actualizar, borrar.
- **REST**: recursos en la URL, acciones en el método.
- **Métodos HTTP**: `GET`, `POST`, `PUT`, `DELETE` (y `PATCH` para parcial).
- **Códigos**: `200`, `201`, `204 No Content`, `400`, `404`.
- **`res.sendStatus`**: responde solo con el código.
- **`find` vs `findIndex` + `splice`**: buscar para leer, posición para borrar.
- **Referencias**: modificar el objeto que devuelve `find` modifica el guardado.
- **Estado aislado**: datos creados dentro de la función, no compartidos.
