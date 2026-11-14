En una tienda en línea los precios del carrito pasan por varias transformaciones: un descuento, el IGV, un redondeo. Cada transformación es una **función que recibe un precio y devuelve otro precio**. En TypeScript esa forma se puede escribir como un tipo:

```ts
type Transformacion = (precio: number) => number;
```

Escribe:

1. El tipo `Transformacion`: una función que recibe un `precio` (número) y devuelve un número.
2. `aplicarATodos(precios, transformar)`: recibe un arreglo de precios y una `Transformacion`, y devuelve un **arreglo nuevo** con la transformación aplicada a cada precio.
3. `conDescuento(porcentaje)`: recibe un porcentaje y **devuelve una `Transformacion`** que le quita ese porcentaje a un precio. Calcula así: `precio - (precio * porcentaje) / 100`.

## Reglas

- No modifiques el arreglo que recibes.
- Si el arreglo está vacío, devuelve `[]`.
- Tipa los parámetros y el retorno: los tests revisan que TypeScript **rechace** un callback que reciba un texto o que devuelva un texto.

## Ejemplos

```ts
aplicarATodos([10, 20, 30], (p) => p * 2);   // [20, 40, 60]
aplicarATodos([], (p) => p + 1);             // []

const menos10 = conDescuento(10);
menos10(100);                                // 90

aplicarATodos([100, 50], conDescuento(20));  // [80, 40]

// Errores de tipos (los marca VS Code):
aplicarATodos([1, 2], (p: string) => p.toUpperCase()); // el callback recibe string
aplicarATodos([1, 2], (p) => "S/ " + p);               // el callback devuelve string
```
