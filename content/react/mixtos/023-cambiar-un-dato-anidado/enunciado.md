El estado de un cliente tiene un objeto **anidado**: la dirección. Quieres cambiar solo el distrito, sin mutar nada. Escribe la función y úsala en un pequeño formulario.

Exporta:

- `cambiarDistrito(cliente, distrito)`: devuelve un cliente **nuevo** con `direccion.distrito` cambiado.
- `PerfilCliente({ clienteInicial })`: componente con el cliente en el estado y un input para editar el distrito.

## Reglas

- `cambiarDistrito` **no modifica** el cliente original ni su dirección (en los tests llegan congelados).
- Copia **solo el camino que cambia**: el cliente y su `direccion` son objetos nuevos, pero lo que no cambia (por ejemplo, el arreglo `pedidos`) se **reutiliza** (es la misma referencia).
- `PerfilCliente`:
  - Un `<p>` con `{nombre} vive en {distrito}`, por ejemplo `Ana vive en Ica`.
  - Un `<input>` con `aria-label="Distrito"` controlado, cuyo valor es el distrito actual. Al escribir, actualiza el estado usando `cambiarDistrito`.

## Ejemplo

```js
const cliente = {
  nombre: "Ana",
  direccion: { distrito: "Ica", calle: "Av. Los Maestros" },
  pedidos: [1, 2],
};

const nuevo = cambiarDistrito(cliente, "Parcona");
nuevo.direccion;                     // { distrito: "Parcona", calle: "Av. Los Maestros" }
cliente.direccion.distrito;          // "Ica" (intacto)
nuevo.pedidos === cliente.pedidos;   // true (se comparte)
```

## Por qué importa

En React el estado se actualiza **reemplazándolo**, nunca modificándolo. Con objetos anidados, el error típico es copiar solo el primer nivel y mutar el de adentro. Saber hacer el "spread anidado" es una pregunta directa de entrevista.
