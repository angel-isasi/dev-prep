El cliente quiere ver el estado de su pedido sin recargar la página. Como el servidor no avisa solo, la app **pregunta cada cierto tiempo** (eso se llama *polling*) y **deja de preguntar** cuando el pedido llega a su estado final.

Crea el componente `EstadoPedido`.

## Reglas

- Exporta `EstadoPedido({ consultar, cada = 1000 })`.
  - `consultar()` es una función asíncrona que devuelve el estado actual como texto (`"en camino"`, `"entregado"`...).
  - `cada` son los milisegundos entre consultas (por defecto 1000).
- El estado empieza en `"preparando"`. Muestra `<p>Tu pedido está: {estado}</p>`.
- Cada `cada` milisegundos, llama a `consultar()` y muestra el estado que devuelve. La primera consulta ocurre a los `cada` ms, no al montar.
- Cuando el estado es `"entregado"`, **deja de consultar** (no debe quedar ningún intervalo vivo).
- Si una consulta falla, ignórala: se vuelve a intentar en la siguiente vuelta.
- Al desmontar, el intervalo se limpia.

## Ejemplo

| Tiempo | `consultar()` devuelve | Se ve |
|---|---|---|
| 0 s | | `Tu pedido está: preparando` |
| 1 s | `"en camino"` | `Tu pedido está: en camino` |
| 2 s | `"entregado"` | `Tu pedido está: entregado` |
| 3 s en adelante | (ya no se llama) | `Tu pedido está: entregado` |

## Por qué importa

El polling aparece en seguimiento de pedidos, pagos pendientes o procesos largos. Combina tres cosas que se evalúan en entrevistas: un **intervalo dentro de `useEffect` con limpieza**, una **condición de parada** expresada con las dependencias del efecto, y **async dentro de un temporizador**.
