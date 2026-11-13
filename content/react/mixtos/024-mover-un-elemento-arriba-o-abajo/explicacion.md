## Idea clave

Calcula el destino; si se sale de la lista, devuelve **la misma referencia** (no hay cambio y React se ahorra el render). Si no, copia el arreglo e **intercambia** las dos posiciones con desestructuración.

## Paso a paso

1. **Destino**: `indice + direccion`. Con `direccion = -1` sube, con `+1` baja.
2. **Límites**: si `destino < 0` (subir el primero) o `destino >= lista.length` (bajar el último), `return lista`.
3. **Copia**: `[...lista]` crea un arreglo nuevo con los mismos elementos.
4. **Intercambio**: `[copia[indice], copia[destino]] = [copia[destino], copia[indice]]`. A la derecha se arma un arreglo temporal con los dos valores en orden inverso; a la izquierda se desestructura en las dos posiciones. No hace falta una variable auxiliar.
5. **Componente**: estado `pasos` y una función `moverPaso` que usa la forma funcional de `setPasos`.
6. **Botones deshabilitados** en los extremos: el usuario ve que no puede moverlos y además nunca se dispara un movimiento inútil.

```jsx
import { useState } from "react";

export function mover(lista, indice, direccion) {
  const destino = indice + direccion;
  if (destino < 0 || destino >= lista.length) return lista;

  const copia = [...lista];
  [copia[indice], copia[destino]] = [copia[destino], copia[indice]];
  return copia;
}

export function ListaPasos({ pasosIniciales }) {
  const [pasos, setPasos] = useState(pasosIniciales);

  function moverPaso(indice, direccion) {
    setPasos((actuales) => mover(actuales, indice, direccion));
  }

  return (
    <ol>
      {pasos.map((paso, indice) => (
        <li key={paso}>
          <span>{paso}</span>
          <button aria-label={`Subir ${paso}`} disabled={indice === 0} onClick={() => moverPaso(indice, -1)}>
            Subir
          </button>
          <button
            aria-label={`Bajar ${paso}`}
            disabled={indice === pasos.length - 1}
            onClick={() => moverPaso(indice, 1)}
          >
            Bajar
          </button>
        </li>
      ))}
    </ol>
  );
}
```

## Por qué funciona

`mover(["masa", "salsa", "queso"], 2, -1)`:

| Paso | Valor |
|---|---|
| `destino` | `2 + (-1) = 1`, está dentro de la lista |
| `copia` | `["masa", "salsa", "queso"]` (arreglo nuevo) |
| lado derecho | `[copia[1], copia[2]]` = `["salsa", "queso"]` |
| asignación | `copia[2] = "salsa"` y `copia[1] = "queso"` |
| resultado | `["masa", "queso", "salsa"]` |

`mover(pasos, 0, -1)`: `destino = -1`, fuera de la lista, devuelve `pasos` (la **misma** referencia). Si esto llegara a `setPasos`, React compara con `Object.is`, ve que es el mismo arreglo y **no re-renderiza**. Si en cambio devolvieras `[...lista]` sin cambios, sería otra referencia y React haría un render inútil.

En el componente, la `key` es el texto del paso (no el índice). Así, cuando "queso" sube, React sabe que es **el mismo** `<li>` que se movió, en vez de pensar que cambiaron los textos de dos `<li>`.

## Errores comunes

- **Intercambiar sobre la lista original** (`lista[i] = ...`). Mutas las props o el estado: con la lista congelada lanza `TypeError`, y en React la pantalla puede no actualizarse.
- **Intercambio sin auxiliar a mano**: `copia[indice] = copia[destino]; copia[destino] = copia[indice];`. La segunda línea copia el valor que ya pisaste: terminas con dos elementos iguales.
- **No revisar los límites.** `copia[-1]` es `undefined`: aparece un elemento vacío y otro se pierde.
- **Devolver siempre una copia**, incluso sin cambios. No es un bug visible, pero provoca renders innecesarios y el test de "misma referencia" falla.
- **Usar el índice como `key`** en una lista que se reordena. React reutiliza los `<li>` por posición y, si tuvieran estado interno (un input, por ejemplo), quedaría pegado al lugar equivocado.

## Otra forma de resolverlo

Con **`splice`** sobre la copia: sacar el elemento y volver a insertarlo en el destino. Sirve también para mover más de una posición (arrastrar y soltar):

```jsx
export function moverA(lista, desde, hasta) {
  if (hasta < 0 || hasta >= lista.length || desde === hasta) return lista;
  const copia = [...lista];
  const [elemento] = copia.splice(desde, 1); // lo saca
  copia.splice(hasta, 0, elemento);          // lo inserta
  return copia;
}

// mover(lista, i, dir) equivale a moverA(lista, i, i + dir)
```

**¿Cuándo conviene?** Cuando el movimiento puede ser de varias posiciones, como en una lista con arrastrar y soltar. `splice` muta, por eso se usa **sobre la copia**, nunca sobre el original. En navegadores modernos también existe `toSpliced`, que no muta. Para mover de a uno, el intercambio con desestructuración es más corto y claro.

## Cómo explicarlo en la entrevista

> "Calculo el destino sumando la dirección al índice. Si se sale de la lista devuelvo la misma referencia, porque no hay cambio y así React, que compara con `Object.is`, se salta el render. Si está dentro, hago una copia con spread e intercambio las dos posiciones con desestructuración, sin variable auxiliar. Nunca toco la lista original. En el componente actualizo con la forma funcional, deshabilito los botones de los extremos y uso el texto como `key`, no el índice, porque la lista se reordena."

## Conceptos

- **Intercambio con desestructuración**: `[a, b] = [b, a]`.
- **Copia con spread** antes de modificar posiciones.
- **Misma referencia si no hay cambio**: React se salta el render (`Object.is`).
- **Validar límites** de índices antes de acceder.
- **`key` estable en listas reordenables**: nunca el índice.
- **`splice` sobre una copia** (o `toSpliced`) para mover varias posiciones.
- **Botones `disabled`** para acciones que no aplican.
