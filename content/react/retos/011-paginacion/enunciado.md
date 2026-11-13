Crea el componente `ListaPaginada` que recibe una lista de textos en la prop `items` y cuántos mostrar por página en la prop `porPagina` (por defecto `3`). Muestra **solo los items de la página actual** y botones para moverse entre páginas.

## Reglas

- Una lista `<ul>` con un `<li>` por cada item de la página actual.
- Un botón con el texto **"Anterior"** y otro con el texto **"Siguiente"**.
- Entre ellos, un texto con el formato **"Página X de Y"** (por ejemplo `Página 2 de 3`).
- Al inicio se ve la página 1.
- En la primera página, "Anterior" está **deshabilitado** (`disabled`). En la última, "Siguiente" está deshabilitado.
- Si `items` está vacío, hay **1** página (`Página 1 de 1`) y los dos botones están deshabilitados.

## Ejemplo

```jsx
<ListaPaginada items={["a", "b", "c", "d", "e"]} porPagina={2} />
```

| Acción | Se ve |
|---|---|
| (al inicio) | a, b · Página 1 de 3 · "Anterior" deshabilitado |
| clic en "Siguiente" | c, d · Página 2 de 3 |
| clic en "Siguiente" | e · Página 3 de 3 · "Siguiente" deshabilitado |
| clic en "Anterior" | c, d · Página 2 de 3 |

## Por qué importa

Casi toda app real pagina datos: productos, noticias, resultados de búsqueda. El entrevistador quiere ver si guardas **solo la página actual** y calculas lo demás, y si cuidas los bordes (primera y última página, lista vacía).
