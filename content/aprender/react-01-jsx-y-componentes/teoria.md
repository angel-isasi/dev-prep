## En una frase

Un componente es una **función que devuelve JSX**: una descripción de lo que quieres ver en pantalla; React la llama y se encarga de pintar el HTML.

## Lo esencial

### Un componente es una función

```jsx
function Saludo() {
  return <h1>Hola, Lima</h1>;
}
// Se ve: Hola, Lima  (como <h1>)
```

- El nombre empieza con **mayúscula** (`Saludo`, no `saludo`). Así React sabe que es un componente y no una etiqueta HTML.
- Devuelve JSX (o `null` si no quiere pintar nada).
- Se usa como si fuera una etiqueta: `<Saludo />`.

### JSX: HTML dentro de JavaScript (con algunas diferencias)

JSX parece HTML, pero se convierte en llamadas de JavaScript. Por eso tiene sus reglas:

```jsx
function Tarjeta() {
  const nombre = "Margarita";
  const precio = 28;
  return (
    <article className="tarjeta">
      <h2>{nombre.toUpperCase()}</h2>
      <p>Precio: S/ {precio.toFixed(2)}</p>
      <img src="/pizza.png" alt="Pizza" />
      <label htmlFor="cantidad">Cantidad</label>
      <input id="cantidad" style={{ width: 60, color: "gray" }} />
    </article>
  );
}
// Se ve: MARGARITA / Precio: S/ 28.00 / la imagen / Cantidad [  ]
```

| HTML | JSX | Por qué |
|---|---|---|
| `class="x"` | `className="x"` | `class` es palabra reservada en JS |
| `for="id"` | `htmlFor="id"` | `for` también es reservada |
| `onclick="..."` | `onClick={fn}` | Atributos en camelCase y reciben una **función** |
| `style="color: red"` | `style={{ color: "red" }}` | `style` recibe un **objeto** |
| `<img>` `<br>` `<input>` | `<img />` `<br />` `<input />` | Toda etiqueta se cierra |
| `<!-- comentario -->` | `{/* comentario */}` | Es un comentario de JS |

Si el JSX ocupa varias líneas, envuélvelo en **paréntesis** después del `return`.

### Llaves `{}`: aquí va JavaScript

Dentro de `{}` puedes poner **cualquier expresión** (algo que da un valor): variables, cuentas, llamadas a funciones, ternarios, `map`.

```jsx
<p>{2 + 3}</p>                    // 5
<p>{usuario.nombre}</p>           // Ana
<p>{edad >= 18 ? "Adulto" : "Menor"}</p>
<p>{true}{false}{null}{undefined}</p> // (vacío: no pintan nada)
<p>{0}</p>                        // 0  (los números sí se pintan)
```

**No** puedes poner sentencias como `if`, `for` o `const`: esas van antes del `return`.

### Un solo elemento padre y fragmentos

Un componente devuelve **un solo** elemento raíz. Si no quieres un `<div>` de más, usa un fragmento `<>...</>`: agrupa sin agregar nada al HTML.

```jsx
function Encabezado() {
  return (
    <>
      <h1>Padre Gino</h1>
      <p>Pizzas al horno de leña</p>
    </>
  );
}
// En el HTML quedan <h1> y <p> sueltos, sin envoltorio.
```

### Componer: componentes dentro de componentes

```jsx
function Logo() {
  return <strong>Padre Gino</strong>;
}

function Barra() {
  return (
    <nav>
      <Logo /> | <Logo />
    </nav>
  );
}
// Se ve: Padre Gino | Padre Gino
```

Divides la pantalla en piezas pequeñas y las combinas. Cada pieza se puede reutilizar las veces que quieras.

### import y export

Cada componente suele vivir en su propio archivo `.jsx`.

```jsx
// Boton.jsx
export default function Boton() { return <button>OK</button>; } // por defecto (1 por archivo)
export function Icono() { return <i>★</i>; }                    // nombrado (todos los que quieras)

// App.jsx
import Boton, { Icono } from "./Boton.jsx";
// default: sin llaves y con el nombre que tú elijas
// nombrado: con llaves y con el nombre exacto
```

### Cómo se monta una app

