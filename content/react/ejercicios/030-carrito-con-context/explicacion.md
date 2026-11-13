## Idea clave

**Context** es un canal para pasar datos a cualquier descendiente sin props intermedias. Se crea con `createContext`, el **provider** pone un valor en el canal (aquí el estado del carrito y la función para agregar) y cualquier componente de adentro lo lee con `useContext`. Cuando el valor cambia, todos los que lo leen se vuelven a renderizar.

## Paso a paso

1. **Crea el contexto** fuera de los componentes: `const CarritoContext = createContext(null)`. El `null` es el valor por defecto si alguien lo lee sin provider.
2. **El provider guarda el estado**: `useState([])` para los items y una función `agregar` que crea un arreglo nuevo con el spread.
3. **Publica el valor**: `<CarritoContext.Provider value={{ items, agregar }}>`. Todo lo que esté dentro de `{children}` puede leerlo, sin importar la profundidad.
4. **Lee con `useContext`**: `Encabezado` toma `items` para contar; `BotonPizza` toma `agregar` para el clic.
5. **Exporta solo los componentes**, no el contexto: así nadie puede usar el carrito sin pasar por el provider.

```jsx
import { createContext, useContext, useState } from "react";

// 1. El "canal" por donde viaja el carrito.
const CarritoContext = createContext(null);

// 2. El provider guarda el estado y lo pone en el canal.
export function CarritoProvider({ children }) {
  const [items, setItems] = useState([]);
  const agregar = (nombre) => setItems((anteriores) => [...anteriores, nombre]);

  return (
    <CarritoContext.Provider value={{ items, agregar }}>
      {children}
    </CarritoContext.Provider>
  );
}

// 3. Cualquier descendiente lee el canal con useContext.
export function Encabezado() {
  const { items } = useContext(CarritoContext);
  return <p>Carrito: {items.length}</p>;
}

export function BotonPizza({ nombre }) {
  const { agregar } = useContext(CarritoContext);
  return <button onClick={() => agregar(nombre)}>Pedir {nombre}</button>;
}
```

## Por qué funciona

| Acción | Estado `items` en el provider | Lo que se pinta |
|---|---|---|
| Primer render | `[]` | Carrito: 0, botón "Pedir Hawaiana" |
| Clic en "Pedir Hawaiana" | `["Hawaiana"]` | Carrito: 1 |
| Clic en "Pedir Americana" | `["Hawaiana", "Americana"]` | Carrito: 2 |

Al hacer clic, `BotonPizza` llama a `agregar`, que vive en el provider. El provider cambia su estado y se vuelve a renderizar, creando un nuevo `value`. React detecta que el `value` cambió y vuelve a renderizar **a todos los que hacen `useContext(CarritoContext)`**, aunque estén lejísimos en el árbol. Por eso el `Encabezado` se entera sin que nadie le pase props.

¿Y dos providers? Cada `CarritoProvider` es una instancia distinta con **su propio** `useState`. Un `useContext` lee el provider **más cercano hacia arriba**, así que cada tienda ve su propio carrito.

## Errores comunes

- **Usar `useContext` en un componente que no está dentro del provider.** Recibe el valor por defecto (`null`) y explota al desestructurar. Lo reconoces por "Cannot destructure property 'items' of null".
- **Crear el contexto dentro del componente.** Cada render crearía un canal nuevo y los hijos nunca lo encontrarían. `createContext` va en el nivel del módulo.
- **Mutar el arreglo**: `items.push(nombre); setItems(items)`. Es el mismo arreglo, React no ve el cambio y nada se actualiza.
- **Poner solo `items` en el value** y olvidar `agregar`. Los botones no tienen cómo modificar el carrito.
- **Usar Context para todo.** Si el dato solo baja uno o dos niveles, las props son más claras. Context brilla cuando muchos componentes lejanos necesitan lo mismo (usuario, tema, carrito, idioma).

## Otra forma de resolverlo

Con un **hook propio `useCarrito`** que además avisa con un error claro si se usa fuera del provider, y `useMemo` para no crear un `value` nuevo en cada render del provider:

```jsx
import { createContext, useContext, useMemo, useState } from "react";

const CarritoContext = createContext(null);

export function CarritoProvider({ children }) {
  const [items, setItems] = useState([]);
  const valor = useMemo(
    () => ({ items, agregar: (nombre) => setItems((a) => [...a, nombre]) }),
    [items],
  );
  return <CarritoContext.Provider value={valor}>{children}</CarritoContext.Provider>;
}

function useCarrito() {
  const contexto = useContext(CarritoContext);
  if (!contexto) throw new Error("useCarrito debe usarse dentro de <CarritoProvider>");
  return contexto;
}

export function Encabezado() {
  const { items } = useCarrito();
  return <p>Carrito: {items.length}</p>;
}

export function BotonPizza({ nombre }) {
  const { agregar } = useCarrito();
  return <button onClick={() => agregar(nombre)}>Pedir {nombre}</button>;
}
```

**¿Cuándo conviene?** Siempre que el contexto se use en varios archivos: el hook esconde el detalle de `useContext` y el error explica qué falta. `useMemo` importa cuando el provider se renderiza por otras razones y no quieres que todos los consumidores se vuelvan a renderizar sin necesidad.

## Cómo explicarlo en la entrevista

> "Para evitar prop drilling uso Context. Creo el contexto con `createContext`, y un componente provider que guarda el carrito en un `useState` y publica en el `value` tanto los items como la función para agregar. Los componentes que lo necesitan lo leen con `useContext`, sin importar qué tan anidados estén. Cuando el estado cambia, React vuelve a renderizar a todos los consumidores. En un proyecto real lo envolvería en un hook `useCarrito` que lance un error si se usa fuera del provider."

## Conceptos

- **Prop drilling**: pasar props por componentes que no las usan.
- **`createContext`**: crea el canal; su argumento es el valor por defecto.
- **Provider**: `<Contexto.Provider value={...}>` publica un valor para sus descendientes.
- **`useContext`**: lee el valor del provider más cercano hacia arriba.
- **Re-render de consumidores**: cuando cambia el `value`, se actualizan todos los que lo leen.
- **Estado inmutable**: `[...anteriores, nuevo]` en vez de `push`.
- **Hook propio sobre un contexto**: oculta `useContext` y valida que haya provider.
