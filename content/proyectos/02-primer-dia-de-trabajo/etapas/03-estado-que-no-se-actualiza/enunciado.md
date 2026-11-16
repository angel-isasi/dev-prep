## TICKET-103: el pedido no cambia de estado al hacer clic

**Tipo:** bug · **Prioridad:** crítica · **Reportado por:** Julio Ccori, jefe de cocina

> Cuando aprieto **"Marcar como listo"** no pasa nada. La tarjeta sigue diciendo "En cocina" y el contador de arriba no cambia. Los mozos creen que el plato no está y se enfría en la barra. Lo raro es que si alguien marca y desmarca **"Ocultar entregados"**, de pronto aparece bien. Y si recargo la página también sale bien, o sea que sí se guarda.

### Pasos para reproducir

1. Abre el panel.
2. En el pedido **#1042** (Pendiente), haz clic en **"Enviar a cocina"**.
3. La tarjeta sigue en "Pendiente" y arriba sigue `Pendientes: 3`.
4. Marca "Ocultar entregados": recién ahí la tarjeta pasa a "En cocina".

**Esperado:** apenas termina el clic, la tarjeta muestra el estado nuevo, su botón cambia y los contadores se actualizan.

### Criterios de aceptación

- [ ] Al hacer clic en el botón de una tarjeta, su estado cambia en pantalla sin hacer nada más (#1042 pasa a `En cocina` y su botón a `Marcar como listo`).
- [ ] Los contadores de la cabecera se actualizan al mismo tiempo (`Pendientes: 2`, `En cocina: 2`).
- [ ] Si "Ocultar entregados" está marcado y entregas un pedido, la tarjeta desaparece al instante.
- [ ] El cambio se sigue guardando en la API y los demás pedidos no cambian.
- [ ] El arreglo no modifica (no muta) objetos ni arrays que están en el estado.

### Qué entrenas

- Seguir un evento desde el botón hasta quien de verdad cambia los datos: `OrderCard` → prop `onAdvance` → `App`.
- Entender por qué React no vuelve a pintar si le pasas el mismo array a `setState`, aunque por dentro hayas cambiado algo.
- Leer las convenciones del equipo (el README) y comparar con código del mismo proyecto que sí lo hace bien.

## Pistas

1. El botón está en `OrderCard.jsx`, pero ahí solo se llama a `onAdvance(order.id)`. Busca en VS Code (`Ctrl` + `Shift` + `F`) quién le pasa `onAdvance` y qué hace esa función con el pedido después de llamar a la API.
2. React compara el estado nuevo con el anterior con `Object.is`: si es el mismo array, no vuelve a renderizar. Mira cómo `MenuPanel.jsx` actualiza un plato después de `setDishAvailability`: ese es el patrón del equipo.
