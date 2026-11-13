Crea el componente `PrecioRemoto`, que muestra el precio de una pizza según su tamaño. El precio no lo tienes: lo pides con la función `obtenerPrecio(tamano)`, que devuelve una **promesa** (como si consultara un servidor). Cuando cambia la prop `tamano`, vuelve a pedir el precio.

## Reglas

- Exporta la función `PrecioRemoto({ tamano, obtenerPrecio })`.
- Llama a `obtenerPrecio(tamano)` al montar y **cada vez que cambie `tamano`**.
- Mientras la promesa no responde, muestra un párrafo que empiece con **`Calculando`** (por ejemplo, `Calculando…`).
- Cuando responde con un número, muestra **`S/ {precio}`**, por ejemplo `S/ 28`.
- Al cambiar de tamaño, vuelve a mostrar `Calculando…` hasta que llegue el precio nuevo.
- **Respuestas viejas no deben pisar a las nuevas.** Si pides el precio de `"M"`, el usuario cambia a `"L"` y la respuesta de `"M"` llega **después** que la de `"L"`, debe quedarse el precio de `"L"`.

## Ejemplo

```jsx
const obtenerPrecio = async (tamano) => ({ M: 28, L: 36 })[tamano];

<PrecioRemoto tamano="M" obtenerPrecio={obtenerPrecio} />
```

| Acción | Se ve |
|---|---|
| Al montar con `tamano="M"` | Calculando… |
| Responde la promesa de `"M"` | S/ 28 |
| El padre cambia a `tamano="L"` | Calculando… y luego S/ 36 |
| `"M"` responde tarde, después de `"L"` | sigue S/ 36 |

## Por qué importa

Pedir datos cuando cambia una prop (un id, una búsqueda, una página) es lo que más vas a hacer con `useEffect` en el trabajo real. Y la **condición de carrera** (respuestas que llegan en desorden) es un bug clásico que los entrevistadores usan para separar a quien copia un `fetch` de quien entiende los efectos.
