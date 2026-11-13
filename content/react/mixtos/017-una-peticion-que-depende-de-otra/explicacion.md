## Idea clave

Cuando una petición **depende** del resultado de otra, se encadenan con `await`, una después de la otra. Como el efecto no puede ser `async`, defines una **función `async` dentro** del efecto y la llamas. Un solo `try/catch` cubre las dos peticiones.

## Paso a paso

1. **Estado** `texto`, que empieza en `"Cargando…"`. Como la interfaz es un solo párrafo, basta con un texto.
2. **Función async interna** `cargar()` dentro del efecto.
3. **Primer `await`**: `const usuario = await api.usuario()`. La función se "pausa" aquí hasta que llega el usuario.
4. **Segundo `await`**: `api.pedidosDe(usuario.id)`. Solo se ejecuta cuando ya tienes el `id`.
5. **`try/catch`**: si **cualquiera** de los `await` lanza, el control salta al `catch`, y lo que sigue al `await` que falló no se ejecuta. Por eso, si falla el usuario, nunca se llama a `pedidosDe`.
6. **Bandera `vigente`**: se revisa antes de cada `setTexto` y se pone en `false` en la limpieza.

```jsx
import { useEffect, useState } from "react";

export function MisPedidos({ api }) {
  const [texto, setTexto] = useState("Cargando…");

  useEffect(() => {
    let vigente = true;

    async function cargar() {
      try {
        const usuario = await api.usuario();
        const pedidos = await api.pedidosDe(usuario.id);
        if (vigente) setTexto(`${usuario.nombre} tiene ${pedidos.length} pedidos`);
      } catch {
        if (vigente) setTexto("No pudimos cargar tus pedidos");
      }
    }

    cargar();
    return () => {
      vigente = false;
    };
  }, [api]);

  return <p>{texto}</p>;
}
```

## Por qué funciona

Recorrido con el ejemplo:

| Paso | Qué pasa | `texto` |
|---|---|---|
| render 1 | se pinta el estado inicial | `Cargando…` |
| efecto | se llama a `cargar()`, que llega al primer `await` y se pausa | |
| llega el usuario | `usuario = { id: 7, nombre: "Angel" }`, se llama a `pedidosDe(7)` y se pausa | |
| llegan los pedidos | `pedidos = [1, 2]`, `setTexto(...)` | `Angel tiene 2 pedidos` |

Si `api.usuario()` se rechaza en el segundo paso, `await` lanza el error ahí mismo, se salta la línea de `pedidosDe` y entra al `catch`: `No pudimos cargar tus pedidos`.

¿Por qué no `useEffect(async () => {...})`? Una función `async` **siempre devuelve una promesa**. React espera que el efecto devuelva una función de limpieza o nada; si recibe una promesa, la ignora como limpieza y muestra una advertencia. Con la función interna, el efecto devuelve tu limpieza normal.

## Errores comunes

- **`useEffect(async () => ...)`.** Advertencia de React y pierdes la limpieza.
- **Olvidar el `await` en el primer paso.** `usuario` sería una promesa, `usuario.id` sería `undefined` y pedirías los pedidos de `undefined`.
- **Usar `Promise.all` aquí.** No puedes: no tienes el `id` hasta que llega el usuario.
- **Un `try/catch` por cada `await` con el mismo mensaje.** Repites código: un solo bloque cubre los dos.
- **Olvidar `vigente`.** Si el usuario cambia de pantalla mientras carga, el efecto intentaría actualizar un componente desmontado o, si `api` cambia, una respuesta vieja pisaría a la nueva.

## Otra forma de resolverlo

Encadenando con `.then`, sin `async/await`:

```jsx
useEffect(() => {
  let vigente = true;
  api
    .usuario()
    .then((usuario) =>
      api.pedidosDe(usuario.id).then((pedidos) => {
        if (vigente) setTexto(`${usuario.nombre} tiene ${pedidos.length} pedidos`);
      })
    )
    .catch(() => {
      if (vigente) setTexto("No pudimos cargar tus pedidos");
    });
  return () => {
    vigente = false;
  };
}, [api]);
```

**¿Cuándo conviene?** Es útil entenderla porque es lo que `async/await` hace "por debajo". Fíjate que el segundo `.then` va **anidado** para seguir teniendo acceso a `usuario`: con muchos pasos esto se vuelve difícil de leer. Para pasos encadenados, `async/await` es más claro.

## Cómo explicarlo en la entrevista

> "Como la segunda petición necesita el id del usuario, no puedo hacerlas en paralelo: las encadeno con `await`. Un efecto no puede ser `async` porque debe devolver una función de limpieza, no una promesa, así que defino una función async dentro y la llamo. Un solo `try/catch` cubre ambas peticiones: si falla la primera, ni siquiera llamo a la segunda. Y con una bandera `vigente` en la limpieza evito actualizar el estado si el componente se desmontó."

## Conceptos

- **Peticiones encadenadas**: la segunda usa un dato de la primera.
- **`async/await`**: escribir código asíncrono como si fuera secuencial.
- **Función async dentro de `useEffect`**: el efecto no puede ser `async` directamente.
- **`try/catch` con `await`**: un `await` rechazado lanza el error en esa línea.
- **Secuencial vs paralelo**: con dependencia se espera; sin dependencia, `Promise.all`.
- **Bandera `vigente`**: proteger el estado de respuestas tardías.
