## En una frase

Un **hook propio** es una función `useAlgo` que empaqueta lógica con hooks para reutilizarla, y los **patrones** (componentes compuestos, portales, error boundaries, `lazy`, `memo`) son soluciones conocidas a problemas que aparecen en toda app real.

## Lo esencial

### Hooks propios

```jsx
// Extraes la lógica repetida a una función que empieza con "use"
function useAnchoVentana() {
  const [ancho, setAncho] = useState(window.innerWidth);

  useEffect(() => {
    const alCambiar = () => setAncho(window.innerWidth);
    window.addEventListener("resize", alCambiar);
    return () => window.removeEventListener("resize", alCambiar);
  }, []);

  return ancho;               // devuelve datos, no JSX
}

function Encabezado() {
  const ancho = useAnchoVentana();
  return ancho < 600 ? <MenuMovil /> : <MenuCompleto />;
}
```

Comparten **lógica**, no estado: cada componente que llama a `useAnchoVentana()` tiene su propio `useState` y su propio efecto.

**Reglas de los hooks**:
1. Solo se llaman en el **nivel superior** del componente o de otro hook: nunca dentro de `if`, bucles, funciones internas o después de un `return` temprano.
2. Solo se llaman desde **componentes** o **hooks propios**, no desde funciones normales.

React identifica cada `useState` por el **orden** en que se llama. Si un `if` salta un hook en un render, el orden se corre y los estados se mezclan. El nombre `use...` le dice al linter que aplique estas reglas.

### Componentes compuestos

Varias piezas que trabajan juntas y se comunican por Context, como `<select>` y `<option>`:

```jsx
const OpcionesContext = createContext(null);

function Opciones({ valor, onCambio, children }) {
  return (
    <OpcionesContext value={{ valor, onCambio }}>
      <div role="radiogroup">{children}</div>
    </OpcionesContext>
  );
}

Opciones.Item = function Item({ valor, children }) {
  const grupo = useContext(OpcionesContext);           // lee al padre sin props
  return (
    <button
      role="radio"
      aria-checked={grupo.valor === valor}
      onClick={() => grupo.onCambio(valor)}
    >
      {children}
    </button>
  );
};

// Quien lo usa decide el orden y el contenido
<Opciones valor={masa} onCambio={setMasa}>
  <Opciones.Item valor="delgada">Delgada</Opciones.Item>
  <Opciones.Item valor="gruesa">Gruesa</Opciones.Item>
</Opciones>
```

### Portales

```jsx
import { createPortal } from "react-dom";

function Modal({ children, onCerrar }) {
  return createPortal(
    <div role="dialog" aria-modal="true">
      {children}
      <button onClick={onCerrar}>Cerrar</button>
    </div>,
    document.body               // se dibuja aquí en el DOM...
  );
}
```

El modal se pinta como hijo de `<body>`, así escapa de un `overflow: hidden` o `z-index` del padre. Pero en React **sigue siendo hijo** de su componente: recibe su Context, y sus eventos suben (burbujean) por el árbol de **React**, no por el del DOM.

### Error boundaries

Si un componente lanza un error al renderizar, React desmonta **toda** la app (pantalla en blanco). Un error boundary atrapa ese error y muestra un plan B solo en esa zona:

```jsx
// Es lo único que todavía exige una clase en React 19
class LimiteDeErrores extends Component {
  state = { hayError: false };

  static getDerivedStateFromError() {
    return { hayError: true };          // cambia el estado para mostrar el plan B
  }

  componentDidCatch(error, info) {
    console.error(error, info);         // aquí lo mandarías a un servicio de logs
  }

  render() {
    if (this.state.hayError) return <p role="alert">Algo salió mal</p>;
    return this.props.children;
  }
}

<LimiteDeErrores>
  <Comentarios />
</LimiteDeErrores>
```

Atrapa errores del **render**, de los **efectos** y del ciclo de vida de sus hijos. **No** atrapa errores de manejadores de eventos ni de código asíncrono (`setTimeout`, promesas): esos se manejan con `try/catch`. En proyectos reales se usa la librería `react-error-boundary`.

### `lazy` y `Suspense`

```jsx
import { lazy, Suspense, useState } from "react";

const Mapa = lazy(() => import("./Mapa.jsx"));   // FUERA del componente

function Locales() {
  const [ver, setVer] = useState(false);
  return (
    <>
      <button onClick={() => setVer(true)}>Ver mapa</button>
      {ver && (
        <Suspense fallback={<p>Cargando mapa...</p>}>
          <Mapa />
        </Suspense>
      )}
    </>
  );
}
```

El código de `Mapa` va en otro archivo JS que se descarga **solo cuando se necesita** (code splitting). El archivo importado debe tener `export default`. Mientras llega, `Suspense` muestra el `fallback`.

### `memo`: evitar re-renders de un hijo

