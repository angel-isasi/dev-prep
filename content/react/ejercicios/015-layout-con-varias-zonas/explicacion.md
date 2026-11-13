## Idea clave

Las props no son solo textos o números: **pueden ser JSX**. Así un componente define la estructura (las "zonas") y quien lo usa decide el contenido. `children` es la zona por defecto; para las demás se usan props con nombre (`encabezado`, `pie`). Esto se llama **composición**.

## Paso a paso

1. **Recibe las tres props.** `encabezado` y `pie` llegan como JSX ya armado (por ejemplo `<h1>Padre Gino</h1>`). `children` es lo que escribiste entre las etiquetas de apertura y cierre.
2. **Usa un fragmento.** `<>...</>` agrupa varios elementos sin meter un `<div>` extra en el HTML. Un componente debe devolver un solo elemento raíz, y el fragmento cumple esa regla sin ensuciar el DOM.
3. **Pinta header y main.** `<header>{encabezado}</header>` y `<main>{children}</main>`: las llaves insertan el JSX que llegó.
4. **Pie opcional.** `{pie && <footer>{pie}</footer>}`. Si `pie` es `undefined`, la expresión `&&` se queda en `undefined` y React no pinta nada; si hay pie, pinta el `<footer>`.
5. **Etiquetas semánticas.** `<header>`, `<main>` y `<footer>` le dicen al navegador y a los lectores de pantalla qué es cada zona. Por eso los tests las encuentran por rol: `banner`, `main` y `contentinfo`.

```jsx
export function Layout({ encabezado, children, pie }) {
  return (
    <>
      <header>{encabezado}</header>
      <main>{children}</main>
      {/* El pie es opcional: sin `pie` no se pinta el <footer>. */}
      {pie && <footer>{pie}</footer>}
    </>
  );
}
```

## Por qué funciona

React convierte el uso del componente en un objeto de props. Fíjate en que `children` se arma solo:

| Uso | Props que recibe | Se pinta |
|---|---|---|
| `<Layout encabezado={<h1>Padre Gino</h1>}><p>Menú</p></Layout>` | `{ encabezado: <h1>…</h1>, children: <p>Menú</p> }` | header + main |
| lo mismo con `pie={<small>Lima</small>}` | además `pie: <small>Lima</small>` | header + main + footer |

En el primer caso `pie` es `undefined`, así que `pie && ...` da `undefined` y no aparece ningún `<footer>`. Con dos hijos (`<p>Menú</p><p>Promociones</p>`), `children` es un arreglo con los dos, y React los pinta seguidos dentro del `<main>`.

## Errores comunes

- **Envolver todo en un `<div>`.** Funciona en pantalla, pero agrega un nodo innecesario y rompe estructuras de CSS (grid, flex) del padre. El test del orden lo detecta porque espera exactamente `HEADER`, `MAIN`, `FOOTER`.
- **Pintar siempre el `<footer>`**, aunque sea vacío. Deja una zona vacía que los lectores de pantalla anuncian igual. Lo reconoces porque falla "sin pie no hay footer".
- **Usar `<div className="header">`** en vez de `<header>`. Se ve igual, pero pierdes el significado: no tiene rol `banner` y los tests (y los lectores de pantalla) no lo reconocen.
- **Olvidar `children`** en los parámetros o escribirlo como `{props.children}` sin recibir `props`. El `<main>` queda vacío.
- **Llamar `encabezado` como función** (`{encabezado()}`). Es JSX, no una función: se inserta tal cual con `{encabezado}`.

## Otra forma de resolverlo

Con un ternario, que deja claro qué se pinta en cada caso:

```jsx
export function Layout({ encabezado, children, pie }) {
  return (
    <>
      <header>{encabezado}</header>
      <main>{children}</main>
      {pie ? <footer>{pie}</footer> : null}
    </>
  );
}
```

**¿Cuándo conviene?** Es equivalente aquí. El ternario es más seguro si la condición pudiera ser `0` o `""` (con `&&` React pintaría el `0`). Como `pie` es JSX o `undefined`, el `&&` es suficiente y más corto.

Un paso más allá es el patrón de **componentes compuestos** (`<Layout.Header>`, `<Layout.Main>`), que verás más adelante: sirve cuando las zonas son muchas o tienen comportamiento propio.

## Cómo explicarlo en la entrevista

> "Uso composición: el `Layout` define la estructura y recibe el contenido como props. `children` es lo que va entre las etiquetas y lo pongo en el `<main>`; para el resto de zonas uso props con nombre que reciben JSX, como `encabezado` y `pie`. El pie es opcional, así que lo pinto con renderizado condicional. Devuelvo un fragmento para no agregar un `div` extra, y uso etiquetas semánticas para que la página sea accesible."

## Conceptos

- **Composición**: armar componentes grandes pasando componentes como contenido de otros.
- **`children`**: prop especial con lo que va entre la etiqueta de apertura y la de cierre.
- **JSX como prop**: cualquier prop puede recibir elementos de React.
- **Fragmento `<>...</>`**: agrupa elementos sin agregar nodos al DOM.
- **Renderizado condicional con `&&`**: pinta el elemento solo si hay valor.
- **HTML semántico**: `header`, `main` y `footer` tienen significado y roles (`banner`, `main`, `contentinfo`).
