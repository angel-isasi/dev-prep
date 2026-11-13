Crea el componente `Cantidades`, que recibe en la prop `inicial` un arreglo de items del pedido (`{ id, nombre, cantidad }`) y permite **subir o bajar la cantidad** de cada uno con botones `+` y `−`.

## Reglas

- Exporta la función `Cantidades({ inicial })`. La lista vive en el estado y empieza con `inicial`.
- Pinta una `<ul>` con un `<li>` por item. El texto del `<li>` empieza con **`{nombre} x{cantidad}`**, por ejemplo `Margarita x2`.
- Cada `<li>` tiene dos botones:
  - `−` con `aria-label` exacto **`Menos {nombre}`** (por ejemplo, `"Menos Margarita"`).
  - `+` con `aria-label` exacto **`Más {nombre}`** (con tilde: `"Más Margarita"`).
- La cantidad **nunca baja de 1**: si está en 1 y aprietas `−`, se queda en 1.
- Solo cambia el item cuyo botón tocaste; los demás quedan igual.
- **No modifiques** el arreglo `inicial` ni sus objetos: crea copias.

## Ejemplo

```jsx
<Cantidades
  inicial={[
    { id: 1, nombre: "Margarita", cantidad: 1 },
    { id: 2, nombre: "Hawaiana", cantidad: 3 },
  ]}
/>
```

| Acción | Se ve |
|---|---|
| (al inicio) | Margarita x1, Hawaiana x3 |
| `+` de Margarita dos veces | Margarita x3, Hawaiana x3 |
| `−` de Margarita | Margarita x2, Hawaiana x3 |
| `−` de Margarita tres veces más | Margarita x1 (no baja de 1) |

## Por qué importa

Actualizar **un** elemento dentro de un arreglo del estado es el patrón base de carritos, listas de tareas y tablas editables. En entrevistas miran si usas `map` + spread para crear copias en vez de modificar el objeto directamente.
