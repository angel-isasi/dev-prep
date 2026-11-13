Crea el componente `TituloPedido`, que recibe la prop `cantidad` (cuántas pizzas hay en el carrito) y **cambia el título de la pestaña del navegador** (`document.title`) para mostrarla.

## Reglas

- Exporta la función `TituloPedido({ cantidad })`.
- Si `cantidad` es mayor que 0, el título de la pestaña es **`({cantidad}) Padre Gino`**, por ejemplo `(3) Padre Gino`.
- Si `cantidad` es 0, el título es solo **`Padre Gino`**.
- Cuando la prop `cantidad` cambia, el título se actualiza.
- En la página, el componente pinta un párrafo con el texto **`{cantidad} en el carrito`**, por ejemplo `3 en el carrito`.
- Cambia el título dentro de un **`useEffect`**, no directamente en el cuerpo del componente.

## Ejemplo

```jsx
<TituloPedido cantidad={3} />
```

| Prop `cantidad` | Se ve en la página | Título de la pestaña |
|---|---|---|
| `0` | 0 en el carrito | Padre Gino |
| `3` | 3 en el carrito | (3) Padre Gino |
| cambia de `3` a `0` | 0 en el carrito | Padre Gino |

## Por qué importa

Es el ejemplo más simple de **efecto**: sincronizar React con algo que está fuera de él (aquí, el título de la pestaña). Entender cuándo corre un efecto y para qué sirve el arreglo de dependencias es de las preguntas más comunes en entrevistas de React.