```jsx
import { memo, useCallback } from "react";

const Fila = memo(function Fila({ texto, onBorrar }) {
  return <li>{texto} <button onClick={() => onBorrar(texto)}>Borrar</button></li>;
});
// memo: si las props son iguales (comparación superficial con Object.is), no re-renderiza

function Padre() {
  const [clics, setClics] = useState(0);
  const [items, setItems] = useState(["a", "b"]);
  const borrar = useCallback((t) => setItems((l) => l.filter((x) => x !== t)), []);
  // sin useCallback, borrar sería una función nueva en cada render y memo no serviría

  return (
    <>
      <button onClick={() => setClics(clics + 1)}>Clics: {clics}</button>
      <ul>{items.map((t) => <Fila key={t} texto={t} onBorrar={borrar} />)}</ul>
    </>
  );
  // clic en "Clics": el Padre se re-renderiza, pero las Fila no (mismas props)
}
```

### Cómo pensar el rendimiento

1. **Mide primero**: React DevTools, pestaña Profiler. No optimices a ciegas.
2. **Baja el estado**: si solo un input usa un estado, ponlo en ese componente, no en el padre de toda la página.
3. **Pasa `children`**: lo que llega como `children` no se re-renderiza cuando cambia el estado del componente que lo envuelve.
4. **Recién ahí** `memo`, `useMemo` y `useCallback`, en los puntos que el Profiler señaló.
5. Listas enormes: virtualización (pintar solo lo visible). Código pesado: `lazy`.

Si el proyecto usa **React Compiler**, este memoriza automáticamente y casi no necesitas `memo`, `useMemo` ni `useCallback` a mano.

## Errores típicos

**1. Un hook dentro de un `if`.**

```jsx
function Perfil({ logueado }) {
  if (logueado) {
    const [nombre, setNombre] = useState("");   // rompe el orden de los hooks
  }
  const [tema, setTema] = useState("claro");
}
```

Llama siempre al hook y pon la condición adentro o en el JSX.

**2. Creer que un hook propio comparte el estado.**

```jsx
function A() { const [n, sumar] = useContador(); /* ... */ }
function B() { const [n, sumar] = useContador(); /* ... */ }
// A y B tienen contadores separados. Para compartir, sube el estado o usa Context.
```

**3. `memo` con props que son objetos o funciones nuevas.**

```jsx
<Fila estilo={{ color: "red" }} onBorrar={() => borrar(id)} />
// objeto y función nuevos en cada render: memo compara, ve "distinto" y re-renderiza igual
```

**4. `lazy` dentro del componente.**

```jsx
function Locales() {
  const Mapa = lazy(() => import("./Mapa.jsx"));   // un lazy NUEVO y sin cargar en cada render
  // en cada render se suspende otra vez: el mapa se esconde y parpadea el fallback
}
```

**5. Esperar que el error boundary atrape un error de un clic.**

```jsx
<button onClick={() => { throw new Error("falló"); }}>Pagar</button>
// no lo atrapa: los errores de eventos no ocurren durante el render
```

**6. Llamar `use...` a una función que no usa hooks.** Confunde al lector y al linter. Si no usa hooks, es una función normal: `formatearPrecio`, no `useFormatearPrecio`.

## Chuleta

- Hook propio: función `useX` que usa otros hooks y devuelve datos. Comparte lógica, **no** estado.
- Reglas: nivel superior (nada de `if` ni bucles) y solo en componentes o hooks propios.
- Compuestos: padre con Context + piezas `Padre.Item` que lo leen.
- Portal: `createPortal(jsx, document.body)`. En el DOM está afuera; en React sigue adentro (Context y eventos).
- Error boundary: clase con `getDerivedStateFromError`. No atrapa eventos ni async.
- `lazy(() => import(...))` fuera del componente + `<Suspense fallback>`.
- `memo(Comp)`: salta el render si las props son iguales por referencia. Necesita `useCallback`/`useMemo` en las props.
- Rendimiento: mide, baja el estado, usa `children`, y recién después memoriza.

## En la entrevista

**¿Qué es un custom hook y cuándo lo creas?**
Una función que empieza con `use` y usa otros hooks para encapsular lógica reutilizable, como `useFetch`, `useDebounce` o `useLocalStorage`. Lo creo cuando repito la misma combinación de estado y efectos en varios componentes. Cada componente que lo usa tiene su propio estado.

**¿Cuáles son las reglas de los hooks y por qué existen?**
Llamarlos solo en el nivel superior y solo desde componentes u otros hooks. React asocia cada hook con su posición en el orden de llamadas; si un `if` cambia ese orden entre renders, los estados se mezclan.

**¿Qué es un portal y para qué lo usarías?**
Una forma de pintar un componente en otro nodo del DOM, como `document.body`, mientras sigue siendo parte del árbol de React. Lo uso para modales, tooltips y notificaciones, para que no los corte el `overflow` o el `z-index` del padre.

**¿Qué hace `React.memo`? ¿Lo usarías en todos los componentes?**
Evita que un componente se vuelva a renderizar si sus props no cambiaron, comparando cada prop por referencia. No lo uso en todo: comparar tiene costo, y si le paso objetos o funciones nuevos en cada render no sirve. Lo uso cuando el Profiler muestra que un componente caro se renderiza de más.

**¿Cómo mejorarías el rendimiento de una app React lenta?**
Primero mido con el Profiler para encontrar el cuello de botella. Luego bajo el estado al componente que lo usa, reviso las keys de las listas, uso `memo` con `useCallback` o `useMemo` donde hay renders caros innecesarios, virtualizo listas largas y divido el código con `lazy`.
