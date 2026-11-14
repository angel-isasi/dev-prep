## En una frase

En React con TypeScript (archivos `.tsx`) tipas **las props de cada componente**, el **estado** y los **eventos**; a cambio, el editor te avisa si te olvidas una prop, pasas un tipo equivocado o lees algo que puede ser `null`.

## Lo esencial

### Tipar props

Las props son un objeto, así que se tipan con `type` o `interface`:

```tsx
type TarjetaProps = {
  titulo: string;
  precio: number;
  oferta?: boolean;               // opcional
  etiquetas: string[];
};

function Tarjeta({ titulo, precio, oferta = false, etiquetas }: TarjetaProps) {
  return (
    <article>
      <h2>{titulo}</h2>
      <p>S/ {precio.toFixed(2)} {oferta && "¡Oferta!"}</p>
      <small>{etiquetas.join(", ")}</small>
    </article>
  );
}

<Tarjeta titulo="Café" precio={6} etiquetas={[]} />    // ok
<Tarjeta titulo="Café" etiquetas={[]} />               // error: falta la propiedad "precio"
<Tarjeta titulo="Café" precio="6" etiquetas={[]} />    // error: string no es number
```

No hace falta anotar el retorno del componente: TypeScript infiere que devuelve JSX.

### children

Para recibir contenido entre las etiquetas, usa `React.ReactNode`: acepta JSX, texto, números, `null`, arrays...

```tsx
import type { ReactNode } from "react";

type CajaProps = {
  titulo: string;
  children: ReactNode;
};

function Caja({ titulo, children }: CajaProps) {
  return (
    <section>
      <h3>{titulo}</h3>
      {children}
    </section>
  );
}

<Caja titulo="Aviso"><p>Hoy cerramos temprano</p></Caja>
```

### Funciones como props

```tsx
type BotonProps = {
  texto: string;
  onClick: () => void;
  variante?: "primario" | "secundario";   // unión de literales: solo esas dos
};

type BuscadorProps = {
  onBuscar: (termino: string) => void;    // el padre recibe el texto
};
```

### Eventos

Cada evento tiene su tipo, que dice **qué elemento** lo disparó:

```tsx
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

function Formulario() {
  const [email, setEmail] = useState("");

  function alCambiar(e: ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);         // TS sabe que target es un input
  }

  function alEnviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
  }

  return (
    <form onSubmit={alEnviar}>
      <input value={email} onChange={alCambiar} />
      <button onClick={(e) => console.log(e.clientX)}>Enviar</button>
    </form>
  );
}
```

Truco: si escribes el manejador **en línea** (`onClick={(e) => ...}`), `e` se infiere solo. Si no sabes el tipo, escribe el manejador en línea y pasa el mouse sobre `e` en VS Code: te lo muestra.

| Evento | Tipo |
|---|---|
| `onChange` de input | `ChangeEvent<HTMLInputElement>` |
| `onChange` de select | `ChangeEvent<HTMLSelectElement>` |
| `onSubmit` | `FormEvent<HTMLFormElement>` |
| `onClick` | `MouseEvent<HTMLButtonElement>` |
| `onKeyDown` | `KeyboardEvent<HTMLInputElement>` |

### useState\<T\>

Si el valor inicial deja claro el tipo, se infiere. Si no, pásalo explícito:

```tsx
const [contador, setContador] = useState(0);          // number (inferido)
const [nombre, setNombre] = useState("");             // string

type Usuario = { id: number; nombre: string };
const [usuario, setUsuario] = useState<Usuario | null>(null); // empieza vacío
const [lista, setLista] = useState<Usuario[]>([]);    // sin <>, [] sería never[]

usuario.nombre;   // error: "usuario" es posiblemente "null"
usuario?.nombre;  // ok
```

### useRef

```tsx
import { useRef } from "react";

function Buscador() {
  const inputRef = useRef<HTMLInputElement>(null);    // referencia a un elemento

  function enfocar() {
    inputRef.current?.focus();   // current puede ser null antes de montarse
  }

  return <input ref={inputRef} onFocus={enfocar} />;
}

const intervalo = useRef<number | null>(null);        // guardar un valor que no pinta
```

### Componentes genéricos

Una lista que sirve para **cualquier** tipo de elemento, sin perder el tipo en `render`:

