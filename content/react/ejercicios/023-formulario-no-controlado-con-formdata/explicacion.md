## Idea clave

Si solo necesitas los datos **al enviar**, no hace falta un `useState` por campo: deja que los inputs guarden su valor (formulario **no controlado**) y léelos todos juntos en el `onSubmit` con `new FormData(formulario)`.

## Paso a paso

1. **Escucha `onSubmit` en el `<form>`.** Se dispara al hacer clic en el botón o al presionar Enter en un campo. Un `<button>` dentro de un `<form>` es de tipo `submit` por defecto.
2. **`preventDefault()`.** Por defecto, enviar un formulario recarga la página (o navega a otra URL). En una app de React no quieres eso.
3. **Toma el formulario.** `evento.currentTarget` es el elemento que tiene el listener: el `<form>`.
4. **Lee los campos con `FormData`.** `new FormData(formulario)` junta todos los campos que tengan atributo `name`, como pares `[nombre, valor]`.
5. **Conviértelo en objeto.** `Object.fromEntries(...)` transforma esos pares en `{ nombre: "Angel", mensaje: "Sin cebolla" }`.
6. **Avisa al padre y limpia.** `onEnviar(datos)` y luego `formulario.reset()`, que devuelve cada campo a su valor inicial (vacío).
7. **Validación gratis.** `required` en el input hace que el navegador no dispare `submit` si el nombre está vacío, y muestra su propio mensaje.

```jsx
export function Contacto({ onEnviar }) {
  function enviar(evento) {
    evento.preventDefault(); // que el navegador no recargue la página

    const formulario = evento.currentTarget; // el <form>
    // FormData lee todos los campos con `name`; fromEntries lo vuelve objeto.
    const datos = Object.fromEntries(new FormData(formulario));

    onEnviar(datos);
    formulario.reset(); // deja los campos vacíos
  }

  return (
    <form onSubmit={enviar}>
      <label>
        Nombre <input name="nombre" required />
      </label>
      <label>
        Mensaje <textarea name="mensaje" />
      </label>
      <button>Enviar</button>
    </form>
  );
}
```

Poner el input **dentro** del `<label>` los une sin necesidad de `id` y `htmlFor`: hacer clic en el texto enfoca el campo, y `getByLabelText("Nombre")` lo encuentra.

## Por qué funciona

| Acción | ¿Re-render? | Dónde está el valor | Qué pasa |
|---|---|---|---|
| Escribe "Angel" | **no** | en el propio `<input>` del DOM | nada en React |
| Escribe "Sin cebolla" | **no** | en el `<textarea>` | nada en React |
| Clic en Enviar | | | el navegador valida `required`: el nombre tiene texto, sigue |
| `submit` | | | `FormData` da `[["nombre","Angel"],["mensaje","Sin cebolla"]]` |
| | | | `fromEntries` da `{ nombre: "Angel", mensaje: "Sin cebolla" }` y se llama a `onEnviar` |
| `reset()` | **no** | campos vacíos | listo para otro pedido |
| Clic en Enviar con nombre vacío | | | `required` falla: **no** hay `submit`, no se llama a `onEnviar` |

El componente nunca vuelve a renderizar mientras escribes: React no sabe qué hay en los campos hasta que lees el formulario. Esa es la diferencia con un input controlado (`value` + `onChange`), donde cada tecla pasa por el estado.

## Errores comunes

- **Olvidar `preventDefault()`.** El navegador intenta enviar el formulario y recargar. En la app se pierde todo; en los tests, jsdom avisa "Not implemented: HTMLFormElement.prototype.submit" o similar.
- **Usar `onClick` en el botón en vez de `onSubmit` en el form.** Presionar Enter en un campo ya no funciona, y `required` no bloquea nada porque el clic se procesa igual.
- **Campos sin `name`.** `FormData` los ignora: el objeto sale sin esa clave. Lo reconoces porque `onEnviar` recibe `{}` o le falta un campo.
- **Usar `evento.target` en lugar de `evento.currentTarget`.** En `submit` suelen coincidir, pero `currentTarget` es siempre el elemento que tiene el listener; `target` puede ser un hijo en otros eventos.
- **Ponerle `value` a un campo sin `onChange`**, mezclando controlado y no controlado. React lo vuelve de solo lectura. Si quieres un valor inicial en un no controlado, usa `defaultValue`.

## Otra forma de resolverlo

Con **formulario controlado**, un estado con los dos campos:

```jsx
import { useState } from "react";

export function Contacto({ onEnviar }) {
  const [datos, setDatos] = useState({ nombre: "", mensaje: "" });

  function cambiar(evento) {
    const { name, value } = evento.target;
    setDatos((actual) => ({ ...actual, [name]: value }));
  }

  function enviar(evento) {
    evento.preventDefault();
    onEnviar(datos);
    setDatos({ nombre: "", mensaje: "" });
  }

  return (
    <form onSubmit={enviar}>
      <label>
        Nombre <input name="nombre" required value={datos.nombre} onChange={cambiar} />
      </label>
      <label>
        Mensaje <textarea name="mensaje" value={datos.mensaje} onChange={cambiar} />
      </label>
      <button>Enviar</button>
    </form>
  );
}
```

**¿Cuándo conviene?** Cuando necesitas reaccionar **mientras** el usuario escribe: validar en vivo, contar caracteres, deshabilitar el botón, formatear el texto o mostrar una vista previa. Si solo usas los datos al final, el no controlado con `FormData` es más corto. En React 19 también existe `<form action={funcion}>`, que recibe directamente el `FormData`, y sigue la misma idea.

## Cómo explicarlo en la entrevista

> "Como solo necesito los datos al enviar, uso un formulario no controlado: los inputs guardan su valor en el DOM y no hay un render por tecla. En el `onSubmit` hago `preventDefault`, leo todos los campos con `new FormData(evento.currentTarget)` y lo convierto en objeto con `Object.fromEntries`; las claves salen del atributo `name`. Después llamo a `onEnviar` y hago `reset()`. Para validar uso `required`, que bloquea el envío de forma nativa. Si necesitara validar mientras escribe, pasaría a inputs controlados."

## Conceptos

- **Formulario no controlado**: el DOM guarda el valor de cada campo; React lo lee cuando lo necesita.
- **Formulario controlado**: el valor vive en el estado (`value` + `onChange`).
- **`onSubmit`**: evento del `<form>`; cubre clic en el botón y Enter.
- **`preventDefault()`**: cancela la acción por defecto del navegador (recargar al enviar).
- **`FormData`**: lee los campos con `name` de un formulario.
- **`Object.fromEntries`**: convierte pares `[clave, valor]` en un objeto.
- **`reset()`**: devuelve los campos del formulario a su valor inicial.
- **`required`**: validación nativa del navegador; impide el `submit` si el campo está vacío.
