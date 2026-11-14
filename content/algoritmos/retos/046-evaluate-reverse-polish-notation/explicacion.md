## Idea clave

Usa una **pila**. Recorres los tokens: cada número lo apilas; cada operador saca los **dos últimos** números, los opera y apila el resultado. Como el operador siempre trabaja con lo más reciente, la pila es la estructura exacta. Al final queda un solo número: la respuesta.

## Paso a paso

1. **La solución directa** (dila en voz alta): busca el primer operador del arreglo, opera los dos números que tiene justo antes, reemplaza esos tres tokens por el resultado y repite hasta que quede uno. Funciona, pero cada reemplazo con `splice` mueve el resto del arreglo: O(n²).
2. **Fíjate en el patrón**: un operador siempre usa los dos números **más recientes** que todavía no se usaron. "El más reciente primero" es justo lo que hace una pila.
3. **Si el token es un número**, conviértelo con `Number(token)` y apílalo. Hace falta convertir porque `"2" + "1"` da `"21"`, no `3`.
4. **¿Cómo distingues un operador?** Compara el token **completo** con `"+"`, `"-"`, `"*"` y `"/"`. No mires solo el primer carácter: `"-3"` empieza con `-` y es un número.
5. **Si es un operador**, saca dos valores. El **primero que sale es el de la derecha** (`b`), porque fue el último en entrar; el segundo es el de la izquierda (`a`). Calcula `a op b` y apila el resultado.
6. **División entera hacia cero**: `Math.trunc(a / b)` quita los decimales sin redondear: `Math.trunc(3.5)` es 3 y `Math.trunc(-3.5)` es -3.
7. **Al terminar**, la pila tiene un solo número: devuélvelo con `pila.pop()`.

```js
function operar(a, b, operador) {
  switch (operador) {
    case "+": return a + b;
    case "-": return a - b;
    case "*": return a * b;
    case "/": return Math.trunc(a / b);
  }
}

export function evaluarRPN(tokens) {
  const pila = [];

  for (const token of tokens) {
    if (token === "+" || token === "-" || token === "*" || token === "/") {
      const b = pila.pop();
      const a = pila.pop();
      pila.push(operar(a, b, token));
    } else {
      pila.push(Number(token));
    }
  }

  return pila.pop();
}
```

## Por qué funciona

Recorrido con `evaluarRPN(["4", "13", "5", "/", "+"])`, que es `4 + (13 / 5)`:

| Token | ¿Qué es? | Acción | Pila después |
|---|---|---|---|
| `"4"` | número | apilar 4 | `[4]` |
| `"13"` | número | apilar 13 | `[4, 13]` |
| `"5"` | número | apilar 5 | `[4, 13, 5]` |
| `"/"` | operador | `b = 5`, `a = 13`, `Math.trunc(13 / 5)` = 2 | `[4, 2]` |
| `"+"` | operador | `b = 2`, `a = 4`, `4 + 2` = 6 | `[6]` |

Resultado: 6. Fíjate en el `"/"`: si hubieras puesto el primer `pop` a la izquierda, calcularías `5 / 13`, que trunca a 0, y el resultado sería 4.

## Errores comunes

- **Invertir el orden de los operandos.** El primer `pop` es el de la **derecha**. Con la suma y la multiplicación no se nota, pero con `["5", "3", "-"]` darías -2 en vez de 2. Lo reconoces en el test "el orden importa en la resta y la división".
- **Usar `Math.floor` para la división.** Con negativos redondea hacia abajo: `Math.floor(-3.5)` es -4. Lo reconoces en el test "la división trunca hacia cero": `["-7", "2", "/"]` debe dar -3.
- **Olvidar dividir entero**: `13 / 5` en JavaScript es `2.6`. El ejemplo `["4", "13", "5", "/", "+"]` daría 6.6.
- **No convertir a número.** Si apilas los textos, `"2" + "1"` concatena y da `"21"`.
- **Detectar el operador mirando solo el primer carácter** (`token[0] === "-"`). `"-3"` pasa por operador, haces dos `pop` de más y el resultado es `NaN`. Lo reconoces en el test "un solo número, también negativo".

## Otra forma de resolverlo

**Reemplazar con `splice`** (paso 1): O(n²) de tiempo. Funciona, pero es lento y fácil de equivocarse con los índices.

**Un objeto con una función por operador**: en vez del `switch`, guardas las operaciones en un objeto y lo usas como tabla. Es más corto y fácil de ampliar (por ejemplo, agregar `"^"`):

```js
const OPERACIONES = {
  "+": (a, b) => a + b,
  "-": (a, b) => a - b,
  "*": (a, b) => a * b,
  "/": (a, b) => Math.trunc(a / b),
};

const pila = [];
for (const token of tokens) {
  if (Object.hasOwn(OPERACIONES, token)) {
    const b = pila.pop();
    const a = pila.pop();
    pila.push(OPERACIONES[token](a, b));
  } else {
    pila.push(Number(token));
  }
}
return pila.pop();
```

Se usa `Object.hasOwn` en vez de `token in OPERACIONES` porque `in` también encuentra propiedades heredadas, como `"toString"`.

**¿Cuál conviene?** Las dos son O(n) de tiempo y O(n) de memoria (la pila). El `switch` es lo más claro para explicar en voz alta. El objeto de funciones queda más elegante y es buena idea mencionarlo si te preguntan "¿y si agregamos más operadores?".

## Cómo explicarlo en la entrevista

> "En notación polaca inversa cada operador usa los dos números más recientes, así que uso una pila. Recorro los tokens: si es un número lo convierto y lo apilo; si es un operador saco dos valores, teniendo cuidado de que el primero que sale es el de la derecha, los opero y apilo el resultado. Para la división uso Math.trunc porque tiene que truncar hacia cero, también con negativos. Al final queda un solo valor en la pila y ese es el resultado. Es una pasada, O(n) de tiempo y O(n) de memoria."

## Conceptos

- **Pila (`push` / `pop`)**: el último que entra es el primero que sale.
- **Notación polaca inversa**: el operador va después de sus operandos; no necesita paréntesis.
- **`Number(texto)`**: convierte `"13"` en `13` y `"-3"` en `-3`.
- **`Math.trunc` vs `Math.floor`**: `trunc` corta hacia cero; `floor` baja siempre, también con negativos.
- **`switch`** y **objeto de funciones**: dos formas de elegir qué hacer según un valor.
