## Idea clave

Con `useReducer`, los componentes no cambian el estado directamente: **despachan acciones** (objetos que describen qué pasó) y una función pura, el **reducer**, decide el estado nuevo. Toda la lógica de cambios queda en un solo lugar.

## Paso a paso

1. **Escribe el reducer** fuera del componente: recibe `(estado, accion)` y devuelve un estado **nuevo**. No usa props, ni hooks, ni modifica nada: es una función pura.
2. **Un `case` por acción** dentro de un `switch (accion.tipo)`:
   - `"sumar"`: `estado.cuenta + (accion.paso ?? 1)`. El operador `??` da `1` solo si `paso` no vino.
   - `"reiniciar"`: `{ cuenta: 0 }`.
3. **`default` lanza un error.** Si alguien despacha `"sumra"` por un error de tipeo, te enteras al instante en vez de que no pase nada en silencio.
4. **En el componente**, `useReducer(reducer, { cuenta: 0 })` devuelve `[estado, despachar]`, parecido a `useState`.
5. **Los botones despachan acciones**: `despachar({ tipo: "sumar", paso: 5 })`.

```jsx
import { useReducer } from "react";

// Función pura: recibe el estado actual y una acción, devuelve el estado nuevo.
export function reducer(estado, accion) {
  switch (accion.tipo) {
    case "sumar":
      return { cuenta: estado.cuenta + (accion.paso ?? 1) };
    case "reiniciar":
      return { cuenta: 0 };
    default:
      throw new Error(`Acción desconocida: ${accion.tipo}`);
  }
}

export function Contador() {
  const [estado, despachar] = useReducer(reducer, { cuenta: 0 });

  return (
    <div>
      <p>Cuenta: {estado.cuenta}</p>
      <button onClick={() => despachar({ tipo: "sumar", paso: 5 })}>+5</button>
      <button onClick={() => despachar({ tipo: "reiniciar" })}>Reiniciar</button>
    </div>
  );
}
```

## Por qué funciona

| Acción del usuario | Acción despachada | `reducer` devuelve | Se pinta |
|---|---|---|---|
| (primer render) | | estado inicial `{ cuenta: 0 }` | Cuenta: 0 |
| Clic en "+5" | `{ tipo: "sumar", paso: 5 }` | `{ cuenta: 5 }` | Cuenta: 5 |
| Clic en "+5" | `{ tipo: "sumar", paso: 5 }` | `{ cuenta: 10 }` | Cuenta: 10 |
| Clic en "Reiniciar" | `{ tipo: "reiniciar" }` | `{ cuenta: 0 }` | Cuenta: 0 |

Cuando llamas a `despachar(accion)`, React ejecuta `reducer(estadoActual, accion)`. Si lo que devuelve es un objeto distinto al anterior, vuelve a renderizar con el nuevo. Como `reducer` siempre recibe el estado **actual**, dos despachos seguidos se encadenan bien (igual que la forma funcional de `setState`).

Y como el reducer es una función normal, se prueba sin React: `reducer({ cuenta: 2 }, { tipo: "sumar" })` da `{ cuenta: 3 }`. El test usa `Object.freeze` para asegurarse de que no modificas el estado recibido.

## Errores comunes

- **Mutar el estado**: `estado.cuenta += 5; return estado`. Devuelves el mismo objeto, React cree que nada cambió y no vuelve a renderizar. Con `Object.freeze` además lanza error en modo estricto. Siempre devuelve un objeto nuevo.
- **Usar `accion.paso || 1`** en vez de `??`. Con `paso: 0`, `||` lo trata como "falso" y suma 1. `??` solo reemplaza `null` y `undefined`.
- **Olvidar el `default`**, o hacer que devuelva `undefined`. Una acción mal escrita deja el estado en `undefined` y explota en el siguiente render con un error confuso.
- **Llamar a `despachar` directamente en el `onClick`**: `onClick={despachar({ tipo: "sumar" })}`. Se ejecuta durante el render (bucle infinito). Debe ser una función: `onClick={() => despachar(...)}`.
- **Poner efectos secundarios en el reducer** (`fetch`, `console.log`, `Math.random`). React puede llamarlo más de una vez en modo estricto; debe ser puro.

## Otra forma de resolverlo

Con **`useState`** y funciones con nombre:

```jsx
import { useState } from "react";

export function Contador() {
  const [cuenta, setCuenta] = useState(0);
  const sumar = (paso = 1) => setCuenta((c) => c + paso);
  const reiniciar = () => setCuenta(0);
  return (
    <div>
      <p>Cuenta: {cuenta}</p>
      <button onClick={() => sumar(5)}>+5</button>
      <button onClick={reiniciar}>Reiniciar</button>
    </div>
  );
}
```

**¿Cuándo conviene cada uno?** Para un contador, `useState` es más simple, y está bien decirlo en la entrevista. `useReducer` gana cuando el estado tiene varias partes que cambian juntas (un carrito con items, cupón y total; un formulario con validaciones), cuando hay muchas acciones distintas, o cuando quieres probar la lógica sin la interfaz.

## Cómo explicarlo en la entrevista

> "Con `useReducer` separo qué pasó de cómo cambia el estado. Los botones despachan acciones con un `tipo`, y el reducer, que es una función pura, devuelve el estado nuevo según ese tipo. Siempre devuelvo un objeto nuevo y en el `default` lanzo un error para detectar acciones mal escritas. Lo prefiero sobre `useState` cuando el estado es complejo o tiene muchas transiciones, porque toda la lógica queda en un lugar y la puedo probar sin renderizar nada."

## Conceptos

- **`useReducer(reducer, inicial)`**: devuelve `[estado, despachar]`.
- **Reducer**: función pura `(estado, accion) => nuevoEstado`.
- **Acción**: objeto que describe qué pasó, normalmente con un `tipo` y datos extra.
- **Función pura**: mismo resultado para mismos argumentos, sin efectos secundarios ni mutaciones.
- **`switch`** para elegir según el tipo de acción.
- **Operador `??`** (nullish coalescing): valor por defecto solo para `null`/`undefined`.
- **`Object.freeze`**: congela un objeto; útil en pruebas para detectar mutaciones.
- **Patrón Redux**: el mismo modelo de acciones y reducers a escala de toda la app.
