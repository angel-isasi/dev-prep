## En una frase

`useRef` guarda algo **sin volver a renderizar**, `useMemo` y `useCallback` **reutilizan** un valor o una función entre renders, `useReducer` ordena un estado complejo en **acciones**, y Context **comparte** datos con todo un árbol sin pasar props nivel por nivel.

## Lo esencial

### `useRef`: el elemento del DOM

```jsx
import { useRef, useEffect } from "react";

function Buscador() {
  const inputRef = useRef(null);    // { current: null }

  useEffect(() => {
    inputRef.current.focus();       // después de pintar, current es el <input> real
  }, []);

  return <input ref={inputRef} aria-label="Buscar pizza" />;
}
```

Sirve para lo que React no hace solo: dar foco, medir un elemento, hacer scroll, reproducir un video.

### `useRef`: valores que no re-renderizan

```jsx
function Cronometro() {
  const [seg, setSeg] = useState(0);
  const idRef = useRef(null);           // guarda el id del intervalo entre renders

  function iniciar() {
    idRef.current = setInterval(() => setSeg((s) => s + 1), 1000);
  }
  function pausar() {
    clearInterval(idRef.current);       // lo leemos aquí, en un manejador
  }
  // ...
}
```

| | `useState` | `useRef` |
|---|---|---|
| Al cambiarlo | re-renderiza | **no** re-renderiza |
| Se cambia con | `setValor(x)` | `ref.current = x` |
| Úsalo para | lo que se ve en pantalla | ids de timers, el DOM, el valor anterior |

Regla: no leas ni escribas `ref.current` durante el render (salvo para inicializarlo). Hazlo en efectos y manejadores.

### `useMemo` y `useCallback`

```jsx
// useMemo: guarda el RESULTADO de un cálculo
const stats = useMemo(() => estadisticas(pedidos), [pedidos]);
// solo recalcula si pedidos cambió (otro arreglo); si no, devuelve el guardado

// useCallback: guarda la FUNCIÓN misma (la misma referencia entre renders)
const borrar = useCallback((id) => {
  setItems((lista) => lista.filter((i) => i.id !== id));
}, []);
// useCallback(fn, deps) es lo mismo que useMemo(() => fn, deps)
```

**Cuándo sí**:
- un cálculo realmente caro (miles de elementos);
- pasar un objeto o función a un hijo envuelto en `memo`;
- un objeto o función que es dependencia de un `useEffect`.

**Cuándo no**: en cálculos baratos (`a + b`, filtrar 20 elementos). Cuestan memoria y hacen el código más difícil de leer. Primero que funcione; memoriza cuando midas un problema.

### `useReducer`: el estado como acciones

```jsx
// reducer PURO: recibe (estado, accion) y devuelve un estado NUEVO
function reducer(estado, accion) {
  switch (accion.tipo) {
    case "agregar":
      return { ...estado, items: [...estado.items, accion.item] };
    case "quitar":
      return { ...estado, items: estado.items.filter((i) => i.id !== accion.id) };
    case "vaciar":
      return { ...estado, items: [] };
    default:
      throw new Error(`Acción desconocida: ${accion.tipo}`);
  }
}

function Carrito() {
  const [estado, dispatch] = useReducer(reducer, { items: [] });
  return (
    <button onClick={() => dispatch({ tipo: "agregar", item: { id: 1, nombre: "Hawaiana" } })}>
      Agregar
    </button>
  );
}
```

Los componentes dicen **qué pasó** (`dispatch({ tipo: "agregar" })`) y el reducer decide **cómo cambia** el estado. Úsalo cuando hay varias formas de cambiar el mismo estado o varios campos que cambian juntos. Como es una función pura, se prueba sin React: `reducer(estado, accion)`.

### Context: compartir sin "prop drilling"

```jsx
import { createContext, useContext, useState } from "react";

const TemaContext = createContext("claro");   // valor por defecto, si no hay proveedor

function TemaProvider({ children }) {
  const [tema, setTema] = useState("claro");
  // React 19: el contexto mismo es el proveedor (antes era <TemaContext.Provider>)
  return <TemaContext value={{ tema, setTema }}>{children}</TemaContext>;
}

function BotonTema() {
  const { tema, setTema } = useContext(TemaContext);   // lee el proveedor más cercano
  return (
    <button onClick={() => setTema(tema === "claro" ? "oscuro" : "claro")}>
      Tema: {tema}
    </button>
  );
}

<TemaProvider>
  <Layout>
    <BotonTema />    {/* no importa qué tan profundo esté */}
  </Layout>
</TemaProvider>
```

