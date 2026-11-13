Crea el componente `Saludo`, que recibe la prop opcional `nombre` y muestra un título que dice **"Hola, {nombre}"**. Si no le pasan `nombre`, saluda a **"invitado"**.

Es tu primer componente: una función que recibe un objeto con props y devuelve JSX (lo que se pinta en pantalla).

## Reglas

- Exporta la función `Saludo` (con `export function Saludo...`).
- Devuelve un título `<h1>` cuyo texto completo sea exactamente `Hola, {nombre}` (con coma y un espacio).
- Si la prop `nombre` no llega, el texto es `Hola, invitado`.
- No uses `if` ni el operador `||`: usa un **valor por defecto** al desestructurar las props.

## Ejemplo

```jsx
<Saludo />
<Saludo nombre="Angel" />
```

| Uso | Se ve |
|---|---|
| `<Saludo />` | **Hola, invitado** (como `<h1>`) |
| `<Saludo nombre="Angel" />` | **Hola, Angel** |
| `<Saludo nombre="Rosa" />` | **Hola, Rosa** |

## Por qué importa

Todo en React son componentes que reciben props. Saber leer props con desestructuración y darles un valor por defecto es lo primero que te piden en cualquier ejercicio en vivo, y lo vas a usar en todos los que siguen.
