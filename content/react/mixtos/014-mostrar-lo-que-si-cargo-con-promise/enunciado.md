Un tablero junta datos de varias fuentes (ventas, clima, pedidos...). Si una fuente se cae, **no quieres perder las demás**: muestras lo que sí cargó y marcas lo que falló.

Crea el componente `Tablero`.

## Reglas

- Exporta `Tablero({ fuentes })`. `fuentes` es un arreglo de `{ nombre, cargar }`, donde `cargar` es una función asíncrona que devuelve un texto.
- Al montar, llama a **todas** las `cargar()` a la vez.
- Mientras esperan, muestra `<p>Cargando…</p>`.
- Cuando **todas** terminan (bien o mal), muestra una `<ul>` con un `<li>` por fuente, en el mismo orden:
  - Si cargó: `Nombre: valor` (por ejemplo, `Ventas: S/ 540`).
  - Si falló: `Nombre: no disponible`.

## Ejemplo

```jsx
const fuentes = [
  { nombre: "Ventas", cargar: async () => "S/ 540" },
  { nombre: "Clima", cargar: async () => { throw new Error("caído"); } },
];

<Tablero fuentes={fuentes} />
```

Se ve:

```
- Ventas: S/ 540
- Clima: no disponible
```

## Por qué importa

`Promise.all` es "todo o nada": con un solo fallo pierdes todo. `Promise.allSettled` espera a todas y te dice cuál salió bien y cuál no. Saber **cuándo usar cada una** es una pregunta frecuente en entrevistas, y en React se traduce en interfaces que fallan con elegancia.
