## Idea clave

El semáforo es una **máquina de estados**: un estado actual (la luz) y una regla que dice cuál viene después y cuándo. Guardas la luz en el estado y un `useEffect` que depende de ella programa **un solo** `setTimeout` hacia la siguiente. Cuando la luz cambia, el efecto vuelve a correr y programa el próximo cambio: así se encadena solo.

## Paso a paso

1. **Datos fuera del componente.** El objeto `LUCES` dice, para cada luz, su `duracion` y la `siguiente`. No cambia nunca, por eso no va en el estado ni dentro del componente.
2. **Estado.** `const [luz, setLuz] = useState("rojo")`.
3. **Efecto que depende de la luz.** Lee la configuración de la luz actual y programa `setTimeout(() => setLuz(siguiente), duracion)`.
4. **Limpieza.** El efecto devuelve `() => clearTimeout(id)`. React la ejecuta antes de volver a correr el efecto y al desmontar el componente.
5. **Pintar.** Un `<p data-testid="luz">` con el nombre de la luz.

```jsx
import { useEffect, useState } from "react";

// Cuánto dura cada luz y cuál viene después.
const LUCES = {
  rojo: { duracion: 3000, siguiente: "verde" },
  verde: { duracion: 2000, siguiente: "amarillo" },
  amarillo: { duracion: 1000, siguiente: "rojo" },
};

export function Semaforo() {
  const [luz, setLuz] = useState("rojo");

  useEffect(() => {
    const { duracion, siguiente } = LUCES[luz];
    const id = setTimeout(() => setLuz(siguiente), duracion);
    return () => clearTimeout(id);
  }, [luz]);

  return <p data-testid="luz">{luz}</p>;
}
```

## Por qué funciona

| Momento | `luz` | Qué hace el efecto | Se pinta |
|---|---|---|---|
| Montaje (0 ms) | rojo | programa "verde" en 3000 ms | rojo |
| 3000 ms | verde | limpia el anterior (ya disparado) y programa "amarillo" en 2000 ms | verde |
| 5000 ms | amarillo | programa "rojo" en 1000 ms | amarillo |
| 6000 ms | rojo | programa "verde" en 3000 ms | rojo |

Cada `setLuz` provoca un render; como `luz` cambió, React ejecuta la limpieza del efecto anterior y vuelve a correr el efecto con la luz nueva. En todo momento hay **un solo** temporizador vivo. Al desmontar, la limpieza lo cancela y no queda ninguno pendiente (eso es lo que revisa el test con `vi.getTimerCount()`).

En los tests se usan **temporizadores falsos** (`vi.useFakeTimers()`): `vi.advanceTimersByTime(3000)` hace como si pasaran 3 segundos al instante, y `act` asegura que React procese el cambio de estado antes de revisar el DOM. Ojo: los tests avanzan el tiempo **fase por fase** (3000, luego 2000...). Si avanzaras 5000 ms de golpe dentro de un solo `act`, el segundo `setTimeout` todavía no existiría, porque el efecto que lo programa corre recién cuando React termina de procesar el cambio a verde.

## Errores comunes

- **Usar `setInterval` con un tiempo fijo.** Las luces duran distinto, así que un intervalo de 1 s obliga a llevar un contador extra. Un `setTimeout` por luz es más simple.
- **Olvidar `[luz]` en las dependencias** (o poner `[]`). El efecto corre una sola vez: pasa a verde y se queda ahí para siempre. Lo reconoces porque falla el test de amarillo.
- **No limpiar el timeout.** Si el componente se desmonta, el temporizador sigue y llama a `setLuz` sobre un componente que ya no existe. Falla el test de "no deja temporizadores".
- **Meter la lógica en un `switch` gigante** dentro del efecto. Funciona, pero agregar una luz (por ejemplo, "intermitente") obliga a tocar la lógica. Con el objeto `LUCES`, solo cambias datos.
- **Definir `LUCES` dentro del componente.** Se crea un objeto nuevo en cada render; aquí no rompe nada, pero no tiene sentido recrear datos fijos.

## Otra forma de resolverlo

Con un **arreglo de fases** y un índice, útil si el orden es una secuencia fija:

```jsx
const FASES = [
  { luz: "rojo", duracion: 3000 },
  { luz: "verde", duracion: 2000 },
  { luz: "amarillo", duracion: 1000 },
];

export function Semaforo() {
  const [indice, setIndice] = useState(0);
  const fase = FASES[indice];

  useEffect(() => {
    const id = setTimeout(() => setIndice((i) => (i + 1) % FASES.length), fase.duracion);
    return () => clearTimeout(id);
  }, [indice, fase.duracion]);

  return <p data-testid="luz">{fase.luz}</p>;
}
```

**¿Cuándo conviene?** Cuando las fases siempre van en el mismo orden circular. El objeto con `siguiente` es más flexible si algún día una luz puede saltar a distintas siguientes (por ejemplo, un botón de peatón).

## Cómo explicarlo en la entrevista

> "Lo modelé como una máquina de estados: guardo solo la luz actual, y un objeto de configuración dice cuánto dura cada luz y cuál sigue. Un `useEffect` que depende de la luz programa un `setTimeout` hacia la siguiente; cuando la luz cambia, el efecto se vuelve a ejecutar y programa el próximo cambio. La limpieza cancela el temporizador para no dejar nada pendiente al desmontar. Si mañana agregan una luz, cambio datos, no lógica."

## Conceptos

- **Máquina de estados**: un estado actual más reglas de transición.
- **`useEffect` con dependencias**: el efecto vuelve a correr cuando cambia algo de la lista.
- **Función de limpieza** del efecto: se ejecuta antes del siguiente efecto y al desmontar.
- **`setTimeout` / `clearTimeout`**: programar y cancelar una acción.
- **Datos fuera del componente**: constantes que no cambian no van en el estado.
- **Temporizadores falsos** en tests: `vi.useFakeTimers()` y `vi.advanceTimersByTime()` con `act`.
