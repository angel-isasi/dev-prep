## Idea clave

Una **unión discriminada** es una unión de objetos que comparten una propiedad con un valor literal distinto en cada variante (aquí `tipo`). Al hacer `switch (figura.tipo)`, TypeScript angosta `figura` a la variante correcta en cada `case`, y solo te deja usar las propiedades que esa figura tiene.

## Paso a paso

1. **Lee el tipo.** Cada variante tiene `tipo` con un literal (`"circulo"`, `"rectangulo"`, `"triangulo"`) y sus propias medidas. Un círculo no tiene `ancho`; un rectángulo no tiene `radio`.
2. **¿Por qué no `figura.radio` directo?** Porque sobre la unión completa, `radio` solo existe en una variante. TypeScript responde: "La propiedad 'radio' no existe en el tipo '{ tipo: "rectangulo"; ... }'".
3. **Discrimina con `switch`.** `switch (figura.tipo)` y un `case` por figura. Dentro de `case "circulo":`, `figura` es `{ tipo: "circulo"; radio: number }`.
4. **Calcula cada área.** Círculo `Math.PI * r * r`, rectángulo `ancho * alto`, triángulo `base * altura / 2`.
5. **Redondea una sola vez.** Si `areaTotal` sumara áreas ya redondeadas, podrías acumular errores. La solución separa `areaExacta` (sin redondear) de `area` (redondeada), y `areaTotal` redondea solo la suma final.

```ts
function areaExacta(figura: Figura): number {
  switch (figura.tipo) {
    case "circulo":
      return Math.PI * figura.radio * figura.radio;
    case "rectangulo":
      return figura.ancho * figura.alto;
    case "triangulo":
      return (figura.base * figura.altura) / 2;
  }
}
```

Como el `switch` cubre los tres tipos y cada uno retorna, TypeScript sabe que la función siempre devuelve un `number`: no hace falta `default`.

## Por qué funciona

Recorrido con `areaTotal` del banner de los tests:

| Figura | `case` | Cálculo | Área exacta | `suma` |
|---|---|---|---|---|
| rectángulo 2 x 3 | `"rectangulo"` | `2 * 3` | `6` | `6` |
| triángulo 4, 2 | `"triangulo"` | `4 * 2 / 2` | `4` | `10` |
| círculo radio 1 | `"circulo"` | `3.14159... * 1 * 1` | `3.14159...` | `13.14159...` |

Redondeo final: `Math.round(1314.159...) / 100 = 13.14`.

Del lado de los tipos: `area({ tipo: "circulo", ancho: 2 })` falla porque TypeScript busca la variante con `tipo: "circulo"`, ve que pide `radio` y no `ancho`. Y `{ tipo: "hexagono" }` falla porque ninguna variante tiene ese literal.

## Errores comunes

- **Usar `if ("radio" in figura)`** en todo el código. Funciona (el operador `in` también angosta), pero si dos variantes comparten una propiedad se vuelve ambiguo. El discriminante `tipo` es la forma estándar.
- **Olvidar el `/ 2` del triángulo.** `base * altura` es el área del rectángulo que lo contiene: el test del triángulo recibe 15 en vez de 7.5.
- **Usar `radio ** 2` sin `Math.PI`**, o `Math.PI * radio * 2` (eso es la mitad del perímetro, no el área).
- **Escribir un `case` mal**: `case "circlo":` da error de tipos, porque ese literal no está en la unión. Es una ventaja: los errores de tipeo no pasan.
- **Redondear cada área antes de sumar en `areaTotal`.** Con muchas figuras, los redondeos pueden sumar un centavo de diferencia.

## Otra forma de resolverlo

**Con `if` en vez de `switch`**:

```ts
function areaExacta(figura: Figura): number {
  if (figura.tipo === "circulo") return Math.PI * figura.radio ** 2;
  if (figura.tipo === "rectangulo") return figura.ancho * figura.alto;
  return (figura.base * figura.altura) / 2; // aquí solo queda el triángulo
}
```

Cada `if` angosta igual que un `case`. En el último `return`, TypeScript ya descartó el círculo y el rectángulo.

**Un objeto de funciones** (un "mapa" de calculadoras) también existe, pero tipar bien que cada función reciba su variante exige genéricos avanzados. Para un junior, el `switch` es lo esperado y lo que usa React en los reducers.

## Cómo explicarlo en la entrevista

> "Figura es una unión discriminada: todas las variantes tienen la propiedad tipo con un literal distinto. Hago un switch sobre figura.tipo y en cada case TypeScript angosta el tipo, así que en el case círculo puedo usar radio, y si intento usar ancho me da error. Calculo el área exacta y redondeo una sola vez al final, también en el total, para no acumular errores de redondeo. Es el mismo patrón que se usa en los reducers de React con las acciones."

## Conceptos

- **Unión discriminada**: unión de objetos con una propiedad literal común (el discriminante).
- **Narrowing por discriminante**: `switch (x.tipo)` o `if (x.tipo === "...")` angosta a una variante.
- **`switch` exhaustivo**: si cubre todos los casos, TypeScript sabe que la función siempre retorna.
- **`Extract<Union, Forma>`**: saca de una unión las variantes que encajan con una forma.
- **Indexed access**: `Figura["tipo"]` da la unión de todos los discriminantes.
- **`Math.PI` y `**`**: constante pi y potencia.
- Tema de Aprender: uniones y narrowing en TypeScript.
