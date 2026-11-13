## Idea clave

Un hook personalizado es una función que **reutiliza hooks**. Aquí es un `useState` con dos añadidos: **leer** `localStorage` una sola vez al montar (inicialización perezosa) y **escribir** en `localStorage` cada vez que el valor cambia (un `useEffect`).

## Paso a paso

1. **Firma igual a `useState`.** El hook recibe `(clave, inicial)` y devuelve `[valor, setValor]`, así quien lo use no tiene que aprender nada nuevo.
2. **Inicialización perezosa.** Si escribieras `useState(leerDeLocalStorage())`, esa lectura se haría en **cada** render aunque React solo use el resultado la primera vez. Pasando una **función**, `useState(() => ...)`, React la llama solo en el primer render.
3. **Leer con cuidado.** `localStorage.getItem` devuelve `null` si no existe la clave. Si existe, es un **texto**, por eso `JSON.parse` lo convierte de vuelta a arreglo, objeto o número. Si el texto está corrupto, `JSON.parse` lanza un error: el `try/catch` lo atrapa y usamos `inicial`.
4. **Guardar en un efecto.** `useEffect(() => localStorage.setItem(clave, JSON.stringify(valor)), [clave, valor])`. Guardar es un **efecto secundario** (algo fuera de React), por eso va en `useEffect` y no en el cuerpo del componente.
5. **Devolver el setter de `useState`.** Como es el original, ya acepta tanto un valor como una función `(prev) => ...`.

```jsx
import { useEffect, useState } from "react";

export function useLocalStorage(clave, inicial) {
  // Inicialización perezosa: la función solo se ejecuta en el primer render.
  const [valor, setValor] = useState(() => {
    try {
      const guardado = localStorage.getItem(clave);
      return guardado !== null ? JSON.parse(guardado) : inicial;
    } catch {
      // JSON corrupto o localStorage no disponible
      return inicial;
    }
  });

  // Cada vez que cambia el valor (o la clave), lo guardamos.
  useEffect(() => {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
    } catch {
      // Modo privado o almacenamiento lleno: seguimos funcionando en memoria.
    }
  }, [clave, valor]);

  return [valor, setValor];
}
```

## Por qué funciona

Recorrido del test de "sobrevive a desmontar":

| Momento | Qué pasa | `valor` | `localStorage["favoritos"]` |
|---|---|---|---|
| 1.er montaje | `getItem` da `null`, se usa `inicial` | `[]` | (vacío) |
| después del render | el efecto guarda | `[]` | `"[]"` |
| `setValor(["Drama"])` | React re-renderiza | `["Drama"]` | `"[]"` |
| después del render | el efecto se repite porque cambió `valor` | `["Drama"]` | `'["Drama"]'` |
| desmontar y volver a montar | la función perezosa lee y hace `JSON.parse` | `["Drama"]` | `'["Drama"]'` |

Fíjate en que el efecto corre **después** de pintar: primero se ve el valor nuevo y luego se guarda. Para el usuario es instantáneo.

## Errores comunes

- **Guardar sin `JSON.stringify`.** `localStorage.setItem("x", ["Drama"])` guarda el texto `"Drama"` (o `"[object Object]"` con objetos). Al leerlo no recuperas lo mismo. `localStorage` solo guarda textos.
- **Leer en cada render** con `useState(JSON.parse(localStorage.getItem(clave)))`. Funciona, pero lee y parsea en cada render. La versión con función es la correcta.
- **No proteger `JSON.parse`.** Si alguien (o una versión vieja de tu app) dejó un valor inválido, toda la página se cae con un `SyntaxError`. Lo reconoces porque falla el test del "JSON válido".
- **Olvidar `clave` en las dependencias** del efecto. Si la clave cambia, guardarías el valor en la clave vieja.
- **Usarlo en el servidor** (Next.js). En el servidor no existe `localStorage`; ahí hay que leerlo solo en el cliente, dentro de un efecto.

## Otra forma de resolverlo

Guardar directamente dentro del setter, en vez de usar un efecto:

```jsx
export function useLocalStorage(clave, inicial) {
  const [valor, setValorInterno] = useState(() => {
    try {
      const guardado = localStorage.getItem(clave);
      return guardado !== null ? JSON.parse(guardado) : inicial;
    } catch {
      return inicial;
    }
  });

  function setValor(nuevo) {
    setValorInterno((anterior) => {
      const final = typeof nuevo === "function" ? nuevo(anterior) : nuevo;
      localStorage.setItem(clave, JSON.stringify(final));
      return final;
    });
  }

  return [valor, setValor];
}
```

**¿Cuándo conviene?** Guarda en el mismo momento del cambio, sin esperar al efecto, y no escribe nada al montar. A cambio, el setter tiene que replicar la lógica de "valor o función" y no es una función pura (React podría llamarla dos veces en modo estricto). La versión con `useEffect` es más simple y la más esperada en entrevista. Si además quisieras sincronizar varias pestañas abiertas, escucharías el evento `storage` de `window`.

## Cómo explicarlo en la entrevista

> "Es un `useState` con persistencia. Leo `localStorage` una sola vez con la inicialización perezosa, pasando una función a `useState`, para no leer en cada render. Como `localStorage` solo guarda textos, uso `JSON.stringify` al guardar y `JSON.parse` al leer, envuelto en `try/catch` por si el dato está corrupto o el navegador no deja usar el almacenamiento. Guardo en un `useEffect` que depende de la clave y el valor. Devuelvo la misma forma que `useState`, así se usa sin aprender nada nuevo."

## Conceptos

- **Hook personalizado**: función que empieza con `use` y combina otros hooks.
- **Inicialización perezosa**: `useState(() => calculo())` ejecuta el cálculo solo en el primer render.
- **`useEffect` con dependencias**: corre después del render cuando cambia algo de la lista.
- **`localStorage`**: almacenamiento del navegador de clave y texto, que persiste entre recargas.
- **`JSON.stringify` / `JSON.parse`**: convierten entre valores de JavaScript y texto.
- **`try/catch`**: atrapa errores para que la app no se caiga.
- **Setter funcional**: `setValor((prev) => ...)` calcula a partir del valor anterior.
