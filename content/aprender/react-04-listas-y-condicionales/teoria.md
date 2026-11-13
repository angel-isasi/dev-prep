## En una frase

Para pintar una lista conviertes el arreglo en JSX con `map` (y le das a cada elemento una `key` única); para mostrar u ocultar algo usas `&&`, el ternario o un `return` temprano.

## Lo esencial

### Listas con `map`

```jsx
const pizzas = [
  { id: 1, nombre: "Margarita", precio: 28 },
  { id: 2, nombre: "Pepperoni", precio: 32 },
];

function Menu() {
  return (
    <ul>
      {pizzas.map((pizza) => (
        <li key={pizza.id}>
          {pizza.nombre}: S/ {pizza.precio}
        </li>
      ))}
    </ul>
  );
}
// • Margarita: S/ 28
// • Pepperoni: S/ 32
```

React sabe pintar un **arreglo de JSX**, y `map` convierte cada dato en un `<li>`. Fíjate en los paréntesis `(` `)` después de la flecha: devuelven el JSX directamente. Si usas llaves `{}`, necesitas `return`.

Puedes preparar la lista antes del `return` y filtrar sin problema:

```jsx
const baratas = pizzas.filter((p) => p.precio < 30);
return <ul>{baratas.map((p) => <li key={p.id}>{p.nombre}</li>)}</ul>;
// • Margarita
```

### `key`: el DNI de cada elemento

La `key` le dice a React **qué elemento es cuál** entre un render y otro. Así, si agregas, quitas o reordenas, React sabe qué nodo mover, cuál crear y cuál borrar, y conserva el estado de cada uno (lo escrito en un input, si está abierto, etc.).

- Debe ser **única entre hermanos** y **estable**: el mismo dato siempre con la misma key.
- Lo ideal es un `id` que venga de los datos. Un texto único (como el nombre) también sirve.
- Va en el elemento **que devuelve el `map`**, no dentro del componente hijo.
- No es una prop: el hijo no puede leer `props.key` (es `undefined`).
- Si no pones key, la lista se pinta igual, pero React avisa en consola: `Each child in a list should have a unique "key" prop`.

### ¿Por qué no usar el índice como key?

```jsx
{nombres.map((n, i) => (
  <li key={i}>{n} <input /></li>
))}
// Lista: Ana, Luis. Escribes "hola" en el input de Ana.
// Agregas "Rosa" al inicio → Rosa [hola], Ana [ ], Luis [ ]
```

Al insertar al inicio, Rosa recibe el índice 0, que antes era de Ana. React cree que el elemento 0 es el mismo y le deja el input con "hola". Con `key={n}` (o un id), "hola" se queda con Ana. El índice solo es aceptable si la lista **nunca** se reordena, filtra ni recibe inserciones en medio, y sus elementos no tienen estado.

### Si necesitas devolver varios elementos por item

```jsx
import { Fragment } from "react";

<dl>
  {terminos.map((t) => (
    <Fragment key={t.id}>
      <dt>{t.palabra}</dt>
      <dd>{t.significado}</dd>
    </Fragment>
  ))}
</dl>
```

El atajo `<>...</>` no acepta `key`; para eso usa `<Fragment key=...>`.

### Renderizado condicional: tres herramientas

**1. `&&`: mostrar algo o nada**

```jsx
{hayOferta && <p>¡2x1 hoy!</p>}
// hayOferta = true  → se ve el párrafo
// hayOferta = false → no se ve nada
```

**2. Ternario: una cosa u otra**

```jsx
<p>{abierto ? "Abierto ahora" : "Cerrado"}</p>
{logueado ? <Perfil /> : <BotonEntrar />}
```

**3. `return` temprano: el componente entero cambia**

```jsx
function Aviso({ mensaje }) {
  if (!mensaje) return null;      // null = no pintar nada
  return <p className="aviso">{mensaje}</p>;
}
```

Usa `if` antes del `return` cuando la condición es larga o hay varios casos (cargando, error, vacío, datos). Evita ternarios anidados dentro del JSX: se vuelven ilegibles.

### La trampa del `0 &&`

`a && b` devuelve `a` si `a` es falsy. React no pinta `false`, `null` ni `undefined`, pero **sí pinta `0`** (y `NaN`):

```jsx
const cantidad = 0;
{cantidad && <p>Tienes {cantidad} pizzas</p>}
// Se ve: 0   (¡un cero suelto en la pantalla!)
```

