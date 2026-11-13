Crea el componente `Carrito`, que recibe en la prop `inicial` un arreglo de pizzas (`{ id, nombre }`) y las muestra en una lista. Cada pizza tiene un botón para **quitarla** del carrito.

## Reglas

- Exporta la función `Carrito({ inicial })`.
- La lista de pizzas vive en el **estado** del componente, y empieza con el valor de `inicial`.
- Pinta una `<ul>` con un `<li>` por pizza. Dentro del `<li>` va el nombre y un botón.
- El botón muestra `×` y tiene `aria-label` con el texto exacto **`Quitar {nombre}`** (por ejemplo, `aria-label="Quitar Margarita"`). Así los tests y los lectores de pantalla saben qué quita cada botón.
- Al hacer clic, esa pizza desaparece de la lista. Las demás se quedan.
- **No modifiques** el arreglo `inicial` que te pasan (nada de `splice` ni `pop`): crea un arreglo nuevo.

## Ejemplo

```jsx
<Carrito
  inicial={[
    { id: 1, nombre: "Margarita" },
    { id: 2, nombre: "Hawaiana" },
  ]}
/>
```

| Acción | Se ve |
|---|---|
| (al inicio) | Margarita ×, Hawaiana × |
| Clic en "Quitar Margarita" | Hawaiana × |
| Clic en "Quitar Hawaiana" | (lista vacía) |

## Por qué importa

Quitar un elemento de una lista es una de las operaciones más comunes en React (carritos, tareas, filtros). La entrevista mira si actualizas el estado **sin mutarlo**, usando `filter` para crear un arreglo nuevo.
