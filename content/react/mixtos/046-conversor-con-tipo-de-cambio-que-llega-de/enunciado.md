Crea el componente `ConversorDolares` que convierte soles a dólares. El tipo de cambio no se conoce de antemano: llega de una API. El componente recibe la prop `obtenerTasa`, una función **asíncrona** que devuelve cuántos soles vale un dólar (por ejemplo, `4`).

```jsx
<ConversorDolares obtenerTasa={async () => 4} />
```

## Reglas

- Un input con la etiqueta **"Monto en soles"** (usa `<label htmlFor>`), que empieza con el valor `"100"`.
- Al montarse, el componente llama **una sola vez** a `obtenerTasa()`.
- Mientras espera, muestra **"Consultando el tipo de cambio…"** (con el carácter de puntos suspensivos `…`).
- Si la promesa falla, muestra **"No pudimos obtener el tipo de cambio."** en un elemento con `role="alert"`.
- Cuando llega la tasa:
  - Si el monto es válido, muestra **"Equivale a US$ {resultado}"** con 2 decimales (`monto / tasa`).
  - Si el monto está vacío, no es un número o es negativo, muestra **"Escribe un monto válido."**
- Si el componente se desmonta antes de que llegue la respuesta, no debe intentar actualizar el estado.

## Ejemplo

Con `obtenerTasa={async () => 4}`:

| Momento o lo que escribe el usuario | Se ve |
|---|---|
| Recién montado | Consultando el tipo de cambio… |
| Llega la tasa (input en "100") | Equivale a US$ 25.00 |
| `10` | Equivale a US$ 2.50 |
| `abc`, vacío o `-5` | Escribe un monto válido. |

## Por qué importa

Pedir datos al montar, mostrar los estados de carga y error, y validar números que vienen de un input (que **siempre** son texto) son tareas diarias en frontend. Además, cuidar que una respuesta tardía no actualice un componente que ya no existe demuestra que entiendes la limpieza de los efectos.
