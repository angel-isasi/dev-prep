## Idea clave

No escondas ni muestres elementos uno por uno: ten una función **`pintar()`** que calcula qué nombres coinciden con lo escrito, **vacía** la lista y la vuelve a llenar. La llamas al montar y en cada evento `input`. Los datos (`nombres`) nunca cambian; solo cambia lo que se muestra.

## Paso a paso

1. **Crea el input** con `type = "search"` y `placeholder = "Buscar..."`, y el `<ul>`.
2. **Escribe `pintar()`**:
   - Lee lo escrito y normalízalo: `input.value.trim().toLowerCase()`.
   - Filtra: `nombres.filter((nombre) => nombre.toLowerCase().includes(busqueda))`. `filter` devuelve un arreglo **nuevo**, así que `nombres` no se toca.
   - Vacía la lista con `lista.replaceChildren()`.
   - Si no hay coincidencias, agrega el `<li class="vacio">Sin resultados</li>` y termina con `return`.
   - Si hay, agrega un `<li>` por nombre con `textContent`.
3. **Conecta el evento**: `input.addEventListener("input", pintar)`. Ojo: se pasa `pintar`, sin paréntesis.
4. **Pinta una vez al inicio**, para que se vean todos los nombres antes de escribir.
5. **Monta**: `contenedor.append(input, lista)`.

```js
export function montarBuscador(contenedor, nombres) {
  const input = document.createElement("input");
  input.type = "search";
  input.placeholder = "Buscar...";

  const lista = document.createElement("ul");

  function pintar() {
    const busqueda = input.value.trim().toLowerCase();
    const visibles = nombres.filter((nombre) => nombre.toLowerCase().includes(busqueda));

    lista.replaceChildren();

    if (visibles.length === 0) {
      const vacio = document.createElement("li");
      vacio.className = "vacio";
      vacio.textContent = "Sin resultados";
      lista.append(vacio);
      return;
    }

    for (const nombre of visibles) {
      const li = document.createElement("li");
      li.textContent = nombre;
      lista.append(li);
    }
  }

  input.addEventListener("input", pintar);
  pintar();

  contenedor.append(input, lista);
}
```

## Por qué funciona

Con `["Ana", "Bruno", "Mariana", "Luis", "Juan"]`:

| Lo escrito | `busqueda` | `visibles` | La lista muestra |
|---|---|---|---|
| (al montar) | `""` | los 5 | los 5 |
| `"an"` | `"an"` | `Ana`, `Mariana`, `Juan` | esos 3 |
| `"  LU "` | `"lu"` | `Luis` | `Luis` |
| `"zzz"` | `"zzz"` | `[]` | `Sin resultados` |
| `""` | `""` | los 5 | los 5 |

¿Por qué con el texto vacío salen todos? Porque **todo texto contiene al texto vacío**: `"Ana".includes("")` es `true`. No hace falta un `if` especial.

El evento `input` se dispara en cada cambio del campo: al escribir, borrar, pegar o usar la "x" del `type="search"`. En los tests se simula con `input.dispatchEvent(new Event("input"))`, después de cambiar `input.value` a mano.

## Errores comunes

- **Escuchar `change` en vez de `input`**: `change` se dispara recién cuando el campo pierde el foco o presionas Enter, no mientras escribes. Los tests disparan `input`, así que no pasa nada.
- **Escuchar `keyup`**: no detecta cuando pegas con el mouse ni cuando borras con la "x" del buscador.
- **No vaciar la lista antes de volver a pintar**: los resultados se acumulan y cada búsqueda agrega más `<li>` debajo de los anteriores.
- **Olvidar normalizar mayúsculas en los dos lados**: si solo haces `busqueda.toLowerCase()`, `"ana"` no encuentra a `"Ana"`. Hay que comparar `nombre.toLowerCase()` con la búsqueda en minúsculas.
- **No pintar al montar**: la lista arranca vacía hasta que el usuario escribe algo.
- **Armar la lista con `innerHTML` y los nombres**: `lista.innerHTML += "<li>" + nombre + "</li>"`. Si un nombre trae HTML se interpreta (XSS); el último test lo revisa.
- **Usar `startsWith`**: el enunciado pide "contiene"; `"Mariana"` no empieza con `"an"`.

## Otra forma de resolverlo

Crear los `<li>` **una sola vez** y, en cada búsqueda, solo elegir cuáles se quedan en la lista:

```js
export function montarBuscador(contenedor, nombres) {
  const input = document.createElement("input");
  input.type = "search";
  input.placeholder = "Buscar...";
  const lista = document.createElement("ul");

  const items = nombres.map((nombre) => {
    const li = document.createElement("li");
    li.textContent = nombre;
    return li;
  });
  const vacio = document.createElement("li");
  vacio.className = "vacio";
  vacio.textContent = "Sin resultados";

  input.addEventListener("input", () => {
    const busqueda = input.value.trim().toLowerCase();
    const visibles = items.filter((li) => li.textContent.toLowerCase().includes(busqueda));
    lista.replaceChildren(...(visibles.length ? visibles : [vacio]));
  });

  lista.append(...items);
  contenedor.append(input, lista);
}
```

Esta versión reutiliza los mismos elementos en vez de crearlos de nuevo en cada tecla: con listas grandes es más eficiente. La primera es más fácil de leer y es la que recomiendo en una entrevista. Con miles de elementos, además, convendría un **debounce**: esperar unos 300 ms sin teclear antes de filtrar.

## Cómo explicarlo en la entrevista

> "Tengo los datos en un arreglo que no cambia y una función `pintar` que deriva la vista: normaliza lo escrito con `trim` y `toLowerCase`, filtra los nombres que lo contienen, vacía la lista y la vuelve a llenar con `textContent`, o muestra 'Sin resultados' si no hay coincidencias. Escucho el evento `input`, que se dispara en cada cambio, y pinto una vez al inicio. Si la lista fuera muy grande, agregaría un debounce para no filtrar en cada tecla."

## Conceptos

- **Evento `input`**: se dispara en cada cambio del valor de un campo; `change` solo al confirmar.
- **`input.value`**: el texto actual del campo.
- **Renderizar desde los datos**: la vista se recalcula a partir del estado, en vez de parcharla a mano.
- **`filter` + `includes`**: quedarse con los elementos que contienen un texto.
- **`replaceChildren()`**: sin argumentos vacía un elemento; con argumentos, reemplaza sus hijos.
- **`dispatchEvent(new Event("input"))`**: dispara un evento desde código, útil en tests.
- **Debounce**: esperar a que el usuario deje de escribir antes de reaccionar.