```jsx
// main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

`index.html` tiene un `<div id="root"></div>` vacío. `createRoot` toma ese div y React pinta ahí todo el árbol de componentes, empezando por `App`. `StrictMode` solo agrega revisiones extra en desarrollo. Desde React 17 no necesitas `import React from "react"` para usar JSX.

## Errores típicos

**1. Devolver dos elementos sin padre**

```jsx
function Info() {
  return <h1>Título</h1><p>Texto</p>; // Error de sintaxis al compilar
}
```
Un `return` solo puede devolver una cosa. Envuélvelos en `<>...</>` o en un `<div>`.

**2. Nombre del componente en minúscula**

```jsx
function saludo() { return <p>Hola</p>; }
function App() { return <saludo />; }
// En el HTML queda <saludo></saludo> vacío y no se ve "Hola"
```
Con minúscula, React cree que es una etiqueta HTML (como `<div>`). Los componentes van con **Mayúscula**.

**3. Escribir atributos como en HTML**

```jsx
<label class="campo" for="email">Correo</label>
<button onclick={guardar}>Guardar</button>
```
Con `class` y `for` React igual pinta el atributo, pero muestra advertencias en consola ("Did you mean `className`?"). `onclick` en minúscula **no hace nada** al hacer clic. Usa `className`, `htmlFor` y `onClick`.

**4. `style` como texto**

```jsx
<p style="color: red">Agotado</p> // Error: style espera un objeto
```
Escribe `style={{ color: "red" }}`: las llaves de fuera son "aquí va JS" y las de dentro son el objeto. Las propiedades van en camelCase: `fontSize`, `backgroundColor`.

**5. Pintar un objeto entero**

```jsx
const usuario = { nombre: "Ana" };
<p>{usuario}</p> // Error: Objects are not valid as a React child
```
React sabe pintar textos, números, JSX y arreglos de esas cosas, pero no objetos. Pinta una propiedad: `{usuario.nombre}`.

**6. Mezclar import por defecto y nombrado**

```jsx
// Boton.jsx
export default function Boton() { /* ... */ }
// App.jsx
import { Boton } from "./Boton.jsx"; // Falla: no existe un export nombrado "Boton"
```
Si se exportó con `default`, se importa **sin llaves**: `import Boton from "./Boton.jsx"`.

## Chuleta

- Componente = función con nombre en **Mayúscula** que devuelve JSX (o `null`).
- Se usa como `<MiComponente />`.
- `{}` = expresión de JS. Nada de `if`/`for` adentro.
- `true`, `false`, `null`, `undefined` no se pintan. `0` y `NaN` **sí**.
- `className`, `htmlFor`, `onClick`, `style={{ ... }}`, etiquetas siempre cerradas.
- Un solo padre: usa `<>...</>` para no agregar `<div>` de más.
- `export default X` → `import X from`; `export function Y` → `import { Y } from`.
- Montar: `createRoot(document.getElementById("root")).render(<App />)`.

## En la entrevista

**¿Qué es JSX?**
Es una sintaxis que parece HTML pero se escribe dentro de JavaScript. Al compilar se convierte en llamadas que crean objetos (elementos de React) que describen la interfaz; el navegador nunca ve JSX.

**¿Qué es un componente en React?**
Es una función que recibe props y devuelve JSX. Sirve para dividir la interfaz en piezas reutilizables e independientes; su nombre empieza con mayúscula para diferenciarlo de las etiquetas HTML.

**¿Por qué se usa `className` y no `class`?**
Porque JSX es JavaScript y `class` es una palabra reservada del lenguaje. Además, `className` es el nombre de esa propiedad en el DOM (`elemento.className`).

**¿Qué es un fragmento y para qué sirve?**
Es `<>...</>` (o `<Fragment>`): permite devolver varios elementos sin agregar un nodo extra al HTML. Útil cuando un `<div>` de más rompería el diseño o el HTML semántico, por ejemplo dentro de una tabla o una lista.

**¿Cómo arranca una aplicación de React?**
En `main.jsx`, `createRoot` toma un elemento del HTML (normalmente `<div id="root">`) y `render(<App />)` pinta ahí el componente raíz; desde `App` se arma todo el árbol de componentes.
