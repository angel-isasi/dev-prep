## Idea clave

Hay **dos estados**: el valor **elegido** y el valor **bajo el mouse**. Lo que se pinta se deriva de ambos (`hover || valor`). El componente **avisa** al padre con un callback (`onCambio`), que es la forma en que los hijos le "devuelven" datos al padre en React.

## Paso a paso

1. **Dos estados.** `valor` (0 = sin elegir) y `hover` (0 = mouse fuera). Son independientes: pasar el mouse no debe cambiar lo elegido.
2. **Qué se muestra.** `const visible = hover || valor`. Si `hover` es 0 (falsy), el `||` devuelve `valor`. Así, con el mouse encima se previsualiza y al salir se ve lo elegido.
3. **Generar las estrellas.** `Array.from({ length: total }, (_, i) => i + 1)` crea `[1, 2, 3, 4, 5]`. Cada número es un botón.
4. **Llenas o vacías.** La estrella `n` está llena si `n <= visible`: con `visible = 4`, las 1, 2, 3 y 4 son `★`.
5. **Eventos.** `onClick` elige y avisa; `onMouseEnter` pone `hover = n`; `onMouseLeave` lo vuelve a 0.
6. **Callback opcional.** `onCambio?.(n)`: el `?.` solo llama a la función si existe. Así el componente funciona aunque el padre no pase `onCambio`.
7. **Accesibilidad.** `role="radiogroup"` en el contenedor y `role="radio"` con `aria-checked` en cada botón: elegir una calificación es elegir **una** opción entre varias. El `aria-label` dice cuántas estrellas son, porque `★` solo no significa nada para un lector de pantalla.

```jsx
import { useState } from "react";

export function Estrellas({ total = 5, onCambio }) {
  const [valor, setValor] = useState(0); // la estrella elegida (0 = ninguna)
  const [hover, setHover] = useState(0); // la estrella bajo el mouse (0 = ninguna)

  // Si hay hover se muestra ese; si no, el elegido.
  const visible = hover || valor;

  // [1, 2, 3, 4, 5]
  const numeros = Array.from({ length: total }, (_, i) => i + 1);

  function elegir(n) {
    setValor(n);
    onCambio?.(n);
  }

  return (
    <div role="radiogroup" aria-label="Calificación">
      {numeros.map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={valor === n}
          aria-label={n === 1 ? "1 estrella" : `${n} estrellas`}
          onClick={() => elegir(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
        >
          {n <= visible ? "★" : "☆"}
        </button>
      ))}
    </div>
  );
}
```

## Por qué funciona

| Acción | `valor` | `hover` | `visible` | Se pinta |
|---|---|---|---|---|
| (al inicio) | 0 | 0 | 0 | ☆☆☆☆☆ |
| clic en la 4.ª (el mouse entró antes) | 4 | 4 | 4 | ★★★★☆ y `onCambio(4)` |
| mouse sobre la 2.ª | 4 | 2 | 2 | ★★☆☆☆ |
| el mouse sale | 4 | 0 | 4 | ★★★★☆ |

En ningún momento guardamos "qué estrellas están llenas": eso se calcula con `n <= visible` en cada render.

## Errores comunes

- **Un solo estado para todo.** Si el hover cambia `valor`, al sacar el mouse pierdes lo que el usuario eligió. Lo reconoces porque falla el test "al sacar el mouse".
- **Guardar un arreglo de booleanos** (`[true, true, false, ...]`) con las estrellas llenas. Es estado derivado: un número basta.
- **Llamar a `onCambio(n)` sin comprobar** que exista: si el padre no lo pasa, `onCambio is not a function` rompe el clic. Usa `onCambio?.(n)`.
- **`onClick={elegir(n)}`** sin la flecha. Eso **ejecuta** `elegir` durante el render (y en bucle infinito si cambia el estado). Debe ser `onClick={() => elegir(n)}`.
- **Usar el ícono como única información.** Sin `aria-label`, un lector de pantalla diría "estrella negra, estrella blanca..." sin decir el valor.

## Otra forma de resolverlo

Con **inputs de tipo radio** reales, escondidos visualmente, y etiquetas con la estrella:

```jsx
<fieldset>
  <legend>Calificación</legend>
  {numeros.map((n) => (
    <label key={n} onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}>
      <input
        type="radio"
        name="estrellas"
        value={n}
        checked={valor === n}
        onChange={() => elegir(n)}
        className="solo-lector" // oculto a la vista, visible para lectores de pantalla
      />
      {n <= visible ? "★" : "☆"}
    </label>
  ))}
</fieldset>
```

**¿Cuándo conviene?** Cuando la calificación va **dentro de un formulario** que se envía: los radios nativos traen gratis la navegación con flechas del teclado y el valor viaja con el formulario. Los botones con `role="radio"` son más fáciles de estilizar, pero la navegación con teclado la tendrías que programar tú.

## Cómo explicarlo en la entrevista

> "Uso dos estados: el valor elegido y el que está bajo el mouse. Al pintar, si hay hover muestro ese y si no, el elegido, con `hover || valor`; las estrellas llenas no las guardo, las calculo comparando cada número con ese valor. Al hacer clic guardo el valor y aviso al padre con un callback opcional, `onCambio?.(n)`. Para accesibilidad uso `radiogroup` y `radio` con `aria-checked`, porque semánticamente es elegir una opción entre varias, y cada botón tiene un `aria-label` con el número de estrellas."

## Conceptos

- **Varios `useState`** para datos independientes.
- **Estado derivado**: `visible` y si cada estrella está llena se calculan.
- **Operador `||`** para valores por defecto: `hover || valor`.
- **Callbacks hacia el padre**: el padre pasa una función y el hijo la llama con el dato.
- **Encadenamiento opcional** `?.()`: llama a la función solo si existe.
- **`Array.from({ length: n }, fn)`**: crea un arreglo de n elementos.
- **`onMouseEnter` / `onMouseLeave`**: eventos de entrar y salir con el mouse.
- **Roles ARIA** `radiogroup` y `radio` con `aria-checked`.
