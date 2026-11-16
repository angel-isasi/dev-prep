## El problema

Una usuaria de la app de pendientes reporta: "Marqué **'Pagar la luz'** como hecha. Después borré **'Comprar pan'** y, de repente, 'Pagar la luz' aparece **sin marcar** y la que quedó marcada es **'Llamar a mamá'**, que todavía no hice".

Marcar y borrar por separado funcionan bien. Tampoco hay errores en la consola.

## Qué debe hacer

`Pendientes` recibe `iniciales` (un arreglo de `{ id, texto }`) y muestra cada tarea con:

- una casilla de "hecho", que cada tarea recuerda por su cuenta;
- un botón **Borrar {texto}** que la quita de la lista.

Al borrar una tarea, **las demás conservan su casilla** tal como estaba.

```jsx
<Pendientes
  iniciales={[
    { id: 1, texto: "Comprar pan" },
    { id: 2, texto: "Pagar la luz" },
    { id: 3, texto: "Llamar a mamá" },
  ]}
/>
// Marco "Pagar la luz", borro "Comprar pan":
// [x] Pagar la luz
// [ ] Llamar a mamá
```

## Tu tarea

Encuentra el error y arréglalo cambiando lo mínimo.
