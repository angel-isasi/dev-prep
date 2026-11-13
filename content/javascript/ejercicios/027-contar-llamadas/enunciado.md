Escribe la función `contarLlamadas(fn)` que **envuelva** a `fn` y devuelva una función nueva que hace lo mismo que `fn`, pero además lleva la cuenta de cuántas veces se usó. La cuenta se lee en la propiedad `veces` de la función devuelta.

## Reglas

- La función envuelta recibe los mismos argumentos que `fn`, se los pasa y devuelve el mismo resultado.
- `envuelta.veces` empieza en `0` y aumenta en 1 con cada llamada.
- Cada función envuelta lleva su propia cuenta.

## Ejemplos

```js
const sumar = contarLlamadas((a, b) => a + b);
sumar.veces;      // 0
sumar(1, 2);      // 3
sumar(2, 3);      // 5
sumar.veces;      // 2
```

## Por qué importa

Te enseña algo que sorprende a muchos: **las funciones en JavaScript son objetos** y pueden tener propiedades. Además es el patrón "wrapper" (envoltorio), la base de cómo funcionan herramientas reales: los "espías" de los tests (`vi.fn()` cuenta llamadas así), los logs de rendimiento o el `memo` de React.
