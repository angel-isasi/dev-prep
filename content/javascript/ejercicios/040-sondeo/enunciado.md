Escribe la función `sondear(consultar, intervalo, intentos)`. `consultar` es una función asíncrona que pregunta "¿ya está listo?": devuelve algo **verdadero** (truthy) cuando sí, y algo falso (`null`, `false`...) cuando todavía no. `sondear` la llama hasta que responda algo verdadero, esperando `intervalo` milisegundos entre una consulta y otra, con un máximo de `intentos` consultas.

## Reglas

- La primera consulta se hace **de inmediato**, sin esperar.
- Si `consultar` devuelve algo verdadero, `sondear` se cumple con ese valor y no consulta más.
- Si devuelve algo falso, espera `intervalo` ms y vuelve a consultar.
- Si se hacen `intentos` consultas sin éxito, rechaza con `new Error("Se agotaron los intentos")`.
- **No esperes después de la última consulta**: si ya no quedan intentos, rechaza en ese momento.

## Ejemplos

```js
// Un despliegue que tarda: responde "publicado" en la tercera consulta
let llamadas = 0;
const estadoDespliegue = async () => (++llamadas === 3 ? "publicado" : null);

await sondear(estadoDespliegue, 100, 5);
// t = 0:   consulta 1 -> null
// t = 100: consulta 2 -> null
// t = 200: consulta 3 -> "publicado"   => se cumple con "publicado"

await sondear(async () => null, 100, 2);
// t = 0:   consulta 1 -> null
// t = 100: consulta 2 -> null, no quedan intentos
// => lanza Error("Se agotaron los intentos") a los 100 ms (no a los 200)
```

## Por qué importa

Muchas cosas no avisan cuando terminan: un pago que se está procesando, un archivo que se está convirtiendo, un despliegue. La solución típica es **preguntar cada cierto tiempo** (sondeo, o *polling* en inglés), siempre con un límite para no quedarte preguntando para siempre. Es la misma estructura que un "reintentar con espera", que también piden en entrevistas.
