Crea un interruptor (switch) **controlado**: no tiene estado propio, recibe su valor por props y avisa al padre cuando quiere cambiar. El padre decide y, como conoce el valor, puede reaccionar a él.

Exporta dos componentes:

- `Interruptor({ activo, onCambio, etiqueta })`: el switch, sin estado.
- `Opciones()`: el padre, que guarda si el delivery está activo y muestra el costo de envío.

## Reglas

- `Interruptor`:
  - Es un `<button>` con `role="switch"` y `aria-checked` igual a `activo` (así los lectores de pantalla y los tests saben si está prendido).
  - Su texto es la etiqueta, dos puntos y **"sí"** o **"no"**, por ejemplo **"Delivery: no"**.
  - Al hacer clic llama a `onCambio(!activo)`. **No** cambia nada por su cuenta: si el padre no actualiza `activo`, el interruptor se queda igual.
- `Opciones`:
  - Guarda `delivery` en un estado (empieza en `false`).
  - Pinta `<Interruptor etiqueta="Delivery" ... />` conectado a ese estado.
  - Si `delivery` está activo, muestra un `<p>` con **"Costo de envío: S/ 5"**.

## Ejemplo

```jsx
<Opciones />
```

| Acción | `aria-checked` | Se ve |
|---|---|---|
| (inicio) | `false` | Delivery: no |
| Clic en el switch | `true` | Delivery: sí, Costo de envío: S/ 5 |
| Clic otra vez | `false` | Delivery: no |

## Por qué importa

"¿Qué es un componente controlado?" es pregunta típica. La respuesta va más allá de los inputs: cualquier componente que recibe su valor y un `onCambio` por props es controlado, y eso permite que el padre **reaccione** al valor (aquí, mostrar el costo de envío).
