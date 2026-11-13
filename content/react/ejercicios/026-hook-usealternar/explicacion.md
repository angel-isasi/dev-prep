## Idea clave

Un **hook propio** es una función normal cuyo nombre empieza con `use` y que usa otros hooks por dentro. `useAlternar` envuelve un `useState` booleano y te da una función `alternar` lista para usar, **estable** gracias a `useCallback`.

## Paso a paso

1. **Guarda el booleano** con `useState(inicial)`. El parámetro tiene valor por defecto `false`, así `useAlternar()` funciona sin argumentos.
2. **Crea `alternar`** con la forma funcional del setter: `setValor((v) => !v)`. React te pasa el valor más reciente en `v`, aunque llames a `alternar` dos veces seguidas.
3. **Hazla estable** con `useCallback(fn, [])`. Con dependencias vacías, React devuelve la misma función en todos los renders.
4. **Devuelve un arreglo** `[valor, alternar]`, como `useState`. Con arreglo, quien usa el hook elige los nombres: `const [abierto, alternarMenu] = useAlternar()`.

```jsx
import { useCallback, useState } from "react";

export function useAlternar(inicial = false) {
  const [valor, setValor] = useState(inicial);

  // useCallback con [] crea la función una sola vez.
  // Usa la forma funcional (v) => !v para no depender de `valor`.
  const alternar = useCallback(() => setValor((v) => !v), []);

  return [valor, alternar];
}
```

## Por qué funciona

Cada componente que llama a `useAlternar` tiene **su propio** estado: el hook no comparte nada entre componentes, solo reutiliza la lógica.

| Acción | Estado `valor` | Lo que devuelve el hook |
|---|---|---|
| Primer render con `useAlternar()` | `false` | `[false, alternar]` |
| `alternar()` | `false` pasa a `true` | `[true, alternar]` (misma función) |
| `alternar()` dos veces en el mismo evento | `true`, luego `false` | `[false, alternar]` |

¿Por qué funcionan dos llamadas seguidas? Porque `setValor((v) => !v)` encola una **función**. React las aplica en orden: la primera recibe `false` y devuelve `true`, la segunda recibe `true` y devuelve `false`. Si escribieras `setValor(!valor)`, las dos llamadas leerían el mismo `valor` del render actual y el resultado sería `true`.

¿Y por qué `useCallback` con `[]` no se queda con un valor viejo? Porque la función **no lee `valor`**: solo le pide a React que lo invierta. No hay nada que se pueda quedar desactualizado.

## Errores comunes

- **`setValor(!valor)` en lugar de la forma funcional.** Funciona con un clic, pero falla si alternas dos veces en el mismo evento. Lo reconoces porque falla el test "dos llamadas seguidas".
- **`useCallback(() => setValor(!valor), [])`.** Peor aún: la función se crea una vez y se queda para siempre con el `valor` del primer render (closure viejo). Siempre lo pone en `true`.
- **No usar `useCallback`.** El hook funciona, pero `alternar` es una función nueva en cada render. Si la pasas a un hijo con `memo` o a un `useEffect`, se vuelve a ejecutar sin necesidad. Falla el test de "misma función".
- **Llamar el hook `alternar` en vez de `useAlternar`.** Sin el prefijo `use`, React y su linter no saben que es un hook y no te avisan si lo llamas dentro de un `if`.
- **Devolver un objeto `{ valor, alternar }`.** No está mal en general, pero aquí el enunciado pide arreglo: con objeto, los tests que leen `result.current[0]` fallan.

## Otra forma de resolverlo

Con **`useReducer`**, que ya devuelve un `dispatch` estable sin necesidad de `useCallback`:

```jsx
import { useReducer } from "react";

export function useAlternar(inicial = false) {
  // El reducer ignora la acción: siempre invierte el estado.
  const [valor, alternar] = useReducer((v) => !v, inicial);
  return [valor, alternar];
}
```

**¿Cuándo conviene?** Es más corto y `dispatch` es estable por diseño. El detalle: `alternar` recibe un argumento opcional que se ignora (si haces `onClick={alternar}`, recibe el evento y no pasa nada). En entrevista, la versión con `useState` + `useCallback` es más fácil de explicar; la de `useReducer` es un buen "dato extra" si te preguntan alternativas.

## Cómo explicarlo en la entrevista

> "Un hook propio es una función que empieza con `use` y usa otros hooks. Aquí guardo el booleano con `useState` y expongo `alternar`, que usa la forma funcional del setter para siempre trabajar con el valor más reciente, incluso si se llama dos veces seguidas. La envuelvo en `useCallback` con dependencias vacías para que sea la misma función en cada render; como no lee el estado, no hay riesgo de closure viejo. Devuelvo un arreglo como `useState` para que quien lo use elija los nombres."

## Conceptos

- **Hook propio**: función que empieza con `use` y llama a otros hooks; reutiliza lógica, no estado.
- **`useState`**: guarda un valor entre renders.
- **Forma funcional del setter**: `setX((anterior) => nuevo)`, siempre parte del valor más reciente.
- **`useCallback`**: devuelve la misma función mientras no cambien sus dependencias.
- **Referencia estable**: importante para `memo`, `useEffect` y listas de dependencias.
- **Closure viejo** (stale closure): una función que recuerda un valor de un render anterior.
- **Reglas de los hooks**: solo se llaman en el nivel superior de un componente o de otro hook.
