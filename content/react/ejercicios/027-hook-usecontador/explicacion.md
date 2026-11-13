## Idea clave

El hook guarda **un número** con `useState` y expone funciones que lo cambian **sin salirse de los límites**. Los límites se aplican con `Math.min` y `Math.max`, y las opciones llegan en un objeto con valores por defecto.

## Paso a paso

1. **Opciones con valores por defecto.** Desestructura el objeto directamente en los parámetros: `{ inicial = 0, min = -Infinity, max = Infinity } = {}`. Cada opción que falte toma su valor por defecto, y el `= {}` final cubre el caso de llamar `useContador()` sin nada (sin él, JavaScript intentaría desestructurar `undefined` y lanzaría un error).
2. **Estado** con `useState(inicial)`.
3. **`sumar` con tope**: `Math.min(max, c + 1)` devuelve el menor de los dos; si `c + 1` se pasa de `max`, gana `max`.
4. **`restar` con piso**: `Math.max(min, c - 1)`; si `c - 1` baja de `min`, gana `min`.
5. **Forma funcional** `setCuenta((c) => ...)` en ambos, para que dos llamadas seguidas se encadenen.
6. **Devuelve un objeto**: quien usa el hook toma solo lo que necesita (`const { cuenta, sumar } = useContador()`), en cualquier orden.

```jsx
import { useState } from "react";

// Desestructuramos las opciones con valores por defecto.
// El "= {}" final permite llamar useContador() sin argumentos.
export function useContador({ inicial = 0, min = -Infinity, max = Infinity } = {}) {
  const [cuenta, setCuenta] = useState(inicial);

  // Forma funcional: cada llamada parte del valor más reciente.
  const sumar = () => setCuenta((c) => Math.min(max, c + 1));
  const restar = () => setCuenta((c) => Math.max(min, c - 1));
  const reiniciar = () => setCuenta(inicial);

  return { cuenta, sumar, restar, reiniciar };
}
```

## Por qué funciona

Con `useContador({ inicial: 1, min: 1, max: 2 })`:

| Acción | Cálculo | `cuenta` |
|---|---|---|
| Primer render | `useState(1)` | `1` |
| `sumar()` | `Math.min(2, 1 + 1)` = 2 | `2` |
| `sumar()` | `Math.min(2, 2 + 1)` = 2 | `2` |
| `restar()` | `Math.max(1, 2 - 1)` = 1 | `1` |
| `restar()` | `Math.max(1, 1 - 1)` = 1 | `1` |

¿Por qué `-Infinity` e `Infinity` como valores por defecto? Porque así `Math.min(Infinity, c + 1)` siempre da `c + 1` y `Math.max(-Infinity, c - 1)` siempre da `c - 1`: "sin límite" sale gratis, sin `if`.

¿Y las dos llamadas en el mismo `act`? React encola `(c) => Math.min(max, c + 1)` dos veces y las aplica en orden: 5 pasa a 6 y 6 pasa a 7. Con `setCuenta(cuenta + 1)` las dos leerían `cuenta = 5` y el resultado sería 6.

## Errores comunes

- **Olvidar `= {}`** en el parámetro. `useContador()` lanza "Cannot destructure property 'inicial' of undefined". Lo reconoces porque falla el test "sin argumentos".
- **`setCuenta(cuenta + 1)`** en vez de la forma funcional. Funciona con un clic por evento, pero falla el test de "dos sumar en el mismo act".
- **Comprobar el límite con la `cuenta` del render** (`if (cuenta < max) setCuenta(cuenta + 1)`). Con dos llamadas seguidas, las dos ven el valor viejo y el chequeo no sirve.
- **Usar `min = 0` por defecto.** Parece razonable, pero el enunciado dice "sin límite": un contador de temperatura, por ejemplo, necesita negativos.
- **Confundir `Math.min` y `Math.max`.** Truco para recordarlo: para no pasarte del **máximo** usas `Math.min` (te quedas con el menor de los dos).

## Otra forma de resolverlo

Con una función auxiliar `limitar` (a veces llamada *clamp*) y un solo setter `cambiar(paso)`:

```jsx
import { useState } from "react";

const limitar = (n, min, max) => Math.min(max, Math.max(min, n));

export function useContador({ inicial = 0, min = -Infinity, max = Infinity } = {}) {
  const [cuenta, setCuenta] = useState(inicial);
  const cambiar = (paso) => setCuenta((c) => limitar(c + paso, min, max));
  return {
    cuenta,
    sumar: () => cambiar(1),
    restar: () => cambiar(-1),
    reiniciar: () => setCuenta(inicial),
  };
}
```

**¿Cuándo conviene?** Cuando quieres agregar más acciones (sumar de 5 en 5, por ejemplo) sin repetir la lógica del límite. Para un contador simple, la primera versión es más directa y fácil de leer.

## Cómo explicarlo en la entrevista

> "Recibo las opciones como un objeto desestructurado con valores por defecto, y agrego `= {}` para que también funcione sin argumentos. Uso `Infinity` y `-Infinity` como límites por defecto, así 'sin límite' no necesita `if`. Al sumar aplico `Math.min(max, c + 1)` y al restar `Math.max(min, c - 1)`, siempre con la forma funcional del setter para que varias llamadas seguidas se encadenen bien. Devuelvo un objeto para que el componente tome solo lo que necesita por nombre."

## Conceptos

- **Hook propio** que devuelve un objeto con estado y acciones.
- **Desestructuración con valores por defecto** en los parámetros: `({ a = 1 } = {})`.
- **`Math.min` / `Math.max`** para poner topes (clamp).
- **`Infinity` y `-Infinity`** como "sin límite".
- **Forma funcional del setter**: encadena actualizaciones seguidas.
- **Objeto vs arreglo de retorno**: el objeto se usa por nombre; el arreglo, por posición.
