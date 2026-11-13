## Idea clave

En vez de varios booleanos (`pagado`, `confirmado`...) que pueden combinarse de formas imposibles, el pedido tiene **un solo estado** y una **tabla de transiciones** que dice qué eventos acepta cada estado. Lo que no está en la tabla, simplemente no puede pasar. La misma tabla sirve para calcular el siguiente estado y para dibujar los botones.

## Paso a paso

1. **La tabla.** `TRANSICIONES` es un objeto de objetos: la primera clave es el estado actual, la segunda el evento, y el valor es el estado destino. `confirmado: {}` significa "estado final, no acepta eventos".
2. **`siguiente(estado, evento)`** busca en la tabla:
   - `TRANSICIONES[estado]` da los eventos de ese estado. Si el estado no existe, da `undefined`, y `?.` evita el error de leer `[evento]` sobre `undefined`.
   - `?.[evento]` da el destino, o `undefined` si el evento no está permitido.
   - `?? estado` convierte ese `undefined` en "me quedo donde estoy".
3. **`useReducer(siguiente, "carrito")`.** Un reducer es una función `(estado, accion) => nuevoEstado`. `siguiente` ya tiene esa forma, con el evento como acción. `enviar("pagar")` hace que React llame `siguiente(estadoActual, "pagar")` y guarde el resultado.
4. **Los botones salen de la tabla.** `Object.keys(TRANSICIONES[estado])` da los eventos permitidos ahora mismo. Un `map` crea un botón por cada uno. En `confirmado`, `Object.keys({})` es `[]`, así que no hay botones.

```jsx
import { useReducer } from "react";

export const TRANSICIONES = {
  carrito: { pagar: "pago" },
  pago: { confirmar: "confirmado", volver: "carrito" },
  confirmado: {},
};

export const siguiente = (estado, evento) => TRANSICIONES[estado]?.[evento] ?? estado;

export function Checkout() {
  const [estado, enviar] = useReducer(siguiente, "carrito");

  return (
    <div>
      <p>Paso: {estado}</p>
      {Object.keys(TRANSICIONES[estado]).map((evento) => (
        <button key={evento} onClick={() => enviar(evento)}>
          {evento}
        </button>
      ))}
    </div>
  );
}
```

## Por qué funciona

Recorrido de un pedido completo:

| Momento | `estado` | `Object.keys(TRANSICIONES[estado])` | Botones |
|---|---|---|---|
| Inicio | `"carrito"` | `["pagar"]` | pagar |
| `enviar("pagar")` | `siguiente("carrito", "pagar")` = `"pago"` | `["confirmar", "volver"]` | confirmar, volver |
| `enviar("confirmar")` | `siguiente("pago", "confirmar")` = `"confirmado"` | `[]` | ninguno |

¿Y un evento no permitido? `siguiente("carrito", "confirmar")`:

- `TRANSICIONES["carrito"]` es `{ pagar: "pago" }`.
- `{ pagar: "pago" }["confirmar"]` es `undefined`.
- `undefined ?? "carrito"` da `"carrito"`: no se mueve.

Además, como `siguiente` devuelve **el mismo valor** que ya había, React detecta que el estado no cambió y ni siquiera vuelve a renderizar. Y desde la interfaz es imposible enviar un evento no permitido, porque su botón no existe.

## Errores comunes

- **Modelar con varios booleanos** (`const [pagado, setPagado]`, `const [confirmado, setConfirmado]`). Aparecen combinaciones absurdas como `confirmado: true, pagado: false`. Es justo lo que esta técnica evita.
- **Escribir los botones a mano con `if`** (`{estado === "carrito" && <button>pagar</button>}`). Funciona, pero si agregas un estado tienes que tocar la tabla y la vista. Con `Object.keys` la vista siempre coincide con la tabla.
- **Olvidar el `?.`.** Con un estado desconocido, `TRANSICIONES["inventado"]["pagar"]` lanza `Cannot read properties of undefined`.
- **Usar `||` en vez de `??`.** Aquí da igual porque los destinos son textos no vacíos, pero `??` expresa la intención exacta: "solo si no hay destino".
- **Lanzar un error para eventos no permitidos.** En otros reducers tiene sentido lanzar con acciones desconocidas, pero en una máquina de estados ignorar el evento es el comportamiento esperado (un doble clic en "pagar" no debe romper nada).

## Otra forma de resolverlo

Con `switch` anidados, sin tabla:

```jsx
function siguiente(estado, evento) {
  switch (estado) {
    case "carrito":
      return evento === "pagar" ? "pago" : estado;
    case "pago":
      if (evento === "confirmar") return "confirmado";
      if (evento === "volver") return "carrito";
      return estado;
    default:
      return estado;
  }
}
```

**¿Cuándo conviene?** Cuando una transición necesita lógica (por ejemplo, "confirmar solo si el monto es mayor que cero") o datos extra en la acción. La tabla es mejor cuando las transiciones son fijas: se lee como un diagrama, y además te da gratis la lista de eventos para los botones. Si el flujo crece mucho (estados anidados, tiempos, reintentos), existe la librería XState.

## Cómo explicarlo en la entrevista

> "Modelé el checkout como una máquina de estados: un solo estado y una tabla que dice qué eventos acepta cada paso y a dónde llevan. La función `siguiente` busca en la tabla y, si el evento no está permitido, devuelve el mismo estado; como tiene forma de reducer, la paso directo a `useReducer`. Los botones los genero con las claves del estado actual, así la interfaz nunca ofrece una acción imposible, y en el estado final no aparece ninguno. Con esto evito los estados imposibles que salen cuando uno usa varios booleanos."

## Conceptos

- **Máquina de estados finita**: un conjunto de estados y las transiciones permitidas entre ellos.
- **Estados imposibles**: combinaciones de datos que no deberían existir; una buena forma del estado las evita.
- **`useReducer`**: guarda estado y lo actualiza con una función `(estado, accion) => nuevoEstado`.
- **Encadenamiento opcional `?.`**: lee una propiedad sin romperse si lo de la izquierda es `undefined`.
- **Operador `??`**: valor por defecto solo para `null` o `undefined`.
- **`Object.keys`**: arreglo con las claves de un objeto.
- **Interfaz derivada de datos**: los botones salen de la tabla, no se escriben a mano.
