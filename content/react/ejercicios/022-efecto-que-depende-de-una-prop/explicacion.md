## Idea clave

Pide los datos en un `useEffect` que **depende de la prop** (`[tamano]`), así se repite cuando cambia. Y usa una bandera `vigente` que la **limpieza** del efecto pone en `false`: cuando llega una respuesta de una petición vieja, se ignora.

## Paso a paso

1. **Estado del precio.** `useState(null)`: `null` significa "todavía no llegó", y con eso decides si mostrar `Calculando…` o el precio.
2. **Efecto con dependencias.** `useEffect(..., [tamano, obtenerPrecio])`. Todo lo que usas dentro y viene de props va en el arreglo. Cuando `tamano` cambia, React vuelve a correr el efecto.
3. **Vuelve a "Calculando…".** Al empezar cada petición, `setPrecio(null)`. Sin esto, al cambiar de M a L seguirías viendo el precio de M mientras llega el de L.
4. **Pide el precio.** `obtenerPrecio(tamano).then(...)`. La función devuelve una promesa; con `.then` recibes el número cuando llega.
5. **Bandera `vigente`.** Cada ejecución del efecto crea su propia variable `let vigente = true`. En el `.then` solo actualizas si `vigente` sigue en `true`.
6. **Limpieza.** `return () => { vigente = false; }`. React ejecuta esta función **antes de correr el efecto otra vez** (y al desmontar). Así la petición anterior queda "anulada".
7. **Pinta según el estado.** `` precio === null ? "Calculando…" : `S/ ${precio}` ``.

```jsx
import { useEffect, useState } from "react";

export function PrecioRemoto({ tamano, obtenerPrecio }) {
  // null significa "todavía no llega el precio".
  const [precio, setPrecio] = useState(null);

  useEffect(() => {
    // Cada ejecución del efecto tiene su propia bandera.
    let vigente = true;
    setPrecio(null);

    obtenerPrecio(tamano).then((nuevoPrecio) => {
      // Si el tamaño ya cambió, esta respuesta es vieja: se ignora.
      if (vigente) setPrecio(nuevoPrecio);
    });

    // Limpieza: corre antes del siguiente efecto (o al desmontar).
    return () => {
      vigente = false;
    };
  }, [tamano, obtenerPrecio]);

  return <p>{precio === null ? "Calculando…" : `S/ ${precio}`}</p>;
}
```

## Por qué funciona

El caso difícil: el usuario elige M, cambia a L enseguida, y el servidor responde **L primero y M después**.

| Momento | Qué pasa | `vigente` de M | `vigente` de L | Estado `precio` | Se ve |
|---|---|---|---|---|---|
| Monta con M | Efecto 1: pide M | `true` | | `null` | Calculando… |
| Cambia a L | Limpieza del efecto 1 | **`false`** | | `null` | Calculando… |
| | Efecto 2: pide L | `false` | `true` | `null` | Calculando… |
| Responde L con 36 | `vigente` de L es `true`: `setPrecio(36)` | `false` | `true` | `36` | S/ 36 |
| Responde M con 28 (tarde) | `vigente` de M es `false`: se ignora | `false` | `true` | `36` | S/ 36 |

La clave es que cada ejecución del efecto es una **clausura** (closure) distinta: el `.then` de M recuerda *su* variable `vigente`, no la de L. Cuando React limpia el efecto 1, cambia la variable del efecto 1 y nada más.

Sin la bandera, la respuesta tardía de M haría `setPrecio(28)` y el usuario vería el precio de la pizza mediana con la familiar seleccionada.

## Errores comunes

- **Olvidar `tamano` en las dependencias** (`[]`). El efecto solo corre al montar: al cambiar de tamaño, el precio no se actualiza. Lo reconoces porque falla "vuelve a pedir el precio cuando cambia el tamaño".
- **No manejar respuestas viejas.** Funciona cuando las respuestas llegan en orden, por eso el bug pasa desapercibido en local. Falla el test "una respuesta vieja que llega tarde no pisa a la nueva".
- **Hacer `async` la función del efecto**: `useEffect(async () => {...})`. Una función `async` devuelve una promesa, y React espera que el efecto devuelva una función de limpieza o nada. Si quieres `await`, crea una función `async` **dentro** del efecto y llámala.
- **Pedir el precio en el cuerpo del componente** (fuera del efecto) y hacer `setPrecio` en el `.then`. Cada render dispara otra petición, que actualiza el estado, que provoca otro render: un bucle infinito de peticiones.
- **No volver a `null` al cambiar de tamaño.** Se ve el precio viejo un instante, como si fuera el del tamaño nuevo.

## Otra forma de resolverlo

Con `async/await` dentro del efecto y `AbortController`, que es lo que usarías con `fetch` real porque además **cancela** la petición en el navegador:

```jsx
useEffect(() => {
  const controlador = new AbortController();
  setPrecio(null);

  async function cargar() {
    try {
      const respuesta = await fetch(`/api/precio?tamano=${tamano}`, { signal: controlador.signal });
      const datos = await respuesta.json();
      setPrecio(datos.precio);
    } catch (error) {
      if (error.name !== "AbortError") console.error(error);
    }
  }

  cargar();
  return () => controlador.abort();
}, [tamano]);
```

**¿Cuándo conviene?** Con `fetch` real, `AbortController` es mejor porque no solo ignora la respuesta vieja: corta la descarga y ahorra red. La bandera `vigente` sirve con cualquier promesa (como `obtenerPrecio` de este ejercicio, que no acepta `signal`). En proyectos grandes se suele usar una librería como TanStack Query, que resuelve esto y la caché por ti.

## Cómo explicarlo en la entrevista

> "Pido el precio en un `useEffect` que depende de `tamano`, así se repite cada vez que cambia. Guardo el precio en el estado con `null` como 'cargando'. El problema es la condición de carrera: si cambio de M a L y la respuesta de M llega después, pisaría el precio correcto. Para evitarlo, cada ejecución del efecto tiene una bandera `vigente`, y la limpieza la pone en `false` antes de que corra el efecto siguiente. Con `fetch` real usaría `AbortController` en la limpieza para además cancelar la petición."

## Conceptos

- **Dependencias del efecto**: el efecto se repite cuando cambia alguno de sus valores.
- **Función de limpieza**: corre antes de repetir el efecto y al desmontar; sirve para cancelar o ignorar lo anterior.
- **Condición de carrera (race condition)**: dos tareas asíncronas terminan en un orden distinto al esperado.
- **Closure**: cada ejecución del efecto recuerda sus propias variables (`vigente`).
- **Promesas y `.then`**: el valor llega después; el componente ya puede haber cambiado.
- **`AbortController`**: permite cancelar un `fetch` en curso.
- **Estado de carga**: `null` (o un booleano aparte) para mostrar "Calculando…" mientras llega el dato.
