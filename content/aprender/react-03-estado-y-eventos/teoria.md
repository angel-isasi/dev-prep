## En una frase

El **estado** es la memoria de un componente: lo creas con `useState`, lo cambias con su función `set`, y cada cambio hace que React **vuelva a llamar** a tu componente para pintar la pantalla actualizada.

## Lo esencial

### useState y un evento

```jsx
import { useState } from "react";

function Contador() {
  const [cantidad, setCantidad] = useState(0); // 0 = valor inicial

  return (
    <button onClick={() => setCantidad(cantidad + 1)}>
      Pizzas: {cantidad}
    </button>
  );
}
// Al inicio: "Pizzas: 0". Clic: "Pizzas: 1". Otro clic: "Pizzas: 2".
```

- `useState(inicial)` devuelve un par: el **valor actual** y la **función para cambiarlo**.
- Llamar a `setCantidad(nuevo)` guarda el valor y **programa un nuevo render**.
- En ese render, `cantidad` ya trae el valor nuevo y el JSX se recalcula.

### Por qué no basta una variable normal

```jsx
function Contador() {
  let cantidad = 0;
  return <button onClick={() => { cantidad = cantidad + 1; }}>Pizzas: {cantidad}</button>;
}
// Haces clic 10 veces y sigue diciendo "Pizzas: 0"
```

Cambiar una variable local no avisa a React, así que no hay render. Y aunque lo hubiera, la función se ejecuta desde cero y `let cantidad = 0` vuelve a empezar. `useState` resuelve las dos cosas: **recuerda** el valor entre renders y **avisa** que hay que repintar.

### Reglas de los hooks

Los hooks (`useState`, `useEffect`...) se llaman **arriba del componente**, siempre en el mismo orden: nunca dentro de un `if`, un bucle o una función interna. Así React sabe qué estado es cuál en cada render.

### Eventos: onClick y onChange

```jsx
function Buscador() {
  const [texto, setTexto] = useState("");
  return (
    <>
      <input value={texto} onChange={(e) => setTexto(e.target.value)} />
      <p>Buscas: {texto}</p>
    </>
  );
}
// Escribes "pep" → se ve "Buscas: pep" letra por letra
```

- Los eventos van en camelCase y reciben una **función**: `onClick={fn}`, no `onClick={fn()}`.
- React le pasa a tu función un objeto evento `e`. En un input, `e.target.value` es lo escrito (siempre **texto**).
- En React, `onChange` se dispara **con cada tecla**, no solo al salir del campo.

### El estado es una foto de ese render

```jsx
function manejarClic() {
  setCantidad(cantidad + 1);
  setCantidad(cantidad + 1);
  setCantidad(cantidad + 1);
  console.log(cantidad); // 0: todavía es el valor de este render
}
// Después del clic se ve 1, no 3
```

Dentro de un render, `cantidad` es una constante. Las tres líneas dicen "ponlo en 0 + 1". React junta los cambios y hace **un solo** render al final.

### El actualizador funcional: `setX(prev => ...)`

```jsx
function manejarClic() {
  setCantidad((prev) => prev + 1);
  setCantidad((prev) => prev + 1);
  setCantidad((prev) => prev + 1);
}
// Después del clic se ve 3
```

Si le pasas una **función**, React la llama con el valor más reciente (incluidos los cambios en cola). Úsala siempre que el nuevo valor dependa del anterior: contadores, alternar (`setAbierto(a => !a)`).

### Objetos y arreglos: reemplazar, nunca mutar

React compara el valor viejo y el nuevo con `Object.is`. Si mutas y pasas **el mismo** objeto o arreglo, para React no cambió nada y **no repinta**.

```jsx
const [pedido, setPedido] = useState({ pizza: "Margarita", tamano: "M" });
setPedido({ ...pedido, tamano: "L" });     // copia y cambia un campo

const [items, setItems] = useState(["Pan"]);
setItems([...items, "Leche"]);                       // agregar
setItems(items.filter((i) => i !== "Pan"));          // quitar
setItems(items.map((i) => (i === "Pan" ? "Pan integral" : i))); // cambiar uno
```

| Quieres | Evita (muta) | Usa (crea uno nuevo) |
|---|---|---|
| Agregar | `push` | `[...arr, x]` |
| Quitar | `splice`, `pop` | `filter` |
| Cambiar uno | `arr[i] = x` | `map` |
| Ordenar | `sort` | `toSorted` o `[...arr].sort()` |
| Cambiar campo | `obj.campo = x` | `{ ...obj, campo: x }` |

### Estado derivado: no guardes lo que puedes calcular

```jsx
const [items, setItems] = useState([{ nombre: "Margarita", precio: 28 }]);
const total = items.reduce((acc, i) => acc + i.precio, 0); // se calcula en cada render
const cantidad = items.length;
```

