## Idea clave

Un booleano en el estado (`acepta`) controla dos cosas a la vez: si la casilla se ve marcada (`checked={acepta}`) y si el botón está bloqueado (`disabled={!acepta}`). En los checkbox se usa **`checked`**, no `value`.

## Paso a paso

1. **Estado booleano.** `const [acepta, setAcepta] = useState(false)`: al inicio el usuario no ha aceptado.
2. **Checkbox controlado.** `checked={acepta}` hace que la casilla muestre lo que dice el estado. En `onChange`, `evento.target.checked` trae el nuevo valor (`true` si quedó marcada) y lo guardas con `setAcepta`.
3. **Etiqueta envolvente.** Poner el `<input>` **dentro** del `<label>` los une sin necesidad de `id` ni `htmlFor`. Además, hacer clic en el texto también marca la casilla, y `getByLabelText("Acepto los términos")` encuentra el input.
4. **Botón dependiente.** `disabled={!acepta}`: cuando `acepta` es `false`, `!acepta` es `true` y el botón queda bloqueado.

```jsx
import { useState } from "react";

export function Terminos() {
  const [acepta, setAcepta] = useState(false);

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={acepta}
          onChange={(evento) => setAcepta(evento.target.checked)}
        />
        Acepto los términos
      </label>

      <button disabled={!acepta}>Confirmar pedido</button>
    </div>
  );
}
```

## Por qué funciona

Cada clic en la casilla dispara `onChange`, que actualiza el estado; React vuelve a ejecutar `Terminos` y recalcula `checked` y `disabled`:

| Acción | `evento.target.checked` | `acepta` | `checked` | `disabled` |
|---|---|---|---|---|
| Primer render | (sin evento) | `false` | `false` | `true` |
| Clic en la casilla | `true` | `true` | `true` | `false` |
| Otro clic | `false` | `false` | `false` | `true` |

Como los dos atributos salen del mismo estado, es imposible que la casilla diga una cosa y el botón otra.

## Errores comunes

- **Leer `evento.target.value`.** En un checkbox, `value` vale `"on"` siempre, esté marcado o no. Lo reconoces porque el botón se habilita y nunca vuelve a deshabilitarse.
- **Usar `value={acepta}` en vez de `checked={acepta}`.** En un checkbox, `value` no marca ni desmarca la casilla: queda sin controlar y el estado y lo que ves pueden no coincidir.
- **Invertir la condición**: `disabled={acepta}`. El botón queda habilitado al inicio y se bloquea justo cuando el usuario acepta.
- **Guardar otro estado para el botón** (`const [habilitado, setHabilitado] = useState(false)`). Es información repetida: si se olvida actualizar uno, se desincronizan. `disabled` se deriva de `acepta`.
- **Usar `setAcepta(!acepta)` en `onChange`.** Funciona casi siempre, pero es más frágil: depende del valor del render actual. Leer `evento.target.checked` dice exactamente lo que el navegador marcó.

## Otra forma de resolverlo

Con la etiqueta separada, unida por `id` y `htmlFor`, y alternando con la forma funcional del setter:

```jsx
import { useState } from "react";

export function Terminos() {
  const [acepta, setAcepta] = useState(false);

  return (
    <div>
      <input
        id="terminos"
        type="checkbox"
        checked={acepta}
        onChange={() => setAcepta((anterior) => !anterior)}
      />
      <label htmlFor="terminos">Acepto los términos</label>

      <button disabled={!acepta}>Confirmar pedido</button>
    </div>
  );
}
```

**¿Cuándo conviene?** El `id` + `htmlFor` es útil cuando el diseño obliga a poner la etiqueta lejos del input (por ejemplo, en otra columna). `setAcepta((anterior) => !anterior)` es la forma segura de alternar un booleano cuando el nuevo valor depende del anterior.

## Cómo explicarlo en la entrevista

> "Tengo un solo estado booleano, `acepta`. La casilla es controlada con `checked`, porque en los checkbox el `value` no cambia, y en `onChange` leo `event.target.checked`. El botón no tiene estado propio: su `disabled` es `!acepta`, así que siempre está sincronizado con la casilla. Pongo el input dentro del label para que sea accesible y que el clic en el texto también funcione."

## Conceptos

- **`useState` con booleano**: el caso más simple de estado, un sí o no.
- **Checkbox controlado**: `checked` + `onChange`, leyendo `evento.target.checked`.
- **Atributo `disabled`**: en JSX recibe un booleano; con `true` el botón no se puede presionar.
- **Estado derivado**: el bloqueo del botón se calcula a partir de `acepta`.
- **Label envolvente**: un input dentro de un `<label>` queda unido a ese texto.
- **Setter con función**: `setX((anterior) => ...)` cuando el nuevo valor depende del anterior.