```tsx
type ListaProps<T> = {
  items: T[];
  render: (item: T) => ReactNode;
  obtenerClave: (item: T) => string | number;
};

function Lista<T>({ items, render, obtenerClave }: ListaProps<T>) {
  return <ul>{items.map((it) => <li key={obtenerClave(it)}>{render(it)}</li>)}</ul>;
}

<Lista
  items={[{ id: 1, nombre: "Ana" }]}
  obtenerClave={(u) => u.id}
  render={(u) => u.nombre}     // u se infiere como { id: number; nombre: string }
/>
```

### Hooks propios tipados

Un hook es una función: tipas sus parámetros y su retorno. Si devuelves una tupla, usa `as const` para que no se mezclen los tipos:

```tsx
function useAlternar(inicial = false) {
  const [activo, setActivo] = useState(inicial);
  const alternar = () => setActivo((a) => !a);
  return [activo, alternar] as const;   // readonly [boolean, () => void]
}

const [abierto, alternarModal] = useAlternar();
```

Sin `as const`, el retorno sería `(boolean | (() => void))[]` y `abierto` podría ser cualquiera de los dos. Si devuelves un objeto (`{ activo, alternar }`) no hace falta.

## Errores típicos

**1. Estado vacío sin tipo**

```tsx
const [productos, setProductos] = useState([]); // never[]
setProductos([{ id: 1 }]); // error: no se puede asignar a never
```
Indica el tipo: `useState<Producto[]>([])`.

**2. Olvidar que el estado o la ref pueden ser null**

```tsx
const ref = useRef<HTMLInputElement>(null);
ref.current.focus(); // error: es posiblemente "null"
```
Usa `ref.current?.focus()`.

**3. Tipar el evento con el elemento equivocado**

```tsx
function f(e: ChangeEvent<HTMLInputElement>) {}
<select onChange={f} /> // error: un select no es un input
```
El tipo genérico del evento debe ser el elemento real: `HTMLSelectElement`.

**4. Usar `React.JSX.Element` para children**

```tsx
type P = { children: React.JSX.Element };
<Caja>Hola</Caja> // error: un texto no es un elemento JSX
```
`JSX.Element` solo acepta un elemento JSX (en React 19 ya no existe suelto: es `React.JSX.Element`). `ReactNode` acepta todo lo que React puede pintar. Úsalo para `children`.

**5. Tupla de un hook sin `as const`**

```tsx
return [valor, setValor]; // (string | ((v: string) => void))[]
```
Agrega `as const` o devuelve un objeto.

## Chuleta

```tsx
type Props = { texto: string; edad?: number; children: ReactNode; onGuardar: (id: number) => void };
function C({ texto, edad = 0, children, onGuardar }: Props) { ... }

useState(0)                         // number
useState<Usuario | null>(null)      // empieza en null
useState<Item[]>([])                // array vacío con tipo
useRef<HTMLInputElement>(null)      // ref a un elemento → ref.current?.
(e: ChangeEvent<HTMLInputElement>) => e.target.value
(e: FormEvent<HTMLFormElement>) => e.preventDefault()
function Lista<T>(props: ListaProps<T>) { ... }
return [a, b] as const;             // tupla en un hook propio
```

## En la entrevista

**¿Cómo tipas las props de un componente?**
Con un `type` o `interface` que describe el objeto de props y lo pongo en el parámetro: `function Tarjeta({ titulo }: TarjetaProps)`. Las opcionales llevan `?` y les puedo dar valor por defecto en el destructuring.

**¿Qué tipo usas para `children`?**
`React.ReactNode`, porque acepta todo lo que React puede renderizar: elementos, texto, números, `null` y arrays.

**¿Cuándo pasas el tipo a `useState` explícitamente?**
Cuando el valor inicial no basta para inferirlo: un array vacío (`useState<Item[]>([])`) o un valor que empieza en `null` y luego será un objeto (`useState<Usuario | null>(null)`).

**¿Cómo tipas un evento de un input?**
Con `ChangeEvent<HTMLInputElement>`; así `e.target.value` es un string. Si escribo el manejador en línea en el JSX, TypeScript lo infiere solo.

**¿Qué es un componente genérico?**
Un componente con un parámetro de tipo, como `Lista<T>`, que recibe `items: T[]` y una función `render(item: T)`. Sirve para cualquier tipo de dato y TypeScript sigue sabiendo qué es cada `item`.
