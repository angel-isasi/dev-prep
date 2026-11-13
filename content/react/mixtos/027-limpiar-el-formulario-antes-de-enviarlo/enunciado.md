Crea y exporta la función pura `normalizarPedido(formulario)`. Recibe los valores **tal como los escribió el usuario** en un formulario de pedido (todos son textos) y devuelve un objeto nuevo, limpio y listo para enviar al servidor.

`formulario` tiene la forma `{ nombre, correo, telefono, cantidad }`.

## Reglas

- **`nombre`**: sin espacios al inicio ni al final, y con un solo espacio entre palabras. `"  Angel   Isasi "` pasa a `"Angel Isasi"`.
- **`correo`**: sin espacios en los extremos y todo en minúsculas. `" ANGEL@Unica.edu.pe "` pasa a `"angel@unica.edu.pe"`.
- **`telefono`**: solo los dígitos. `"+51 987-654-321"` pasa a `"51987654321"` (sigue siendo texto).
- **`cantidad`**: un **número entero** de al menos 1. Si no se puede leer un número (`"abc"`, `""`) o es menor que 1 (`"0"`, `"-3"`), usa `1`. `"3"` pasa a `3` y `"2.7"` a `2`.
- **No modifiques** el objeto que recibes: devuelve uno nuevo.

## Ejemplo

```js
normalizarPedido({
  nombre: "  Angel   Isasi ",
  correo: " ANGEL@Unica.edu.pe ",
  telefono: "+51 987-654-321",
  cantidad: "abc",
});
// { nombre: "Angel Isasi", correo: "angel@unica.edu.pe", telefono: "51987654321", cantidad: 1 }
```

En el componente, la llamarías justo antes de enviar:

```jsx
function enviar(evento) {
  evento.preventDefault();
  const pedido = normalizarPedido(datos);
  guardarPedido(pedido);
}
```

## Por qué importa

Lo que escribe un usuario siempre llega "sucio": espacios de más, mayúsculas, guiones en el teléfono, letras donde va un número. Limpiarlo en **un solo lugar** antes de usarlo evita bugs como dos usuarios "distintos" con el mismo correo en mayúsculas. Y como es una función pura, se prueba en segundos.
