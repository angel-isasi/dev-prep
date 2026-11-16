## TICKET-105: el panel dice que no hay pedidos cuando se cae el internet

**Tipo:** bug · **Prioridad:** alta · **Reportado por:** Rosa Huamán, administradora del local de Miraflores

> Hoy a la 1 p. m. se cayó el wifi un ratito y el panel dijo **"No hay pedidos por ahora"**. La cocina pensó que no había nada y se quedaron parados, pero había 12 pedidos. Si no hay conexión, que lo diga claro y que podamos volver a intentar sin recargar la página. Y cuando recién abre, que no diga "no hay pedidos" mientras todavía está cargando.

### Pasos para reproducir

1. Para simular la caída, en `src/api.js` agrega temporalmente `throw new Error("Sin conexión");` como primera línea dentro de la función que le pasa `getOrders` a `respond` (no lo dejes en el PR). Los tests hacen lo mismo con `failNextRequest("getOrders")`.
2. Abre el panel: dice `No hay pedidos por ahora`. En la consola del navegador aparece el error.

**Esperado:** un aviso de error con un botón para reintentar.

### Criterios de aceptación

- [ ] Mientras se cargan los pedidos, la sección "Pedidos" muestra `Cargando pedidos...` y **no** muestra `No hay pedidos por ahora`.
- [ ] Si la API falla, la sección muestra un aviso con `role="alert"` que dice `No se pudieron cargar los pedidos.` y un botón `Reintentar`. No muestra tarjetas ni el mensaje de "no hay pedidos".
- [ ] `Reintentar` vuelve a pedir los pedidos: mientras tanto muestra `Cargando pedidos...` y, si responde bien, desaparece el aviso y salen las tarjetas.
- [ ] Si el servidor responde con una lista vacía, recién ahí sale `No hay pedidos por ahora`.
- [ ] La carta carga por su lado: si fallan los pedidos, la carta igual se muestra.
- [ ] Lo de los tickets anteriores sigue funcionando (búsqueda, avanzar estado, totales).

### Qué entrenas

- Modelar los estados de una petición: cargando, error, listo y vacío.
- Encontrar en el mismo proyecto un patrón que ya resuelve el problema y seguirlo, para que el código se vea del mismo equipo.
- Cerrar un `TODO` que dejó otro dev, y quitar el comentario cuando ya no aplica.

## Pistas

1. Hay un `TODO` de Diego justo donde se piden los pedidos en `App.jsx`. Y otro componente del proyecto ya carga sus datos con carga, error y reintento: mira cómo lo hace `MenuPanel.jsx` (un solo estado `status`, una función de carga con `try`/`catch` y `useCallback`).
2. No borres el buscador ni el filtro: el aviso y el "Cargando..." reemplazan solo a la lista. Un `if` por estado antes del `return`, o tres bloques `{status === "..." && ...}` como en la carta, se leen mejor que ternarios anidados.
