## Idea clave

El único estado es el **número**. Todo lo demás (si un botón está deshabilitado, qué texto se muestra) se calcula a partir de él en cada render. Y como el nuevo valor depende del anterior, se actualiza con la **forma funcional** del setter.

## Paso a paso

1. **Estado inicial.** `useState(min)`: el contador arranca en el mínimo. Gracias a los valores por defecto en la desestructuración (`{ min = 0, max = 10 }`), si no te pasan props se usan 0 y 10.
2. **Restar y sumar con forma funcional.** `setValor((anterior) => anterior + 1)` le dice a React "toma el valor más reciente y súmale 1". Así no dependes de la variable `valor` capturada en ese render.
3. **Limitar el rango.** `Math.min(max, anterior + 1)` nunca devuelve algo mayor que `max`; `Math.max(min, anterior - 1)` nunca devuelve algo menor que `min`. Es la defensa en la lógica.
4. **Deshabilitar los botones.** `disabled={valor === max}` en `+` y `disabled={valor === min}` en `-`. Es la defensa en la interfaz: el usuario ve que llegó al límite.
5. **Reiniciar.** `setValor(min)`. Aquí no hace falta la forma funcional, porque el nuevo valor no depende del anterior.

```jsx
import { useState } from "react";

export function Contador({ min = 0, max = 10 }) {
  const [valor, setValor] = useState(min);

  function restar() {
    setValor((anterior) => Math.max(min, anterior - 1));
  }

  function sumar() {
    setValor((anterior) => Math.min(max, anterior + 1));
  }

  return (
    <div>
      <p aria-live="polite">Valor: {valor}</p>
      <button onClick={restar} disabled={valor === min}>
        -
      </button>
      <button onClick={sumar} disabled={valor === max}>
        +
      </button>
      <button onClick={() => setValor(min)}>Reiniciar</button>
    </div>
  );
}
```

`aria-live="polite"` hace que un lector de pantalla anuncie el nuevo valor cuando cambia, sin interrumpir lo que está leyendo.

## Por qué funciona

Recorrido con `<Contador max={2} />`:

| Acción | Estado `valor` | Lo que se pinta |
|---|---|---|
| (primer render) | `0` | `Valor: 0`, `-` deshabilitado |
| clic en `+` | `Math.min(2, 0 + 1)` = `1` | `Valor: 1`, ambos habilitados |
| clic en `+` | `Math.min(2, 1 + 1)` = `2` | `Valor: 2`, `+` deshabilitado |
| clic en `+` | (el botón está deshabilitado, React no ejecuta `onClick`) | `Valor: 2` |
| clic en `Reiniciar` | `0` | `Valor: 0`, `-` deshabilitado |

Cada `setValor` provoca un nuevo render: React vuelve a ejecutar la función `Contador`, `valor` trae el nuevo número y las expresiones `valor === min` y `valor === max` se recalculan solas.

## Errores comunes

- **Usar `setValor(valor + 1)` en vez de la forma funcional.** Con un solo clic funciona, pero si llamas dos veces seguidas en el mismo evento (`setValor(valor + 1); setValor(valor + 1);`) solo suma 1, porque las dos usan el mismo `valor` de ese render. La forma funcional siempre parte del último valor.
- **Solo deshabilitar el botón, sin limitar en la lógica** (o al revés). Lo ideal son las dos cosas: la lógica protege el dato y el `disabled` informa al usuario.
- **Guardar `puedeSumar` en otro `useState`.** Es estado derivado: se calcula con `valor === max`. Si lo guardas aparte, tienes que acordarte de actualizarlo en cada cambio y tarde o temprano se desincroniza.
- **Escribir `disabled="false"`.** Un texto no vacío es verdadero; el botón quedaría deshabilitado siempre. Pasa un booleano: `disabled={valor === max}`.
- **Empezar en `0` fijo en vez de en `min`.** Si te pasan `min={5}`, el contador arrancaría fuera del rango.

## Otra forma de resolverlo

Con una sola función `cambiar(paso)` que sirve para sumar y restar, y que "aprieta" el valor dentro del rango:

```jsx
import { useState } from "react";

const limitar = (n, min, max) => Math.min(max, Math.max(min, n));

export function Contador({ min = 0, max = 10 }) {
  const [valor, setValor] = useState(min);
  const cambiar = (paso) => setValor((v) => limitar(v + paso, min, max));

  return (
    <div>
      <p>Valor: {valor}</p>
      <button onClick={() => cambiar(-1)} disabled={valor === min}>-</button>
      <button onClick={() => cambiar(1)} disabled={valor === max}>+</button>
      <button onClick={() => setValor(min)}>Reiniciar</button>
    </div>
  );
}
```

**¿Cuándo conviene?** Cuando aparecen más botones (`+5`, `-5`): agregas un botón con `cambiar(5)` y listo. `limitar` (en inglés se le llama *clamp*) es una función pura que puedes reutilizar y probar aparte.

## Cómo explicarlo en la entrevista

> "Guardo solo el número en un estado. Para sumar y restar uso la forma funcional del setter, `setValor(v => ...)`, porque el nuevo valor depende del anterior y así no me afecta que React agrupe actualizaciones. Limito con `Math.min` y `Math.max` para que el dato nunca salga del rango, y además deshabilito el botón en los extremos para que el usuario vea que llegó al límite. Que el botón esté deshabilitado no lo guardo en estado: lo calculo comparando el valor con el mínimo y el máximo."

## Conceptos

- **`useState`**: guarda un valor entre renders; al cambiarlo, React vuelve a renderizar.
- **Actualización funcional**: `setX((anterior) => nuevo)` usa siempre el valor más reciente.
- **Props con valor por defecto**: `function Contador({ min = 0, max = 10 })`.
- **Estado derivado**: `valor === max` se calcula, no se guarda.
- **`disabled`**: un botón deshabilitado no dispara `onClick`.
- **`Math.min` / `Math.max`**: para mantener un número dentro de un rango.
- **`aria-live`**: avisa a los lectores de pantalla cuando cambia un texto.
