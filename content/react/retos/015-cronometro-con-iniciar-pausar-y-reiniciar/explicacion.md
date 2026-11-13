## Idea clave

El intervalo es un **efecto** que debe existir solo mientras el cronómetro corre. Un `useEffect` que depende de `corriendo` lo crea cuando pasa a `true` y su **función de limpieza** lo destruye al pausar o al desmontar. Dentro del intervalo se usa la **actualización funcional** para no quedarse con un valor viejo.

## Paso a paso

1. **Estado.** `ms` (milisegundos acumulados, empieza en 0) y `corriendo` (booleano). Guardamos milisegundos enteros y no segundos con decimales porque `0.1 + 0.2` en JavaScript da `0.30000000000000004`.
2. **Mostrar.** `(ms / 1000).toFixed(1)` convierte 1500 en `"1.5"`. Es un cálculo al pintar, no otro estado.
3. **El efecto del intervalo.** `useEffect(() => { ... }, [corriendo])`:
   - Si `corriendo` es `false`, sale sin hacer nada.
   - Si es `true`, crea `setInterval(() => setMs((m) => m + 100), 100)`.
   - Devuelve `() => clearInterval(id)`. React llama a esa limpieza **antes** de volver a ejecutar el efecto (cuando `corriendo` cambia) y al desmontar.
4. **Botón Iniciar/Pausar.** `setCorriendo((c) => !c)`. El texto se decide con un ternario.
5. **Reiniciar.** Pone `corriendo` en `false` (la limpieza borra el intervalo) y `ms` en 0.

```jsx
import { useEffect, useState } from "react";

export function Cronometro() {
  const [ms, setMs] = useState(0);
  const [corriendo, setCorriendo] = useState(false);

  // El intervalo existe SOLO mientras `corriendo` es true.
  useEffect(() => {
    if (!corriendo) return;
    const id = setInterval(() => {
      setMs((anterior) => anterior + 100); // forma funcional: siempre el valor más reciente
    }, 100);
    return () => clearInterval(id); // al pausar o al desmontar
  }, [corriendo]);

  function reiniciar() {
    setCorriendo(false);
    setMs(0);
  }

  return (
    <div>
      <p>{(ms / 1000).toFixed(1)} s</p>
      <button onClick={() => setCorriendo((c) => !c)}>{corriendo ? "Pausar" : "Iniciar"}</button>
      <button onClick={reiniciar}>Reiniciar</button>
    </div>
  );
}
```

## Por qué funciona

| Acción | `corriendo` | Qué hace el efecto | `ms` | Se pinta |
|---|---|---|---|---|
| (al inicio) | `false` | nada | 0 | 0.0 s · Iniciar |
| clic en Iniciar | `true` | crea el intervalo | 0 | 0.0 s · Pausar |
| pasan 1500 ms | `true` | el intervalo llamó 15 veces a `setMs` | 1500 | 1.5 s · Pausar |
| clic en Pausar | `false` | la limpieza borra el intervalo | 1500 | 1.5 s · Iniciar |
| pasa 1 s | `false` | no hay intervalo | 1500 | 1.5 s |
| clic en Iniciar | `true` | crea un intervalo nuevo | 1500 | sigue sumando desde 1500 |

**¿Por qué la forma funcional?** La función que le pasas a `setInterval` se crea una vez, en el render donde `corriendo` pasó a `true`, y "recuerda" (closure) las variables de **ese** render. Si escribieras `setMs(ms + 100)`, `ms` sería siempre el valor de ese momento (por ejemplo 0) y el cronómetro se quedaría en `0.1 s`. Con `setMs((m) => m + 100)`, React te pasa el valor actual en cada llamada.

## Errores comunes

- **`setMs(ms + 100)` dentro del intervalo.** El cronómetro se queda pegado en `0.1 s` (closure obsoleta). Usa la forma funcional.
- **No devolver la limpieza.** Al pausar, el intervalo sigue vivo y al iniciar otra vez se crea un segundo: el tiempo empieza a correr al doble. Lo reconoces porque el test de "pausar" falla.
- **Crear el intervalo en el cuerpo del componente o en el `onClick` sin guardarlo.** Cada render (o cada clic) crea uno nuevo y no hay forma de borrarlo.
- **Poner `ms` en las dependencias del efecto.** El intervalo se destruiría y recrearía cada 100 ms. Funciona a medias, pero es justo lo que la forma funcional evita.
- **Guardar segundos con decimales** (`s + 0.1`). Después de unas vueltas verás `0.30000000000000004`. Guarda enteros y divide al mostrar.

## Otra forma de resolverlo

Sin `useEffect`, guardando el id del intervalo en un **`useRef`** y creándolo/borrándolo desde los clics:

```jsx
import { useRef, useState } from "react";

export function Cronometro() {
  const [ms, setMs] = useState(0);
  const [corriendo, setCorriendo] = useState(false);
  const intervalo = useRef(null);

  function iniciar() {
    intervalo.current = setInterval(() => setMs((m) => m + 100), 100);
    setCorriendo(true);
  }

  function pausar() {
    clearInterval(intervalo.current);
    setCorriendo(false);
  }

  function reiniciar() {
    pausar();
    setMs(0);
  }

  // Faltaría limpiar al desmontar: useEffect(() => () => clearInterval(intervalo.current), []);
  // ...
}
```

`useRef` guarda un valor que **sobrevive entre renders pero no causa un render** al cambiar: perfecto para un id de temporizador. **¿Cuándo conviene?** Cuando la acción nace de un evento concreto (un clic) y quieres el control explícito. La versión con efecto es más declarativa ("si corre, hay intervalo") y no se olvida la limpieza al desmontar. Para máxima precisión, en vez de sumar 100, guardarías la hora de inicio y calcularías `Date.now() - inicio`, porque los intervalos del navegador se atrasan.

## Cómo explicarlo en la entrevista

> "Guardo los milisegundos y si está corriendo. El intervalo vive en un `useEffect` que depende de `corriendo`: lo crea al iniciar y su función de limpieza lo borra al pausar o al desmontar, así no quedan temporizadores sueltos. Dentro uso `setMs(m => m + 100)` porque el callback del intervalo tiene un closure con el valor de cuando se creó; con la forma funcional siempre parto del valor actual. Guardo milisegundos enteros para evitar errores de decimales y formateo con `toFixed(1)` al mostrar."

## Conceptos

- **`useEffect` con limpieza**: la función que devuelves se ejecuta antes del siguiente efecto y al desmontar.
- **`setInterval` / `clearInterval`**: repetir algo cada cierto tiempo y detenerlo.
- **Closure obsoleta (stale closure)**: una función que recuerda valores de un render viejo.
- **Actualización funcional**: `setX((anterior) => ...)` siempre recibe el valor más reciente.
- **`useRef`**: caja mutable que persiste entre renders sin provocar re-render.
- **`toFixed(1)`**: formatea con un decimal.
- **Precisión de flotantes**: mejor guardar enteros (ms) y dividir al mostrar.
