Estás programando un editor de banners para redes sociales (tipo Canva, en chiquito). El usuario dibuja figuras y la app muestra cuánta superficie ocupa cada una. Cada figura tiene propiedades distintas según su forma, y una propiedad `tipo` que dice cuál es:

```ts
export type Figura =
  | { tipo: "circulo"; radio: number }
  | { tipo: "rectangulo"; ancho: number; alto: number }
  | { tipo: "triangulo"; base: number; altura: number };
```

Esto es una **unión discriminada**: la propiedad `tipo` (el discriminante) le dice a TypeScript qué otras propiedades existen.

Escribe:

1. `area(figura: Figura): number`: el área de una figura, **redondeada a 2 decimales**.
   - Círculo: `Math.PI * radio * radio`
   - Rectángulo: `ancho * alto`
   - Triángulo: `base * altura / 2`
2. `areaTotal(figuras: Figura[]): number`: la suma de las áreas, redondeada a 2 decimales. Sin figuras, `0`.

## Reglas

- Exporta el tipo `Figura` tal como está arriba.
- Un círculo con `ancho` en vez de `radio`, o un `tipo: "hexagono"`, debe ser un **error de tipos**.

## Ejemplos

```ts
area({ tipo: "circulo", radio: 1 });                  // 3.14
area({ tipo: "rectangulo", ancho: 4, alto: 2.5 });    // 10
area({ tipo: "triangulo", base: 3, altura: 5 });      // 7.5

areaTotal([
  { tipo: "rectangulo", ancho: 2, alto: 3 },          // 6
  { tipo: "triangulo", base: 4, altura: 2 },          // 4
]);                                                    // 10

area({ tipo: "circulo", ancho: 2 });                   // error de TypeScript
```

## Reto extra

Dentro de `case "circulo":` escribe `figura.` y mira lo que sugiere VS Code: solo `tipo` y `radio`. TypeScript ya sabe que es un círculo.
