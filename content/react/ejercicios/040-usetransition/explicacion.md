## Idea clave

`useTransition` te da una función para marcar un `setState` como **no urgente** y un booleano `pendiente` que dice si React todavía lo está preparando. React dibuja ese cambio en segundo plano, puede interrumpirlo si llega algo más urgente (un clic, una tecla) y mientras tanto mantiene visible la pantalla anterior.

## Paso a paso

1. **Estado de la pestaña**: `useState("menu")`.
2. **El hook**: `const [pendiente, iniciarTransicion] = useTransition()`. Fíjate que el booleano va **primero**.
3. **Cambia dentro de la transición**: `iniciarTransicion(() => setPestana(valor))`. Todo `setState` dentro de esa función queda marcado como transición.
4. **Indicador**: mientras `pendiente` sea `true`, muestra "Cambiando…"; si no, "Viendo: " + la pestaña.
5. **Botones desde un arreglo** `PESTANAS`, con `aria-pressed` para indicar el activo. Separar el valor interno (`"menu"`) del texto visible (`"Menú"`) evita problemas con tildes y permite traducir la interfaz sin tocar la lógica.

```jsx
import { useState, useTransition } from "react";

const PESTANAS = [
  { valor: "menu", texto: "Menú" },
  { valor: "pedidos", texto: "Pedidos" },
];

export function Pestanas() {
  const [pestana, setPestana] = useState("menu");
  // pendiente: true mientras React prepara la transición en segundo plano.
  const [pendiente, iniciarTransicion] = useTransition();

  function cambiar(valor) {
    // Lo que va aquí adentro se marca como NO urgente.
    iniciarTransicion(() => setPestana(valor));
  }

  return (
    <div>
      {PESTANAS.map((p) => (
        <button key={p.valor} aria-pressed={pestana === p.valor} onClick={() => cambiar(p.valor)}>
          {p.texto}
        </button>
      ))}
      <p>{pendiente ? "Cambiando…" : `Viendo: ${pestana}`}</p>
    </div>
  );
}
```

## Por qué funciona

| Momento | `pestana` | `pendiente` | Se pinta |
|---|---|---|---|
| Primer render | `"menu"` | `false` | Viendo: menu |
| Clic en Pedidos: render urgente | `"menu"` (todavía) | `true` | Cambiando… |
| Render de la transición (segundo plano) | `"pedidos"` | `false` | Viendo: pedidos |

Al llamar `iniciarTransicion`, React hace **dos** cosas: primero un render urgente donde solo cambia `pendiente` a `true` (la pestaña sigue siendo la vieja), y después, con baja prioridad, el render con `pestana = "pedidos"` y `pendiente = false`. Si ese segundo render es pesado y el usuario hace clic en "Menú" mientras tanto, React descarta el trabajo a medias y atiende el nuevo clic.

Con este contenido tan liviano, el "Cambiando…" dura menos de lo que se ve a simple vista. La diferencia se nota cuando el contenido de la pestaña tarda en renderizar (por ejemplo, una tabla de 5000 pedidos): sin transición, el botón no responde hasta que termina; con transición, la interfaz sigue viva.

## Errores comunes

- **Invertir el orden**: `const [iniciarTransicion, pendiente] = useTransition()`. El primero es el booleano. Lo reconoces por "iniciarTransicion is not a function".
- **Envolver algo que no es un setState**, como un `fetch` sin `await` adentro. La transición solo marca las actualizaciones de estado que ocurren dentro. (En React 19 sí puedes pasarle una función `async`; el `pendiente` dura hasta que termine.)
- **Usar transiciones para inputs de texto.** El valor de un input controlado debe actualizarse de forma **urgente**; si lo metes en una transición, el input se siente atrasado. Para eso se combina un estado urgente con uno en transición, o se usa `useDeferredValue`.
- **Ocultar todo el contenido mientras `pendiente`.** La gracia de las transiciones es mantener la pantalla anterior visible; mejor un indicador discreto (atenuar, un spinner pequeño).
- **Olvidar `aria-pressed`** en los botones. Funciona, pero un lector de pantalla no sabe cuál está activo.

## Otra forma de resolverlo

Con la función **`startTransition`** importada directamente de React, cuando no necesitas el `pendiente` (por ejemplo, fuera de un componente):

```jsx
import { startTransition, useState } from "react";

export function Pestanas() {
  const [pestana, setPestana] = useState("menu");
  const cambiar = (valor) => startTransition(() => setPestana(valor));
  return (
    <div>
      <button aria-pressed={pestana === "menu"} onClick={() => cambiar("menu")}>Menú</button>
      <button aria-pressed={pestana === "pedidos"} onClick={() => cambiar("pedidos")}>Pedidos</button>
      <p>Viendo: {pestana}</p>
    </div>
  );
}
```

**¿Cuándo conviene?** Cuando no te interesa mostrar un indicador de carga, o cuando el cambio se dispara desde código que no es un componente (una librería de rutas, por ejemplo). Si quieres mostrar "Cambiando…", necesitas el hook `useTransition`.

## Cómo explicarlo en la entrevista

> "`useTransition` me deja marcar una actualización de estado como no urgente. Envuelvo el `setPestana` en `iniciarTransicion`; React primero hace un render rápido donde `pendiente` es `true` y sigue mostrando la pestaña anterior, y luego prepara la nueva en segundo plano, de forma interrumpible. Así, si el contenido es pesado, los clics siguen respondiendo. Uso `pendiente` para dar feedback, sin ocultar la pantalla actual. No lo usaría para el valor de un input, que debe ser urgente."

## Conceptos

- **Transición**: actualización de estado marcada como no urgente e interrumpible.
- **`useTransition()`**: devuelve `[pendiente, iniciarTransicion]`.
- **`startTransition`**: la misma idea sin el booleano.
- **Renderizado concurrente**: React puede preparar varias versiones de la interfaz y priorizar.
- **Urgente vs no urgente**: escribir y hacer clic es urgente; cambiar de vista puede esperar.
- **`aria-pressed`**: indica el botón activo en un grupo.
- **Separar valor interno y texto visible**: datos estables y textos traducibles.
