## El problema

Una usuaria escribe a soporte: "**Apenas entro a 'Mis favoritos', se borran todos solos**. No llegué a tocar nada". En la consola aparece una advertencia de React: `Cannot update a component while rendering a different component`.

Para probar, un compañero dejó la lista fija sin borrar nada, y vio otra cosa rara: el botón **"Quitar" no hace nada** al hacer clic.

## Qué debe hacer

`ListaFavoritos` recibe `favoritos` (un arreglo de `{ id, nombre }`) y `onQuitar`. Muestra cada favorito con un botón **Quitar**. Al hacer clic en el botón de un favorito, llama a `onQuitar(id)` con el id de **ese** favorito, una sola vez. Mientras nadie haga clic, no se llama a `onQuitar`.

```jsx
<ListaFavoritos
  favoritos={[
    { id: 1, nombre: "Curso de React" },
    { id: 2, nombre: "Guía de CSS" },
  ]}
  onQuitar={(id) => console.log("quitar", id)}
/>
// Clic en el segundo "Quitar" -> quitar 2
```

## Tu tarea

Encuentra el error y arréglalo cambiando lo mínimo.
