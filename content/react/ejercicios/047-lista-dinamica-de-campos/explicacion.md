## Idea clave

Cada fila es un objeto con un **id propio** (`{ id, valor }`) que se usa como `key`. La `key` le dice a React **qué elemento es cuál** entre un render y otro; si es estable, al quitar una fila React elimina exactamente esa y deja intactos los elementos del DOM de las demás. La posición (1, 2, 3) solo se usa para los textos que ve el usuario.

## Paso a paso

1. **Estado con identidad**: `useState([{ id: 1, valor: "" }])`.
2. **Contador de ids en un ref**: `useRef(2)`. Cambia cada vez que agregas, pero no tiene que provocar un render, así que no es estado. (También podrías usar `crypto.randomUUID()`.)
3. **Cambiar un valor**: `map` que devuelve una copia `{ ...item, valor }` solo para la fila con ese id.
4. **Quitar**: `filter` que deja todas menos la del id.
5. **Agregar**: lee el id y súmale uno **fuera** del setter (`siguienteId.current++`), y luego agrega `{ id, valor: "" }` al final con spread.
6. **Renderiza** con `key={item.id}` y usa `i + 1` para los `aria-label`.

```jsx
import { useRef, useState } from "react";

export function Ingredientes() {
  // Cada fila tiene un id propio que NO cambia aunque se borren otras.
  const [lista, setLista] = useState([{ id: 1, valor: "" }]);
  const siguienteId = useRef(2); // contador que no necesita re-renderizar

  const cambiar = (id, valor) =>
    setLista((l) => l.map((item) => (item.id === id ? { ...item, valor } : item)));

  const quitar = (id) => setLista((l) => l.filter((item) => item.id !== id));

  const agregar = () => {
    const id = siguienteId.current++;
    setLista((l) => [...l, { id, valor: "" }]);
  };

  return (
    <div>
      {lista.map((item, i) => (
        <div key={item.id}>
          <input
            aria-label={`Ingrediente ${i + 1}`}
            value={item.valor}
            onChange={(e) => cambiar(item.id, e.target.value)}
          />
          <button aria-label={`Quitar ingrediente ${i + 1}`} onClick={() => quitar(item.id)}>
            ×
          </button>
        </div>
      ))}
      <button onClick={agregar}>Agregar ingrediente</button>
    </div>
  );
}
```

## Por qué funciona

| Acción | Estado `lista` | `key` en pantalla | Campos |
|---|---|---|---|
| Inicio | `[{1, ""}]` | 1 | Ingrediente 1: "" |
| Escribe queso | `[{1, "queso"}]` | 1 | Ingrediente 1: queso |
| Agregar | `[{1, "queso"}, {2, ""}]` | 1, 2 | ..., Ingrediente 2: "" |
| Escribe jamón | `[{1, "queso"}, {2, "jamón"}]` | 1, 2 | queso, jamón |
| Quitar el 1 | `[{2, "jamón"}]` | 2 | Ingrediente 1: jamón |

Al quitar la fila 1, React compara las keys: antes `[1, 2]`, ahora `[2]`. Concluye que la fila con key 1 se fue y **elimina su `<div>`**. El `<div>` con key 2 es el mismo elemento de antes: solo le cambia el `aria-label` a "Ingrediente 1". Por eso, si estabas escribiendo en "jamón", sigues con el foco ahí.

¿Qué pasaría con `key={i}` (el índice)? Antes `[0, 1]`, ahora `[0]`. React cree que **la última** fila se fue: elimina el `<div>` de "jamón" y al `<div>` de "queso" le cambia el valor a "jamón". En pantalla el texto parece correcto (porque los inputs son controlados), pero el elemento que tenía el foco desapareció. Y si las filas tuvieran estado interno (un input no controlado, un componente con `useState`, una animación), ese estado quedaría en la fila equivocada. El último test lo comprueba: con el índice como key, falla.

## Errores comunes

- **Usar el índice como `key`.** Funciona hasta que borras o reordenas: React reutiliza los elementos por posición y mezcla foco y estado interno. Falla el test de "key estable".
- **Usar el valor como `key`** (`key={item.valor}`). Dos filas vacías tendrían la misma key, y al escribir la key cambia en cada tecla, así que React recrea el input y pierdes el foco.
- **Generar la key en el render** (`key={Math.random()}`). Cada render todas las keys son nuevas: React destruye y recrea todos los inputs en cada tecla.
- **Mutar la lista**: `lista[i].valor = texto; setLista(lista)`. Es el mismo arreglo, React no ve cambios.
- **Guardar el contador de ids en `useState`.** Funciona, pero provoca un render extra por nada; y si haces `siguienteId.current++` dentro del setter, en modo estricto React puede llamarlo dos veces y saltarse ids.

## Otra forma de resolverlo

Con **`crypto.randomUUID()`** para los ids, sin contador:

```jsx
import { useState } from "react";

const nuevaFila = () => ({ id: crypto.randomUUID(), valor: "" });

export function Ingredientes() {
  const [lista, setLista] = useState(() => [nuevaFila()]);
  // cambiar y quitar igual que antes...
  const agregar = () => setLista((l) => [...l, nuevaFila()]);
  // ...mismo JSX con key={item.id}
}
```

**¿Cuándo conviene?** Cuando las filas se crean en distintos lugares (o vienen del servidor con su propio id) y no quieres mantener un contador. `useState(() => ...)` con función evita generar un UUID nuevo en cada render (solo se usa la primera vez). En formularios grandes, librerías como React Hook Form tienen `useFieldArray`, que hace todo esto por ti.

## Cómo explicarlo en la entrevista

> "Guardo cada fila como un objeto con un id estable y uso ese id como `key`. La key le dice a React qué elemento es cuál entre renders; si usara el índice, al borrar el primero React creería que se borró el último y reutilizaría los elementos por posición, mezclando foco y estado interno. El número visible lo saco del índice, solo para las etiquetas. Las actualizaciones son inmutables: `map` para cambiar, `filter` para quitar y spread para agregar, y el contador de ids va en un `useRef` porque no necesita re-renderizar."

## Conceptos

- **`key` en listas**: identidad de cada elemento entre renders.
- **Reconciliación**: cómo React compara el árbol anterior con el nuevo para decidir qué cambiar.
- **Por qué no el índice como key**: falla al borrar, insertar o reordenar.
- **Formularios dinámicos**: arreglo de objetos `{ id, valor }`.
- **`useRef` como contador**: valor que persiste sin provocar renders.
- **Inmutabilidad**: `map`, `filter` y spread.
- **`crypto.randomUUID()`**: ids únicos sin contador.
- **Inicialización perezosa** `useState(() => ...)`: el cálculo inicial se hace una sola vez.
