Crea el componente `Conversor` con **dos inputs sincronizados**: soles y dólares. Al escribir en uno, el otro se actualiza solo con la conversión. Usa un tipo de cambio fijo de **3.75 soles por dólar**.

## Reglas

- Un input con la etiqueta accesible **"Soles"** y otro con **"Dólares"** (usa `<label>` o `aria-label`).
- Al inicio, los dos están **vacíos**.
- Lo que escribes en un input **se queda tal cual** lo escribiste (no se reformatea mientras escribes).
- El **otro** input muestra la conversión con **2 decimales** (`toFixed(2)`):
  - dólares = soles / 3.75
  - soles = dólares × 3.75
- Si el input que editas queda vacío o no es un número, el otro queda **vacío**.
- Usa **una sola fuente de verdad**: no guardes los dos montos en dos estados independientes.

## Ejemplo

| Escribes en | Texto | Se ve en Soles | Se ve en Dólares |
|---|---|---|---|
| (inicio) | | (vacío) | (vacío) |
| Soles | `75` | `75` | `20.00` |
| Dólares | `1` | `3.75` | `1` |
| Dólares | `10` | `37.50` | `10` |
| Soles | (lo borras) | (vacío) | (vacío) |
| Soles | `abc` | `abc` | (vacío) |

## Por qué importa

Es el ejemplo clásico de la documentación de React ("levantar el estado", el conversor de temperaturas). Evalúa si sabes identificar **cuál es el dato mínimo** que hay que guardar y qué se puede **calcular**, evitando dos estados que se desincronizan.
