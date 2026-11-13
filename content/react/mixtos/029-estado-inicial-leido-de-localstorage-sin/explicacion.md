## Idea clave

`JSON.parse` **lanza un error** con datos que no son JSON. Si lo llamas sin protección al iniciar el estado, el componente revienta y la app queda en blanco. Por eso la lectura va dentro de un `try/catch` con un valor de respaldo, y se hace **una sola vez** con la inicialización perezosa de `useState`.

## Paso a paso

1. **`leerGuardado(clave, respaldo)`**:
   - `localStorage.getItem(clave)` devuelve el texto guardado, o `null` si la clave no existe.
   - Si es `null`, devuelve el `respaldo`. Ojo: no se puede pasar `null` a `JSON.parse` esperando el respaldo; `JSON.parse(null)` da `null`, no tu valor por defecto.
   - Si hay texto, `JSON.parse(crudo)` lo convierte. Si está corrupto, lanza un `SyntaxError` que cae en el `catch` y devuelves el `respaldo`.
2. **Inicialización perezosa.** `useState(() => leerGuardado(...))` recibe una **función**. React la ejecuta solo en el primer render. Si escribieras `useState(leerGuardado(...))`, la lectura y el parseo se harían en **cada** render (React ignora el resultado después del primero, pero el trabajo se hace igual).
3. **Guardar con un efecto.** `useEffect(() => { localStorage.setItem("tema", JSON.stringify(tema)); }, [tema])` se ejecuta después del primer render y cada vez que `tema` cambia. `localStorage` es un efecto secundario (escribe fuera de React), por eso va en `useEffect` y no en el cuerpo del componente.
4. **Alternar.** El botón hace `setTema(tema === "claro" ? "oscuro" : "claro")`.

```jsx
import { useEffect, useState } from "react";

export function leerGuardado(clave, respaldo) {
  try {
    const crudo = localStorage.getItem(clave);
    return crudo === null ? respaldo : JSON.parse(crudo);
  } catch {
    return respaldo;
  }
}

export function Preferencias() {
  const [tema, setTema] = useState(() => leerGuardado("tema", "claro"));

  useEffect(() => {
    localStorage.setItem("tema", JSON.stringify(tema));
  }, [tema]);

  return (
    <button onClick={() => setTema(tema === "claro" ? "oscuro" : "claro")}>
      Tema: {tema}
    </button>
  );
}
```

## Por qué funciona

Recorrido con `localStorage["tema"] = "{roto"`:

1. **Primer render.** `useState` ejecuta la función: `getItem` da `"{roto"`, `JSON.parse("{roto")` lanza `SyntaxError`, el `catch` devuelve `"claro"`. El botón dice "Tema: claro".
2. **Después del render**, corre el efecto: guarda `JSON.stringify("claro")`, que es `'"claro"'`. ¡El dato corrupto quedó reparado solo!
3. **Clic.** `setTema("oscuro")`. React vuelve a renderizar; ahora `useState` **no** vuelve a leer `localStorage`, simplemente devuelve `"oscuro"`.
4. Como `tema` cambió, el efecto corre de nuevo: guarda `'"oscuro"'`.

¿Por qué las comillas? `JSON.stringify("oscuro")` produce el texto `"oscuro"` **con** comillas, porque así se representa un string en JSON. Al leerlo, `JSON.parse('"oscuro"')` devuelve `oscuro` sin comillas. Guardar siempre en JSON te permite usar la misma función para strings, números, objetos o arreglos.

## Errores comunes

- **Llamar `JSON.parse` sin `try/catch`.** Con datos corruptos el componente lanza un error al renderizar y la pantalla queda en blanco. Lo reconoces porque el test de "corrupto" revienta en vez de fallar.
- **`useState(leerGuardado(...))` sin la flecha.** Funciona, pero lee y parsea en cada render. Con un dato grande (una lista de 500 tareas) se nota.
- **Guardar sin `JSON.stringify`** (`setItem("tema", tema)`). Se guarda `oscuro` sin comillas, y al recargar `JSON.parse("oscuro")` lanza error: caes siempre en el respaldo y "pierdes" la preferencia.
- **Guardar dentro del `onClick`** en vez de en el efecto. Funciona para este botón, pero si mañana otro lugar cambia el tema, tendrás que acordarte de guardar ahí también. El efecto sincroniza con `localStorage` venga de donde venga el cambio.
- **Leer `localStorage` dentro de un `useEffect` y luego `setTema`.** Provoca un primer render con el valor por defecto y un "parpadeo" al valor guardado.

## Otra forma de resolverlo

Sacar todo a un **hook reutilizable** `useLocalStorage`:

```jsx
function useLocalStorage(clave, respaldo) {
  const [valor, setValor] = useState(() => leerGuardado(clave, respaldo));

  useEffect(() => {
    localStorage.setItem(clave, JSON.stringify(valor));
  }, [clave, valor]);

  return [valor, setValor];
}

export function Preferencias() {
  const [tema, setTema] = useLocalStorage("tema", "claro");
  return <button onClick={() => setTema(tema === "claro" ? "oscuro" : "claro")}>Tema: {tema}</button>;
}
```

**¿Cuándo conviene?** En cuanto tengas una segunda cosa que persistir (idioma, filtros, carrito). El hook tiene la misma forma que `useState`, así que el componente casi no cambia. Si además `localStorage` pudiera estar lleno o bloqueado (modo privado de algunos navegadores), envolverías también el `setItem` en un `try/catch`.

## Cómo explicarlo en la entrevista

> "Leo el valor inicial con la inicialización perezosa de `useState`, así solo toco `localStorage` en el primer render. La lectura está dentro de un `try/catch`, porque si alguien dejó un valor corrupto `JSON.parse` lanza un error y la app quedaría en blanco; en ese caso uso un valor de respaldo. Para guardar uso un `useEffect` que depende del tema y lo serializa con `JSON.stringify`, así se sincroniza venga de donde venga el cambio. Si lo necesitara en varios lugares, lo convertiría en un hook `useLocalStorage`."

## Conceptos

- **`localStorage`**: almacenamiento del navegador que guarda textos por clave y sobrevive a recargas.
- **`JSON.stringify` / `JSON.parse`**: convierten un valor a texto JSON y de vuelta.
- **`try/catch`**: atrapa errores para que no detengan la app.
- **Inicialización perezosa**: `useState(() => calcular())` ejecuta `calcular` solo en el primer render.
- **`useEffect` con dependencias**: corre después del render y cada vez que cambia algo de la lista.
- **Efecto secundario**: algo que el componente hace fuera de React, como escribir en `localStorage`.
- **Valor de respaldo**: lo que usas cuando el dato no existe o no sirve.
