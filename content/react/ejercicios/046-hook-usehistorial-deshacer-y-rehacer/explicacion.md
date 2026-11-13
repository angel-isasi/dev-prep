## Idea clave

El historial son **tres partes**: `pasado` (lista), `presente` (valor) y `futuro` (lista). Deshacer y rehacer solo **mueven valores** entre ellas, y fijar algo nuevo vacía el futuro. Como las tres cambian siempre juntas, viven en **un solo estado**, actualizado de forma inmutable con la forma funcional del setter.

## Paso a paso

1. **Un solo estado** `{ pasado: [], presente: inicial, futuro: [] }`. Si usaras tres `useState`, tendrías que actualizarlos a la vez y es fácil dejarlos inconsistentes.
2. **`fijar(nuevo)`**: el presente se agrega al final del pasado, `nuevo` pasa a ser el presente y el futuro queda vacío.
3. **`deshacer()`**: si el pasado está vacío, devuelve `h` tal cual (React no re-renderiza si el estado es el mismo objeto). Si no:
   - `pasado.slice(0, -1)`: todo menos el último.
   - `pasado.at(-1)`: el último, que pasa a ser el presente.
   - `[h.presente, ...h.futuro]`: el presente actual va **al inicio** del futuro (es lo primero que se rehará).
4. **`rehacer()`**: el espejo. El presente va al final del pasado y el primero del futuro pasa a ser el presente.
5. **Forma funcional** `setHistorial((h) => ...)` en todos, para que dos llamadas seguidas se encadenen.
6. **Derivados**: `puedeDeshacer` y `puedeRehacer` se calculan del largo de las listas; no se guardan.

```jsx
import { useState } from "react";

export function useHistorial(inicial) {
  // Las tres partes cambian juntas, por eso van en un solo estado.
  const [historial, setHistorial] = useState({ pasado: [], presente: inicial, futuro: [] });

  const fijar = (nuevo) =>
    setHistorial((h) => ({
      pasado: [...h.pasado, h.presente], // el presente pasa al pasado
      presente: nuevo,
      futuro: [], // un cambio nuevo borra lo que se podía rehacer
    }));

  const deshacer = () =>
    setHistorial((h) => {
      if (h.pasado.length === 0) return h; // nada que deshacer
      return {
        pasado: h.pasado.slice(0, -1), // todo menos el último
        presente: h.pasado.at(-1), // el último del pasado
        futuro: [h.presente, ...h.futuro], // el presente va al inicio del futuro
      };
    });

  const rehacer = () =>
    setHistorial((h) => {
      if (h.futuro.length === 0) return h; // nada que rehacer
      return {
        pasado: [...h.pasado, h.presente],
        presente: h.futuro[0],
        futuro: h.futuro.slice(1),
      };
    });

  return {
    valor: historial.presente,
    fijar,
    deshacer,
    rehacer,
    puedeDeshacer: historial.pasado.length > 0,
    puedeRehacer: historial.futuro.length > 0,
  };
}
```

## Por qué funciona

| Acción | `pasado` | `presente` | `futuro` |
|---|---|---|---|
| Inicio | `[]` | margarita | `[]` |
| `fijar("pepperoni")` | `[margarita]` | pepperoni | `[]` |
| `fijar("hawaiana")` | `[margarita, pepperoni]` | hawaiana | `[]` |
| `deshacer()` | `[margarita]` | pepperoni | `[hawaiana]` |
| `rehacer()` | `[margarita, pepperoni]` | hawaiana | `[]` |
| `deshacer()` | `[margarita]` | pepperoni | `[hawaiana]` |
| `fijar("vegana")` | `[margarita, pepperoni]` | vegana | `[]` (hawaiana se perdió) |

El pasado funciona como una **pila**: lo último que entra es lo primero que sale al deshacer. El futuro también es una pila, pero se apila por el inicio. Cada operación crea arreglos nuevos (`slice`, spread), nunca usa `push` ni `pop`, que modificarían el estado actual.

