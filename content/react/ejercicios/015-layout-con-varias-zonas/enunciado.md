Crea el componente `Layout`: la estructura de una página con tres zonas, encabezado, contenido principal y pie. Quien lo usa decide qué va en cada zona pasándole **JSX como props**.

## Reglas

- Exporta la función `Layout`, que recibe tres props: `encabezado`, `children` y `pie`.
- Devuelve, en este orden y sin un `<div>` que los envuelva (usa un fragmento `<>...</>`):
  - un `<header>` con lo que llegue en `encabezado`,
  - un `<main>` con lo que llegue en `children` (lo que se escribe entre `<Layout>` y `</Layout>`),
  - un `<footer>` con lo que llegue en `pie`, **solo si** llegó `pie`. Si no llega, no se pinta ningún `<footer>`.

En los tests, el `<header>` se busca por su rol `banner`, el `<main>` por el rol `main` y el `<footer>` por el rol `contentinfo`.

## Ejemplo

```jsx
<Layout encabezado={<h1>Padre Gino</h1>} pie={<small>Lima, 2026</small>}>
  <p>Menú</p>
</Layout>
```

| Uso | Se ve |
|---|---|
| con `encabezado`, `children` y `pie` | header "Padre Gino", main "Menú", footer "Lima, 2026" |
| sin `pie` | header y main, **sin** footer |

## Por qué importa

Así se arman las plantillas de páginas en React: un componente define la estructura y otros rellenan los huecos. Es el patrón de **composición**, que React recomienda en lugar de la herencia, y te lo pueden preguntar como "¿qué es `children`?" o "¿cómo harías un layout reutilizable?".
