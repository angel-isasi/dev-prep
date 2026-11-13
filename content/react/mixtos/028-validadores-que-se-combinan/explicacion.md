## Idea clave

Cada validador es una función pequeña con el mismo contrato: **recibe un valor y devuelve `null` o un mensaje**. Como todos hablan "el mismo idioma", se pueden poner en listas y combinar. `minimo(3)` es una **fábrica**: un closure que recuerda el 3 y devuelve el validador ya configurado.

## Paso a paso

1. **`requerido`**: `String(valor).trim()` convierte a texto (por si llega un número) y quita espacios. Un texto vacío es falsy, así que el ternario devuelve el mensaje; si tiene algo, `null`.
2. **`minimo(n)`**: es una función que **devuelve otra función**. La de afuera recibe `n`; la de adentro recibe el `valor` y compara su largo con `n`. Cuando llamas `minimo(3)`, la función de afuera termina, pero la de adentro sigue "viendo" `n = 3`: eso es un **closure**.
3. **`esCorreo`**: la regex `/^\S+@\S+\.\S+$/` se lee: desde el inicio (`^`), uno o más caracteres que no son espacio (`\S+`), una `@`, más caracteres, un punto literal (`\.`), más caracteres, y el final (`$`). Es una validación básica, suficiente para el frontend.
4. **`validar`**:
   - Recorre `Object.entries(reglas)`, que da pares `[campo, validadores]`.
   - Lee el valor con `valores[campo] ?? ""` para que un campo que falta cuente como vacío.
   - `validadores.map((v) => v(valor))` da un arreglo como `[null, "Escribe al menos 3 caracteres"]`.
   - `.find(Boolean)` devuelve el primer elemento truthy, es decir, el primer mensaje. Si todos son `null`, da `undefined`.
   - Solo si hay mensaje, lo guarda en `errores`.

```jsx
export const requerido = (valor) => (String(valor).trim() ? null : "Este campo es obligatorio");

export const minimo = (n) => (valor) =>
  String(valor).trim().length >= n ? null : `Escribe al menos ${n} caracteres`;

export const esCorreo = (valor) => (/^\S+@\S+\.\S+$/.test(valor) ? null : "Ingresa un correo válido");

export function validar(valores, reglas) {
  const errores = {};
  for (const [campo, validadores] of Object.entries(reglas)) {
    const valor = valores[campo] ?? "";
    const mensaje = validadores.map((validador) => validador(valor)).find(Boolean);
    if (mensaje) errores[campo] = mensaje;
  }
  return errores;
}
```

## Por qué funciona

Recorrido de `validar({ nombre: "Al", correo: "" }, reglas)` con `reglas = { nombre: [requerido, minimo(3)], correo: [requerido, esCorreo] }`:

| Campo | Valor | Resultados del `map` | `find(Boolean)` |
|---|---|---|---|
| nombre | `"Al"` | `[null, "Escribe al menos 3 caracteres"]` | `"Escribe al menos 3 caracteres"` |
| correo | `""` | `["Este campo es obligatorio", "Ingresa un correo válido"]` | `"Este campo es obligatorio"` |

Fíjate en el correo: los dos validadores fallan, pero `find` se queda con el **primero**. Por eso el orden en la lista importa: pones `requerido` antes que `esCorreo` para que un campo vacío diga "obligatorio" y no "correo inválido".

¿Cómo recuerda `minimo(3)` su número? Al llamar `minimo(3)` se crea un "ambiente" donde `n` vale 3, y la función devuelta queda enganchada a ese ambiente. `minimo(5)` crea otro ambiente distinto. Son dos validadores independientes hechos por la misma fábrica.

## Errores comunes

- **Que `minimo` valide directamente** (`minimo(valor, n)`). Entonces no puedes ponerlo en la lista `[requerido, minimo]`, porque `validar` llama a cada validador con un solo argumento. Lo reconoces porque el test dice que `minimo(3)` no es una función.
- **Usar `filter` en vez de `find`** y guardar un arreglo de mensajes. El test espera **un** texto por campo, el primero.
- **Guardar el campo aunque no haya error** (`errores[campo] = mensaje` sin el `if`). Quedaría `{ nombre: undefined }` y `toEqual({})` falla... y en la vista `Object.keys(errores).length` diría que hay errores.
- **Olvidar el `?? ""`.** Si el campo no existe, `valores[campo]` es `undefined` y `String(undefined)` es `"undefined"`, que tiene 9 caracteres: ¡pasaría `requerido`!
- **Regex sin `^` y `$`.** Sin anclas, `"hola a@b.pe"` sería "válido" porque contiene un correo en algún lugar.

## Otra forma de resolverlo

Cortar en el primer error con un `for...of`, sin ejecutar los validadores que sobran:

```jsx
export function validar(valores, reglas) {
  const errores = {};
  for (const [campo, validadores] of Object.entries(reglas)) {
    for (const validador of validadores) {
      const mensaje = validador(valores[campo] ?? "");
      if (mensaje) {
        errores[campo] = mensaje;
        break; // ya encontramos el primero
      }
    }
  }
  return errores;
}
```

**¿Cuándo conviene?** Cuando algún validador es caro o tiene efectos (por ejemplo, uno que consulta al servidor si el usuario ya existe). `map` + `find` ejecuta todos; este bucle se detiene en el primero que falla. Para validadores baratos como estos, la versión con `map` y `find` es más corta y se lee igual de bien.

## Cómo explicarlo en la entrevista

> "Defino cada validador como una función que recibe un valor y devuelve `null` o un mensaje. Como todos tienen el mismo contrato, por cada campo pongo una lista y `validar` las recorre en orden, quedándose con el primer mensaje. Para reglas con parámetros, como el mínimo de caracteres, uso una fábrica: `minimo(3)` es un closure que recuerda el 3 y devuelve el validador listo. Así agregar una regla nueva es agregar una función a la lista, sin tocar `validar`."

## Conceptos

- **Closure**: una función que recuerda las variables del lugar donde se creó, aunque ese lugar ya terminó.
- **Función de orden superior**: recibe o devuelve funciones (`minimo` devuelve una).
- **Contrato común**: todas las piezas reciben y devuelven lo mismo, por eso se combinan.
- **`Object.entries`**: convierte un objeto en pares `[clave, valor]` para recorrerlo.
- **`find(Boolean)`**: devuelve el primer elemento truthy de un arreglo.
- **Regex con anclas**: `^` y `$` obligan a que el patrón cubra el texto completo.
- **Operador `??`**: valor por defecto solo para `null` o `undefined`.
