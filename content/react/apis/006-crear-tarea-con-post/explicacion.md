## Idea clave

Leer datos es un efecto (pasa porque el componente aparece); **enviar** datos es una respuesta a una acción del usuario, así que va en el **manejador del evento**, no en un `useEffect`. Un envío tiene su propio ciclo: validar, marcar "enviando" (y bloquear el botón para que no haya doble envío), mandar el `POST` con JSON, y terminar mostrando el éxito o el motivo exacto del rechazo. El `finally` garantiza que el botón siempre se desbloquee.

## Paso a paso

1. **Estados.** `titulo` (input controlado), `enviando`, `error` y `creada` (para el aviso de éxito).
2. **`preventDefault()`.** Un `<form>` por defecto recarga la página al enviarse; esto lo impide. Usar `onSubmit` (y no `onClick` del botón) hace que también funcione al presionar Enter.
3. **Validar en el cliente.** Si `titulo.trim()` está vacío, muestras el error sin gastar una petición. El servidor igual valida: la validación del cliente es por comodidad, la del servidor es por seguridad.
4. **Marcar "enviando".** `setEnviando(true)` deshabilita el botón en el siguiente render. El `if (enviando) return` al inicio es una segunda defensa.
5. **Armar el `POST`.** `method: "POST"`, el encabezado `Content-Type: application/json` (le dice al servidor cómo leer el cuerpo) y `body: JSON.stringify({ titulo })` (el cuerpo debe ser texto, no un objeto).
6. **Leer el cuerpo y revisar `ok`.** Con un 400 el servidor explica el problema en `cuerpo.error`: lo muestras tal cual y **no** borras el campo, para que el usuario corrija.
7. **Éxito.** Vacías el campo, muestras el aviso y llamas `alCrear(cuerpo)` con la tarea **del servidor** (trae el `id` que el cliente no conocía).
8. **`catch` y `finally`.** El `catch` atrapa el fallo de red; el `finally` corre en todos los casos (incluso después del `return` del error 400) y vuelve a habilitar el botón.

```jsx
const respuesta = await fetch("/api/practica/tareas", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ titulo: limpio }),
});
const cuerpo = await respuesta.json().catch(() => null);
if (!respuesta.ok) {
  setError(cuerpo?.error ?? `Error ${respuesta.status}`);
  return; // el finally igual corre
}
```

## Por qué funciona

| Momento | `enviando` | Botón | Campo | Mensaje |
|---|---|---|---|---|
| escribe y envía | `true` | `Guardando...`, deshabilitado | el texto | |
| intenta enviar otra vez | `true` | el clic en un botón deshabilitado no envía el formulario | | |
| llega `201` | `false` (por el `finally`) | `Agregar` | vacío | `Tarea creada: ...` |
| o llega `400` | `false` | `Agregar` | **se conserva** | el `error` del servidor |
| o no hay red | `false` | `Agregar` | se conserva | `No se pudo conectar con el servidor` |

El `return` dentro del `try` no se salta el `finally`: JavaScript siempre ejecuta el `finally` antes de salir de la función. Por eso no tienes que acordarte de poner `setEnviando(false)` en tres lugares.

## Errores comunes

- **Olvidar `preventDefault()`.** La página se recarga, el estado se pierde y la petición puede quedar cortada a la mitad.
- **Mandar el objeto sin `JSON.stringify`.** `body: { titulo }` se convierte en el texto `"[object Object]"` y el servidor no entiende nada.
- **Olvidar el `Content-Type`.** Muchos servidores (como Express con `express.json()`) solo leen el cuerpo si el encabezado dice que es JSON: el título llega vacío y te responden 400 aunque lo escribiste.
- **No deshabilitar el botón.** Doble clic, dos tareas creadas. En un checkout son dos cobros.
- **Borrar el campo antes de saber la respuesta.** Si el servidor rechaza, el usuario pierde lo que escribió.
- **`setEnviando(false)` solo en el camino feliz.** Con un error el botón queda deshabilitado para siempre.
- **Poner el `fetch` en un `useEffect` que depende de un estado "enviar".** Es más complicado y se presta a envíos repetidos; una acción del usuario va en su manejador.

## Otra forma de resolverlo

React 19 trae las **Actions de formulario**: le pasas una función `async` a `action` y `useActionState` maneja el estado "pendiente" por ti.

```jsx
import { useActionState } from "react";

function NuevaTarea({ alCrear }) {
  const [estado, accion, pendiente] = useActionState(async (anterior, datosForm) => {
    const titulo = String(datosForm.get("titulo")).trim();
    if (!titulo) return { error: "Escribe un título" };
    try {
      const r = await fetch("/api/practica/tareas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo }),
      });
      const cuerpo = await r.json().catch(() => null);
      if (!r.ok) return { error: cuerpo?.error ?? `Error ${r.status}` };
      alCrear?.(cuerpo);
      return { creada: cuerpo.titulo };
    } catch {
      return { error: "No se pudo conectar con el servidor" };
    }
  }, {});

  return (
    <form action={accion}>
      <label>Título <input name="titulo" /></label>
      <button disabled={pendiente}>{pendiente ? "Guardando..." : "Agregar"}</button>
      {estado.error && <p role="alert">{estado.error}</p>}
    </form>
  );
}
```

**¿Cuándo conviene?** En proyectos nuevos con React 19 es la forma recomendada: menos estados a mano, y el formulario se resetea solo al terminar. Ojo: el reseteo automático también borra el texto cuando el servidor responde 400, así que para conservarlo necesitas un input controlado o devolver el valor en el estado. La versión con `useState` sigue siendo la que más vas a ver en código existente y la que todo entrevistador entiende.

## Cómo explicarlo en la entrevista

> "El envío va en el `onSubmit`, no en un efecto, porque es una acción del usuario. Primero hago `preventDefault`, valido que el título no esté vacío y pongo `enviando` en `true`, que deshabilita el botón para evitar el doble envío. El `POST` lleva el encabezado `Content-Type: application/json` y el cuerpo con `JSON.stringify`. Si el servidor responde con error, muestro el mensaje que manda en el cuerpo y no borro lo que escribió el usuario; si sale bien, limpio el campo y paso la tarea que devolvió el servidor, con su `id`. El `setEnviando(false)` va en un `finally` para que el botón se habilite en cualquier caso."

## Conceptos

- **`onSubmit` y `preventDefault()`**: manejar el envío sin recargar la página (también con Enter).
- **`POST` con `fetch`**: `method`, `headers` y `body`.
- **`Content-Type: application/json`** y **`JSON.stringify`**.
- **`201 Created`** y **`400 Bad Request`** con mensaje de validación.
- **Doble envío**: botón deshabilitado y guarda en el manejador.
- **`try/catch/finally`**: el `finally` corre siempre, incluso tras un `return`.
- **Validación en cliente y en servidor**: comodidad vs. seguridad.
- **`useActionState`** (React 19) como alternativa.
