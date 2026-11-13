Crea el componente `Autocompletar`: un input que sugiere opciones mientras escribes y se puede manejar **con el teclado**. Recibe en la prop `opciones` un arreglo de textos y en la prop `onElegir` una función que llamas con la opción elegida.

## Reglas

- Un `<input>` con `role="combobox"` y `aria-label="Distrito"`.
- **Sugerencias**: las opciones que **empiezan** con lo escrito, sin distinguir mayúsculas. Si el input está vacío, no hay sugerencias.
- Si hay sugerencias, se muestran en una `<ul role="listbox">` con un `<li role="option">` por cada una. Si no hay, la lista no se pinta.
- **Flecha abajo** (`ArrowDown`) resalta la siguiente sugerencia; **flecha arriba** (`ArrowUp`) la anterior. No se sale de los extremos. Al escribir, no hay ninguna resaltada.
- La sugerencia resaltada tiene `aria-selected="true"`; las demás, `"false"`.
- **Enter** elige la resaltada (si hay una). **Clic** en una sugerencia también la elige.
- Al **elegir**: el input muestra la opción, se llama a `onElegir(opcion)` y la lista se cierra.
- **Escape** borra el texto y cierra la lista.

## Ejemplo

```jsx
<Autocompletar
  opciones={["Ica", "Ica Norte", "Parcona", "Pueblo Nuevo"]}
  onElegir={(distrito) => console.log(distrito)}
/>
```

| Acción | Input | Sugerencias (resaltada en **negrita**) |
|---|---|---|
| escribe `p` | p | Parcona, Pueblo Nuevo |
| ↓ | p | **Parcona**, Pueblo Nuevo |
| ↓ | p | Parcona, **Pueblo Nuevo** |
| ↓ (ya está en la última) | p | Parcona, **Pueblo Nuevo** |
| Enter | Pueblo Nuevo | (cerrada) y `onElegir("Pueblo Nuevo")` |

## Por qué importa

El autocompletar junta casi todo lo que preguntan en una prueba en vivo: input controlado, estado derivado (las sugerencias), eventos de teclado y accesibilidad con roles ARIA. Muchos candidatos lo hacen solo con el mouse; manejarlo con teclado te diferencia.
