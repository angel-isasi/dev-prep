## Idea clave

`useSyncExternalStore` conecta React con datos que viven **fuera** de él. Le das `suscribir` (para que React se entere de los cambios) y `leer` (para obtener el valor actual). React compara lo que devuelve `leer` por **referencia**: por eso `agregar` crea un arreglo nuevo en vez de usar `push`.

## Paso a paso

1. **Campos privados.** `#items = []` y `#oyentes = new Set()`. El `#` es parte del nombre y hace que solo el código dentro de la clase pueda leerlos. Desde fuera, `almacen.items` es `undefined` y `almacen.#items` es un error de sintaxis.
2. **`suscribir` como campo flecha.** `suscribir = (fn) => { ... }` crea una función **por instancia** con `this` fijado a esa instancia. Agrega `fn` al Set y devuelve la función que la quita.
3. **`leer` como campo flecha.** `leer = () => this.#items` devuelve el arreglo actual. Mientras nadie llame a `agregar`, siempre es el mismo objeto.
4. **`agregar` crea un arreglo nuevo.** `this.#items = [...this.#items, item]` copia los items y agrega el nuevo al final. Luego llama a cada oyente sin argumentos: solo les dice "algo cambió".
5. **Una instancia compartida.** `export const carrito = new AlmacenCarrito()` crea un solo almacén para toda la app; cualquier archivo que lo importe usa el mismo.
6. **El componente.** `useSyncExternalStore(almacen.suscribir, almacen.leer)` devuelve el arreglo actual y vuelve a renderizar cuando un oyente avisa y `leer()` devuelve otra referencia.

```jsx
import { useSyncExternalStore } from "react";

export class AlmacenCarrito {
  #items = [];
  #oyentes = new Set();

  suscribir = (fn) => {
    this.#oyentes.add(fn);
    return () => this.#oyentes.delete(fn);
  };

  leer = () => this.#items;

  agregar(item) {
    this.#items = [...this.#items, item];
    this.#oyentes.forEach((fn) => fn());
  }
}

export const carrito = new AlmacenCarrito();

export function Insignia({ almacen = carrito }) {
  const items = useSyncExternalStore(almacen.suscribir, almacen.leer);
  return <p>{items.length} en el carrito</p>;
}
```

## Por qué funciona

Recorrido con `<Insignia almacen={almacen} />`:

| Paso | Qué pasa | `#items` | Pantalla |
|---|---|---|---|
| Montaje | React llama `leer()` y luego `suscribir(avisar)` | `[]` (referencia A) | 0 en el carrito |
| `agregar("Margarita")` | `#items` = `["Margarita"]` (referencia B); se llama `avisar()` | B | |
| React recibe el aviso | llama `leer()`: B !== A, entonces vuelve a renderizar | B | 1 en el carrito |
| `agregar("Pepperoni")` | referencia C, aviso, C !== B | C | 2 en el carrito |
| Desmontaje | React llama la función que devolvió `suscribir` | | |

**¿Y si `agregar` usara `push`?** El arreglo crecería, pero `leer()` devolvería **la misma** referencia A. React compararía A con A, concluiría que nada cambió y no volvería a renderizar: la insignia se quedaría en 0.

**¿Por qué campos flecha?** `useSyncExternalStore` recibe las funciones sueltas y las llama como `suscribir(avisar)`, sin `almacen.` delante. Con un método normal (`suscribir(fn) { ... }`), `this` sería `undefined` dentro y `this.#oyentes` lanzaría un error. La flecha toma `this` de donde se creó: la instancia.

## Errores comunes

- **Mutar con `push`.** La pantalla no se actualiza aunque los datos cambien. Lo reconoces porque falla "agregar crea un arreglo nuevo" y la insignia se queda en 0.
- **Métodos normales en vez de campos flecha.** Error `Cannot read private member #oyentes from an object whose class did not declare it` o `this is undefined` al pasarlos sueltos. Otra solución válida: `this.suscribir = this.suscribir.bind(this)` en el constructor.
- **`leer` que crea algo nuevo en cada llamada**, por ejemplo `leer = () => [...this.#items]`. React ve una referencia distinta cada vez, cree que siempre cambió y entra en un bucle infinito (error "The result of getSnapshot should be cached").
- **No devolver la función de desuscripción.** React no puede limpiar al desmontar y los oyentes se acumulan.
- **Olvidar avisar a los oyentes en `agregar`.** Los datos cambian pero nadie se entera hasta el próximo render por otro motivo.

## Otra forma de resolverlo

Con **Context + `useState`**, que es lo más común en apps chicas:

```jsx
import { createContext, useContext, useState } from "react";

const CarritoContexto = createContext(null);

export function ProveedorCarrito({ children }) {
  const [items, setItems] = useState([]);
  const agregar = (item) => setItems((lista) => [...lista, item]);
  return <CarritoContexto.Provider value={{ items, agregar }}>{children}</CarritoContexto.Provider>;
}

export function Insignia() {
  const { items } = useContext(CarritoContexto);
  return <p>{items.length} en el carrito</p>;
}
```

**¿Cuándo conviene cada una?** Context es lo natural cuando el estado solo se usa dentro de React. El almacén externo conviene cuando el dato también se cambia **fuera** de React (un WebSocket, código que no es componente, otra librería) o cuando quieres que solo se vuelvan a renderizar los componentes que leen ese dato. Es la idea de Zustand.

## Cómo explicarlo en la entrevista

> "Hice un almacén con una clase: los items y los oyentes son campos privados con `#`, así nadie los modifica desde fuera. Tiene `suscribir`, que devuelve la función para desuscribirse, `leer` y `agregar`. Lo conecto a React con `useSyncExternalStore`, que es el hook oficial para datos externos. Dos detalles importantes: `agregar` crea un arreglo nuevo, porque React compara por referencia y con `push` no se enteraría; y `suscribir` y `leer` son funciones flecha para que `this` no se pierda cuando React las llama sueltas. Así funcionan librerías como Zustand."

## Conceptos

- **Clase y campos de clase**: propiedades declaradas directamente en el cuerpo de la clase.
- **Campos privados `#`**: solo accesibles dentro de la clase; encapsulan el estado.
- **`this` en funciones flecha**: se toma del lugar donde se creó la función, no de cómo se llama.
- **Inmutabilidad**: crear un valor nuevo en vez de modificar el existente, para que cambie la referencia.
- **`useSyncExternalStore(suscribir, leer)`**: suscribe un componente a un almacén externo.
- **Patrón observer**: un Set de funciones a las que se avisa cuando algo cambia.
- **Singleton de módulo**: una instancia exportada que comparte toda la app.
