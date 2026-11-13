## Idea clave

Revisa los rangos **en orden**, de abajo hacia arriba, y devuelve apenas encuentres el que corresponde. Como cada `return` termina la función, cuando llegas a una pregunta ya sabes que la nota no cumplió las anteriores.

## Paso a paso

1. **Descarta lo inválido** primero: `nota < 0 || nota > 20`. El `||` ("o") es verdadero si se cumple cualquiera de los dos lados.
2. **Pregunta por el rango más bajo**: `nota < 11`. Ahí entran el 0, el 8 y el 10.5.
3. **Sigue subiendo**: `nota < 14` y luego `nota < 18`. No hace falta escribir `nota >= 11 && nota < 14`, porque si la nota fuera menor que 11 ya habrías salido en el paso anterior.
4. **Lo que queda** es de 18 a 20: devuelve `"excelente"` sin preguntar nada.

```js
export function calificar(nota) {
  if (nota < 0 || nota > 20) return "nota inválida";
  if (nota < 11) return "desaprobado";
  if (nota < 14) return "aprobado";
  if (nota < 18) return "bueno";
  return "excelente";
}
```

## Por qué funciona

| `nota` | inválida? | `< 11`? | `< 14`? | `< 18`? | Devuelve |
|---|---|---|---|---|---|
| `10.5` | no | sí | | | `"desaprobado"` |
| `11` | no | no | sí | | `"aprobado"` |
| `17.9` | no | no | no | sí | `"bueno"` |
| `18` | no | no | no | no | `"excelente"` |
| `21` | sí | | | | `"nota inválida"` |

Los límites salen bien porque usamos `<` (menor estricto): `11 < 11` es `false`, así que el 11 pasa al siguiente rango, que es lo que pide la tabla.

## Errores comunes

- **Usar `<=` en los límites.** Con `nota <= 11` el 11 queda como `"desaprobado"`. Lo reconoces porque falla justo el test del 11 o del 18.
- **Validar el rango al final.** Si `calificar(25)` llega a las otras preguntas, ninguna se cumple y devuelves `"excelente"`.
- **Usar `&&` en vez de `||` para lo inválido.** `nota < 0 && nota > 20` nunca es verdadero: ningún número es negativo y mayor que 20 a la vez.
- **Escribir `11 <= nota < 14`.** En JavaScript eso no significa "entre 11 y 14": se evalúa como `(11 <= nota) < 14`, que es `true < 14` o `false < 14`, y los dos dan `true` (porque `true` se convierte en 1 y `false` en 0). Siempre se escribe `nota >= 11 && nota < 14`.
- **Escribir `if` sin `return` ni `else`.** Si en cada `if` asignas a una variable y no cortas, los `if` siguientes pisan el resultado.

## Otra forma de resolverlo

Con `if / else if / else` y una sola salida:

```js
export function calificar(nota) {
  let resultado;
  if (nota < 0 || nota > 20) {
    resultado = "nota inválida";
  } else if (nota < 11) {
    resultado = "desaprobado";
  } else if (nota < 14) {
    resultado = "aprobado";
  } else if (nota < 18) {
    resultado = "bueno";
  } else {
    resultado = "excelente";
  }
  return resultado;
}
```

Es equivalente: el `else if` también evita revisar los rangos ya descartados.

**¿Cuál conviene?** La de los `return` tempranos ("guard clauses"): menos líneas, sin variable auxiliar y sin anidar. Es el estilo que más se ve en código moderno.

## Cómo explicarlo en la entrevista

> "Primero descarto las notas fuera de rango, porque si no caerían en alguna categoría por error. Después pregunto de la más baja a la más alta con menor estricto, y devuelvo apenas encuentro la categoría. Así cada condición solo necesita el límite de arriba, porque el de abajo ya lo garantizan los `return` anteriores. Probaría los bordes: 10.9, 11, 17.9, 18, -1 y 21."

## Conceptos

- **`if` con `return` temprano**: devolver apenas sabes la respuesta evita anidar `else`.
- **Operadores de comparación**: `<`, `<=`, `>`, `>=`. El estricto (`<`) no incluye el límite.
- **`||` (o lógico)**: verdadero si al menos un lado lo es.
- **`&&` (y lógico)**: verdadero solo si los dos lados lo son.
- **Casos borde**: los valores justo en los límites (11, 18, 20) son donde más fallan las condiciones.
