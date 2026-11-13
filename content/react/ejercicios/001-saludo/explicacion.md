## Idea clave

Un componente de React es **una función que recibe props y devuelve JSX**. Para que una prop tenga un valor cuando no la pasan, se le pone un **valor por defecto al desestructurarla**: `{ nombre = "invitado" }`.

## Paso a paso

1. **Declara y exporta la función.** El nombre empieza con mayúscula (`Saludo`): así React sabe que es un componente y no una etiqueta HTML como `<div>`.
2. **Recibe las props desestructuradas.** React llama a tu función con un solo argumento, un objeto con todas las props: `<Saludo nombre="Angel" />` se convierte en `Saludo({ nombre: "Angel" })`. Con `{ nombre }` sacas esa propiedad directamente.
3. **Pon el valor por defecto.** `{ nombre = "invitado" }` significa: "si `nombre` es `undefined`, usa `"invitado"`". Con `<Saludo />` el objeto de props es `{}`, así que `nombre` es `undefined` y toma el valor por defecto.
4. **Devuelve JSX.** `<h1>Hola, {nombre}</h1>`. Las llaves `{ }` dentro del JSX meten una expresión de JavaScript en el texto.

```jsx
// Si no llega `nombre`, toma el valor por defecto "invitado".
export function Saludo({ nombre = "invitado" }) {
  return <h1>Hola, {nombre}</h1>;
}
```

## Por qué funciona

React convierte cada uso del componente en una llamada a la función:

| Uso en JSX | Props que recibe | Valor de `nombre` | Se pinta |
|---|---|---|---|
| `<Saludo />` | `{}` | `"invitado"` (por defecto) | `<h1>Hola, invitado</h1>` |
| `<Saludo nombre="Angel" />` | `{ nombre: "Angel" }` | `"Angel"` | `<h1>Hola, Angel</h1>` |

El valor por defecto de la desestructuración solo se usa cuando la propiedad es `undefined`. Por eso funciona igual que en cualquier función de JavaScript: `function f({ a = 1 }) {}` y `f({})` da `a = 1`.

Cada `<Saludo />` en pantalla es una llamada distinta con sus propias props: por eso en el último test un saludo dice "Ana" y el otro "invitado".

## Errores comunes

- **Escribir el componente con minúscula** (`function saludo`). React trata `<saludo />` como una etiqueta HTML desconocida y no llama a tu función. Lo reconoces porque no aparece nada y en la consola sale una advertencia sobre una etiqueta no reconocida.
- **Recibir `nombre` como parámetro suelto**: `function Saludo(nombre)`. Ahí `nombre` es el objeto de props completo, y pintarlo da error ("Objects are not valid as a React child").
- **Usar `nombre || "invitado"`.** Funciona en este caso, pero también reemplaza valores válidos como `""` o `0`. El valor por defecto solo actúa con `undefined`, que es justo "no me pasaron la prop".
- **Olvidar el `return`** o devolver el JSX en otra línea sin paréntesis (`return` solo en una línea y el JSX abajo). JavaScript devuelve `undefined` y no se pinta nada.
- **Cambiar el texto**: `Hola {nombre}` sin coma, o `¡Hola, ...!`. Los tests comparan el texto exacto.

## Otra forma de resolverlo

Recibir `props` completo y usar el operador `??` (devuelve el lado derecho solo si el izquierdo es `null` o `undefined`):

```jsx
export function Saludo(props) {
  const nombre = props.nombre ?? "invitado";
  return <h1>Hola, {nombre}</h1>;
}
```

**¿Cuándo conviene?** Casi nunca en código nuevo: la desestructuración en los parámetros es lo habitual porque deja ver de un vistazo qué props usa el componente. `props.algo` lo vas a ver en código antiguo o cuando necesitas pasar todas las props a otro componente (`<Otro {...props} />`).

## Cómo explicarlo en la entrevista

> "Un componente es una función que recibe un objeto de props y devuelve JSX. Desestructuro `nombre` directamente en los parámetros y le doy `"invitado"` como valor por defecto, que solo se aplica si la prop llega como `undefined`. Prefiero eso a un `||` porque el `||` también pisaría valores válidos como un texto vacío. El nombre del componente va con mayúscula para que React lo distinga de una etiqueta HTML."

## Conceptos

- **Componente**: función con nombre en mayúscula que devuelve JSX.
- **Props**: el objeto con los datos que el padre le pasa al componente. Son de solo lectura.
- **Desestructuración**: `{ nombre }` saca la propiedad `nombre` de un objeto.
- **Valor por defecto**: `{ nombre = "invitado" }` se usa solo cuando el valor es `undefined`.
- **JSX**: sintaxis parecida a HTML que se convierte en llamadas de JavaScript; las llaves `{ }` insertan expresiones.
- **`export`**: hace que la función se pueda importar desde otro archivo (los tests la importan así).
