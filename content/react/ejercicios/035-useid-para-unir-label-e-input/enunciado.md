Crea el componente reutilizable `Campo`: una etiqueta y un input **correctamente unidos**, aunque uses el componente muchas veces en la misma página.

```jsx
<Campo etiqueta="Teléfono" type="tel" placeholder="999 999 999" />
```

## Reglas

- Recibe `etiqueta` (el texto del `<label>`) y **cualquier otra prop**, que se pasa tal cual al `<input>` (`type`, `placeholder`, `value`, `onChange`, `required`...).
- Pinta un `<label>` y, **al lado** (no adentro), un `<input>`.
- El `<label>` debe estar unido al input con `htmlFor` apuntando al `id` del input. Así, al hacer clic en la etiqueta se enfoca el input, y los lectores de pantalla lo anuncian con su nombre.
- El `id` lo genera **`useId`**: cada `Campo` debe tener un id distinto, incluso si dos campos tienen la misma etiqueta.

## Ejemplo

```jsx
<form>
  <Campo etiqueta="Nombre" />
  <Campo etiqueta="Teléfono" type="tel" />
</form>
```

Genera algo como:

```html
<label for="_r_1_">Nombre</label>   <input id="_r_1_">
<label for="_r_2_">Teléfono</label> <input id="_r_2_" type="tel">
```

| Prueba | Resultado |
|---|---|
| Buscar el input por la etiqueta "Teléfono" | lo encuentra y es `type="tel"` |
| Comparar los `id` de Nombre y Teléfono | son distintos |
| Dos campos con etiqueta "Nombre" | dos inputs distintos, cada uno con su label |

## Por qué importa

Un `id` escrito a mano (`id="nombre"`) se repite si usas el componente dos veces, y entonces el segundo label apunta al primer input. `useId` existe justo para esto, y unir label e input es la base de la **accesibilidad** de formularios, algo que cada vez más empresas revisan en entrevistas.
