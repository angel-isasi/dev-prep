## El problema

El equipo de backend se queja: "El buscador de la tienda nos está saturando el servidor. Si alguien escribe **casa** rápido, nos llegan **4 peticiones** (c, ca, cas, casa) en vez de una. Se supone que usaban un debounce".

Tu compañero revisó y dice: "Sí lo uso, y además cancelo el temporizador anterior con `clearTimeout`. No sé por qué no funciona".

## Qué debe hacer

`debounce(fn, ms)` devuelve una función que, al llamarla, espera `ms` milisegundos. Si la vuelven a llamar antes de que pase ese tiempo, **cancela la espera anterior** y empieza a contar de nuevo. Así, solo la última llamada de una ráfaga ejecuta `fn`, con sus argumentos.

```js
const buscarConEspera = debounce(buscar, 300);

buscarConEspera("c");
buscarConEspera("ca");
buscarConEspera("casa");
// 300 ms después de la última: buscar("casa"), una sola vez
```

## Tu tarea

Encuentra el error y arréglalo cambiando lo mínimo.
