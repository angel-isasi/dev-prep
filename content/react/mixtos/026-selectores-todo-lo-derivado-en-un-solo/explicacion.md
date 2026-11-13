## Idea clave

El componente guarda en el estado **solo lo que eligió el usuario** (los filtros). Todo lo demás (la lista visible, cuántas son, la más barata) es **estado derivado**, y se calcula en una sola función pura: el **selector**.

## Paso a paso

1. **Parámetros con valores por defecto.** Desestructura el segundo argumento: `{ busqueda = "", soloVeggie = false } = {}`. El `= {}` final es lo que permite llamar `seleccionar(pizzas)` sin filtros: sin él, JavaScript intentaría desestructurar `undefined` y lanzaría un error.
2. **Prepara el texto una sola vez.** `busqueda.trim().toLowerCase()` quita espacios de los extremos y pasa a minúsculas. Hazlo fuera del `filter` para no repetirlo por cada pizza.
3. **Filtra.** Una pizza pasa si su nombre en minúsculas incluye el texto **y** cumple el filtro veggie. La condición `!soloVeggie || pizza.veggie` se lee: "si no pidieron solo veggie, pasa; si lo pidieron, tiene que ser veggie".
4. **Deriva la cantidad** con `visibles.length`.
5. **Busca la más barata** con `toSorted` (copia ordenada por precio) y toma el primer elemento. Si `visibles` está vacía, `[0]` da `undefined`, y `?? null` lo convierte en `null`.
6. **Devuelve todo junto** en un objeto.

```jsx
export function seleccionar(pizzas, { busqueda = "", soloVeggie = false } = {}) {
  const texto = busqueda.trim().toLowerCase();

  const visibles = pizzas.filter(
    (pizza) => pizza.nombre.toLowerCase().includes(texto) && (!soloVeggie || pizza.veggie),
  );

  const masBarata = visibles.toSorted((a, b) => a.precio - b.precio)[0] ?? null;

  return { visibles, cantidad: visibles.length, masBarata };
}
```

En un componente se usaría así, sin `useEffect` ni estados extra:

```jsx
function Menu({ pizzas }) {
  const [filtros, setFiltros] = useState({ busqueda: "", soloVeggie: false });
  const { visibles, cantidad, masBarata } = seleccionar(pizzas, filtros);
  // ... pintar inputs, la lista, "3 pizzas", "La más barata: Marinera"
}
```

## Por qué funciona

Recorrido con `seleccionar(pizzas, { busqueda: "mar" })`:

1. `busqueda` vale `"mar"` y `soloVeggie` toma su valor por defecto, `false`. `texto` es `"mar"`.
2. El filtro revisa cada pizza:

| Pizza | `nombre.toLowerCase()` | ¿incluye `"mar"`? | `!soloVeggie \|\| veggie` | ¿pasa? |
|---|---|---|---|---|
| Margarita | `"margarita"` | sí | `true` (no pidieron veggie) | sí |
| Marinera | `"marinera"` | sí | `true` | sí |
| Carnívora | `"carnívora"` | no | `true` | no |

3. `visibles` = `[Margarita, Marinera]`, `cantidad` = 2.
4. `toSorted` crea una copia ordenada por precio: `[Marinera (24), Margarita (28)]`. El primero es Marinera. `visibles` sigue en su orden original porque `toSorted` no la tocó.

Con `{ busqueda: "zzz" }`, `visibles` es `[]`, la copia ordenada también es `[]`, `[][0]` es `undefined` y `undefined ?? null` da `null`.

¿Y si el texto está vacío? `"margarita".includes("")` es `true`: todo texto contiene al texto vacío, por eso sin búsqueda pasan todas.

## Errores comunes

- **Usar `sort` en vez de `toSorted`.** `visibles.sort(...)` ordena **el mismo arreglo**, así que `visibles` quedaría ordenada por precio y no en el orden original. Lo reconoces porque la lista aparece reordenada. Y si algún día haces `pizzas.sort(...)` directo sobre una prop, desordenas los datos del componente padre, un bug muy difícil de rastrear.
- **Olvidar el `= {}` del parámetro.** `seleccionar(pizzas)` lanza `Cannot destructure property 'busqueda' of undefined`.
- **Devolver `undefined` en vez de `null`.** `[][0]` es `undefined`; el test pide `null` explícito. `null` comunica "busqué y no hay", y es lo que se suele chequear en la vista (`masBarata === null`).
- **Escribir la condición veggie al revés**, por ejemplo `soloVeggie && pizza.veggie`. Con `soloVeggie` en `false` esa expresión es `false` y no pasaría ninguna pizza.
- **Guardar `visibles`, `cantidad` o `masBarata` en `useState`** dentro del componente. Funciona, pero tienes cuatro estados que se desincronizan apenas olvidas actualizar uno.

## Otra forma de resolverlo

Buscar la más barata con `reduce`, en una sola pasada y sin crear una copia ordenada:

```jsx
const masBarata = visibles.reduce(
  (mejor, pizza) => (mejor === null || pizza.precio < mejor.precio ? pizza : mejor),
  null,
);
```

**¿Cuándo conviene?** `reduce` recorre la lista una vez (O(n)); ordenar cuesta O(n log n). Con un menú de 20 pizzas da igual y `toSorted` se lee más fácil. Con miles de elementos, o si solo necesitas el mínimo, `reduce` es más eficiente. Si el selector se volviera caro, en el componente lo envolverías en `useMemo(() => seleccionar(pizzas, filtros), [pizzas, filtros])`.

## Cómo explicarlo en la entrevista

> "En el estado guardo solo lo que el usuario decide, que son los filtros. Todo lo que se puede calcular a partir de eso lo saco en una función pura, un selector, que devuelve la lista visible, la cantidad y la más barata. Así no hay estados duplicados que sincronizar, y la lógica la puedo probar sin montar componentes. Uso `toSorted` porque no muta el arreglo, y devuelvo `null` cuando no hay resultados para que la vista lo maneje explícitamente."

## Conceptos

- **Estado derivado**: lo que se calcula a partir de props o estado no se guarda aparte.
- **Selector**: función pura que transforma el estado crudo en lo que la vista necesita.
- **Función pura**: mismo resultado para los mismos argumentos y sin modificar nada de afuera.
- **Desestructuración con valores por defecto**: `{ a = 1 } = {}` en los parámetros.
- **`filter` + `includes`**: quedarse con los elementos que contienen un texto.
- **`toSorted`**: versión inmutable de `sort` (ES2023), devuelve una copia ordenada.
- **Operador `??`**: usa el valor de la derecha solo si el de la izquierda es `null` o `undefined`.
