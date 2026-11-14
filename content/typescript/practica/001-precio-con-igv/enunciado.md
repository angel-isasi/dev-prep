En una tienda online peruana los precios se guardan **sin IGV** y se muestran al cliente **con IGV**. Escribe en TypeScript la función `precioConIgv(precio, tasa)` que haga ese cálculo.

El objetivo no es solo la cuenta: es **anotar los tipos** de la función, como lo harías en cualquier proyecto con TypeScript.

## Reglas

- `precio` es un `number`: el precio sin impuesto.
- `tasa` es opcional: si no la pasas, vale `0.18` (el IGV en Perú). Si la pasas, es un `number`.
- Devuelve el precio con impuesto, **redondeado a 2 decimales**.
- Anota el **tipo de retorno** (`number`) en la firma.
- Llamar con un texto, como `precioConIgv("100")`, debe ser un **error de tipos**. Los tests lo revisan con `tsc`.

## Ejemplos

```ts
precioConIgv(100);        // 118
precioConIgv(50.5);       // 59.59
precioConIgv(19.9);       // 23.48
precioConIgv(100, 0.1);   // 110
precioConIgv(0);          // 0
precioConIgv("100");      // error de TypeScript: un string no es un number
```

## Reto extra

Pasa el cursor sobre `precioConIgv` en VS Code. Fíjate cómo muestra la firma: `(precio: number, tasa?: number) => number`. Un parámetro con valor por defecto se ve como **opcional** para quien llama.
