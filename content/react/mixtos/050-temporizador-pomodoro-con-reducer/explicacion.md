## Idea clave

Toda la lógica del Pomodoro vive en un **reducer puro**: qué pasa con un tic, con pausar o con reiniciar. El `useEffect` tiene un solo trabajo: **mientras esté corriendo**, despachar `{ tipo: "tic" }` cada segundo. Separar "las reglas" de "el reloj" hace el código fácil de probar y evita los bugs típicos de `setInterval`.

## Paso a paso

1. **`crearInicial`**: arma el estado a partir de las duraciones y las guarda en `duraciones`, para que el reducer sepa a cuánto volver al cambiar de modo o al reiniciar.
2. **El reducer**:
   - `alternar`: `{ ...estado, corriendo: !estado.corriendo }`.
   - `tic`: si queda más de 1 segundo, resta. Si quedaba 1, en vez de mostrar `00:00` cambia de modo y carga la duración del nuevo modo con `estado.duraciones[modo]`.
   - `reiniciar`: `crearInicial(estado.duraciones)`, que deja todo detenido en modo trabajo.
   - `default`: `throw`, para descubrir enseguida una acción mal escrita.
3. **`useReducer(pomodoro, { trabajo, descanso }, crearInicial)`**: con tres argumentos, React llama a `crearInicial({ trabajo, descanso })` **una sola vez** para obtener el estado inicial.
4. **El efecto depende solo de `estado.corriendo`**:
   - Si no corre, sale sin hacer nada.
   - Si corre, crea un `setInterval` que despacha `tic` y lo limpia en el `return`.
   - Al pausar, `corriendo` pasa a `false`: React ejecuta la limpieza (`clearInterval`) y el nuevo efecto no crea otro intervalo.
5. **¿Por qué no hay closure viejo?** El intervalo nunca lee `estado.restante`; solo despacha una acción. El reducer siempre recibe el estado **actual**. Y `despachar` es estable, así que no hace falta ponerlo en las dependencias.
6. **Formato mm:ss**: `Math.floor(restante / 60)` son los minutos, `restante % 60` los segundos, y `padStart(2, "0")` convierte `5` en `"05"`.
7. **`role="timer"`**: le dice a las tecnologías de asistencia que ese texto es un temporizador.

```jsx
import { useEffect, useReducer } from "react";

export function crearInicial({ trabajo, descanso }) {
  return { modo: "trabajo", restante: trabajo, corriendo: false, duraciones: { trabajo, descanso } };
}

export function pomodoro(estado, accion) {
  switch (accion.tipo) {
    case "alternar":
      return { ...estado, corriendo: !estado.corriendo };
    case "tic": {
      if (estado.restante > 1) return { ...estado, restante: estado.restante - 1 };
      const modo = estado.modo === "trabajo" ? "descanso" : "trabajo";
      return { ...estado, modo, restante: estado.duraciones[modo] };
    }
    case "reiniciar":
      return crearInicial(estado.duraciones);
    default:
      throw new Error(`Acción desconocida: ${accion.tipo}`);
  }
}

const dosDigitos = (numero) => String(numero).padStart(2, "0");

export function Pomodoro({ trabajo = 25 * 60, descanso = 5 * 60 }) {
  const [estado, despachar] = useReducer(pomodoro, { trabajo, descanso }, crearInicial);

  useEffect(() => {
    if (!estado.corriendo) return;
    const id = setInterval(() => despachar({ tipo: "tic" }), 1000);
    return () => clearInterval(id);
  }, [estado.corriendo]);

  const minutos = Math.floor(estado.restante / 60);
  const segundos = estado.restante % 60;

  return (
    <div>
      <p>{estado.modo === "trabajo" ? "A trabajar" : "Descanso"}</p>
      <p role="timer">
        {dosDigitos(minutos)}:{dosDigitos(segundos)}
      </p>
      <button onClick={() => despachar({ tipo: "alternar" })}>
        {estado.corriendo ? "Pausar" : "Iniciar"}
      </button>
      <button onClick={() => despachar({ tipo: "reiniciar" })}>Reiniciar</button>
    </div>
  );
}
```

## Por qué funciona

Recorrido con `trabajo = 3` y `descanso = 2`:

