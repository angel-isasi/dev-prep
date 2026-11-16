## Idea clave

Una función flecha **con llaves** no devuelve nada si no escribes `return`. El `map` recibe `undefined` en cada vuelta y arma `[undefined, undefined]`. Después, `join("")` convierte cada `undefined` en texto vacío, y el resultado final es `""`: por eso el avatar sale vacío y sin ningún error.

## Paso a paso

1. **Lee el síntoma.** No hay error, solo un resultado vacío. Eso indica que el código corre completo pero algún paso pierde los datos.
2. **Aísla cada paso de la cadena.** Pon un `console.log` entre los métodos, o prueba cada uno en la consola del navegador:
   - `"Ana Torres".trim().split(" ").filter(...)` da `["Ana", "Torres"]`: bien.
   - `.map(...)` da `[undefined, undefined]`: aquí se pierde todo.
3. **Mira la flecha del `map`.** Tiene llaves y adentro una expresión suelta, `parte[0].toUpperCase();`. Esa línea calcula la letra y la descarta.
4. **Agrega el `return`.**

```js
.map((parte) => {
  return parte[0].toUpperCase();
})
```

## Por qué funciona

Las flechas tienen dos formas:

| Forma | Ejemplo | Qué devuelve |
|---|---|---|
| Sin llaves (expresión) | `(p) => p[0]` | el valor de la expresión, sin escribir `return` |
| Con llaves (bloque) | `(p) => { p[0]; }` | `undefined`, salvo que escribas `return` |

Con el `return`, el `map` arma `["A", "T"]` y `join("")` lo convierte en `"AT"`.

¿Y por qué no sale `"undefinedundefined"`? Porque `join` trata `undefined` y `null` como texto vacío. Si hubieras usado `+` para unirlas, sí verías la palabra `undefined`.

## Errores comunes

- **Pensar que el problema es el `split` o el `filter`** y cambiarlos. Están bien: por eso conviene revisar paso por paso en vez de reescribir todo.
- **Cambiar `join("")` por otra cosa**, por ejemplo `toString()`. Sale `","` (las comas entre dos vacíos). El `join` no es el culpable, solo recibe datos vacíos.
- **Poner `return` en la función de afuera y creer que alcanza.** La función `iniciales` ya tiene `return`; el que falta es el de la flecha interna, que es otra función.

## Otra forma de resolverlo

Quitar las llaves para usar el retorno implícito:

```js
.map((parte) => parte[0].toUpperCase())
```

Es lo más común cuando la flecha hace una sola cosa. Las llaves se justifican cuando necesitas varias líneas dentro, y ahí el `return` es obligatorio.

## Cómo explicarlo en la entrevista

> "No había error, solo un texto vacío, así que revisé la cadena paso por paso. Hasta el `filter` estaba bien; el `map` devolvía `undefined` porque la flecha tenía llaves y no tenía `return`. Y `join` convierte `undefined` en vacío, por eso no se notaba. Lo arreglé con el `return`, o quitando las llaves para usar el retorno implícito."

## Conceptos

- **Retorno implícito**: una flecha sin llaves devuelve el valor de su expresión.
- **Cuerpo de bloque**: una flecha con llaves necesita `return` para devolver algo.
- **`map`**: arma un arreglo nuevo con lo que devuelve la función en cada vuelta; si devuelve `undefined`, guarda `undefined`.
- **`join`**: une los elementos en un texto; `undefined` y `null` se vuelven vacío.
- **Encadenar métodos**: cada método recibe lo que devolvió el anterior, así que puedes revisar la cadena por partes.
