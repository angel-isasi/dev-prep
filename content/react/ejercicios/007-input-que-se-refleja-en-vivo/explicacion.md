## Idea clave

Un **input controlado** es un campo cuyo valor vive en el estado de React: `value` lee el estado y `onChange` lo actualiza con cada tecla. Como cada tecla cambia el estado, React vuelve a renderizar y todo lo que depende de ese texto (el mensaje) se actualiza solo.

## Paso a paso

1. **Crea el estado** `nombre` con `useState("")`. Empieza vacío porque el input empieza vacío.
2. **Conecta el input**: `value={nombre}` hace que el input muestre lo que hay en el estado; `onChange={(evento) => setNombre(evento.target.value)}` guarda lo que el usuario escribió. `evento.target` es el input y `.value` su texto actual.
3. **Une el label con el input**: `htmlFor="nombre"` en el `<label>` y `id="nombre"` en el `<input>`. En JSX se escribe `htmlFor` porque `for` es una palabra reservada de JavaScript.
4. **Calcula el mensaje** con un ternario: si `nombre` tiene texto, `` `Pedido a nombre de ${nombre}` ``; si está vacío (`""` es *falsy*), `"Escribe tu nombre"`.
5. **Envuelve todo en un `<div>`** porque un componente devuelve un solo elemento raíz.

```jsx
import { useState } from "react";

export function Nombre() {
  const [nombre, setNombre] = useState("");

  return (
    <div>
      <label htmlFor="nombre">Tu nombre</label>
      <input
        id="nombre"
        value={nombre}
        onChange={(evento) => setNombre(evento.target.value)}
      />
      <p>{nombre ? `Pedido a nombre de ${nombre}` : "Escribe tu nombre"}</p>
    </div>
  );
}
```

## Por qué funciona

Recorrido escribiendo "Angel" y luego borrando:

| Acción | Estado `nombre` | `value` del input | Mensaje |
|---|---|---|---|
| Primer render | `""` | vacío | Escribe tu nombre |
| Escribe `A` → `onChange` → `setNombre("A")` | `"A"` | `A` | Pedido a nombre de A |
| ... sigue hasta `Angel` | `"Angel"` | `Angel` | Pedido a nombre de Angel |
| Borra todo → `setNombre("")` | `""` | vacío | Escribe tu nombre |

El ciclo es siempre el mismo: **evento → `set` → render nuevo → el JSX se calcula con el valor nuevo**. El estado es la **única fuente de verdad**: el input no guarda su propio valor, muestra el del estado.

## Errores comunes

- **Poner `value` sin `onChange`.** El input queda bloqueado: escribes y no cambia nada, porque React siempre le vuelve a poner el valor del estado. En la consola aparece una advertencia sobre un campo de solo lectura.
- **Usar `for` en vez de `htmlFor`.** El label no se une al input y `getByLabelText` no lo encuentra.
- **Guardar el evento en vez del texto**: `onChange={setNombre}` guarda el objeto evento entero en el estado. El mensaje mostraría algo raro o daría error.
- **Guardar el mensaje en otro estado** y actualizarlo a mano. Es estado derivado: se calcula del nombre en cada render.
- **Empezar con `useState()` sin valor** (`undefined`). React avisa que el input pasa de "no controlado" a "controlado". Empieza con `""`.

## Otra forma de resolverlo

Meter el input **dentro** del label, sin `id` ni `htmlFor`:

```jsx
<label>
  Tu nombre
  <input value={nombre} onChange={(evento) => setNombre(evento.target.value)} />
</label>
```

**¿Cuándo conviene?** Es más corto y no necesitas inventar un `id` (útil si el componente se repite varias veces en la página, porque los `id` deben ser únicos). La forma con `htmlFor` + `id` es mejor cuando el label y el input están en lugares distintos del diseño. Para generar `id` únicos en componentes reutilizables, React tiene el hook `useId`.

## Cómo explicarlo en la entrevista

> "Uso un input controlado: el valor vive en el estado con `useState`, el input lo lee con `value` y lo actualiza con `onChange`. Así el estado es la única fuente de verdad y todo lo que depende del texto se recalcula en cada render, como el mensaje de abajo, que no guardo aparte porque es estado derivado. Uno el label con el input con `htmlFor` e `id`, por accesibilidad."

## Conceptos

- **Input controlado**: `value` + `onChange`; React manda sobre el valor del campo.
- **`evento.target.value`**: el texto actual del input en el evento `change`.
- **Única fuente de verdad**: el dato vive en un solo lugar (el estado).
- **Estado derivado**: el mensaje se calcula a partir del nombre, no se guarda.
- **`htmlFor`**: versión JSX del atributo `for` del label.
- **Template literals**: `` `Pedido a nombre de ${nombre}` `` inserta variables en un texto.
