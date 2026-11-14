Estás haciendo el mapa de una app de delivery. Cada lugar (el cliente, la tienda, el repartidor) es un punto `[x, y]` en el plano. Necesitas dos funciones:

- `distancia(a, b)`: la distancia en línea recta entre dos puntos.
- `puntoMedio(a, b)`: el punto que está justo a la mitad, para centrar el mapa entre la tienda y el cliente.

Primero define el tipo `Punto` como una **tupla** de exactamente dos números, y úsalo en las dos funciones.

## Reglas

- Exporta `type Punto = [number, number]`.
- `distancia(a: Punto, b: Punto): number` usa Pitágoras: la raíz de `(x2 - x1)² + (y2 - y1)²`.
- `puntoMedio(a: Punto, b: Punto): Punto` devuelve `[(x1 + x2) / 2, (y1 + y2) / 2]`.
- Un punto con 3 números, o con un texto adentro, debe ser un **error de tipos**.
- `puntoMedio` debe devolver una tupla `Punto`, no un `number[]` cualquiera. Los tests lo revisan con `tsc`.

## Ejemplos

```ts
distancia([0, 0], [3, 4]);      // 5
distancia([1, 1], [4, 5]);      // 5
distancia([2, 3], [2, 3]);      // 0
distancia([-1, -1], [2, 3]);    // 5
puntoMedio([0, 0], [4, 2]);     // [2, 1]
puntoMedio([-2, 5], [2, -5]);   // [0, 0]

distancia([1, 2, 3], [0, 0]);   // error de TypeScript: sobra un elemento
```

## Reto extra

Usa **desestructuración** de tuplas en los parámetros: `const [x1, y1] = a;`. Pasa el cursor sobre `x1` en VS Code: TypeScript sabe que es un `number` porque la tupla dice qué tipo va en cada posición.
