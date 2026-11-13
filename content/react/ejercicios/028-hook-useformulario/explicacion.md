## Idea clave

Un formulario entero cabe en **un objeto de estado**. Cada input tiene un atributo `name` igual a su clave en el objeto, y un **único manejador** usa ese `name` para actualizar solo esa propiedad, copiando las demás con el spread.

## Paso a paso

1. **Un solo estado** con `useState(inicial)`, donde `inicial` es algo como `{ nombre: "", promo: false }`.
2. **Lee el evento**: `const { name, type, value, checked } = evento.target`. El `target` es el input que disparó el evento.
3. **Elige el dato correcto**: los checkbox guardan su estado en `checked` (`true`/`false`). Su `value` es un texto fijo (normalmente `"on"`) que no cambia al marcarlo, por eso no sirve.
4. **Crea un objeto nuevo**: `{ ...anteriores, [name]: dato }`. El spread copia todas las propiedades anteriores y luego `[name]` sobrescribe solo la que cambió. Los corchetes son una **propiedad computada**: la clave es el **valor** de la variable `name` (por ejemplo `"nombre"`), no la palabra "name".
5. **Forma funcional** `setValores((anteriores) => ...)` para no perder cambios si llegan dos eventos seguidos.
6. **`reiniciar`** simplemente vuelve a poner el objeto inicial.

```jsx
import { useState } from "react";

export function useFormulario(inicial) {
  const [valores, setValores] = useState(inicial);

  // Un solo manejador para todos los campos: el `name` del input dice cuál cambió.
  const cambiar = (evento) => {
    const { name, type, value, checked } = evento.target;
    setValores((anteriores) => ({
      ...anteriores, // copia los demás campos
      [name]: type === "checkbox" ? checked : value, // propiedad computada
    }));
  };

  const reiniciar = () => setValores(inicial);

  return { valores, cambiar, reiniciar };
}
```

## Por qué funciona

| Acción | `name` / dato leído | Nuevo `valores` |
|---|---|---|
| Primer render | | `{ nombre: "", promo: false }` |
| Escribe "Ana" en nombre | `"nombre"` / `value = "Ana"` | `{ nombre: "Ana", promo: false }` |
| Marca promo | `"promo"` / `checked = true` | `{ nombre: "Ana", promo: true }` |
| `reiniciar()` | | `{ nombre: "", promo: false }` |

Cada cambio crea un **objeto nuevo** (no modifica el anterior). React compara referencias: como el objeto es otro, sabe que tiene que volver a renderizar, y los inputs controlados (`value={valores.nombre}`, `checked={valores.promo}`) muestran el dato nuevo.

## Errores comunes

- **Olvidar el spread** y escribir `setValores({ [name]: value })`. Al escribir el nombre se borra `promo` (y viceversa). Lo reconoces porque falla "no borra los demás".
- **Escribir `{ name: value }` sin corchetes.** Crea una propiedad llamada literalmente `"name"`. Los corchetes hacen que la clave sea el contenido de la variable.
- **Usar `value` en los checkbox.** Guardarías `"on"` siempre, marques o desmarques. Falla el test del checkbox.
- **Mutar el estado**: `valores[name] = value; setValores(valores)`. Es el mismo objeto, React no ve cambios y no vuelve a renderizar.
- **Olvidar el atributo `name` en el input.** `evento.target.name` llega vacío y se guarda en la clave `""`.

## Otra forma de resolverlo

Con **`useReducer`**, útil si el formulario crece y quieres más acciones (por ejemplo, cargar datos del servidor):

```jsx
import { useReducer } from "react";

function reducer(valores, accion) {
  switch (accion.tipo) {
    case "cambiar":
      return { ...valores, [accion.campo]: accion.dato };
    case "reiniciar":
      return accion.inicial;
    default:
      return valores;
  }
}

export function useFormulario(inicial) {
  const [valores, despachar] = useReducer(reducer, inicial);
  const cambiar = (evento) => {
    const { name, type, value, checked } = evento.target;
    despachar({ tipo: "cambiar", campo: name, dato: type === "checkbox" ? checked : value });
  };
  const reiniciar = () => despachar({ tipo: "reiniciar", inicial });
  return { valores, cambiar, reiniciar };
}
```

**¿Cuándo conviene?** Cuando las reglas de cambio se complican (validaciones, campos que dependen de otros). Para un formulario simple, `useState` con un objeto es suficiente y más corto.

## Cómo explicarlo en la entrevista

> "Guardo todo el formulario en un solo objeto de estado y uso un único manejador. Cada input tiene un `name` igual a su clave; en el manejador leo `name`, `type`, `value` y `checked` del `target`. Para checkbox uso `checked`, porque su `value` no cambia. Creo un objeto nuevo con spread para copiar los demás campos y una propiedad computada `[name]` para actualizar solo el que cambió. Así agregar un campo nuevo es solo agregar un input con su `name`."

## Conceptos

- **Hook propio para formularios**: un estado, un manejador.
- **Inputs controlados**: `value`/`checked` vienen del estado y `onChange` lo actualiza.
- **`evento.target`**: el elemento que disparó el evento, con su `name`, `type`, `value` y `checked`.
- **Spread de objetos** `{ ...obj }`: copia superficial.
- **Propiedad computada** `{ [clave]: valor }`: la clave sale de una variable.
- **Inmutabilidad**: crear un objeto nuevo en vez de modificar el existente.
- **Checkbox**: su estado está en `checked`, no en `value`.
