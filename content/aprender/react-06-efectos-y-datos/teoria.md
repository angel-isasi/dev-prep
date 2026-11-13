## En una frase

Un **efecto** (`useEffect`) es código que React ejecuta **después de pintar** la pantalla para sincronizar tu componente con algo de afuera: el título de la pestaña, un timer, un evento de `window` o una petición al servidor.

## Lo esencial

### Qué es un efecto

```jsx
import { useEffect } from "react";

function TituloPedido({ cantidad }) {
  useEffect(() => {
    document.title = `(${cantidad}) Padre Gino`;  // corre DESPUÉS de pintar
  }, [cantidad]);                                // solo cuando cambia cantidad

  return <p>{cantidad} en el carrito</p>;        // el render solo calcula JSX
}
```

El cuerpo del componente debe ser **puro**: recibir props y estado y devolver JSX. Lo que toca el mundo exterior (DOM directo, timers, red, `localStorage`) va en un efecto o en un manejador de eventos.

### Cuándo NO usar un efecto

Si un valor se puede **calcular** con las props o el estado, calcúlalo en el render. Un efecto ahí solo agrega un render extra con un valor viejo.

```jsx
// MAL: estado duplicado + efecto
const [completo, setCompleto] = useState("");
useEffect(() => {
  setCompleto(`${nombre} ${apellido}`);
}, [nombre, apellido]);

// BIEN: estado derivado, se calcula en cada render
const completo = `${nombre} ${apellido}`;
```

Otra regla: si algo pasa **porque el usuario hizo clic**, va en el `onClick`, no en un efecto que "escucha" un estado.

### El arreglo de dependencias

```jsx
useEffect(() => { /* ... */ });          // sin arreglo: después de CADA render
useEffect(() => { /* ... */ }, []);      // []: solo al montar
useEffect(() => { /* ... */ }, [id]);    // [id]: al montar y cada vez que id cambie
```

Toda variable del componente (props, estado, funciones) que uses dentro del efecto debe estar en el arreglo. React compara cada dependencia con `Object.is`: un objeto o función creado en el render es "nuevo" cada vez y hace que el efecto corra siempre.

### La función de limpieza

Si el efecto deja algo encendido, devuelve una función que lo apague. React la llama **antes de volver a ejecutar el efecto** y **al desmontar** el componente.

```jsx
useEffect(() => {
  const id = setInterval(() => {
    setSegundos((s) => s + 1);        // actualización funcional: no depende de segundos
  }, 1000);
  return () => clearInterval(id);     // limpieza: apaga el timer
}, []);

useEffect(() => {
  function alPresionar(e) {
    if (e.key === "Escape") onCerrar();
  }
  window.addEventListener("keydown", alPresionar);
  return () => window.removeEventListener("keydown", alPresionar); // la MISMA función
}, [onCerrar]);
```

Sin limpieza: timers que siguen corriendo en componentes que ya no existen y listeners duplicados.

### Pedir datos: cargando, error y datos

```jsx
function Noticias() {
  const [datos, setDatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function cargar() {          // la función async va ADENTRO del efecto
      try {
        const res = await fetch("/api/noticias");
        if (!res.ok) throw new Error(`Error ${res.status}`); // fetch no falla con 404 o 500
        setDatos(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  if (cargando) return <p>Cargando...</p>;
  if (error) return <p role="alert">No se pudo cargar: {error}</p>;
  if (datos.length === 0) return <p>No hay noticias</p>;
  return <ul>{datos.map((n) => <li key={n.id}>{n.titulo}</li>)}</ul>;
}
```

### Condición de carrera

El usuario elige la pizza 1 y luego la 2. Si la respuesta de la 1 llega **después**, pisa a la 2. Hay dos soluciones:

```jsx
// 1. Bandera: ignorar respuestas viejas
useEffect(() => {
  let vigente = true;
  obtenerPizza(id).then((p) => {
    if (vigente) setPizza(p);          // solo guarda si este efecto sigue vigente
  });
  return () => { vigente = false; };   // al cambiar id, el efecto anterior queda "vencido"
}, [id]);

// 2. AbortController: cancelar la petición de verdad
useEffect(() => {
  const controlador = new AbortController();
  fetch(`/api/pizzas/${id}`, { signal: controlador.signal })
    .then((r) => r.json())
    .then(setPizza)
    .catch((err) => {
      if (err.name !== "AbortError") setError(err.message); // abortar no es un error real
    });
  return () => controlador.abort();
}, [id]);
```

### StrictMode ejecuta los efectos dos veces (en desarrollo)

