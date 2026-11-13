Crea el componente `Contacto`, un formulario de pedido especial con dos campos (nombre y mensaje). Al enviarlo, llama a la prop `onEnviar` con un objeto `{ nombre, mensaje }`. Esta vez **sin `useState`**: lee los valores al enviar con `FormData`.

## Reglas

- Exporta la función `Contacto({ onEnviar })`.
- Un `<form>` con:
  - Un `<input>` con `name="nombre"` y el atributo `required`, dentro de un `<label>` con el texto **`Nombre`**.
  - Un `<textarea>` con `name="mensaje"`, dentro de un `<label>` con el texto **`Mensaje`**.
  - Un botón con el texto **`Enviar`**.
- Al enviar, el navegador **no** debe recargar la página (`preventDefault`).
- Llama a `onEnviar` **una vez** con el objeto `{ nombre: "...", mensaje: "..." }`. Las claves salen del atributo `name` de cada campo.
- Después de enviar, **limpia** el formulario (los dos campos quedan vacíos).
- Si el nombre está vacío, el formulario no se envía (eso lo hace el navegador gracias a `required`).

## Ejemplo

```jsx
<Contacto onEnviar={(datos) => console.log(datos)} />
```

| Acción | Resultado |
|---|---|
| Escribe "Angel" y "Sin cebolla", clic en Enviar | `onEnviar({ nombre: "Angel", mensaje: "Sin cebolla" })` y los campos quedan vacíos |
| Deja el nombre vacío y clic en Enviar | no se llama a `onEnviar` |

## Por qué importa

No todos los formularios necesitan un estado por campo. Si solo te interesan los datos al enviar, un formulario **no controlado** con `FormData` es más corto y no vuelve a renderizar en cada tecla. Saber cuándo usar uno u otro (y explicar la diferencia) es una pregunta frecuente de entrevista.
