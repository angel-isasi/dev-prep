Crea el componente `Disponibles` que recibe la prop `pizzas` (arreglo de `{ nombre, precio, disponible }`) y muestra **solo las disponibles**, ordenadas **de la más barata a la más cara**.

## Reglas

- Una lista ordenada `<ol>` con un `<li>` por pizza disponible, que muestra solo su `nombre`.
- Las pizzas con `disponible: false` no aparecen.
- Orden por `precio` ascendente. Si dos cuestan lo mismo, conservan el orden en que venían.
- **No modifiques la prop `pizzas`**: en los tests llega congelada con `Object.freeze`, y si intentas ordenarla en su lugar se lanza un error.

## Ejemplo

```jsx
<Disponibles
  pizzas={[
    { nombre: "Trufa", precio: 45, disponible: true },
    { nombre: "Agotada", precio: 10, disponible: false },
    { nombre: "Margarita", precio: 28, disponible: true },
  ]}
/>
```

Se ve:

```
1. Margarita
2. Trufa
```

## Por qué importa

En React **las props son de solo lectura**. `sort` ordena el arreglo original (lo muta), y si ese arreglo viene del padre o del estado, le cambias los datos a alguien más sin que React se entere. Saber que `toSorted` (o copiar antes de `sort`) evita ese bug es una pregunta típica de entrevista.