Cuando el `value` cambia, **todos** los componentes que usan ese contexto se vuelven a renderizar. Úsalo para datos "globales" que cambian poco: tema, usuario, idioma, carrito. Patrón común: un hook `useTema()` que llama a `useContext` y lanza un error si no hay proveedor.

## Errores típicos

**1. Esperar que cambiar un ref actualice la pantalla.**

```jsx
const clics = useRef(0);
<button onClick={() => clics.current++}>+</button>
<p>{clics.current}</p>   // sigue mostrando 0: cambiar un ref no re-renderiza
```

Si se ve en pantalla, es estado.

**2. Mutar el estado en el reducer.**

```jsx
case "sumar":
  estado.cuenta++;
  return estado;   // mismo objeto: React compara con Object.is, ve "sin cambios" y no re-renderiza
```

Devuelve siempre uno nuevo: `return { ...estado, cuenta: estado.cuenta + 1 }`.

**3. Un objeto nuevo en el `value` del Context en cada render.**

```jsx
function Proveedor({ children }) {
  const [usuario, setUsuario] = useState(null);
  return <UsuarioContext value={{ usuario, setUsuario }}>{children}</UsuarioContext>;
  // cada render del Proveedor crea otro objeto: todos los consumidores se re-renderizan
}
```

Si el proveedor se re-renderiza seguido, memoriza: `const value = useMemo(() => ({ usuario, setUsuario }), [usuario])`.

**4. `useCallback` con dependencias incompletas.**

```jsx
const mostrar = useCallback(() => console.log(cuenta), []);   // siempre imprime 0
```

Igual que en `useEffect`: lo que usas adentro va en las dependencias.

**5. `useMemo` para todo.**

```jsx
const total = useMemo(() => precio * cantidad, [precio, cantidad]);   // más caro que multiplicar
```

**6. Leer el contexto fuera del proveedor sin darte cuenta.** `useContext` devuelve el valor por defecto de `createContext` y el error aparece lejos. Por eso conviene el hook propio que lanza un error claro.

## Chuleta

- `useRef(inicial)` devuelve `{ current }`. Cambiarlo **no** re-renderiza. Para el DOM (`ref={miRef}`) y valores entre renders (ids de timers).
- `useMemo(() => calculo, deps)`: guarda un resultado. `useCallback(fn, deps)`: guarda una función.
- Memoriza solo si es caro o si la referencia importa (`memo`, dependencias de efectos).
- `useReducer(reducer, inicial)` devuelve `[estado, dispatch]`. Reducer **puro**, nunca muta, `default` lanza error.
- Context: `createContext(defecto)`, `<Contexto value={...}>` (React 19), `useContext(Contexto)`.
- Si el `value` es un objeto creado en el render, todos los consumidores se re-renderizan: `useMemo`.

## En la entrevista

**¿Diferencia entre `useRef` y `useState`?**
Los dos guardan un valor entre renders, pero cambiar un `useState` vuelve a renderizar y cambiar `ref.current` no. Uso `useRef` para el DOM y para datos que no se muestran, como el id de un `setInterval`.

**¿Cuándo usarías `useMemo` o `useCallback`?**
Cuando un cálculo es caro, o cuando necesito mantener la misma referencia de un objeto o función: para un hijo con `memo` o para una dependencia de `useEffect`. No los uso por defecto porque tienen costo y ensucian el código.

**¿Cuándo `useReducer` en vez de `useState`?**
Cuando el estado tiene varias partes que cambian juntas o muchas formas de cambiar, como un carrito (agregar, quitar, cambiar cantidad, vaciar). Centraliza la lógica en una función pura, fácil de probar.

**¿Qué es el prop drilling y cómo lo resuelve Context?**
Es pasar una prop por varios componentes intermedios que no la usan, solo para que llegue abajo. Con Context el proveedor pone el valor arriba y cualquier descendiente lo lee con `useContext`.

**¿Context reemplaza a Redux?**
Para datos que cambian poco (tema, usuario), sí basta. Context no optimiza: todo consumidor se re-renderiza cuando cambia el `value`. Para estado global grande y que cambia mucho, una librería como Zustand o Redux Toolkit evita esos renders y da mejores herramientas.
