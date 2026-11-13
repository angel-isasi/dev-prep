Crea el componente `Pestanas`, que recibe la prop `pestanas`: un arreglo de objetos `{ titulo, contenido }`. Muestra un botón por pestaña y, debajo, el contenido de la pestaña activa. Debe ser **accesible**: usable con teclado y entendible para un lector de pantalla.

## Reglas

- Un contenedor con `role="tablist"` y dentro un `<button role="tab">` por pestaña, con su `titulo` como texto.
- Un único panel con `role="tabpanel"` cuyo texto es **solo** el `contenido` de la pestaña activa.
- Al inicio está activa la **primera** pestaña.
- Clic en una pestaña la activa.
- La pestaña activa tiene `aria-selected="true"` y `tabIndex={0}`; las demás, `aria-selected="false"` y `tabIndex={-1}`.
- Con el foco en una pestaña:
  - **Flecha derecha** (`ArrowRight`) activa la siguiente; desde la última vuelve a la primera.
  - **Flecha izquierda** (`ArrowLeft`) activa la anterior; desde la primera va a la última.
- Conecta pestaña y panel con ids: cada tab lleva `aria-controls` con el id del panel, y el panel lleva `aria-labelledby` con el id de la pestaña activa. Genera los ids con `useId`.

## Ejemplo

```jsx
<Pestanas
  pestanas={[
    { titulo: "Drama", contenido: "Cortos de drama" },
    { titulo: "Terror", contenido: "Cortos de terror" },
    { titulo: "Comedia", contenido: "Cortos de comedia" },
  ]}
/>
```

| Acción | Pestaña activa | Panel |
|---|---|---|
| (inicio) | Drama | `Cortos de drama` |
| clic en `Terror` | Terror | `Cortos de terror` |
| `ArrowRight` en Terror | Comedia | `Cortos de comedia` |
| `ArrowRight` en Comedia | Drama (da la vuelta) | `Cortos de drama` |
| `ArrowLeft` en Drama | Comedia | `Cortos de comedia` |

## Por qué importa

Las pestañas están en todos los paneles de administración. Hacer que "cambien de contenido" es fácil; lo que distingue a un buen candidato es usar los **roles ARIA** correctos y soportar el **teclado**, que es lo que exigen las pautas de accesibilidad.
