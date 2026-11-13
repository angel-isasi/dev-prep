## Idea clave

`useDeferredValue(texto)` devuelve una **copia atrasada** de `texto`. Cuando escribes, React primero hace un render **urgente** con el input actualizado y la copia vieja (la lista memorizada no se toca), y después, en segundo plano, un render con la copia nueva. Si escribes otra tecla antes de que termine, React abandona ese trabajo y empieza de nuevo: el input nunca se traba.

## Paso a paso

1. **Estado del input**: `useState("")`, input controlado con `aria-label="Buscar"`.
2. **Copia diferida**: `const textoDiferido = useDeferredValue(texto)`.
3. **La lista recibe la copia diferida**, no `texto`. El input recibe `texto`.
4. **`ListaPesada` envuelta en `memo`**. Esto es imprescindible: en el render urgente `textoDiferido` todavía tiene el valor viejo, y `memo` le dice a React "si las props son iguales, no vuelvas a renderizar esta lista". Sin `memo`, la lista se renderizaría igual en el render urgente y no ganarías nada.
5. **Filtro**: normaliza con `trim()` y `toLowerCase()`, y usa `includes`. Si no hay coincidencias, "Sin resultados".
6. **Indicador opcional**: si `texto !== textoDiferido`, la lista está atrasada; bajar la opacidad le avisa al usuario que se está actualizando.

```jsx
import { memo, useDeferredValue, useState } from "react";

// memo: si `texto` e `items` no cambiaron, React reutiliza el render anterior.
export const ListaPesada = memo(function ListaPesada({ texto, items }) {
  const buscado = texto.trim().toLowerCase();
  const visibles = items.filter((item) => item.toLowerCase().includes(buscado));

  if (visibles.length === 0) return <p>Sin resultados</p>;
  return (
    <ul>
      {visibles.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
});

export function BuscadorFluido({ items }) {
  const [texto, setTexto] = useState("");

  // Copia "atrasada" de texto: React la actualiza cuando no hay nada urgente.
  const textoDiferido = useDeferredValue(texto);
  const desactualizado = texto !== textoDiferido;

  return (
    <div>
      <input aria-label="Buscar" value={texto} onChange={(e) => setTexto(e.target.value)} />
      <div style={{ opacity: desactualizado ? 0.5 : 1 }}>
        <ListaPesada texto={textoDiferido} items={items} />
      </div>
    </div>
  );
}
```

## Por qué funciona

Al escribir "mar" (tecla por tecla):

| Render | `texto` | `textoDiferido` | Input | Lista |
|---|---|---|---|---|
| Inicial | `""` | `""` | vacío | las 3 pizzas |
| Urgente tras "m" | `"m"` | `""` (viejo) | m | igual (memo se la salta), semitransparente |
| En segundo plano | `"m"` | `"m"` | m | margarita, marinara |
| Urgente tras "ma" | `"ma"` | `"m"` | ma | igual, semitransparente |
| ... | | | | |
| Final | `"mar"` | `"mar"` | mar | margarita, marinara |

El render en segundo plano es **interrumpible**: si llega otra tecla mientras React está dibujando la lista para "ma", la deja a medias y atiende primero el input. Por eso, con listas muy grandes, el input se siente instantáneo y la lista "alcanza" al usuario cuando deja de escribir.

En los tests (y con listas chicas) todo pasa tan rápido que casi no se nota; por eso la prueba usa `waitFor`, que espera a que la lista se ponga al día.

## Errores comunes

- **No envolver la lista en `memo`.** Es el error más común: `useDeferredValue` funciona, pero la lista se renderiza igual en cada render urgente y el input se sigue trabando. Lo reconoces porque falla el test de `memo`.
- **Pasarle `texto` a la lista** en lugar de `textoDiferido`. La lista se actualiza con cada tecla, de forma urgente, y el hook no sirve de nada.
- **Pasarle `textoDiferido` al input.** El input se atrasa respecto a lo que escribes: justo lo contrario de lo que querías.
- **Crear `items` nuevo en cada render del padre** (por ejemplo, `items={datos.filter(...)}` sin `useMemo`). `memo` compara por referencia: un arreglo nuevo siempre es "distinto" y la lista se vuelve a renderizar.
- **Confundirlo con debounce.** Un debounce espera un tiempo fijo (por ejemplo 300 ms) aunque la computadora sea rápida. `useDeferredValue` no espera: actualiza apenas puede y se adapta a la velocidad del dispositivo. Para **pedir datos a un servidor**, un debounce sigue siendo útil para no hacer una petición por tecla.

## Otra forma de resolverlo

Con **`useTransition`**, marcando como no urgente la actualización de un segundo estado:

```jsx
import { useState, useTransition } from "react";

export function BuscadorFluido({ items }) {
  const [texto, setTexto] = useState("");
  const [filtro, setFiltro] = useState("");
  const [pendiente, iniciarTransicion] = useTransition();

  function cambiar(e) {
    setTexto(e.target.value); // urgente: el input
    iniciarTransicion(() => setFiltro(e.target.value)); // puede esperar: la lista
  }

  return (
    <div>
      <input aria-label="Buscar" value={texto} onChange={cambiar} />
      <div style={{ opacity: pendiente ? 0.5 : 1 }}>
        <ListaPesada texto={filtro} items={items} />
      </div>
    </div>
  );
}
```

**¿Cuándo conviene cada uno?** `useTransition` se usa cuando **tú controlas el setState** que quieres marcar como no urgente. `useDeferredValue` sirve cuando solo **recibes un valor** (por ejemplo, una prop que viene del padre) y no tienes acceso a su setter. Aquí `useDeferredValue` es más corto porque no necesita un segundo estado.

## Cómo explicarlo en la entrevista

> "Uso `useDeferredValue` para separar lo urgente de lo que puede esperar. El input usa el texto normal y la lista recibe una copia diferida. Cuando escribes, React hace primero un render rápido con el input actualizado y la lista vieja, y luego, en segundo plano e interrumpible, actualiza la lista. Es clave envolver la lista en `memo`; si no, se renderiza igual en el render urgente. Mientras el texto y su copia difieren, bajo la opacidad para indicar que se está actualizando."

## Conceptos

- **Renderizado concurrente**: React puede preparar renders en segundo plano e interrumpirlos.
- **`useDeferredValue(valor)`**: devuelve una copia de `valor` que se actualiza con baja prioridad.
- **Actualización urgente vs no urgente**: escribir es urgente; mostrar resultados puede esperar.
- **`memo`**: evita volver a renderizar un componente si sus props no cambiaron.
- **Comparación por referencia**: `memo` compara props con `Object.is`.
- **Debounce vs valor diferido**: tiempo fijo vs "en cuanto se pueda".
- **`useTransition`**: la alternativa cuando controlas el setState.
