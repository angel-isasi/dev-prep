## Idea clave

Divide el problema: **separar** la frase en palabras con `split`, **transformar** cada palabra con `map` (primera letra en mayúscula + resto en minúscula) y **volver a unir** con `join`. Cuida las palabras vacías que aparecen cuando hay espacios dobles.

## Paso a paso

1. **Separa** con `split(" ")`: `"de ica"` da `["de", "ica"]`.
2. **Transforma cada palabra** con `map`:
   - `palabra[0]` es la primera letra; `toUpperCase()` la pasa a mayúscula.
   - `palabra.slice(1)` es el texto desde la posición 1 hasta el final; `toLowerCase()` lo pasa a minúscula.
   - Los unes con `+`.
3. **Cuida la palabra vacía**: si hay dos espacios seguidos, `split(" ")` deja un `""` entre ellos. `""[0]` es `undefined` y `undefined.toUpperCase()` lanza error, así que la devuelves tal cual.
4. **Une** con `join(" ")`. Como guardaste los `""`, los espacios dobles vuelven a aparecer.

```js
export function capitalizar(frase) {
  return frase
    .split(" ")
    .map((palabra) => {
      // Entre dos espacios seguidos queda una "palabra" vacía: se deja tal cual.
      if (palabra === "") return palabra;
      return palabra[0].toUpperCase() + palabra.slice(1).toLowerCase();
    })
    .join(" ");
}
```

## Por qué funciona

Recorrido con `"uNIVERSIDAD nacional de ica"`. Después de `split(" ")`: `["uNIVERSIDAD", "nacional", "de", "ica"]`.

| `palabra` | `palabra[0].toUpperCase()` | `palabra.slice(1).toLowerCase()` | Resultado |
|---|---|---|---|
| `"uNIVERSIDAD"` | `"U"` | `"niversidad"` | `"Universidad"` |
| `"nacional"` | `"N"` | `"acional"` | `"Nacional"` |
| `"de"` | `"D"` | `"e"` | `"De"` |
| `"ica"` | `"I"` | `"ca"` | `"Ica"` |

`join(" ")` da `"Universidad Nacional De Ica"`.

Con `"hola  mundo"` (dos espacios), `split(" ")` da `["hola", "", "mundo"]`. El `""` pasa sin cambios, y `join(" ")` arma `"Hola" + " " + "" + " " + "Mundo"`, que es `"Hola  Mundo"`: los dos espacios se conservan.

Con `""`, `split(" ")` da `[""]`, se devuelve tal cual y `join` da `""`.

## Errores comunes

- **No pasar el resto a minúsculas**: solo haces `palabra[0].toUpperCase() + palabra.slice(1)`. Lo reconoces porque recibes `"UNIVERSIDAD Nacional De Ica"`.
- **No cuidar la palabra vacía**: con espacios dobles o con `""` lanza **TypeError: Cannot read properties of undefined (reading 'toUpperCase')**. Fallan los tests de espacios dobles y de texto vacío.
- **Usar `split(/\s+/)` o filtrar los vacíos**: así pierdes los espacios dobles. Lo reconoces porque recibes `"Hola Mundo"` (un solo espacio) en vez de `"Hola  Mundo"`.
- **Capitalizar solo la primera letra de toda la frase**: `frase[0].toUpperCase() + frase.slice(1)`. Recibes `"UNIVERSIDAD nacional de ica"`.
- **Olvidar el `join`**: devuelves un arreglo de palabras en vez de un texto.

## Otra forma de resolverlo

Con una expresión regular que busca la primera letra de cada palabra:

```js
export function capitalizar(frase) {
  return frase.toLowerCase().replace(/(^|\s)\S/g, (inicio) => inicio.toUpperCase());
}
```

Primero todo pasa a minúsculas. Luego `/(^|\s)\S/g` encuentra cada carácter que no es espacio (`\S`) y que está al inicio del texto (`^`) o justo después de un espacio (`\s`). `replace` llama a la función con cada coincidencia y la reemplaza por su versión en mayúscula.

**¿Cuál conviene?** La versión con `split`, `map` y `join` es más fácil de leer y de explicar, y es la que espera un entrevistador junior. La de `replace` es más corta pero exige entender expresiones regulares; úsala si las dominas. Ambas son O(n).

## Cómo explicarlo en la entrevista

> "Lo divido en tres pasos: separo la frase por espacios, transformo cada palabra y vuelvo a unir. Para cada palabra tomo la primera letra en mayúscula y le concateno el resto en minúscula con `slice(1)`. Cuido el caso de una palabra vacía, que aparece cuando hay dos espacios seguidos, porque acceder a su primera letra da `undefined`. Es O(n) sobre el largo del texto."

## Conceptos

- **`split(separador)`**: corta un texto en un arreglo usando el separador.
- **`map`**: transforma cada elemento y devuelve un arreglo nuevo.
- **`join(separador)`**: une un arreglo en un texto poniendo el separador entre elementos.
- **Acceso por índice en strings**: `palabra[0]` es el primer carácter; en un texto vacío es `undefined`.
- **`slice(inicio)`**: devuelve el texto desde esa posición hasta el final, sin modificar el original.
- **`toUpperCase()` y `toLowerCase()`**: devuelven una copia en mayúsculas o en minúsculas.
- **Divide y vencerás**: separar un problema en pasos pequeños que sí sabes resolver.
