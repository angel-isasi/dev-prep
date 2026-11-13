## Idea clave

Un **template literal** es un texto entre comillas invertidas (`` ` ``) donde puedes meter cualquier expresión con `${...}`. JavaScript evalúa lo que está dentro de las llaves, lo convierte a texto y lo pega en su lugar.

## Paso a paso

1. **Limpia los textos** con `trim()`, que devuelve una copia sin los espacios del inicio y del final. Guarda cada resultado en una `const`, porque no los vas a reasignar.
2. **Arma la frase** con comillas invertidas y un `${}` por cada dato.
3. **Devuelve** el texto con `return`.

```js
export function presentar(nombre, edad, ciudad) {
  const nombreLimpio = nombre.trim();
  const ciudadLimpia = ciudad.trim();

  return `Me llamo ${nombreLimpio}, tengo ${edad} años y vivo en ${ciudadLimpia}.`;
}
```

## Por qué funciona

Con `presentar("  Luis ", 19, " Arequipa ")`:

| Paso | Valor |
|---|---|
| `nombre.trim()` | `"Luis"` |
| `ciudad.trim()` | `"Arequipa"` |
| `${edad}` | el número `19` se convierte en el texto `"19"` |
| resultado | `"Me llamo Luis, tengo 19 años y vivo en Arequipa."` |

`trim()` no modifica el string original: los strings en JavaScript son **inmutables**, todos sus métodos devuelven uno nuevo. Por eso hay que guardar el resultado en una variable (o usarlo directo).

Con la edad `0` también funciona: `${0}` da `"0"`. Dentro de `${}` no hay nada de truthy o falsy, solo conversión a texto.

## Errores comunes

- **Usar comillas normales.** `"Me llamo ${nombre}"` con comillas dobles devuelve literalmente `Me llamo ${nombre}`, sin reemplazar nada. Lo reconoces porque el test muestra `${` en lo recibido.
- **Llamar a `trim()` sin guardar el resultado.** `nombre.trim();` en una línea suelta no hace nada útil: el string original sigue con espacios.
- **Olvidar el punto final o un espacio.** `toBe` compara carácter por carácter. Si el test falla y "se ve igual", busca espacios dobles o el punto.
- **Olvidar el `return`.** La función devuelve `undefined` y todos los tests fallan con "expected undefined to be...".
- **Usar `let` cuando no reasignas.** No rompe nada, pero en una revisión de código te dirán que uses `const`: deja claro que ese valor no cambia.

## Otra forma de resolverlo

Concatenando con `+`, como se hacía antes de ES6:

```js
export function presentar(nombre, edad, ciudad) {
  return "Me llamo " + nombre.trim() + ", tengo " + edad + " años y vivo en " + ciudad.trim() + ".";
}
```

Funciona igual, pero es fácil olvidar un espacio entre las comillas y cuesta más leerlo. También puedes llamar a `trim()` directo dentro del template: `` `Me llamo ${nombre.trim()}...` ``, porque dentro de `${}` va cualquier expresión.

**¿Cuál conviene?** El template literal. Es el estándar actual y se lee como la frase final.

## Cómo explicarlo en la entrevista

> "Primero limpio el nombre y la ciudad con `trim()` y los guardo en constantes, porque no los voy a reasignar. Después armo la frase con un template literal, que me deja meter cada valor con `${}` sin concatenar con más. Los strings son inmutables, así que `trim()` me devuelve uno nuevo y no toca el original."

## Conceptos

- **`const`**: declara una variable que no se puede reasignar. Es la opción por defecto.
- **Template literal**: texto entre comillas invertidas que acepta `${expresión}` y saltos de línea.
- **`trim()`**: devuelve una copia del texto sin espacios al inicio ni al final.
- **Inmutabilidad de los strings**: ningún método cambia el string original, todos devuelven uno nuevo.
- **Conversión a texto**: dentro de `${}`, cualquier valor se convierte en string (`${19}` es `"19"`).
