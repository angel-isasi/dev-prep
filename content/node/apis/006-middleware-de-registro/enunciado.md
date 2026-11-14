Exporta `crearApp(registro)`, que recibe un **arreglo vacío** y agrega dos **middlewares** a una app que ya tiene sus rutas:

1. **Registro**: por cada petición que llegue, hace `registro.push({ metodo, ruta })`.
2. **Versión**: agrega a **todas** las respuestas el header `X-Api-Version: 1`.

Las rutas ya vienen escritas en el archivo de inicio (`GET /saludo` y `GET /productos`).

## Qué es un middleware

Un middleware es una función que se ejecuta **en medio** del camino entre la petición y la respuesta. Tiene tres parámetros:

```js
app.use((req, res, next) => {
  // 1. Haces algo con la petición o preparas la respuesta
  // 2. Llamas a next() para pasar al siguiente middleware o ruta
  next();
});
```

Express arma una **fila** con todo lo que registras (`app.use`, `app.get`, ...) **en el orden en que lo escribes**. Cada petición recorre la fila: cada función decide si responde ella misma (y la fila se corta) o llama a `next()` para que siga el siguiente. Si un middleware **no responde ni llama a `next()`**, la petición se queda colgada para siempre.

Ya usaste uno: `express.json()` es un middleware que lee el cuerpo y llama a `next()`.

Los usos típicos: registrar peticiones (logs), agregar headers, leer el cuerpo, revisar si el usuario inició sesión, medir tiempos.

## Headers personalizados

Una respuesta puede llevar los headers que quieras. Por convención, los inventados por ti empiezan con `X-`. Se ponen con `res.set("Nombre", "valor")` antes de enviar la respuesta.

## Reglas

- Cada entrada del registro es `{ metodo: req.method, ruta: req.path }`. `req.path` es el camino **sin** la query string: `/productos?orden=precio` se registra como `/productos`.
- Se registran **todas** las peticiones, también las de rutas que no existen (404) y las de cualquier método.
- El header `X-Api-Version: 1` va en todas las respuestas, incluidas las 404.
- Las rutas tienen que seguir funcionando igual que antes.

## Ejemplos

```js
const registro = [];
const app = crearApp(registro);

// GET /saludo              ->  200 { mensaje: "Hola" }   X-Api-Version: 1
// POST /productos?x=1      ->  404                       X-Api-Version: 1

registro;
// [
//   { metodo: "GET", ruta: "/saludo" },
//   { metodo: "POST", ruta: "/productos" },
// ]
```
