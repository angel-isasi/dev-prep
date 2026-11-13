Escribe la función `crearContador(inicial)` que devuelva un **objeto** con tres métodos: `incrementar()`, `decrementar()` y `valor()`. La cuenta debe ser **privada**: nadie puede leerla ni cambiarla desde fuera, salvo usando esos métodos.

## Reglas

- La cuenta empieza en `inicial`. Si no te pasan nada, empieza en `0`.
- `incrementar()` suma 1 y devuelve el nuevo valor.
- `decrementar()` resta 1 y devuelve el nuevo valor.
- `valor()` devuelve la cuenta actual.
- El objeto devuelto **solo** tiene esos tres métodos: no puede tener una propiedad `cuenta` ni nada parecido.
- Cada contador es independiente de los demás.

## Ejemplos

```js
const c = crearContador(5);
c.incrementar();   // 6
c.incrementar();   // 7
c.decrementar();   // 6
c.valor();         // 6
c.cuenta;          // undefined: la cuenta no se ve desde fuera

const otro = crearContador();
otro.valor();      // 0
```

## Por qué importa

"¿Qué es un closure? Dame un ejemplo" es probablemente la pregunta de JavaScript más repetida en entrevistas junior, y este contador es la respuesta modelo. El mismo patrón está detrás de `useState` en React y de cualquier módulo que esconde su estado interno.
