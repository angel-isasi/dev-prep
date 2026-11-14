## Idea clave

Un `POST` trae los datos en el **cuerpo** de la petición. `app.use(express.json())` los convierte en `req.body`. El handler sigue siempre el mismo orden: **leer, validar (400 si algo falla), guardar y responder 201** con el recurso creado y el header `Location`.

## Paso a paso

1. **Activar la lectura de JSON.** `app.use(express.json())` registra un middleware (una función que corre antes de tus rutas). Si la petición trae `Content-Type: application/json`, lee el texto del cuerpo, hace `JSON.parse` y lo guarda en `req.body`. Sin esa línea, `req.body` es `undefined`.
2. **Leer con cuidado.** `const { nombre, email } = req.body ?? {}`. Si llegó un POST sin cuerpo, `req.body` es `undefined` y desestructurarlo lanzaría "Cannot destructure property 'nombre' of undefined", que se convierte en un 500. El `?? {}` lo evita.
3. **Validar el nombre.** Que sea texto (`typeof nombre === "string"`) y que no quede vacío tras `trim()`. Si no, `400` y `return`.
4. **Validar el email.** Texto que contenga `"@"`. Es una validación mínima, suficiente para el ejercicio.
5. **Construir el objeto a mano.** `{ id: siguienteId++, nombre: nombre.trim(), email }`. No copias `req.body` entero: así un cliente no puede colarte `rol: "admin"`.
6. **Guardar y responder.** `usuarios.push(nuevo)` y `res.status(201).location("/usuarios/2").json(nuevo)`. `location` pone el header `Location`; los tres métodos devuelven `res`, por eso se encadenan.

```js
app.use(express.json());

app.post("/usuarios", (req, res) => {
  const { nombre, email } = req.body ?? {};
  if (typeof nombre !== "string" || nombre.trim() === "") {
    return res.status(400).json({ error: "El nombre es obligatorio" });
  }
  if (typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ error: "El email no es válido" });
  }
  const nuevo = { id: siguienteId++, nombre: nombre.trim(), email };
  usuarios.push(nuevo);
  res.status(201).location(`/usuarios/${nuevo.id}`).json(nuevo);
});
```

## Por qué funciona

| Petición (cuerpo) | `req.body` | Qué pasa | Respuesta |
|---|---|---|---|
| `{"nombre":"  Beto ","email":"beto@correo.com","rol":"admin"}` | ese objeto | pasa las dos validaciones; se guarda `{ id: 2, nombre: "Beto", email }` | `201`, `Location: /usuarios/2` |
| `{"email":"x@correo.com"}` | `{ email }` | `nombre` es `undefined`, `typeof` no es `"string"` | `400` nombre |
| `{"nombre":"Carla","email":"carla.correo.com"}` | ese objeto | nombre ok; email sin `@` | `400` email |
| (sin cuerpo) | `undefined` | `?? {}` da `{}`, `nombre` es `undefined` | `400` nombre |

`siguienteId++` devuelve el valor **actual** (2) y después lo sube a 3, por eso el primer creado es el 2 y el siguiente será el 3. Y como `usuarios` y `siguienteId` viven **dentro** de `crearApp`, cada app nueva empieza con solo Ana: los tests no se contaminan entre sí.

## Errores comunes

- **Olvidar `app.use(express.json())`** o ponerlo **después** de las rutas: `req.body` es `undefined` y todo da 400 (o 500). Los middlewares corren en el orden en que los registras.
- **Desestructurar `req.body` sin `?? {}`**: el test "sin cuerpo" recibe un 500 en vez de un 400.
- **Validar con `if (!nombre)`**: deja pasar `"   "` y también un número como `123`, que no tiene `trim`.
- **Guardar `{ id, ...req.body }`**: el usuario queda con `rol: "admin"`. Esto se llama *mass assignment* y es un fallo de seguridad real.
- **Responder 200 en vez de 201**: funciona, pero no es lo que pide una API REST bien hecha y el test lo marca.
- **Calcular el id con `usuarios.length + 1`**: funciona hasta que borras a alguien; entonces repites ids. Un contador o `Math.max(...ids) + 1` es más seguro.
- **Guardar antes de validar**: un POST inválido deja basura en la lista.

## Otra forma de resolverlo

Separar la validación en una función que devuelve el mensaje de error o `null`:

```js
function validarUsuario({ nombre, email } = {}) {
  if (typeof nombre !== "string" || nombre.trim() === "") return "El nombre es obligatorio";
  if (typeof email !== "string" || !email.includes("@")) return "El email no es válido";
  return null;
}

app.post("/usuarios", (req, res) => {
  const error = validarUsuario(req.body);
  if (error) return res.status(400).json({ error });
  // ...
});
```

El handler queda más corto y la validación se puede probar sola o reutilizar en un `PUT`. Cuando las reglas crecen mucho, en el trabajo se usan librerías como **zod**, que describen la forma del objeto y devuelven los errores. Para dos campos, el `if` directo está bien.

## Cómo explicarlo en la entrevista

> "Activo express.json para que Express lea el cuerpo JSON y lo deje en req.body. En el handler desestructuro con un fallback por si no vino cuerpo, valido cada campo y si algo falla respondo 400 Bad Request con un mensaje claro, sin guardar nada. Si todo está bien armo el objeto solo con los campos permitidos, para evitar mass assignment, lo guardo y respondo 201 Created con el recurso y el header Location apuntando a su URL."

## Conceptos

- **POST**: método para crear; los datos van en el cuerpo.
- **`express.json()`** y **`req.body`**: leer cuerpos JSON (en Express 5, `undefined` si no hay).
- **Header `Content-Type: application/json`**: el cliente avisa que manda JSON.
- **201 Created** y **header `Location`**: respuesta correcta al crear.
- **400 Bad Request**: datos inválidos del cliente.
- **Validación en el servidor**: nunca confíes en lo que manda el cliente.
- **Mass assignment**: copiar el cuerpo entero deja pasar campos que no debías.
- **Middleware**: función que corre antes de tus rutas (lo verás a fondo en el ejercicio 006).
