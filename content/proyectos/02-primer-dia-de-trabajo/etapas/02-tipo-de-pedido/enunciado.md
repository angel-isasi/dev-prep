## TICKET-102: mostrar si el pedido es de mesa, delivery o para llevar

**Tipo:** mejora · **Prioridad:** media · **Reportado por:** Rosa Huamán, administradora del local de Miraflores

> En hora punta los mozos no saben a dónde va cada pedido: tienen que preguntar en cocina si es para la mesa 4 o para el motorizado. Queremos que cada tarjeta diga claramente si es **de mesa (y cuál)**, **delivery** o **para llevar**.
>
> Otra cosa: a primera hora, cuando todavía no hay pedidos, el panel sale en blanco y parece que se colgó. Que diga algo.

### Criterios de aceptación

- [ ] Cada tarjeta muestra el tipo de pedido en su propia etiqueta (por ejemplo, un `<span>`), con uno de estos textos exactos:
  - Pedido en el salón: `Mesa N`, con su número de mesa (el pedido #1041 dice `Mesa 4`).
  - Delivery: `Delivery`.
  - Recojo en el local: `Para llevar`.
- [ ] Si no hay pedidos que mostrar, en lugar de la lista aparece el texto `No hay pedidos por ahora`. Esto incluye el caso en que "Ocultar entregados" esconde todos.
- [ ] No cambia nada más de la tarjeta: el código, el cliente, el estado, los items, el total y el botón siguen igual.

### Qué entrenas

- Encontrar el componente que pinta lo que negocio quiere cambiar.
- Revisar qué datos ya llegan de la API antes de pedir "que el backend lo mande".
- Renderizado condicional y estados vacíos, un detalle que se nota mucho en producción.

## Pistas

1. El dato ya existe: busca `type` y `table` en `src/data/orders.js` (el comentario de arriba explica los valores). La tarjeta es `src/components/OrderCard.jsx`.
2. El mensaje vacío va en el componente que recibe la lista y hace el `map`, no en `App`. Ya hay un `TODO` de otra persona que te dice dónde.