Arréglalo con una condición que dé booleano: `{cantidad > 0 && ...}` o usa un ternario `{cantidad ? ... : null}`.

### Listas vacías

Toda lista real puede llegar vacía. Una `<ul>` vacía no le dice nada al usuario:

```jsx
function Carrito({ items }) {
  if (items.length === 0) {
    return <p>Tu carrito está vacío.</p>;
  }
  return (
    <ul>
      {items.map((item) => <li key={item.id}>{item.nombre}</li>)}
    </ul>
  );
}
// items = [] → "Tu carrito está vacío."
```

Ojo: `items.length && <ul>...</ul>` con un arreglo vacío pinta `0`. Usa `items.length > 0 &&`.

## Errores típicos

**1. `map` con llaves y sin `return`**

```jsx
{items.map((item) => { <li key={item}>{item}</li>; })}
// Se pinta una <ul> vacía
```
Con llaves, la flecha necesita `return`; sin él, cada vuelta devuelve `undefined` y no se ve nada. Usa paréntesis `(item) => (<li>...</li>)` o escribe `return`.

**2. Olvidar la `key` o ponerla en el lugar equivocado**

```jsx
function Item({ texto }) {
  return <li key={texto}>{texto}</li>;   // aquí no sirve
}
lista.map((t) => <Item texto={t} />);  // advertencia: falta la key
```
La key va en el elemento que devuelve el `map`: `<Item key={t} texto={t} />`.

**3. Usar el índice como key en listas que cambian**

```jsx
tareas.map((t, i) => <Tarea key={i} tarea={t} />)
```
Si quitas, ordenas o insertas, el estado de cada `Tarea` (un input, un checkbox) se queda pegado a la posición y no al dato. Usa `key={t.id}`.

**4. La trampa del `0 &&`**

```jsx
{notificaciones.length && <Badge />} // con 0 notificaciones se ve "0"
```
Usa `notificaciones.length > 0 &&`.

**5. Usar `Math.random()` como key**

```jsx
items.map((i) => <li key={Math.random()}>{i.nombre}</li>)
```
Cambia en cada render, así que React cree que todos los elementos son nuevos: los destruye y crea otra vez (pierde estado y es lento). La key debe ser **estable**.

**6. Ternarios anidados dentro del JSX**

```jsx
{cargando ? <Spinner /> : error ? <Error /> : datos.length === 0 ? <Vacio /> : <Lista />}
```
Funciona, pero nadie lo lee. Usa `if` con `return` temprano para cada caso.

## Chuleta

- Lista: `{arr.map((x) => <li key={x.id}>{x.nombre}</li>)}`.
- `key`: única entre hermanos, estable, del dato (`id`). En el elemento del `map`. No llega como prop.
- Índice como key: solo en listas estáticas sin estado. `Math.random()`: nunca.
- Varios elementos por item: `<Fragment key={x.id}>`.
- Algo o nada: `cond && <X />`. Una u otra: `cond ? <A /> : <B />`. Nada: `return null`.
- `0` y `NaN` sí se pintan: usa `n > 0 &&`, no `n &&`.
- Lista vacía: `if (arr.length === 0) return <p>Vacío</p>;`.

## En la entrevista

**¿Para qué sirve la prop `key` en una lista?**
Para que React identifique cada elemento entre renders. Con ella sabe cuál se agregó, cuál se quitó y cuál se movió, actualiza solo lo necesario y mantiene el estado de cada elemento asociado al dato correcto.

**¿Por qué no es buena idea usar el índice como key?**
Porque el índice describe la posición, no el dato. Si la lista se reordena o se inserta o quita un elemento, los índices cambian de dueño y React puede mezclar el estado de los elementos (por ejemplo, lo escrito en un input) o hacer trabajo de más. Solo es aceptable en listas que nunca cambian.

**¿Qué formas hay de renderizar condicionalmente?**
`&&` para mostrar algo o nada, el ternario para elegir entre dos opciones y un `if` con `return` temprano (o devolver `null`) cuando cambia todo el componente o hay varios casos.

**¿Por qué a veces aparece un 0 en pantalla con `&&`?**
Porque `&&` devuelve el primer valor falsy, y si es `0`, React lo pinta (solo ignora `false`, `null` y `undefined`). Se evita convirtiendo la condición en booleano: `lista.length > 0 && ...`.

**¿Qué devuelve un componente que no quiere mostrar nada?**
`null`. React no pinta nada en ese lugar, pero el componente sigue montado y puede tener estado y efectos.
