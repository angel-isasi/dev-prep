## Idea clave

La **recursión** resuelve el árbol: cada comentario se convierte en "él mismo + sus respuestas aplanadas un nivel más adentro". `flatMap` junta todo en una lista **plana**, y la lista plana se pinta con un solo `map`.

## Paso a paso

1. **Caso general**: para cada comentario, devuelve un arreglo con dos partes:
   - el propio comentario, sin `respuestas`: `{ id, texto, nivel }`;
   - sus respuestas aplanadas: `...aplanar(respuestas, nivel + 1)`.
2. **`flatMap`** une los arreglos de todos los comentarios en uno solo, en orden.
3. **Caso base**: no hace falta un `if`. Si un comentario no tiene respuestas, `comentario.respuestas ?? []` da `[]`, y `aplanar([])` devuelve `[]` sin volver a llamarse (el `flatMap` de un arreglo vacío no da ninguna vuelta).
4. **Nivel por parámetro**: `nivel = 0` por defecto; cada llamada recursiva pasa `nivel + 1`.
5. **Componente**: `aplanar(comentarios).map(...)` con `style={{ marginLeft: nivel * 24 }}`. En los estilos en línea de React, un número en propiedades de tamaño se interpreta como píxeles.

```jsx
export function aplanar(comentarios, nivel = 0) {
  return comentarios.flatMap((comentario) => [
    { id: comentario.id, texto: comentario.texto, nivel },
    ...aplanar(comentario.respuestas ?? [], nivel + 1),
  ]);
}

const SANGRIA_PX = 24;

export function Hilo({ comentarios }) {
  return (
    <ul>
      {aplanar(comentarios).map((comentario) => (
        <li key={comentario.id} style={{ marginLeft: comentario.nivel * SANGRIA_PX }}>
          {comentario.texto}
        </li>
      ))}
    </ul>
  );
}
```

## Por qué funciona

Recorrido de las llamadas con el ejemplo (cada sangría es una llamada más profunda):

```
aplanar([Buenísima, Llegó fría], 0)
  Buenísima -> [{Buenísima, 0}, ...aplanar([Gracias], 1)]
      aplanar([Gracias], 1)
        Gracias -> [{Gracias, 1}, ...aplanar([Volveré], 2)]
            aplanar([Volveré], 2)
              Volveré -> [{Volveré, 2}, ...aplanar([], 3)]
                  aplanar([], 3) -> []          (caso base)
              devuelve [{Volveré, 2}]
        devuelve [{Gracias, 1}, {Volveré, 2}]
  Buenísima da [{Buenísima, 0}, {Gracias, 1}, {Volveré, 2}]
  Llegó fría -> [{Llegó fría, 0}, ...aplanar([], 1)] = [{Llegó fría, 0}]
resultado: [Buenísima 0, Gracias 1, Volveré 2, Llegó fría 0]
```

El orden sale "de lectura" porque cada comentario pone **primero** su propio objeto y **después** el spread de sus respuestas: se recorre en profundidad antes de pasar al hermano siguiente.

Luego, "Volveré" tiene `nivel: 2`, así que `marginLeft: 2 * 24 = 48`, que React escribe como `margin-left: 48px`.

## Errores comunes

- **Usar `map` en vez de `flatMap`.** Obtienes arreglos dentro de arreglos (`[[...], [...]]`) y el componente pinta mal o lanza error.
- **Olvidar el spread** antes de la llamada recursiva: `[{...}, aplanar(...)]` mete un arreglo entero como un solo elemento.
- **No manejar `respuestas` ausente.** `aplanar(undefined)` lanza `Cannot read properties of undefined (reading 'flatMap')`. El `?? []` lo evita.
- **Pasar `nivel` en vez de `nivel + 1`** en la llamada recursiva: todos los comentarios quedan con nivel 0.
- **Copiar el comentario entero** (`{ ...comentario, nivel }`). El resultado arrastra el arreglo `respuestas`, que ya no sirve y confunde.

## Otra forma de resolverlo

Con un **componente recursivo**, sin aplanar: cada comentario pinta sus respuestas en una lista anidada.

```jsx
export function Comentario({ comentario }) {
  return (
    <li>
      {comentario.texto}
      {comentario.respuestas?.length > 0 && (
        <ul>
          {comentario.respuestas.map((r) => (
            <Comentario key={r.id} comentario={r} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function HiloAnidado({ comentarios }) {
  return (
    <ul>
      {comentarios.map((c) => (
        <Comentario key={c.id} comentario={c} />
      ))}
    </ul>
  );
}
```

**¿Cuándo conviene?** Cuando quieres que el HTML refleje la estructura (listas dentro de listas, mejor para lectores de pantalla) o que cada rama se pueda contraer. La versión aplanada conviene cuando necesitas una lista lineal: para virtualizar miles de comentarios, contarlos, filtrarlos o navegar con el teclado de arriba abajo. Ambas usan recursión; la diferencia es si recursas en los datos o en los componentes.

## Cómo explicarlo en la entrevista

> "Los comentarios forman un árbol, así que uso recursión. `aplanar` recorre los comentarios con `flatMap` y por cada uno devuelve el propio comentario con su nivel, seguido de sus respuestas aplanadas con el nivel más uno. El caso base es implícito: sin respuestas uso un arreglo vacío y la recursión se detiene. El resultado es una lista plana en orden de lectura, y el componente solo hace un `map` aplicando 24 píxeles de sangría por nivel. Si necesitara contraer ramas, haría un componente recursivo en vez de aplanar."

## Conceptos

- **Recursión**: una función que se llama a sí misma con un problema más chico.
- **Caso base**: la condición que detiene la recursión (aquí, un arreglo vacío).
- **Árbol**: estructura donde cada nodo puede tener hijos.
- **Recorrido en profundidad**: visitar todos los hijos de un nodo antes que a su hermano.
- **`flatMap` + spread**: devolver varios elementos por cada uno y unirlos en una lista.
- **Estilos en línea en React**: objeto con propiedades en camelCase; los números son píxeles.
- **Componentes recursivos**: un componente que se renderiza a sí mismo.