Si `total` fuera otro `useState`, tendrías que acordarte de actualizarlo cada vez que cambian los items, y tarde o temprano se desincroniza. Guarda lo **mínimo** y calcula el resto.

### Levantar el estado al padre

Cada instancia de un componente tiene **su propio** estado. Si dos componentes necesitan el mismo dato, súbelo al padre común y pásalo por props:

```jsx
function Interruptor({ activo, onCambio }) {        // no tiene estado propio
  return <button onClick={() => onCambio(!activo)}>{activo ? "Sí" : "No"}</button>;
}

function Opciones() {
  const [delivery, setDelivery] = useState(false);  // el dato vive aquí
  return (
    <>
      <Interruptor activo={delivery} onCambio={setDelivery} />
      {delivery && <p>Costo de envío: S/ 5</p>}
    </>
  );
}
```

El padre es la **única fuente de verdad**: el hijo muestra lo que recibe y avisa cuando quiere cambiar.

## Errores típicos

**1. Usar una variable normal en lugar de estado**

```jsx
let abierto = false;
<button onClick={() => (abierto = !abierto)}>Menú</button>
```
Cambia la variable, pero React no se entera y la pantalla no cambia. Usa `const [abierto, setAbierto] = useState(false)`.

**2. Mutar el arreglo y pasar el mismo**

```jsx
items.push("Leche");
setItems(items); // la pantalla no cambia
```
Es el mismo arreglo (misma referencia), así que React no repinta. Crea uno nuevo: `setItems([...items, "Leche"])`.

**3. Esperar que el estado cambie en la siguiente línea**

```jsx
setCantidad(cantidad + 1);
console.log(cantidad); // sigue mostrando el valor anterior
```
`set` no cambia la variable de este render: programa el siguiente. Si necesitas el valor nuevo ahora, calcúlalo en una constante: `const nueva = cantidad + 1; setCantidad(nueva);`.

**4. Perder campos al actualizar un objeto**

```jsx
const [form, setForm] = useState({ nombre: "", edad: 20 });
setForm({ nombre: "Ana" }); // ¡edad desaparece!
```
`set` **reemplaza** el valor completo, no lo mezcla. Copia lo anterior: `setForm({ ...form, nombre: "Ana" })`.

**5. Llamar a `set` directamente en el render**

```jsx
function Contador() {
  const [n, setN] = useState(0);
  setN(n + 1); // Error: Too many re-renders
  return <p>{n}</p>;
}
```
Cada render pide otro render, sin fin. Los `set` van dentro de eventos (o efectos), no sueltos en el cuerpo del componente.

**6. Guardar en estado algo que se puede calcular**

```jsx
const [items, setItems] = useState([]);
const [total, setTotal] = useState(0); // hay que sincronizarlo a mano
```
Calcula `const total = items.reduce(...)` en el render. Menos estado, menos errores.

## Chuleta

- `const [valor, setValor] = useState(inicial);` arriba del componente, nunca en `if` ni bucles.
- `setValor(nuevo)` → nuevo render con el valor nuevo. La variable actual **no** cambia.
- Depende del anterior → `setValor((prev) => ...)`.
- Eventos: `onClick={fn}`, `onChange={(e) => setX(e.target.value)}`.
- Objetos: `{ ...obj, campo: x }`. Arreglos: `[...arr, x]`, `filter`, `map`. Nunca `push`, `splice`, `sort` ni asignar.
- Lo que se puede calcular, se calcula (estado derivado).
- Dos componentes comparten un dato → el estado sube al padre y baja por props.

## En la entrevista

**¿Qué es el estado y en qué se diferencia de una variable normal?**
Es un valor que React recuerda entre renders y que, al cambiar con su función `set`, provoca un nuevo render. Una variable normal se reinicia en cada render y cambiarla no actualiza la pantalla.

**¿Por qué después de `setCount(count + 1)` el `console.log(count)` muestra el valor viejo?**
Porque el estado es una foto del render actual: `set` no cambia la variable, programa un nuevo render en el que `count` tendrá el valor nuevo. Además React agrupa varios `set` y renderiza una sola vez.

**¿Cuándo usarías `setCount(prev => prev + 1)`?**
Cuando el nuevo valor depende del anterior, sobre todo si hay varias actualizaciones seguidas o la función se ejecuta más tarde (un `setTimeout`, una promesa). La función recibe el valor más reciente, no el de la foto del render.

**¿Por qué no se debe mutar el estado?**
Porque React decide si repintar comparando la referencia vieja con la nueva. Si mutas el mismo objeto o arreglo, la referencia no cambia y la pantalla no se actualiza; además, mutar rompe herramientas como la comparación en `memo`.

**¿Qué significa "levantar el estado"?**
Mover el estado al ancestro común más cercano de los componentes que lo necesitan. El padre lo guarda, lo pasa por props y entrega funciones para cambiarlo; así hay una sola fuente de verdad.
