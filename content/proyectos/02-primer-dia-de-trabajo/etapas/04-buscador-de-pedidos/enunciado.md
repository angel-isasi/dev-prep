## TICKET-104: buscador de pedidos para la hora punta

**Tipo:** feature · **Prioridad:** media · **Reportado por:** Rosa Huamán, administradora del local de Miraflores

> Al mediodía tenemos más de 40 pedidos en pantalla y cuando un cliente llama ("¿ya sale lo de Quispe?") tardamos en encontrarlo. Queremos un buscador arriba de la lista de pedidos para buscar por **nombre del cliente** o por **número de pedido**. Que funcione igual que el de la carta, que a los mozos les gusta.

**Comentario de Diego (tech lead):** ojo, ya tenemos piezas para esto. No escribas otro buscador desde cero.

### Criterios de aceptación

- [ ] La sección "Pedidos" tiene un campo de búsqueda con el nombre accesible `Buscar pedidos` (y un placeholder como `Cliente o número de pedido`).
- [ ] Busca por nombre del cliente sin importar tildes ni mayúsculas: `jose` encuentra a "José Quispe".
- [ ] Busca por número de pedido: `1043` deja solo el pedido #1043.
- [ ] Si nada coincide, en vez de la lista sale `No hay pedidos que coincidan`.
- [ ] Tiene el mismo botón para limpiar que el buscador de la carta (`Limpiar búsqueda`), y al usarlo vuelven todos los pedidos.
- [ ] Funciona junto con "Ocultar entregados": la búsqueda es sobre los pedidos visibles.
- [ ] Los contadores de la cabecera siguen contando **todos** los pedidos, no solo los que coinciden.
- [ ] El buscador de la carta sigue funcionando igual.

### Qué entrenas

- Explorar un proyecto para descubrir qué existe antes de escribir código (lo primero que te piden en un equipo).
- Reutilizar un componente y un hook propio con otros datos.
- Estado derivado: la lista filtrada se calcula en cada render, no se guarda en otro estado.

## Pistas

1. Abre `MenuPanel.jsx` y mira qué usa para su buscador. El README también lista lo que hay en `src/components/` y `src/hooks/`. Lee el comentario de arriba de `useSearch.js`: dice cómo se usa.
2. Piensa en el orden: primero "Ocultar entregados" y luego la búsqueda sobre ese resultado. ¿`id` es un texto o un número? Mira `matchesQuery` en `src/utils/text.js` antes de preocuparte. Para el mensaje, `OrderList` puede recibir el texto vacío como una prop nueva.
