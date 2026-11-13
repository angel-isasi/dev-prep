## Idea clave

Un componente es una función que **recibe props y devuelve JSX**. Aquí solo hay que poner cada prop en su etiqueta y darle formato al precio con `toFixed(2)`, que siempre devuelve un texto con 2 decimales.

## Paso a paso

1. **Desestructura las tres props** en los parámetros: `{ nombre, descripcion, precio }`. Así ves de un vistazo qué datos necesita la tarjeta.
2. **Elige etiquetas con significado.** `<article>` para la tarjeta (es un bloque independiente), `<h2>` para el nombre (es su título) y `<p>` para los textos. Esto ayuda a los lectores de pantalla y es lo que usan los tests con `getByRole("article")` y `getByRole("heading")`.
3. **Un solo elemento raíz.** El `return` devuelve un único `<article>` que envuelve todo. Si devolvieras tres etiquetas sueltas, JSX daría error.
4. **Formatea el precio.** `precio.toFixed(2)` convierte el número en texto con exactamente 2 decimales. Delante escribes el texto fijo `S/ `.
5. **Paréntesis en el `return`.** Cuando el JSX ocupa varias líneas, envuélvelo en `( )` para que JavaScript no termine el `return` en la primera línea.

```jsx
export function Pizza({ nombre, descripcion, precio }) {
  return (
    <article>
      <h2>{nombre}</h2>
      <p>{descripcion}</p>
      <p>S/ {precio.toFixed(2)}</p>
    </article>
  );
}
```

## Por qué funciona

React llama a `Pizza` con las props y pinta lo que devuelve:

| Prop | Expresión en JSX | Se pinta |
|---|---|---|
| `nombre="Margarita"` | `<h2>{nombre}</h2>` | `<h2>Margarita</h2>` |
| `descripcion="Tomate y albahaca"` | `<p>{descripcion}</p>` | `<p>Tomate y albahaca</p>` |
| `precio={28}` | `S/ {precio.toFixed(2)}` | `S/ 28.00` |
| `precio={31.5}` | `S/ {precio.toFixed(2)}` | `S/ 31.50` |

Fíjate en `precio={28}` con llaves: así llega el **número** 28. Si escribieras `precio="28"` llegaría el texto `"28"`, y los textos no tienen `toFixed` (daría error).

El texto `S/ ` y el `{...}` quedan dentro del mismo `<p>`, así que su `textContent` es `"S/ 28.00"`, que es lo que busca el test.

## Errores comunes

- **Devolver varias etiquetas sin un contenedor**: `return <h2>...</h2><p>...</p>`. Da el error "Adjacent JSX elements must be wrapped in an enclosing tag". Envuelve todo en `<article>` (o en un fragmento `<>...</>` si no quieres etiqueta extra).
- **Mostrar el precio sin formato**: `S/ {precio}` pinta `S/ 28` o `S/ 31.5`. Falla el test de los decimales.
- **Pasar el precio como texto** (`precio="28"`) y llamar `toFixed`: "toFixed is not a function". Los números se pasan con llaves.
- **`return` sin paréntesis** y el JSX en la línea siguiente: JavaScript inserta un `;` después de `return` y el componente devuelve `undefined`.
- **Usar `class` en vez de `className`** si le agregas estilos: en JSX el atributo es `className`.

## Otra forma de resolverlo

Usar `Intl.NumberFormat`, la herramienta del navegador para formatear monedas según el país:

```jsx
const formatoSoles = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});

export function Pizza({ nombre, descripcion, precio }) {
  return (
    <article>
      <h2>{nombre}</h2>
      <p>{descripcion}</p>
      <p>{formatoSoles.format(precio)}</p>
    </article>
  );
}
```

**¿Cuándo conviene?** Cuando los precios pueden ser grandes (pone separador de miles: `S/ 1,234.50`) o la app maneja varias monedas o idiomas. Para un precio simple de menú, `toFixed(2)` es suficiente y más fácil de leer. Ojo: el formateador se crea **fuera** del componente para no construirlo de nuevo en cada render.

## Cómo explicarlo en la entrevista

> "Es un componente de presentación: recibe nombre, descripción y precio por props y no tiene estado. Uso etiquetas semánticas: `article` para la tarjeta y `h2` para el nombre, porque ayudan a la accesibilidad y al SEO. El precio lo formateo con `toFixed(2)` para que siempre tenga dos decimales; si tuviera que manejar miles o varias monedas, usaría `Intl.NumberFormat`."

## Conceptos

- **Props**: datos que el padre le pasa al componente, como atributos de HTML.
- **Un solo elemento raíz**: un componente devuelve un elemento; para agrupar sin etiqueta extra existe el fragmento `<>...</>`.
- **Expresiones en JSX**: `{ }` evalúa JavaScript y pinta el resultado.
- **`toFixed(2)`**: convierte un número en texto con 2 decimales (redondea si hace falta).
- **HTML semántico**: `article`, `h2`, `p` describen qué es cada cosa; los lectores de pantalla y los tests los reconocen por su rol.
- **Número vs. texto en props**: `precio={28}` es número, `precio="28"` es texto.