Con `<StrictMode>` (Vite lo pone en `main.jsx`), en desarrollo React monta el componente, **lo desmonta y lo vuelve a montar** al toque. Por eso ves el efecto dos veces en la consola: `efecto`, `limpieza`, `efecto`. Lo hace a propósito para revelar efectos sin limpieza. En producción corre una sola vez. La solución nunca es quitar `StrictMode`: es escribir bien la limpieza.

En un proyecto real, para pedir datos se suele usar una librería como TanStack Query o el framework (Next.js), que ya resuelven caché y carreras. Pero en la entrevista te pedirán hacerlo a mano con `useEffect`.

## Errores típicos

**1. Olvidar una dependencia.** El efecto se queda con el valor del primer render.

```jsx
useEffect(() => {
  fetch(`/api/pizzas/${id}`).then(/* ... */);
}, []);   // si cambia id, NO vuelve a pedir: muestra la pizza vieja
```

Pon `[id]`. El linter `react-hooks/exhaustive-deps` te avisa.

**2. `useEffect(async () => ...)`.** Una función `async` devuelve una promesa, y React espera que el efecto devuelva una función de limpieza o nada.

```jsx
useEffect(async () => {
  const res = await fetch("/api/pizzas");
}, []);   // React avisa en la consola y la limpieza no funciona
```

Declara la función async adentro y llámala.

**3. Closure viejo en un intervalo.**

```jsx
useEffect(() => {
  const id = setInterval(() => setSegundos(segundos + 1), 1000);
  return () => clearInterval(id);
}, []);   // segundos siempre vale 0 adentro: se queda en 1 para siempre
```

Usa `setSegundos((s) => s + 1)`.

**4. Actualizar en el efecto un estado que está en sus dependencias.**

```jsx
useEffect(() => {
  setCuenta(cuenta + 1);
}, [cuenta]);   // bucle infinito: cambia cuenta, corre el efecto, cambia cuenta...
```

**5. No revisar `res.ok`.** `fetch` solo rechaza la promesa si no hay red. Un 404 o 500 llega como respuesta "exitosa".

```jsx
const datos = await (await fetch(url)).json();
// con un 500 guarda el cuerpo del error como si fueran datos, o falla al leerlo
```

Revisa `if (!res.ok) throw new Error(...)` antes de leer el JSON.

**6. Olvidar la limpieza de un listener o pasar otra función al quitarlo.**

```jsx
window.addEventListener("resize", () => setAncho(window.innerWidth));
return () => window.removeEventListener("resize", () => setAncho(window.innerWidth));
// son dos funciones distintas: el listener nunca se quita
```

## Chuleta

- `useEffect(fn, deps)`: corre **después de pintar**, para sincronizar con lo de afuera.
- Sin arreglo: cada render. `[]`: al montar. `[a, b]`: al montar y cuando cambie `a` o `b`.
- Lo que uses adentro va en las dependencias.
- Devuelve una limpieza: `clearInterval`, `removeEventListener`, `controller.abort()`. Corre antes del siguiente efecto y al desmontar.
- Si se puede calcular en el render, **no** es un efecto. Si pasa por un clic, va en el manejador.
- `fetch`: async adentro del efecto, `try/catch/finally`, revisa `res.ok`, tres estados: cargando, error, datos.
- Carrera: bandera `vigente` o `AbortController`.
- StrictMode en desarrollo: efecto, limpieza, efecto. Es a propósito.

## En la entrevista

**¿Para qué sirve `useEffect`?**
Para sincronizar el componente con un sistema externo: pedir datos, suscribirse a eventos, timers, cambiar el título de la página. Corre después de que React pinta, y puede devolver una función de limpieza.

**¿Qué hace el arreglo de dependencias?**
Le dice a React cuándo volver a ejecutar el efecto. Sin arreglo, después de cada render; con `[]`, solo al montar; con valores, cuando alguno cambia (los compara con `Object.is`).

**¿Por qué mi efecto se ejecuta dos veces?**
Porque en desarrollo `StrictMode` monta, desmonta y vuelve a montar cada componente para detectar efectos sin limpieza. En producción corre una vez. Si el efecto tiene buena limpieza, el usuario no nota la diferencia.

**¿Qué es una condición de carrera al pedir datos y cómo la evitas?**
Cuando lanzo varias peticiones seguidas y una vieja responde después de la nueva, pisando los datos. La evito en la limpieza del efecto: con una bandera que ignora respuestas viejas o con un `AbortController` que cancela la petición anterior.

**¿Cuándo no usarías un efecto?**
Para datos que se pueden calcular a partir de props o estado (los calculo en el render) y para lógica que responde a una acción del usuario (va en el manejador del evento).
