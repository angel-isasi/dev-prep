## Idea clave

Cada filtro es una **fábrica de predicados**: recibe su configuración y devuelve una función `(pizza) => true/false`. `todos` combina varios predicados en uno con `every`. El resultado se pasa directo a `filter`. Agregar un filtro nuevo es escribir una función más, sin tocar las otras.

## Paso a paso

1. **Fábricas con closures.** `hastaPrecio(35)` devuelve `(pizza) => pizza.precio <= 35`. El `35` queda "guardado" dentro de la función devuelta (closure). Lo mismo con la categoría y el texto.
2. **El caso "Todas".** En `deCategoria`, `!categoria || pizza.categoria === categoria` se lee: "si no hay categoría elegida, pasa; si la hay, tiene que coincidir". `!""` es `true`, así que con `""` pasa todo sin evaluar lo de la derecha.
3. **Texto sin mayúsculas.** Pasa ambos lados a minúsculas antes de `includes`.
4. **`todos(...condiciones)`.** El parámetro rest `...condiciones` junta todos los argumentos en un arreglo. La función devuelta recibe un item y pregunta `condiciones.every((cumple) => cumple(item))`: `true` solo si **todas** las condiciones dicen `true`.
5. **`every` sobre un arreglo vacío es `true`.** Por eso `todos()` deja pasar todo, que es lo correcto: "sin condiciones, nada que impida".

```jsx
export const todos = (...condiciones) => (item) => condiciones.every((cumple) => cumple(item));

export const deCategoria = (categoria) => (pizza) => !categoria || pizza.categoria === categoria;

export const hastaPrecio = (max) => (pizza) => pizza.precio <= max;

export const conTexto = (texto) => (pizza) => pizza.nombre.toLowerCase().includes(texto.toLowerCase());
```

## Por qué funciona

Recorrido de `pizzas.filter(todos(deCategoria("clásica"), hastaPrecio(35), conTexto("mar")))`:

1. Se crean tres predicados y `todos` los guarda en `condiciones`.
2. `filter` llama al predicado combinado con cada pizza, y `every` va preguntando en orden:

| Pizza | ¿clásica? | ¿precio <= 35? | ¿contiene "mar"? | Resultado |
|---|---|---|---|---|
| Margarita (clásica, 28) | sí | sí | sí | pasa |
| Marinera (clásica, 40) | sí | **no** | (no se pregunta) | no pasa |
| Vegana (veggie, 30) | **no** | (no se pregunta) | (no se pregunta) | no pasa |

`every` **se detiene** en el primer `false`: no hace falta revisar el resto. Por eso conviene poner primero los filtros más baratos o los que descartan más.

Con `todos(deCategoria(""), hastaPrecio(100))`: `deCategoria("")` siempre da `true` y todas cuestan menos de 100, así que pasan las 3.

## Errores comunes

- **Que la fábrica filtre directamente** (`hastaPrecio(pizza, max)`). Entonces no puedes pasarla a `todos` ni a `filter`. Lo reconoces porque el test dice que `hastaPrecio(30)` no es una función.
- **Usar `some` en vez de `every`.** `some` es un "o": pasaría cualquier pizza que cumpla **al menos una** condición.
- **Olvidar el caso de categoría vacía.** `pizza.categoria === ""` es siempre `false`, y elegir "Todas" dejaría la lista vacía.
- **Escribir `todos(condiciones)` sin los tres puntos.** `condiciones` sería el primer predicado, no un arreglo, y `every` no existe en una función: `condiciones.every is not a function`.
- **Usar `<` en vez de `<=`.** Con `hastaPrecio(30)` se perdería la Vegana, que cuesta exactamente 30.

## Otra forma de resolverlo

Un único `filter` con todas las condiciones juntas:

```jsx
function filtrarPizzas(pizzas, { categoria, max, texto }) {
  return pizzas.filter(
    (p) =>
      (!categoria || p.categoria === categoria) &&
      p.precio <= max &&
      p.nombre.toLowerCase().includes(texto.toLowerCase()),
  );
}
```

**¿Cuándo conviene?** Si son dos o tres filtros fijos que nunca cambian, esta versión es más directa y cualquiera la entiende al vuelo. La versión con fábricas gana cuando los filtros son muchos, se activan o desactivan según lo que elija el usuario (puedes armar el arreglo de condiciones dinámicamente), o se reutilizan en varias pantallas. También es fácil agregar `alguno(...condiciones)` con `some` para combinar con "o".

## Cómo explicarlo en la entrevista

> "Cada filtro es una fábrica: recibe su configuración y devuelve un predicado que responde verdadero o falso para una pizza, gracias a un closure. Luego `todos` recibe cualquier cantidad de predicados con el parámetro rest y devuelve uno solo que usa `every`, así que pasa solo si se cumplen todos, y se detiene en el primero que falla. El resultado va directo a `filter`. Agregar un filtro nuevo es escribir una función más sin tocar las demás, y cada una la pruebo por separado."

## Conceptos

- **Predicado**: función que recibe un elemento y devuelve un booleano.
- **Fábrica de funciones**: función que recibe configuración y devuelve otra función.
- **Closure**: la función devuelta recuerda los valores con los que se creó.
- **Parámetro rest `...args`**: junta los argumentos en un arreglo.
- **`every` / `some`**: "todos cumplen" / "al menos uno cumple"; ambos se detienen apenas saben la respuesta.
- **Composición**: armar comportamientos complejos juntando funciones pequeñas.
- **Cortocircuito con `||`**: si la izquierda es verdadera, no se evalúa la derecha.
