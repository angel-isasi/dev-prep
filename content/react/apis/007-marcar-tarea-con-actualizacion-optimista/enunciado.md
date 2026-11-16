Crea el componente `ListaTareas`, que muestra tus tareas con un checkbox cada una y permite marcarlas como hechas con una **actualización optimista**. No recibe props.

Cuando das "me gusta" en una red social, el corazón se pinta al instante, sin esperar al servidor. Eso es una **actualización optimista**: asumes que el servidor dirá que sí, cambias la pantalla de inmediato y, si al final dice que no, **deshaces** el cambio y avisas. La app se siente instantánea aunque la red sea lenta.

## Reglas

**Carga inicial**
- Pide `GET /api/practica/tareas` al montar (responde `[{ id, titulo, hecha }]`).
- Mientras carga: `<p role="status">Cargando tareas...</p>`. Si falla: `<p role="alert">No se pudieron cargar las tareas.</p>`.
- Una `<ul>` con un `<li>` por tarea, y dentro un `<label>` con un `<input type="checkbox">` (marcado si `hecha`) y el `titulo`. Así el nombre accesible del checkbox es el título.

**Al hacer clic en un checkbox**
- **Al instante** (sin esperar), la tarea cambia a su nuevo valor de `hecha`.
- Envía `fetch("/api/practica/tareas/<id>", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hecha: <nuevo valor> }) })`.
- Mientras **ese** PATCH no responda, **ese** checkbox está deshabilitado. Los demás siguen usables.
- Si el PATCH sale bien: no cambies nada más (ya estaba bien).
- Si el PATCH falla (`ok` en `false` o sin conexión): **deshaz solo esa tarea** (vuelve a su valor anterior) y muestra `<p role="alert">No se pudo actualizar "<titulo>". Inténtalo de nuevo.</p>`.
- Cada nuevo clic borra el aviso anterior.

**El detalle difícil:** el usuario puede marcar dos tareas seguidas antes de que respondan. Si la primera falla y la segunda sale bien, al deshacer la primera **no** debes deshacer la segunda. Guardar una copia de toda la lista y restaurarla no sirve.

## Ejemplo

| Pasa esto | Se ve |
|---|---|
| clic en "Resolver un reto de React" | marcada al instante, deshabilitada |
| el servidor responde `200` | sigue marcada, se habilita |
| o el servidor responde `500` | se desmarca y aparece `No se pudo actualizar "Resolver un reto de React". Inténtalo de nuevo.` |
| marcas la 2 y la 3; la 3 sale bien, la 2 falla | la 2 se desmarca, la 3 sigue marcada |

## Pruébalo con la API de práctica

Desde la consola del navegador (F12), con la app abierta:

```js
fetch("http://localhost:4321/api/practica/tareas/2?fallo=0.5", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ hecha: true }),
}).then(async (r) => console.log(r.status, await r.json()));
```

La mitad de las veces responde `500`. Si en tu componente usas `?fallo=0.5&retraso=1500` en la URL del PATCH, verás la casilla marcarse al instante y, a veces, volver atrás con el aviso.

## Por qué importa

La actualización optimista es la técnica detrás de las interfaces que se sienten "rápidas" (likes, carritos, listas de pendientes). Implementarla bien exige pensar en el fallo y en la concurrencia: es el tipo de detalle que en una entrevista muestra criterio de producto, no solo de código.
