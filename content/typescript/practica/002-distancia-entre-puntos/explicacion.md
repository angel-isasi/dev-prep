## Idea clave

Una **tupla** es un array de largo fijo donde cada posición tiene su propio tipo: `type Punto = [number, number]`. Con ella TypeScript sabe que un punto tiene exactamente una x y una y, rechaza `[1, 2, 3]` o `[1, "2"]`, y al desestructurar te da cada coordenada como `number`.

## Paso a paso

1. **El tipo primero.** Podrías usar `number[]`, pero eso acepta `[]`, `[5]` o `[1, 2, 3]`. Un punto tiene dos números y siempre en el mismo orden: eso es una tupla.

   ```ts
   export type Punto = [number, number];
   ```

   `type` crea un **alias**: un nombre para un tipo, para no repetir `[number, number]` en cada firma.

2. **Desestructura.** `const [x1, y1] = a;` saca la posición 0 y la 1. Como `a` es una tupla, TypeScript sabe que `x1` e `y1` son `number` (con un `number[]` también lo serían, pero no sabría si existen).
3. **Distancia con Pitágoras.** Las diferencias `dx` y `dy` son los catetos y la distancia es la hipotenusa: `Math.sqrt(dx * dx + dy * dy)`.
4. **Punto medio.** El promedio de las x y el de las y: `[(x1 + x2) / 2, (y1 + y2) / 2]`.
5. **Anota el retorno como `Punto`.** Si no lo anotas, TypeScript infiere `number[]` para un array literal y pierdes la tupla. Con `: Punto`, el array se revisa como tupla.

```ts
export type Punto = [number, number];

export function distancia(a: Punto, b: Punto): number {
  const [x1, y1] = a;
  const [x2, y2] = b;
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

export function puntoMedio(a: Punto, b: Punto): Punto {
  const [x1, y1] = a;
  const [x2, y2] = b;
  return [(x1 + x2) / 2, (y1 + y2) / 2];
}
```

## Por qué funciona

Recorrido con `distancia([-1, -1], [2, 3])`:

| Paso | Valor |
|---|---|
| `x1, y1` | `-1, -1` |
| `x2, y2` | `2, 3` |
| `dx = 2 - (-1)` | `3` |
| `dy = 3 - (-1)` | `4` |
| `dx * dx + dy * dy` | `9 + 16 = 25` |
| `Math.sqrt(25)` | `5` |

Si das vuelta los puntos, `dx` y `dy` cambian de signo, pero al elevar al cuadrado el signo desaparece: la distancia es la misma.

Del lado de los tipos: en `distancia([1, 2, 3], [0, 0])` TypeScript compara `[number, number, number]` con `[number, number]` y falla porque los largos no coinciden ("El origen tiene 3 elementos, pero el destino solo permite 2").

## Errores comunes

- **Usar `number[]` en vez de la tupla.** Todo compila, pero los tests de `@ts-expect-error` fallan: "Directiva '@ts-expect-error' no usada", porque `[1, 2, 3]` ya no es un error.
- **No anotar el retorno de `puntoMedio`.** Si escribes `const r = [a, b]; return r;` sin `: Punto`, el tipo inferido es `number[]` y `tsc` se queja de que `number[]` no se puede asignar a `[number, number]`.
- **Olvidar los paréntesis en el promedio.** `x1 + x2 / 2` divide solo `x2`. Escribe `(x1 + x2) / 2`.
- **Restar al revés y elevar mal.** `dx ** 2` está bien, `-dx ** 2` es un error de sintaxis en JavaScript. Multiplicar `dx * dx` evita la duda.
- **Comparar decimales con `toBe`.** La distancia de `[0, 0]` a `[1, 1]` es `1.4142...`: en tests se usa `toBeCloseTo`.

## Otra forma de resolverlo

**`Math.hypot`**, que calcula la raíz de la suma de cuadrados por ti:

```ts
export function distancia([x1, y1]: Punto, [x2, y2]: Punto): number {
  return Math.hypot(x2 - x1, y2 - y1);
}
```

Fíjate que aquí la desestructuración va **en los parámetros**: `[x1, y1]: Punto`. Es más corto y se lee bien.

**Un objeto en vez de una tupla**: `interface Punto { x: number; y: number }`. Con objeto no puedes confundir el orden (`p.x` es claro), con tupla es más corto de escribir. Las tuplas se usan cuando el orden es obvio o es una convención, como `[x, y]` o lo que devuelve `useState` en React: `[valor, setValor]`.

## Cómo explicarlo en la entrevista

> "Defino Punto como una tupla de dos números, no como number[], porque un punto tiene exactamente dos coordenadas en un orden fijo. Así TypeScript rechaza un punto de tres elementos o con un string. En distancia desestructuro las coordenadas y aplico Pitágoras con Math.sqrt. En puntoMedio anoto el retorno como Punto, porque si no TypeScript inferiría number[] y perdería la tupla. Es el mismo tipo de dato que devuelve useState en React."

## Conceptos

- **Tupla**: `[number, number]`, array de largo fijo con un tipo por posición.
- **Alias de tipo**: `type Punto = ...`, un nombre reutilizable para un tipo.
- **Desestructuración de arrays**: `const [x, y] = punto;`, también en parámetros.
- **Inferencia de arrays literales**: `[1, 2]` se infiere como `number[]` salvo que anotes el tipo.
- **`Math.sqrt` y `Math.hypot`**: raíz cuadrada e hipotenusa.
- **`import { type Punto }`**: importar solo el tipo.
- Tema de Aprender: tipos básicos de TypeScript.
