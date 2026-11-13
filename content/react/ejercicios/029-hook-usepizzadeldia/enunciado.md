Crea el hook propio `usePizzaDelDia` que **pide datos de forma asíncrona** y el componente `PizzaDelDia` que lo usa. El componente no sabe cómo se obtienen los datos: solo llama al hook.

```jsx
const pizza = usePizzaDelDia(obtener); // null mientras carga, luego { nombre }
```

## Reglas

- `usePizzaDelDia(obtener)`:
  - `obtener` es una función **asíncrona** (devuelve una promesa) que resuelve un objeto como `{ nombre: "Cuatro quesos" }`.
  - Devuelve `null` mientras espera y el objeto cuando llega.
  - Llama a `obtener` **al montar** (una sola vez) y otra vez solo si cambia la función `obtener`.
  - Si `obtener` cambia antes de que llegue la respuesta anterior, **la respuesta vieja no debe pisar a la nueva** (ignórala).
- `PizzaDelDia({ obtener })`:
  - Mientras `pizza` es `null`: un `<p>` con **"Cargando la pizza del día…"**.
  - Cuando llega: un `<h2>` con **"Hoy: "** seguido del nombre, por ejemplo **"Hoy: Cuatro quesos"**.

## Ejemplo

```jsx
const obtener = async () => ({ nombre: "Cuatro quesos" });

<PizzaDelDia obtener={obtener} />
```

| Momento | `pizza` | Se ve |
|---|---|---|
| Primer render | `null` | Cargando la pizza del día… |
| La promesa se resuelve | `{ nombre: "Cuatro quesos" }` | **Hoy: Cuatro quesos** |

## Por qué importa

Pedir datos en un `useEffect` y sacarlo a un hook propio es de lo más común en React. El detalle de **ignorar respuestas viejas** (condición de carrera) es justo lo que separa a un junior que copió un tutorial de uno que entiende los efectos.
