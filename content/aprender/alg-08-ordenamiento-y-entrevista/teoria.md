## En una frase

Ordenar cuesta **O(n log n)** y muchas veces es el primer paso que vuelve fácil un problema; y para cualquier problema de entrevista sigue siempre el mismo método: **entender, ejemplos, plan, código y probar**, pensando en voz alta.

## Lo esencial

### `sort` sin sorpresas

```js
[10, 9, 1, 2].sort();                 // [1, 10, 2, 9]: ¡compara como texto!
[10, 9, 1, 2].sort((a, b) => a - b);  // [1, 2, 9, 10] de menor a mayor
[10, 9, 1, 2].sort((a, b) => b - a);  // [10, 9, 2, 1] de mayor a menor

const personas = [{ nombre: "Luis", edad: 30 }, { nombre: "Ana", edad: 25 }];
personas.sort((a, b) => a.edad - b.edad);                 // por número
personas.sort((a, b) => a.nombre.localeCompare(b.nombre)); // por texto, con tildes bien
```

El comparador devuelve **negativo** si `a` va antes, **positivo** si `b` va antes y **0** si da igual.

`sort` **modifica el array original**. Si no quieres tocarlo: `[...nums].sort(...)` o `nums.toSorted(...)`.

### Cuándo ordenar primero

Después de ordenar, lo que se parece queda junto y aparece una regla para avanzar.

```js
// ¿Alguna reunión se cruza con otra? Cada una es [inicio, fin]
function hayCruce(reuniones) {
  const orden = [...reuniones].sort((a, b) => a[0] - b[0]); // por hora de inicio
  for (let i = 1; i < orden.length; i++) {
    if (orden[i][0] < orden[i - 1][1]) return true; // empieza antes de que termine la anterior
  }
  return false;
}
hayCruce([[9, 10], [13, 14], [9.5, 11]]); // true
```

Sin ordenar tendrías que comparar cada par (O(n²)); ordenando basta mirar al vecino: O(n log n). Señales: **intervalos**, "el k más grande", buscar pares o tríos con dos punteros, juntar iguales.

### El método para cualquier problema

**1. Entender.** Repite el problema con tus palabras y pregunta antes de escribir:
- ¿Puede venir vacío? ¿Hay negativos, repetidos, mayúsculas?
- ¿Viene ordenado? ¿Qué devuelvo si no hay respuesta?
- ¿Puedo modificar la entrada?

**2. Ejemplos.** Escribe uno normal y uno de borde, y calcula la respuesta a mano. Si no puedes resolverlo a mano, todavía no lo entendiste.

**3. Plan.** Primero di la fuerza bruta y su Big O. Después busca la señal del patrón:

| Si el enunciado dice... | Piensa en... |
|---|---|
| contar, frecuencia, "ya apareció", par que suma | `Map` o `Set` |
| ordenado, par o trío, in-place, palíndromo | dos punteros |
| subarreglo o subcadena seguida, "más largo / más corto" | ventana deslizante |
| abrir y cerrar, deshacer, "el siguiente mayor" | pila |
| por niveles, camino más corto | cola (BFS) |
| ordenado y "encontrar" en menos de O(n) | búsqueda binaria |
| todas las combinaciones, árboles | recursión, backtracking |
| intervalos, juntar parecidos | ordenar primero |

**4. Código.** Nombres claros (`izq`, `vistos`, `mejor`), funciones pequeñas y ve diciendo qué hace cada parte. Si te trabas, escribe primero la fuerza bruta: algo que funciona vale más que nada.

**5. Probar.** Recorre tu código con el ejemplo, línea por línea, con los valores reales. Luego los bordes: vacío, un elemento, todos iguales. Termina diciendo la complejidad de tiempo y de espacio.

```js
// Así suena en voz alta, resumido:
// "Entiendo que me dan precios y debo devolver la mayor ganancia, o 0 si no hay.
//  La fuerza bruta es probar cada par: O(n²). Puedo mejorarla guardando el precio
//  más bajo visto hasta ahora: una pasada, O(n) de tiempo y O(1) de espacio."
```

## Errores típicos

**1. `sort()` sin comparador con números.** Ordena como texto: `[10, 9, 1].sort()` da `[1, 10, 9]`.

**2. Comparador que devuelve booleano.** `sort((a, b) => a > b)` devuelve `true` o `false`, no negativo o positivo, y el orden sale mal. Usa `a - b`.

**3. Olvidar que `sort` muta.** Ordenas para un cálculo y la lista que se muestra en pantalla también cambió. Copia primero.

**4. Empezar a programar sin preguntar.** Escribes diez minutos y descubres que el array podía venir vacío o que había negativos. Las preguntas del paso 1 te ahorran eso.

**5. Quedarte callado.** El entrevistador evalúa cómo piensas, no solo el resultado. Si te trabas, di qué estás intentando y qué te falta.

## Chuleta

| Quieres | Escribe |
|---|---|
| Números de menor a mayor | `nums.sort((a, b) => a - b)` |
| De mayor a menor | `nums.sort((a, b) => b - a)` |
| Por propiedad | `lista.sort((a, b) => a.precio - b.precio)` |
| Por texto | `lista.sort((a, b) => a.nombre.localeCompare(b.nombre))` |
| Sin modificar el original | `[...nums].sort(...)` o `nums.toSorted(...)` |

- `sort`: O(n log n). Ordenar + una pasada sigue siendo O(n log n).
- Método: entender, ejemplos, plan (fuerza bruta y mejora), código, probar y decir el Big O.

## En la entrevista

**¿Por qué `[10, 1, 2].sort()` no ordena bien los números?**
Porque sin comparador `sort` convierte los elementos a texto y los compara letra por letra, y `"10"` va antes que `"2"`. Hay que pasar `(a, b) => a - b`.

**¿Qué complejidad tiene ordenar?**
O(n log n) con los algoritmos que usan los motores de JavaScript. Por eso ordenar y luego recorrer una vez queda en O(n log n), mejor que comparar todos los pares en O(n²).

**¿Cómo abordas un problema que no conoces?**
Primero lo entiendo y hago preguntas sobre los casos borde, luego armo un par de ejemplos a mano. Propongo la fuerza bruta con su complejidad, busco un patrón para mejorarla, la programo explicando en voz alta y al final la pruebo con los ejemplos y digo su Big O.

**¿Qué haces si te trabas en la entrevista?**
Lo digo en voz alta: qué intenté y dónde está la duda. Vuelvo a un ejemplo pequeño a mano o escribo primero la fuerza bruta. Comunicar el razonamiento cuenta tanto como llegar a la respuesta.
