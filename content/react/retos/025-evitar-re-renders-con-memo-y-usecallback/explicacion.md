## Idea clave

Cuando un componente cambia de estado, React vuelve a ejecutarlo **a él y a todos sus hijos**. `memo` hace que un hijo se salte ese render si sus props son **iguales** (`===`) a las del render anterior. Pero una función creada dentro del padre es **nueva en cada render**, así que la prop `onBorrar` nunca es igual. `useCallback` conserva la misma función entre renders, y entonces `memo` sí funciona. Se necesitan los dos.

## Paso a paso

1. **Envuelve `Fila` con `memo`.** `memo(function Fila(...) {...})` devuelve un componente que, antes de renderizar, compara cada prop nueva con la anterior usando `Object.is` (casi lo mismo que `===`).
2. **Mira las props de `Fila`:** `texto` es un string (`"a" === "a"` es `true`) y `onBorrar` es una función. Las funciones se comparan por referencia: dos funciones con el mismo código pero creadas en renders distintos **no** son iguales.
3. **Estabiliza `borrar` con `useCallback`.** `useCallback(fn, [])` devuelve la misma función mientras las dependencias no cambien. Con `[]`, siempre la misma.
4. **Usa la actualización funcional** `setItems((anteriores) => ...)`. Así `borrar` no necesita leer `items` y no hace falta ponerlo en las dependencias (si lo pusieras, la función cambiaría cada vez que cambia la lista).

```jsx
import { memo, useCallback, useState } from "react";

// Cuenta cuántas veces se ejecuta Fila. Solo sirve para medir (y para los tests).
export let rendersHijo = 0;

// memo: si las props son las mismas que en el render anterior, React se salta este componente.
export const Fila = memo(function Fila({ texto, onBorrar }) {
  rendersHijo++;
  return (
    <li>
      {texto}{" "}
      <button type="button" onClick={() => onBorrar(texto)}>
        Borrar
      </button>
    </li>
  );
});

export function Padre() {
  const [clics, setClics] = useState(0);
  const [items, setItems] = useState(["a", "b"]);

  // useCallback: la MISMA función en cada render (no depende de nada que cambie).
  const borrar = useCallback((texto) => {
    setItems((anteriores) => anteriores.filter((item) => item !== texto));
  }, []);

  return (
    <div>
      <button type="button" onClick={() => setClics((c) => c + 1)}>
        Clics: {clics}
      </button>
      <ul>
        {items.map((item) => (
          <Fila key={item} texto={item} onBorrar={borrar} />
        ))}
      </ul>
    </div>
  );
}
```

## Por qué funciona

Al hacer clic en "Clics: 0", `Padre` se vuelve a ejecutar. Para cada `Fila`, React compara props:

| Versión | `texto` igual | `onBorrar` igual | ¿Fila se renderiza? |
|---|---|---|---|
| Sin nada | sí | no (función nueva) | sí, siempre (sin `memo` ni compara) |
| Solo `memo` | sí | **no** (función nueva) | sí |
| Solo `useCallback` | sí | sí | sí (sin `memo`, no compara) |
| `memo` + `useCallback` | sí | sí | **no** |

Al borrar "a": `items` pasa a `["b"]`. La fila "a" se desmonta. La fila "b" recibe el mismo `texto` y el mismo `borrar`, así que `memo` la salta.

Un detalle de JavaScript: `rendersHijo` se exporta con `let`. Los imports de módulos ES son **vínculos vivos**: el test que hace `import { rendersHijo }` siempre lee el valor actual, aunque `Fila` lo cambie después.

## Errores comunes

- **Poner `memo` y olvidar `useCallback`.** Es el error más típico: "le puse memo y sigue renderizando". La prop función cambia en cada render. Lo mismo pasa con objetos o arreglos literales como props (`estilo={{ color: "red" }}`).
- **`useCallback` sin `memo` en el hijo.** No sirve de nada: el hijo se renderiza igual porque no compara props.
- **Dependencias mal puestas.** `useCallback(() => setItems(items.filter(...)), [])` usa un `items` viejo (closure) y borra mal. Si pones `[items]`, funciona pero la función cambia cada vez que cambia la lista. La forma funcional del setter resuelve los dos problemas.
- **Optimizar todo por si acaso.** `memo` y `useCallback` también cuestan (comparar props, guardar funciones). Úsalos cuando hay un problema medido: listas largas, componentes caros o hijos que se renderizan muchas veces.
- **Pensar que re-renderizar es un error.** Un render no siempre toca el DOM: React compara y solo cambia lo necesario. Optimizar es para casos donde el render en sí es costoso.

## Otra forma de resolverlo

**Mover el estado que cambia hacia abajo**, para que no afecte a la lista:

```jsx
function Contador() {
  const [clics, setClics] = useState(0);
  return <button onClick={() => setClics((c) => c + 1)}>Clics: {clics}</button>;
}

export function Padre() {
  const [items, setItems] = useState(["a", "b"]);
  // ...
  return (
    <div>
      <Contador />
      <ul>{/* filas */}</ul>
    </div>
  );
}
```

Ahora el clic solo vuelve a renderizar `Contador`; `Padre` y las filas ni se enteran. No hace falta `memo`.

**¿Cuándo conviene?** Siempre que puedas: separar el estado en el componente que lo usa es más simple que memorizar. `memo` + `useCallback` se usa cuando el estado tiene que vivir arriba. Además, el **React Compiler** (React 19) puede aplicar estas memorizaciones automáticamente, así que en proyectos que lo usan cada vez se escriben menos a mano.

## Cómo explicarlo en la entrevista

> "Cuando el padre cambia de estado, React vuelve a renderizar a todos sus hijos. `memo` hace que un hijo se salte el render si sus props no cambiaron, pero compara por referencia, y una función creada dentro del padre es nueva en cada render. Por eso envuelvo el callback en `useCallback` y uso la actualización funcional del setter, así no depende del estado y la referencia nunca cambia. Igual aclararía que no lo haría en todos lados: primero intento bajar el estado al componente que lo usa, y solo memorizo cuando hay un problema de rendimiento medido, o dejo que lo haga el React Compiler."

## Conceptos

- **Re-render en cascada**: si el padre se renderiza, sus hijos también.
- **`memo`**: salta el render de un componente si sus props son iguales.
- **Igualdad por referencia**: funciones, objetos y arreglos se comparan por su dirección en memoria, no por su contenido.
- **`useCallback(fn, deps)`**: devuelve la misma función mientras no cambien las dependencias.
- **Actualización funcional del setter** para no depender del estado en un callback.
- **Closure viejo** (*stale closure*): una función que recuerda valores de un render anterior.
- **Bajar el estado** como alternativa a memorizar.
- **React Compiler**: memoriza automáticamente en tiempo de compilación.
- **Vínculos vivos** de los `import` en módulos ES.
