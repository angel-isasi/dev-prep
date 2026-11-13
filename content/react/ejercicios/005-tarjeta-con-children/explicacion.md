## Idea clave

Lo que escribes **entre la etiqueta de apertura y la de cierre** de un componente llega como la prop especial **`children`**. Pintarla con `{children}` permite crear "marcos" reutilizables que no saben qué contenido van a mostrar.

## Paso a paso

1. **Desestructura** `titulo` y `children`. `children` no se pasa como atributo: React la arma sola con lo que hay entre `<Tarjeta>` y `</Tarjeta>`.
2. **Devuelve el contenedor** `<section>`, un bloque temático con su propio título.
3. **Pinta el título** en un `<h2>`.
4. **Pinta `{children}`** justo debajo. No hace falta recorrerlo: React sabe pintar un elemento, un arreglo de elementos o un texto.

```jsx
export function Tarjeta({ titulo, children }) {
  return (
    <section>
      <h2>{titulo}</h2>
      {children}
    </section>
  );
}
```

## Por qué funciona

Cuando escribes:

```jsx
<Tarjeta titulo="Promo">
  <p>2x1 los martes</p>
</Tarjeta>
```

React llama a tu función con estas props:

| Prop | Valor |
|---|---|
| `titulo` | `"Promo"` |
| `children` | el elemento `<p>2x1 los martes</p>` |

Y el resultado se pinta así:

| Lo que devuelve `Tarjeta` | En el DOM |
|---|---|
| `<h2>{titulo}</h2>` | `<h2>Promo</h2>` |
| `{children}` | `<p>2x1 los martes</p>` |

Si pones dos párrafos, `children` es un **arreglo** con los dos, y `{children}` los pinta en orden. Si pones solo texto (`<Tarjeta titulo="x">Hola</Tarjeta>`), `children` es el texto `"Hola"`. Si no pones nada, es `undefined` y React no pinta nada en ese lugar.

## Errores comunes

- **Olvidar pintar `{children}`.** La tarjeta muestra solo el título y el contenido desaparece. Lo reconoces porque falla el primer test.
- **Pasar el contenido como atributo** desde fuera: `<Tarjeta children={...} />` funciona, pero no es la forma habitual; lo natural es ponerlo entre las etiquetas.
- **Intentar recorrer `children` con `map`.** Si es un solo elemento, no es un arreglo y `children.map` da error. Para pintarlo no hace falta recorrerlo.
- **Escribir `{props.children}` sin recibir `props`**: si desestructuraste, la variable se llama `children`, no `props.children`.
- **Dejar el contenido fuera del `<section>`** (por ejemplo, devolviendo un fragmento con el `section` y el contenido al lado). Falla el test que verifica que ambos están en el mismo `<section>`.

## Otra forma de resolverlo

Darle a la tarjeta zonas con nombre usando props que reciben JSX, por ejemplo un pie opcional:

```jsx
export function Tarjeta({ titulo, children, pie }) {
  return (
    <section>
      <h2>{titulo}</h2>
      {children}
      {pie && <footer>{pie}</footer>}
    </section>
  );
}

// Uso:
<Tarjeta titulo="Promo" pie={<button>Pedir</button>}>
  <p>2x1 los martes</p>
</Tarjeta>
```

**¿Cuándo conviene?** `children` es perfecto para **un** hueco de contenido. Cuando el componente tiene **varios** huecos (encabezado, cuerpo, pie), se agregan props con JSX para los demás. Lo verás en el ejercicio del layout con varias zonas.

## Cómo explicarlo en la entrevista

> "`children` es una prop especial que contiene lo que pongo entre la etiqueta de apertura y la de cierre del componente. La uso para hacer componentes contenedores reutilizables, como esta tarjeta: la tarjeta decide el marco y el título, y quien la usa decide el contenido. Es composición, que en React se prefiere a la herencia. Si necesitara más de un hueco, pasaría JSX en otras props."

## Conceptos

- **`children`**: prop especial con el contenido anidado del componente.
- **Composición**: armar componentes grandes metiendo unos dentro de otros, en vez de heredar.
- **Componente contenedor**: define la estructura y deja el contenido a quien lo usa.
- **JSX como valor**: un elemento JSX se puede guardar en variables o pasar como prop.
- **`<section>`**: etiqueta semántica para un bloque temático con su propio título.
