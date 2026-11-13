## Idea clave

`alternar` decide con `includes` y **siempre crea un arreglo nuevo**: `filter` para quitar, spread `[...arr, id]` para agregar. El componente guarda la selección en el estado y le pasa a `setSeleccion` el resultado de `alternar`.

## Paso a paso

1. **¿Está?** `seleccion.includes(id)` devuelve `true` o `false`.
2. **Si está**, `filter((x) => x !== id)` devuelve un arreglo nuevo con todo menos ese elemento.
3. **Si no está**, `[...seleccion, id]` copia los elementos y agrega `id` al final.
4. **En el componente**, cada casilla es **controlada**: su `checked` sale del estado (`seleccion.includes(opcion)`), no del DOM.
5. **`onChange`** llama a `setSeleccion((actual) => alternar(actual, opcion))`. La forma funcional garantiza que trabajas con la selección más reciente.
6. **Etiqueta envolvente**: poner el `<input>` dentro del `<label>` los asocia sin necesidad de `id` y `htmlFor`. Además, hacer clic en el texto marca la casilla.
7. **Resumen**: `join(", ")` o el texto de "nada elegido".

```jsx
import { useState } from "react";

export function alternar(seleccion, id) {
  return seleccion.includes(id) ? seleccion.filter((x) => x !== id) : [...seleccion, id];
}

export function SelectorIngredientes({ opciones }) {
  const [seleccion, setSeleccion] = useState([]);

  return (
    <fieldset>
      <legend>Ingredientes extra</legend>
      {opciones.map((opcion) => (
        <label key={opcion}>
          <input
            type="checkbox"
            checked={seleccion.includes(opcion)}
            onChange={() => setSeleccion((actual) => alternar(actual, opcion))}
          />
          {opcion}
        </label>
      ))}
      <p>{seleccion.length > 0 ? `Elegiste: ${seleccion.join(", ")}` : "No elegiste nada"}</p>
    </fieldset>
  );
}
```

## Por qué funciona

Recorrido del test del componente:

| Acción | `seleccion` antes | `alternar` devuelve | Resumen |
|---|---|---|---|
| inicio | | `[]` | No elegiste nada |
| clic en aceitunas | `[]` | `["aceitunas"]` | Elegiste: aceitunas |
| clic en queso | `["aceitunas"]` | `["aceitunas", "queso"]` | Elegiste: aceitunas, queso |
| clic en aceitunas | `["aceitunas", "queso"]` | `["queso"]` | Elegiste: queso |

En cada paso, `alternar` devuelve un arreglo **distinto** (otra referencia). React compara la referencia vieja con la nueva, ve que cambió y re-renderiza. Las casillas se marcan porque `checked` se recalcula con la selección nueva.

¿Y si hubieras mutado con `seleccion.push(id); return seleccion;`? Con el arreglo congelado del test lanza `TypeError`. En el componente, `setSeleccion` recibiría **el mismo** arreglo, React diría "no cambió nada" y la casilla no se marcaría.

## Errores comunes

- **`push` o `splice` sobre el arreglo del estado.** Mutas y devuelves la misma referencia: la interfaz no se actualiza (o se actualiza tarde, con el siguiente render por otra causa).
- **`checked` sin `onChange`.** React avisa que el input es de solo lectura y no puedes marcarlo.
- **Usar `defaultChecked` y leer el DOM.** Funciona, pero el estado de React y lo que se ve pueden desincronizarse.
- **Usar `indexOf(id) > 0`** para saber si está. Falla con el primer elemento (índice 0). Usa `includes` o `!== -1`.
- **Olvidar asociar el texto con la casilla.** Sin `<label>`, un lector de pantalla anuncia "casilla, no marcada" sin decir de qué.

## Otra forma de resolverlo

Con un **`Set`** como selección:

```jsx
export function alternarEnSet(seleccion, id) {
  const copia = new Set(seleccion);
  if (copia.has(id)) copia.delete(id);
  else copia.add(id);
  return copia;
}

// En el componente:
const [seleccion, setSeleccion] = useState(() => new Set());
// checked={seleccion.has(opcion)}
// texto: [...seleccion].join(", ")
```

**¿Cuándo conviene?** Con selecciones grandes (cientos o miles de filas): `has` es instantáneo, mientras que `includes` recorre el arreglo. Ojo: hay que **copiar** el `Set` antes de cambiarlo (`new Set(seleccion)`), porque `add` y `delete` lo mutan. Para listas cortas, el arreglo es más simple y se convierte a JSON sin problemas.

## Cómo explicarlo en la entrevista

> "Separé la lógica en una función pura `alternar`: si el elemento está, uso `filter` para devolver un arreglo sin él; si no, spread para devolver uno nuevo con él al final. Nunca muto porque React compara referencias: si devuelvo el mismo arreglo, no re-renderiza. En el componente, las casillas son controladas con `checked` derivado del estado y actualizo con la forma funcional de `setSeleccion`. El input va dentro del `<label>` para que sea accesible y se pueda marcar haciendo clic en el texto."

## Conceptos

- **Inmutabilidad en arreglos**: `filter`, `map` y spread crean copias; `push` y `splice` mutan.
- **`includes`**: dice si un valor está en el arreglo.
- **Checkbox controlado**: `checked` + `onChange`.
- **Actualización funcional**: `setEstado((actual) => ...)`.
- **`<label>` envolvente**: asocia el texto con el input sin `htmlFor`.
- **`<fieldset>` y `<legend>`**: agrupan controles relacionados con un título.
- **`Set`**: alternativa para selecciones grandes, copiándolo antes de modificarlo.