Dos `deshacer()` seguidos funcionan porque cada uno recibe en `h` el resultado del anterior: el primero va de 3 a 2, el segundo de 2 a 1.

## Errores comunes

- **Tres `useState` separados.** Un `deshacer` tendría que llamar a tres setters, y con la forma funcional cada uno ve solo su parte: es fácil mezclar valores de distintos momentos.
- **Usar `push`/`pop` sobre el estado.** `h.pasado.pop()` modifica el arreglo actual: React puede no detectar el cambio y el "historial viejo" queda roto.
- **Olvidar vaciar el futuro en `fijar`.** Después de deshacer y fijar algo nuevo, rehacer traería un valor de otra "línea de tiempo". Falla el test "fijar algo nuevo borra el futuro".
- **No proteger los extremos.** Deshacer con el pasado vacío pondría `undefined` como presente (`[].at(-1)` es `undefined`). Falla "sin historial no hace nada".
- **Usar el valor del render** (`historial.pasado`) en vez de la forma funcional. Dos `deshacer()` en el mismo evento leerían el mismo historial y solo retrocederían uno.

## Otra forma de resolverlo

Con **`useReducer`**, que encaja muy bien porque son tres acciones sobre un estado con varias partes:

```jsx
import { useReducer } from "react";

function reducer(h, accion) {
  switch (accion.tipo) {
    case "fijar":
      return { pasado: [...h.pasado, h.presente], presente: accion.valor, futuro: [] };
    case "deshacer":
      if (!h.pasado.length) return h;
      return { pasado: h.pasado.slice(0, -1), presente: h.pasado.at(-1), futuro: [h.presente, ...h.futuro] };
    case "rehacer":
      if (!h.futuro.length) return h;
      return { pasado: [...h.pasado, h.presente], presente: h.futuro[0], futuro: h.futuro.slice(1) };
    default:
      throw new Error(`Acción desconocida: ${accion.tipo}`);
  }
}

export function useHistorial(inicial) {
  const [h, despachar] = useReducer(reducer, { pasado: [], presente: inicial, futuro: [] });
  return {
    valor: h.presente,
    fijar: (valor) => despachar({ tipo: "fijar", valor }),
    deshacer: () => despachar({ tipo: "deshacer" }),
    rehacer: () => despachar({ tipo: "rehacer" }),
    puedeDeshacer: h.pasado.length > 0,
    puedeRehacer: h.futuro.length > 0,
  };
}
```

**¿Cuándo conviene?** Cuando quieres probar la lógica sin React (el reducer es una función pura) o agregar más acciones (limpiar historial, limitar a 50 pasos). Ambas versiones son correctas; en entrevista, mencionar que esto "pide a gritos un reducer" suma puntos.

## Cómo explicarlo en la entrevista

> "Modelo el historial con tres partes: pasado, presente y futuro, en un solo estado porque siempre cambian juntas. Fijar mueve el presente al pasado y vacía el futuro; deshacer saca el último del pasado y manda el presente al inicio del futuro; rehacer hace lo contrario. Todo es inmutable, con `slice` y spread, y uso la forma funcional del setter para que varias llamadas seguidas se encadenen. Si no hay a dónde ir, devuelvo el mismo estado. `puedeDeshacer` y `puedeRehacer` los derivo del largo de las listas."

## Conceptos

- **Pasado, presente, futuro**: modelo clásico de deshacer y rehacer.
- **Pila** (LIFO): lo último que entra es lo primero que sale.
- **Estado agrupado**: partes que cambian juntas van en un solo objeto.
- **Inmutabilidad**: `slice`, spread y `at` en vez de `push`/`pop`.
- **`Array.prototype.at(-1)`**: el último elemento.
- **Forma funcional del setter**: encadena actualizaciones seguidas.
- **Estado derivado**: `puedeDeshacer` se calcula, no se guarda.
- **`useReducer`**: alternativa natural cuando hay varias acciones.
