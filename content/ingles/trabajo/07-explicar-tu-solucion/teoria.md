# Explicar tu solución

## En una frase

En una entrevista técnica no basta con que el código funcione: tienes que contar qué hace, cuánto cuesta ("This runs in linear time because...") y qué sacrificaste ("The trade-off is...").

## Cómo se forma

Explica en cuatro pasos, siempre con las mismas frases:

| Paso | Frase modelo |
|---|---|
| La idea | **My approach is to** iterate over the array once. |
| Qué guardas | I use a hash map **to keep track of** the numbers I've seen. |
| El costo | **This runs in linear time because** we only loop once. |
| Lo que sacrificas | **The trade-off is** that we use extra memory. |

- **Big O** se lee "big ó": O(n) es **"O of n"**, O(n²) es **"O of n squared"**, O(1) es **"constant time"**, O(log n) es **"log n"**.
- **Iterate over** y **keep track of** siempre llevan su preposición: iterate **over** the list, keep track **of** the index.
- Para comparar: "The brute force solution is quadratic, **but we can optimize it** with a hash map."
- Para el código limpio: **readable** (fácil de leer), **maintainable** (fácil de mantener), **scalable** (aguanta más datos o usuarios).

Ejemplos:
- This runs in O(n) time and O(1) space. → Esto corre en tiempo O(n) y espacio O(1).
- In the worst case, we check every element. → En el peor caso, revisamos cada elemento.
- I'd optimize it if the input size were large. → Lo optimizaría si la entrada fuera grande.

## Errores típicos

- "I iterate the array" ✗ → "I iterate **over** the array" ✓.
- "It has a complexity of order n" ✗ → "It runs in **O(n)** time" o "It's **linear**" ✓.
- "The trade off is that use more memory" ✗ → "The trade-off is that **it uses** more memory" ✓: en inglés el sujeto nunca desaparece.
- "I will optimize" cuando es una idea ✗ → "**I could** optimize it" o "**I'd** optimize it" ✓: suena a propuesta, no a promesa.
- "Big O of n square" ✗ → "O of n **squared**" ✓.

## Pronunciación

- **quadratic** → kuodrátik: la fuerza en "drá".
- **iterate** → ítereit: la fuerza va al inicio, no "iteréit".
- **scalable** → skéilabol y **readable** → rídabol.
- **trade-off** → tréid of: dos golpes, el más fuerte en "tréid".
