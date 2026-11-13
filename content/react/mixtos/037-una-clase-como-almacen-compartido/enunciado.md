Crea un **almacén** (store) de carrito con una clase de JavaScript y conéctalo a React con `useSyncExternalStore`, para que cualquier componente pueda leerlo sin pasar props.

Exporta:

1. **`AlmacenCarrito`**: una clase con:
   - Dos **campos privados**: `#items` (arreglo, empieza vacío) y `#oyentes` (un `Set` de funciones).
   - `suscribir(fn)`: agrega `fn` a los oyentes y devuelve una función para quitarla.
   - `leer()`: devuelve el arreglo actual de items.
   - `agregar(item)`: agrega el item creando un **arreglo nuevo** y avisa a todos los oyentes.
2. **`carrito`**: una instancia de `AlmacenCarrito` compartida por toda la app.
3. **`Insignia`**: un componente que muestra `<n> en el carrito`. Recibe la prop opcional `almacen` (por defecto, `carrito`) y lo lee con `useSyncExternalStore`.

## Reglas

- `#items` y `#oyentes` son privados: desde fuera, `almacen.items` y `almacen.oyentes` son `undefined`.
- `agregar` **no** usa `push`: el arreglo que devolvió `leer()` antes de agregar no debe cambiar.
- `leer()` devuelve el mismo arreglo mientras nada cambie (si devolviera uno nuevo en cada llamada, React entraría en un bucle infinito).
- `suscribir` y `leer` deben funcionar aunque se pasen sueltas (sin el `almacen.` delante), porque así las recibe `useSyncExternalStore`.
- Texto exacto: `0 en el carrito`, `2 en el carrito`, etc.

## Ejemplo

```jsx
const almacen = new AlmacenCarrito();
const antes = almacen.leer();   // []
almacen.agregar("Margarita");
almacen.leer();                 // ["Margarita"]
antes;                          // [] (no cambió)

<Insignia almacen={almacen} />  // "1 en el carrito"
```

## Por qué importa

Muchas librerías de estado global (Zustand, Redux) son, por dentro, exactamente esto: un objeto con datos, una lista de oyentes y un método para suscribirse. Entenderlo te permite explicar en una entrevista **cómo** se entera React de un cambio que ocurre fuera de él, y por qué la inmutabilidad importa.
