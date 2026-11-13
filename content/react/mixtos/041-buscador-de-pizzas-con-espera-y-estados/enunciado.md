Crea el componente **`BuscadorPizzas`**: un buscador que espera **300 ms después de la última tecla** antes de buscar y que muestra un mensaje para cada fase (inicial, cargando, resultados, vacío y error).

Recibe la prop `buscar(texto)`: una función **asíncrona** que devuelve una promesa con un arreglo de nombres de pizzas (en la vida real haría un `fetch`).

## Reglas

- Un `<input>` con `aria-label="Buscar pizza"`, controlado.
- Lo que se busca es el texto **sin espacios al inicio ni al final**. Si queda vacío, no se llama a `buscar` y se muestra `Escribe el nombre de una pizza.`
- Se llama a `buscar` **300 ms después de la última tecla**, una sola vez.
- Mientras la promesa no responde: `Buscando…` (con el carácter de puntos suspensivos `…`).
- Si responde con resultados: una `<ul>` con un `<li>` por pizza.
- Si responde con un arreglo vacío: `No hay pizzas con “<texto>”.` (con comillas tipográficas `“ ”`).
- Si la promesa falla: un párrafo con `role="alert"` y el texto `No pudimos buscar. Revisa tu conexión.`
- Si llega la respuesta de una búsqueda **vieja** (el usuario ya escribió otra cosa), se ignora.

## Ejemplo

```jsx
const buscar = async (texto) =>
  ["Margarita", "Marinera", "Hawaiana"].filter((p) => p.toLowerCase().includes(texto.toLowerCase()));

<BuscadorPizzas buscar={buscar} />
```

| El usuario | Se ve |
|---|---|
| (nada) | Escribe el nombre de una pizza. |
| escribe `mar` y espera 300 ms | Buscando… y luego Margarita, Marinera |
| escribe `sushi` | No hay pizzas con “sushi”. |
| (la red falla) | No pudimos buscar. Revisa tu conexión. |

## Por qué importa

Es el ejercicio de "en vivo" más completo que te pueden pedir: junta debounce, peticiones asíncronas, estados de carga y error, y la **condición de carrera** (una respuesta lenta que pisa a una más nueva). Si lo resuelves y explicas la limpieza del efecto, demuestras que entiendes `useEffect` de verdad.
