Exporta `crearApp()` con un **CRUD** completo de tareas en memoria. CRUD son las cuatro operaciones básicas sobre datos: **C**reate (crear), **R**ead (leer), **U**pdate (actualizar) y **D**elete (borrar). Es lo primero que te piden en una prueba técnica de backend.

Cada llamada a `crearApp()` empieza con sus **propios** datos (no compartidos con otras apps):

```js
[
  { id: 1, titulo: "Estudiar Express", hecha: false },
  { id: 2, titulo: "Practicar SQL", hecha: true },
]
```

## Rutas REST

En una API REST, la URL nombra el **recurso** (`/tareas` es la colección, `/tareas/1` una tarea) y el **método** dice qué hacer con él:

| Método | Ruta | Qué hace | Éxito | Errores |
|---|---|---|---|---|
| `GET` | `/tareas` | lista todas | `200` + arreglo | |
| `GET` | `/tareas/:id` | una tarea | `200` + tarea | `404` |
| `POST` | `/tareas` | crea con `{ titulo }` | `201` + tarea nueva | `400` |
| `PUT` | `/tareas/:id` | reemplaza con `{ titulo, hecha }` | `200` + tarea actualizada | `404`, `400` |
| `DELETE` | `/tareas/:id` | borra | `204` sin cuerpo | `404` |

`204 No Content` significa "hecho, y no tengo nada que devolverte". La respuesta no lleva cuerpo.

## Reglas

- Mensajes de error (en `{ "error": "..." }`):
  - id que no existe: `"Tarea no encontrada"`.
  - `POST` sin `titulo` válido (texto no vacío tras `trim`): `"El título es obligatorio"`.
  - `PUT` con `titulo` inválido o `hecha` que no sea booleano: `"Envía titulo (texto) y hecha (true o false)"`.
- Una tarea nueva empieza con `hecha: false` y el siguiente id libre (la primera será la `3`).
- En `PUT`, primero revisa que la tarea exista (`404`) y después valida el cuerpo (`400`).
- Guarda el título recortado (`trim`).

## Ejemplos

```js
// POST /tareas   { "titulo": "Leer sobre REST" }
// 201
{ "id": 3, "titulo": "Leer sobre REST", "hecha": false }

// PUT /tareas/1   { "titulo": "Estudiar Express 5", "hecha": true }
// 200
{ "id": 1, "titulo": "Estudiar Express 5", "hecha": true }

// DELETE /tareas/2
// 204 (sin cuerpo)

// GET /tareas/2
// 404 { "error": "Tarea no encontrada" }
```
