## Idea clave

El voto pasa por estados: **listo para votar → enviando → votado** (o, si falla, **error → listo otra vez**). Guardas tres datos: el voto confirmado, si se está enviando y el error. Los botones se bloquean mientras se envía y después del éxito, y el voto **solo se marca cuando el servidor lo confirma**.

## Paso a paso

1. **Tres estados.** `voto` (id o `null`), `enviando` (booleano) y `error` (texto).
2. **Guardia al inicio de `votar`.** Si ya hay voto o se está enviando, `return`. Es una segunda barrera además del `disabled`.
3. **Antes de llamar al servidor:** `setEnviando(true)` (bloquea los botones) y `setError("")` (borra el error anterior).
4. **`try`:** `await onVotar(id)`. Si la promesa se resuelve, `setVoto(id)`.
5. **`catch`:** si se rechaza, guarda un mensaje de error para el usuario.
6. **`finally`:** `setEnviando(false)`, salga bien o mal. Así nunca queda bloqueado por un error.
7. **Pintar.** `bloqueado = voto !== null || enviando` se calcula en cada render. El texto del botón depende de si es el votado.

```jsx
import { useState } from "react";

export function Votacion({ cortos, onVotar }) {
  const [voto, setVoto] = useState(null); // id del corto votado, o null
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  async function votar(id) {
    if (voto !== null || enviando) return; // segunda barrera contra el doble envío
    setEnviando(true);
    setError("");
    try {
      await onVotar(id);
      setVoto(id); // solo marcamos el voto cuando el servidor lo confirma
    } catch {
      setError("No se pudo registrar tu voto. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  const bloqueado = voto !== null || enviando;

  return (
    <div>
      {cortos.map((corto) => (
        <button key={corto.id} type="button" disabled={bloqueado} onClick={() => votar(corto.id)}>
          {voto === corto.id ? `✓ Votaste por ${corto.titulo}` : `Votar por ${corto.titulo}`}
        </button>
      ))}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
```

## Por qué funciona

Recorrido con un primer intento que falla y un segundo que sale bien:

| Acción | `voto` | `enviando` | `error` | Se pinta |
|---|---|---|---|---|
| (inicio) | null | false | "" | dos botones "Votar por ..." habilitados |
| Clic en "Bajo la arena" | null | true | "" | botones deshabilitados |
| `onVotar` se rechaza (catch + finally) | null | false | "No se pudo..." | botones habilitados y el alert |
| Clic otra vez | null | true | "" | botones deshabilitados, el alert desaparece |
| `onVotar` se resuelve (try + finally) | 1 | false | "" | "✓ Votaste por Bajo la arena", todo deshabilitado |

El `await` "pausa" la función `votar` hasta que la promesa termine, pero **no** bloquea React: mientras tanto se pinta el estado `enviando = true`. Cuando la promesa termina, la función continúa en el `try` o salta al `catch`, y el `finally` siempre se ejecuta al final.

En los tests, como el resultado llega después, se usa `findByText` / `findByRole`, que esperan (por defecto hasta 1 s) a que el elemento aparezca.

## Errores comunes

- **Marcar el voto antes de que responda el servidor** (`setVoto(id); await onVotar(id)`). Si falla, el usuario ve "✓ Votaste" aunque el voto no se guardó.
- **No deshabilitar mientras se envía.** Un doble clic rápido manda dos votos. Lo reconoces porque `onVotar` se llama dos veces en el test de "mientras se envía".
- **Poner `setEnviando(false)` solo en el `try`.** Si falla, el componente queda bloqueado para siempre. Para eso existe `finally`.
- **No limpiar el error al reintentar.** El mensaje viejo sigue visible aunque el segundo intento salga bien.
- **Creer que esto impide votar dos veces de verdad.** Cualquiera puede llamar a la API sin pasar por tu botón. La regla "un voto por persona" se valida en el servidor; el frontend solo mejora la experiencia.

## Otra forma de resolverlo

Con **un solo estado** que describe la fase, en vez de varios booleanos:

```jsx
const [estado, setEstado] = useState({ fase: "listo", voto: null, error: "" });
// fase: "listo" | "enviando" | "votado"

async function votar(id) {
  if (estado.fase !== "listo") return;
  setEstado({ fase: "enviando", voto: null, error: "" });
  try {
    await onVotar(id);
    setEstado({ fase: "votado", voto: id, error: "" });
  } catch {
    setEstado({ fase: "listo", voto: null, error: "No se pudo registrar tu voto." });
  }
}

const bloqueado = estado.fase !== "listo";
```

**¿Cuándo conviene?** Cuando los estados posibles empiezan a crecer. Con varios booleanos pueden aparecer combinaciones imposibles (por ejemplo, `enviando` y `voto` a la vez); con una sola `fase` eso no puede pasar. En React 19 también existe `useActionState` para formularios con acciones asíncronas.

## Cómo explicarlo en la entrevista

> "Manejo tres datos: el voto confirmado, si se está enviando y el error. Mientras se envía bloqueo los botones para evitar el doble clic, y además pongo una guardia al inicio de la función. Solo marco el voto cuando la promesa se resuelve; si falla, muestro un error accesible con `role='alert'` y dejo reintentar. El `finally` asegura que siempre se libere el estado de envío. Y aclararía que esto es experiencia de usuario: la regla de un voto por persona se valida en el servidor, porque el frontend se puede manipular."

## Conceptos

- **`async / await`** dentro de un manejador de eventos.
- **`try / catch / finally`**: el `finally` corre siempre, haya error o no.
- **Evitar envíos dobles**: deshabilitar + guardia en la función.
- **Actualización confirmada vs. optimista**: marcar el cambio después o antes de que responda el servidor.
- **Estado derivado**: `bloqueado` se calcula de `voto` y `enviando`.
- **`role="alert"`**: el lector de pantalla anuncia el mensaje apenas aparece.
- **`findBy...`** en tests: espera a que aparezca algo asíncrono.
- **Validación en el servidor**: el frontend nunca es la última barrera.
