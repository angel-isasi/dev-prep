## Idea clave

Para actualizar **un** elemento de un arreglo en el estado usa `map`: devuelve una **copia cambiada** del elemento que coincide (`{ ...item, cantidad: nueva }`) y deja igual al resto. Así obtienes un arreglo nuevo sin mutar nada.

## Paso a paso

1. **Estado con la lista.** `useState(inicial)` guarda el arreglo de items.
2. **Una función para los dos botones.** `cambiarCantidad(id, cambio)` recibe qué item cambiar y cuánto (`1` o `-1`). Evitas repetir código.
3. **`map` para recorrer.** Por cada item preguntas: ¿es el que tocaron (`item.id === id`)?
   - Si sí: `{ ...item, cantidad: Math.max(1, item.cantidad + cambio) }`. El spread `...item` copia `id` y `nombre`, y después escribes `cantidad` con el valor nuevo.
   - Si no: devuelves `item` sin tocarlo.
4. **Límite inferior con `Math.max`.** `Math.max(1, 0)` da `1`: la cantidad nunca baja de 1.
5. **Botones con nombre accesible.** `` aria-label={`Menos ${item.nombre}`} `` y `` aria-label={`Más ${item.nombre}`} ``. Los símbolos `−` y `+` solos no dicen de qué item son.

```jsx
import { useState } from "react";

export function Cantidades({ inicial }) {
  const [items, setItems] = useState(inicial);

  // cambio: +1 o -1
  function cambiarCantidad(id, cambio) {
    setItems((actuales) =>
      actuales.map((item) =>
        item.id === id
          ? { ...item, cantidad: Math.max(1, item.cantidad + cambio) } // copia con la cantidad nueva
          : item // los demás quedan igual
      )
    );
  }

  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          {item.nombre} x{item.cantidad}
          <button aria-label={`Menos ${item.nombre}`} onClick={() => cambiarCantidad(item.id, -1)}>
            −
          </button>
          <button aria-label={`Más ${item.nombre}`} onClick={() => cambiarCantidad(item.id, 1)}>
            +
          </button>
        </li>
      ))}
    </ul>
  );
}
```

## Por qué funciona

Con `inicial = [Margarita x1 (id 1), Hawaiana x3 (id 2)]`:

| Acción | Cálculo | Estado | Se pinta |
|---|---|---|---|
| Primer render | | `[M x1, H x3]` | Margarita x1, Hawaiana x3 |
| `+` Margarita | id 1 coincide: `max(1, 1 + 1)` = 2 | `[M x2, H x3]` | Margarita x2 |
| `+` Margarita | `max(1, 2 + 1)` = 3 | `[M x3, H x3]` | Margarita x3 |
| `−` Margarita | `max(1, 3 - 1)` = 2 | `[M x2, H x3]` | Margarita x2 |
| `−` Margarita dos veces | `max(1, 1 - 1)` = 1 | `[M x1, H x3]` | Margarita x1 |

Hawaiana nunca coincide con el id 1, así que `map` la devuelve tal cual: es el **mismo objeto** de antes. Margarita, en cambio, es un objeto nuevo en cada clic. El objeto original de `inicial` nunca se modifica, por eso `inicial[0].cantidad` sigue en 1 (lo comprueba el último test).

## Errores comunes

- **Mutar el objeto**: `item.cantidad++` y luego `setItems([...items])`. El arreglo es nuevo, pero el objeto de adentro es el mismo y lo modificaste: cambias los datos del padre (`inicial`) y rompes componentes que comparan referencias (`memo`). Falla el test "no modifica el arreglo inicial".
- **Olvidar el `: item`** del ternario, o usar `if` dentro de `map` sin `return` en el otro caso. Los demás items quedan como `undefined` y desaparecen de la lista o da error al leer `item.id`.
- **Poner el spread al final**: `{ cantidad: nueva, ...item }`. El spread pisa tu `cantidad` con la vieja y el número no cambia. El orden importa: primero copias, luego sobrescribes.
- **No limitar el mínimo**: sin `Math.max` aparece `x0` o `x-1`. Lo reconoces porque falla "la cantidad nunca baja de 1".
- **Usar `setItems(items.map(...))`** sin la forma funcional. Funciona con clics sueltos, pero si dos actualizaciones ocurren en el mismo evento, la segunda parte de un `items` viejo y se pierde la primera.

## Otra forma de resolverlo

Dos funciones separadas y un botón `−` deshabilitado cuando la cantidad es 1, en vez de "no hacer nada":

```jsx
function sumar(id) {
  setItems((actuales) =>
    actuales.map((item) => (item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item))
  );
}

function restar(id) {
  setItems((actuales) =>
    actuales.map((item) => (item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item))
  );
}

// ...
<button aria-label={`Menos ${item.nombre}`} disabled={item.cantidad === 1} onClick={() => restar(item.id)}>
  −
</button>
```

**¿Cuándo conviene?** Deshabilitar el botón le muestra al usuario que no puede bajar más, lo cual es mejor experiencia. Pero ojo: un botón `disabled` no recibe clics, así que la regla vive en la interfaz y no en la lógica. Lo más robusto es combinar las dos cosas: `Math.max` en la lógica y `disabled` en el botón.

## Cómo explicarlo en la entrevista

> "Tengo el arreglo de items en el estado. Para cambiar una cantidad uso `map`: al item con ese id le devuelvo una copia con spread y la cantidad nueva, y al resto lo devuelvo igual. Así no muto nada: el arreglo es nuevo, solo el item cambiado es un objeto nuevo, y React vuelve a renderizar. Uso `Math.max(1, ...)` para que la cantidad no baje de 1 y la forma funcional de `setItems` para partir siempre del estado más reciente. Una sola función con un parámetro `cambio` sirve para sumar y restar."

## Conceptos

- **`map` para actualizar**: devuelve un arreglo nuevo del mismo tamaño, cambiando solo lo que coincide.
- **Spread de objetos**: `{ ...item, cantidad: 2 }` copia el objeto y sobrescribe una propiedad.
- **Inmutabilidad**: nunca modificar el estado ni los objetos que contiene; crear copias.
- **`Math.max`**: devuelve el mayor de sus argumentos; sirve para poner un límite inferior.
- **Forma funcional de `setState`**: `setItems((actuales) => ...)`.
- **`aria-label`**: nombre accesible para botones que solo muestran un símbolo.
