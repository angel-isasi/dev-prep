Los comentarios de una pizzería tienen **respuestas**, y las respuestas pueden tener más respuestas: es un **árbol**. Para pintarlo como una lista con sangría, primero lo conviertes en una lista **plana** donde cada comentario sabe su nivel de profundidad.

Exporta:

- `aplanar(comentarios, nivel = 0)`: recibe un arreglo de `{ id, texto, respuestas? }` y devuelve un arreglo plano de `{ id, texto, nivel }`.
- `Hilo({ comentarios })`: componente que pinta el árbol con sangría.

## Reglas

- `respuestas` es opcional: si no existe, el comentario no tiene respuestas.
- El orden es el de lectura: cada comentario va seguido de **todas** sus respuestas (y las respuestas de sus respuestas) antes de pasar al siguiente comentario del mismo nivel.
- Los comentarios de primer nivel tienen `nivel: 0`, sus respuestas `nivel: 1`, y así.
- El resultado tiene solo `id`, `texto` y `nivel` (sin `respuestas`).
- `Hilo` pinta una `<ul>` con un `<li>` por comentario aplanado, con el texto y un estilo en línea `marginLeft` de **24 px por nivel** (nivel 2 = `48px`).

## Ejemplo

```js
const comentarios = [
  {
    id: 1,
    texto: "Buenísima",
    respuestas: [{ id: 2, texto: "Gracias", respuestas: [{ id: 3, texto: "Volveré" }] }],
  },
  { id: 4, texto: "Llegó fría" },
];

aplanar(comentarios);
// [
//   { id: 1, texto: "Buenísima", nivel: 0 },
//   { id: 2, texto: "Gracias",   nivel: 1 },
//   { id: 3, texto: "Volveré",   nivel: 2 },
//   { id: 4, texto: "Llegó fría", nivel: 0 },
// ]
```

```
Buenísima
    Gracias
        Volveré
Llegó fría
```

## Por qué importa

Árboles hay en todas partes: comentarios, menús con submenús, carpetas, categorías. La **recursión** es la forma natural de recorrerlos y es tema fijo en entrevistas. Aplanar primero y pintar después mantiene el componente simple: un solo `map`, sin componentes que se llaman a sí mismos.
