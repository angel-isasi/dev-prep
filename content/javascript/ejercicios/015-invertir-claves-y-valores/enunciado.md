Escribe la función `invertirObjeto(obj)` que reciba un objeto y devuelva un **objeto nuevo** donde las claves pasan a ser valores y los valores pasan a ser claves.

## Reglas

- Cada par `clave: valor` del original se convierte en `valor: clave`.
- Las claves de un objeto siempre son textos: si un valor era el número `1`, en el resultado la clave será `"1"`.
- Si dos claves tienen **el mismo valor**, en el resultado queda **la última** (no puede haber claves repetidas).
- Un objeto vacío devuelve `{}`.
- No modifiques el objeto original.

## Ejemplos

```js
invertirObjeto({ pe: "Perú", gt: "Guatemala" });   // { Perú: "pe", Guatemala: "gt" }
invertirObjeto({ a: 1, b: 2 });                    // { "1": "a", "2": "b" }
invertirObjeto({ a: "x", b: "x" });                // { x: "b" }
invertirObjeto({});                                // {}
```

## Por qué importa

Sirve para buscar "al revés": si tienes `{ pe: "Perú" }` para mostrar el nombre de un código, invertirlo te da `{ Perú: "pe" }` para obtener el código a partir del nombre. Y te obliga a aprender `Object.entries` y `Object.fromEntries`, el puente que te permite usar `map` y `filter` sobre objetos.