| Tiempo | Evento | `modo` | `restante` | `corriendo` | Intervalo |
|---|---|---|---|---|---|
| 0 s | (inicio) | trabajo | 3 | false | ninguno |
| 0 s | Iniciar (`alternar`) | trabajo | 3 | true | se crea |
| 1 s | tic (3 > 1) | trabajo | 2 | true | sigue |
| 2 s | tic (2 > 1) | trabajo | 1 | true | sigue |
| 3 s | tic (era 1: cambia) | descanso | 2 | true | sigue |
| 3 s | Pausar (`alternar`) | descanso | 2 | false | se limpia |
| 8 s | (nada) | descanso | 2 | false | ninguno |
| 8 s | Reiniciar | trabajo | 3 | false | ninguno |

Con los valores por defecto, `restante` es `1500`: `Math.floor(1500 / 60)` = 25 y `1500 % 60` = 0, y se ve `25:00`.

Fíjate que el reducer se prueba **sin** esperar ni un segundo: le pasas un estado con `restante: 1` y compruebas que cambia de modo. Esa es la ventaja de que sea puro.

## Errores comunes

- **`setRestante(restante - 1)` dentro de `setInterval` con un efecto de dependencias `[]`**: el intervalo recuerda el `restante` del primer render (closure viejo) y el reloj se queda pegado en un número. Con el reducer este error desaparece.
- **No limpiar el intervalo**: cada vez que pausas y reanudas se crea uno nuevo sin borrar el anterior, y el reloj empieza a ir al doble o al triple de velocidad.
- **Poner `estado` (o `estado.restante`) en las dependencias**: el intervalo se destruye y se vuelve a crear cada segundo. Funciona "más o menos", pero es un desperdicio y puede desfasar el tiempo.
- **Mutar en el reducer** (`estado.restante--; return estado`): misma referencia, React no re-renderiza y el reloj no se mueve en pantalla.
- **Olvidar `padStart`**: se ve `0:5` en vez de `00:05`.

## Otra forma de resolverlo

Con `useState` y la forma de actualización con función, sin reducer:

```jsx
export function Pomodoro({ trabajo = 25 * 60, descanso = 5 * 60 }) {
  const [modo, setModo] = useState("trabajo");
  const [restante, setRestante] = useState(trabajo);
  const [corriendo, setCorriendo] = useState(false);

  useEffect(() => {
    if (!corriendo) return;
    const id = setInterval(() => {
      setRestante((r) => {
        if (r > 1) return r - 1;
        // Problema: aquí también hay que cambiar el modo...
        return r;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [corriendo]);
  // ...
}
```

**¿Cuándo conviene?** Para un contador simple (solo restar), `useState` con función es suficiente. Pero aquí un tic puede cambiar **dos** cosas a la vez (`modo` y `restante`), y hacerlo con estados separados obliga a llamar a un `setModo` dentro del actualizador de otro estado, que debe ser puro. En cuanto varias piezas de estado cambian juntas según reglas, `useReducer` es la herramienta correcta.

## Cómo explicarlo en la entrevista

> "Separé las reglas del reloj. Las reglas están en un reducer puro: alternar invierte si corre, tic resta un segundo o cambia de modo cuando se acaba, y reiniciar vuelve al estado inicial con las mismas duraciones. Lo puedo probar sin timers. El componente usa `useReducer` con una función inicializadora, y un `useEffect` que depende solo de si está corriendo: crea un `setInterval` que despacha 'tic' y lo limpia al pausar o desmontar. Como el intervalo no lee el estado, solo despacha, no tengo el problema del closure viejo."

## Conceptos

- **`useReducer`** con función inicializadora (tercer argumento).
- **Reducer puro**: reglas de negocio sin efectos, fáciles de probar.
- **`useEffect` + `setInterval` + `clearInterval`**: un intervalo que vive solo mientras hace falta.
- **Closure viejo** (stale closure) y cómo `despachar` lo evita.
- **Estabilidad de `despachar`**: React garantiza que no cambia entre renders.
- **Formato de tiempo**: `Math.floor`, `%` y `padStart`.
- **`role="timer"`**: semántica accesible para un temporizador.
- **Fake timers en tests**: `vi.useFakeTimers` y `advanceTimersByTime` dentro de `act`.
