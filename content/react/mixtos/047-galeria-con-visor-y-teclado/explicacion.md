## Idea clave

El estado es solo el **índice** de la foto abierta (o `null`). El teclado se escucha en `document` con un `useEffect` que se suscribe **solo mientras el visor está abierto** y se limpia al cerrarlo. El módulo `%` hace que la galería dé la vuelta.

## Paso a paso

1. **Estado**: `abierta` es un número (0, 1, 2...) o `null`. De ahí sale `visorAbierto = abierta !== null`.
2. **Botones**: un `Ver {foto}` por foto, que llama a `setAbierta(i)`.
3. **Visor**: si `visorAbierto`, un `<div role="dialog">` con `aria-label` "Foto n de total". Ojo, `n` es `abierta + 1` porque el índice empieza en 0.
4. **Efecto del teclado**:
   - Si el visor está cerrado, `return` sin suscribirse.
   - Un objeto `teclas` asocia cada tecla con una acción. `teclas[evento.key]?.()` ejecuta la acción si existe; con cualquier otra tecla, `?.` evita el error.
   - `addEventListener` al entrar y `removeEventListener` en la limpieza, con **la misma** función `manejar`.
5. **Dar la vuelta con `%`**:
   - Siguiente: `(i + 1) % total`. Con 3 fotos: 0 a 1, 1 a 2, 2 a **0**.
   - Anterior: `(i - 1 + total) % total`. Sumamos `total` porque en JavaScript `-1 % 3` es `-1`, no `2`.
6. **Dependencias `[visorAbierto, fotos.length]`**: el efecto **no** depende de `abierta`. Como las flechas usan la forma con función (`setAbierta((i) => ...)`), React les pasa el índice actual y no hace falta leerlo desde el efecto. Así no nos desuscribimos y volvemos a suscribir con cada flecha: solo al abrir y al cerrar.

```jsx
import { useEffect, useState } from "react";

export function Galeria({ fotos }) {
  const [abierta, setAbierta] = useState(null);
  const visorAbierto = abierta !== null;

  useEffect(() => {
    if (!visorAbierto) return;

    const teclas = {
      Escape: () => setAbierta(null),
      ArrowRight: () => setAbierta((i) => (i + 1) % fotos.length),
      ArrowLeft: () => setAbierta((i) => (i - 1 + fotos.length) % fotos.length),
    };

    const manejar = (evento) => teclas[evento.key]?.();
    document.addEventListener("keydown", manejar);
    return () => document.removeEventListener("keydown", manejar);
  }, [visorAbierto, fotos.length]);

  return (
    <div>
      {fotos.map((foto, i) => (
        <button key={foto} onClick={() => setAbierta(i)}>
          Ver {foto}
        </button>
      ))}

      {visorAbierto && (
        <div role="dialog" aria-label={`Foto ${abierta + 1} de ${fotos.length}`}>
          <p>{fotos[abierta]}</p>
          <button onClick={() => setAbierta(null)}>Cerrar</button>
        </div>
      )}
    </div>
  );
}
```

## Por qué funciona

Recorrido con `fotos = ["horno", "masa", "local"]`:

| Acción | `abierta` | `visorAbierto` | ¿Qué pasa con el listener? | Visor |
|---|---|---|---|---|
| (inicio) | null | false | El efecto sale sin suscribirse | (cerrado) |
| Clic "Ver horno" | 0 | true | `visorAbierto` cambió: se suscribe | Foto 1 de 3 |
| ArrowLeft | (0 - 1 + 3) % 3 = 2 | true | Nada: las dependencias no cambiaron | Foto 3 de 3 |
| ArrowRight | (2 + 1) % 3 = 0 | true | Nada | Foto 1 de 3 |
| ArrowRight | 1 | true | Nada | Foto 2 de 3 |
| Escape | null | false | Limpieza: se quita el listener | (cerrado) |

Después de Escape, una flecha no hace nada porque **ya no hay listener**. Y si el componente se desmonta con el visor abierto, React también ejecuta la limpieza.

¿Por qué hay que pasar la misma función a `removeEventListener`? El navegador identifica el listener por referencia. Si escribieras `removeEventListener("keydown", (e) => ...)` con una flecha nueva, sería otra función y no quitaría nada.

## Errores comunes

- **Olvidar la limpieza**: cada vez que abres el visor se agrega un listener más. Lo reconoces porque una flecha avanza dos o tres fotos de golpe.
- **Leer `abierta` dentro del manejador sin ponerla en las dependencias** (`setAbierta(abierta + 1)` con `[visorAbierto]`): el manejador se queda con el valor del momento en que se creó (closure viejo) y la flecha siempre lleva a la misma foto.
- **Poner `abierta` en las dependencias "para que funcione"**: funciona, pero te desuscribes y resuscribes con cada flecha. Con la actualización por función no hace falta.
- **`(i - 1) % total` sin sumar `total`**: desde la primera foto da `-1`, `fotos[-1]` es `undefined` y el visor queda vacío.
- **Escuchar `onKeyDown` en el `<div>` del visor**: solo funciona si ese div tiene el foco. Con `document` funciona siempre.

## Otra forma de resolverlo

Con un `switch` y dependiendo de `abierta`:

```jsx
useEffect(() => {
  if (abierta === null) return;
  function manejar(evento) {
    switch (evento.key) {
      case "Escape":
        setAbierta(null);
        break;
      case "ArrowRight":
        setAbierta((abierta + 1) % fotos.length);
        break;
      case "ArrowLeft":
        setAbierta((abierta - 1 + fotos.length) % fotos.length);
        break;
    }
  }
  document.addEventListener("keydown", manejar);
  return () => document.removeEventListener("keydown", manejar);
}, [abierta, fotos.length]);
```

**¿Cuándo conviene?** Es más directa de leer para quien recién empieza y es correcta porque `abierta` está en las dependencias. El costo es que el listener se quita y se vuelve a poner en cada cambio de foto; en una galería eso no se nota. La versión principal es más fina: entiende que la actualización por función elimina la necesidad de leer el estado dentro del efecto.

## Cómo explicarlo en la entrevista

> "Guardo solo el índice de la foto abierta, o null si está cerrado. Las teclas las escucho en `document` con un `useEffect` que solo se suscribe cuando el visor está abierto, y en la limpieza quito el mismo listener, así no se acumulan. Mapeo las teclas en un objeto en vez de varios if, y para dar la vuelta uso el módulo: al ir atrás sumo el total antes, porque en JavaScript el módulo de un negativo es negativo. Como actualizo con la forma de función, el efecto no necesita depender del índice y no se vuelve a suscribir con cada flecha."

## Conceptos

- **`useEffect` con limpieza**: suscribirse a eventos externos y desuscribirse.
- **`addEventListener` / `removeEventListener`**: necesitan la misma referencia de función.
- **Efecto condicional**: salir temprano del efecto si no aplica.
- **Actualización con función** `setX((anterior) => ...)`: evita closures viejos y dependencias extra.
- **Módulo `%`** para índices circulares, y el caso de los negativos.
- **Objeto de acciones** + encadenamiento opcional `?.()`.
- **`role="dialog"` y `aria-label`**: accesibilidad del visor.
- **Closure viejo** (stale closure): una función que recuerda valores de un render anterior.
