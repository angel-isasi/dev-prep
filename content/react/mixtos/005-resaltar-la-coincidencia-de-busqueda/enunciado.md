En un buscador, se ve muy bien que la parte que coincide aparezca **resaltada**. Crea el componente `Resaltar` que recibe un `texto` y una `busqueda`, y devuelve el texto con cada coincidencia envuelta en `<mark>`.

## Reglas

- Exporta `Resaltar({ texto, busqueda })`. Devuelve un fragmento (`<>...</>`), sin etiquetas extra alrededor.
- Cada coincidencia va dentro de un `<mark>`, **conservando cómo estaba escrita en el texto original**: buscando `"mar"` en `"Pizza Margarita"` se resalta `"Mar"`.
- No distingue mayúsculas.
- Resalta **todas** las coincidencias, no solo la primera.
- Si la búsqueda está vacía o solo tiene espacios, devuelve el texto sin ningún `<mark>`.
- Lo que escribe el usuario puede traer caracteres especiales de las expresiones regulares (`(`, `.`, `*`, `?`...). Deben buscarse **como texto literal** y no romper nada.
- El texto completo se sigue viendo igual: solo se agregan las marcas.

## Ejemplo

```jsx
<p><Resaltar texto="Pizza Margarita (grande)" busqueda="mar" /></p>
// <p>Pizza <mark>Mar</mark>garita (grande)</p>

<p><Resaltar texto="Pizza (grande)" busqueda="(" /></p>
// <p>Pizza <mark>(</mark>grande)</p>

<p><Resaltar texto="Pizza" busqueda="z" /></p>
// <p>Pi<mark>z</mark><mark>z</mark>a</p>
```

## Por qué importa

Une `split`, expresiones regulares y el render de listas de nodos en JSX. Además toca un tema que los entrevistadores valoran: **no confiar en lo que escribe el usuario**. Si armas una `RegExp` con su texto sin escaparlo, un simple `(` hace que la app lance un error.
