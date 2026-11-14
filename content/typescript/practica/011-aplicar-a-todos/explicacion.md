## Idea clave

En TypeScript una función también tiene tipo: `(precio: number) => number` dice "recibo un número y devuelvo un número". Con ese tipo puedes recibir funciones como parámetro (callbacks) y devolver funciones, y TypeScript revisa que quien las use respete esa forma.

## Paso a paso

1. **Escribe el tipo de la función.** La sintaxis es la de una flecha, pero en lugar del cuerpo va el tipo de retorno:

   ```ts
   export type Transformacion = (precio: number) => number;
   ```

   El nombre del parámetro (`precio`) es solo documentación: TypeScript compara posiciones y tipos, no nombres.

2. **Usa el tipo en un parámetro.** `aplicarATodos` recibe un arreglo y una `Transformacion`. Como `map` ya recorre y crea un arreglo nuevo, el cuerpo es una línea:

   ```ts
   export function aplicarATodos(precios: number[], transformar: Transformacion): number[] {
     return precios.map((precio) => transformar(precio));
   }
   ```

3. **Fíjate en la inferencia del callback.** Cuando alguien escribe `aplicarATodos([1, 2], (p) => p * 2)`, no tiene que poner `p: number`: TypeScript sabe que el segundo parámetro es una `Transformacion` y le da a `p` el tipo `number` solo. Esto se llama **tipado contextual**.

4. **Devuelve una función.** `conDescuento` no calcula un precio, fabrica una transformación:

   ```ts
   export function conDescuento(porcentaje: number): Transformacion {
     return (precio) => precio - (precio * porcentaje) / 100;
   }
   ```

   La función de adentro "recuerda" `porcentaje` aunque `conDescuento` ya terminó: es un closure. Y otra vez, `precio` no necesita anotación porque el tipo de retorno `Transformacion` ya lo dice.

## Por qué funciona

Recorrido con `aplicarATodos([100, 50], conDescuento(20))`:

| Paso | Qué pasa | Valor |
|---|---|---|
| 1 | `conDescuento(20)` crea una función que recuerda `porcentaje = 20` | `(precio) => precio - precio * 20 / 100` |
| 2 | `map` llama a `transformar(100)` | `100 - 2000 / 100 = 80` |
| 3 | `map` llama a `transformar(50)` | `50 - 1000 / 100 = 40` |
| 4 | `map` devuelve el arreglo nuevo | `[80, 40]` |

Y en los tipos: `(p: string) => p.length` no encaja con `Transformacion`, porque `aplicarATodos` le va a pasar números y la función espera textos. `(p) => "S/ " + p` tampoco: devuelve `string` y se prometió `number`. Por eso los tests con `@ts-expect-error` comprueban que tsc **sí** dé error en esas líneas. Si dejaras `Transformacion = any`, TypeScript aceptaría cualquier cosa y esos errores desaparecerían.

## Errores comunes

- **Dejar el callback como `any` o como `Function`.** `Function` acepta cualquier función y su resultado es `any`: pierdes toda la revisión. Lo reconoces porque tsc dice "Directiva @ts-expect-error no usada".
- **Confundir el tipo de función con una función flecha.** `type T = (precio: number) => number` es un tipo; `const t = (precio: number) => precio` es un valor. En el tipo, después de `=>` va un **tipo**, no un cálculo.
- **Calcular en `conDescuento` en vez de devolver una función.** Si escribes `return 100 - porcentaje`, devuelves un número y el test "devuelve una función" falla con `typeof` igual a `"number"`.
- **Usar `forEach` y `push` sobre el arreglo recibido.** Modificas el original: lo detecta el test "no modifica el arreglo original".
- **Escribir el descuento como `precio * 0.9` fijo.** Funciona para 10 % pero no para 20 %: usa el `porcentaje` recibido.

## Otra forma de resolverlo

**Con un bucle `for...of`**, armando el arreglo a mano:

```ts
export function aplicarATodos(precios: number[], transformar: Transformacion): number[] {
  const resultado: number[] = [];
  for (const precio of precios) {
    resultado.push(transformar(precio));
  }
  return resultado;
}
```

Es más largo pero muestra lo que `map` hace por dentro. Fíjate que hay que tipar `resultado` como `number[]`: un `[]` vacío sin anotación no le dice a TypeScript qué va a contener.

**Escribir el tipo en línea**, sin alias: `transformar: (precio: number) => number`. Sirve para un uso puntual; el alias `Transformacion` conviene cuando el mismo tipo se repite (aquí aparece en dos funciones) y le da un nombre que se entiende.

Este mismo patrón (pasar funciones tipadas) es lo que haces en React al tipar un `onClick: () => void` o un `onChange: (valor: string) => void` en las props.

## Cómo explicarlo en la entrevista

> "Definí un alias de tipo para la forma de la función: recibe un número y devuelve un número. aplicarATodos recibe esa función como parámetro y usa map, así no muta el arreglo original. conDescuento es una función de orden superior: devuelve otra función que recuerda el porcentaje por closure. Al tipar el callback, TypeScript infiere el parámetro dentro de la flecha y rechaza callbacks que reciban o devuelvan otro tipo, por ejemplo un string."

## Conceptos

- **Tipo de función**: `(param: Tipo) => Retorno`; describe la forma de una función.
- **Alias de tipo (`type`)**: un nombre para un tipo que se repite.
- **Callback**: función que pasas como argumento para que otra la llame.
- **Función de orden superior**: recibe o devuelve funciones (`map`, `conDescuento`).
- **Tipado contextual**: TypeScript deduce el tipo de los parámetros de una flecha por el lugar donde la usas.
- **Closure**: la función interna recuerda las variables de la función que la creó.
- **`@ts-expect-error`**: marca una línea que debe dar error de tipos; si no lo da, tsc avisa.
- Repasa el tema de Aprender "TS: funciones" y, en la Referencia, `map`.
