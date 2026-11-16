## TICKET-101: el total de los pedidos no suma bien

**Tipo:** bug · **Prioridad:** alta · **Reportado por:** Rosa Huamán, administradora del local de Miraflores

> Ayer cobramos de menos en varias mesas. El pedido **#1041** de José Quispe es de **2 ceviches clásicos** (S/ 38 cada uno) y **1 jarra de chicha morada** (S/ 18). Tendría que cobrar **S/ 94.00**, pero el panel dice **S/ 56.00**. Parece que solo cuenta un plato de cada uno. Los pedidos de delivery sí salen bien, no sé por qué.

### Pasos para reproducir

1. Abre el panel (`npx vite`).
2. Mira la tarjeta del pedido **#1041**.
3. El total dice `S/ 56.00`. **Esperado:** `S/ 94.00`.

### Criterios de aceptación

- [ ] El total de cada pedido multiplica el precio de cada item por su cantidad: #1041 muestra `Total: S/ 94.00` y #1043 (3 ajíes de gallina) `Total: S/ 96.00`.
- [ ] Los items que no traen `quantity` cuentan como 1. Los pedidos de delivery siguen saliendo bien: #1042 muestra `Total: S/ 51.50`.
- [ ] Un pedido sin items suma `0`.
- [ ] Los tests del equipo (`tests/utils.test.js`) siguen pasando.

### Qué entrenas

- Ir del síntoma (un número mal en pantalla) a la función que lo calcula, sin leer todo el proyecto.
- Leer los comentarios y los datos de otro dev: ahí está la razón de por qué el delivery "sí sale bien".
- Entender por qué un test que pasa no garantiza que no haya bugs: el test del equipo existía, pero no cubría este caso.

## Pistas

1. El total se muestra en `OrderCard.jsx`, pero no se calcula ahí: sigue el `import` de la función que usa. En VS Code, `Ctrl` + clic sobre el nombre te lleva a su definición.
2. Antes de arreglar, abre `src/data/orders.js` y compara un pedido de salón con uno de delivery. Luego mira el test de `calcOrderTotal` en `tests/utils.test.js`: ¿qué cantidad tienen todos sus items?
