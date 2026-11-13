Crea el componente `Arbol` que dibuja un árbol de carpetas y archivos, como el explorador de VS Code. Recibe la prop `nodo` con la forma `{ nombre, hijos? }`:

- Si el nodo tiene `hijos` (un arreglo), es una **carpeta**.
- Si no tiene `hijos`, es un **archivo**.

Los hijos pueden ser a su vez carpetas con más hijos, con cualquier profundidad. Por eso el componente debe ser **recursivo**: se usa a sí mismo para dibujar cada hijo.

## Reglas

- `Arbol` devuelve un `<li>`. Quien lo usa lo pone dentro de un `<ul>`.
- **Archivo:** un `<li>` con su nombre (puedes anteponer `📄`). No es un botón.
- **Carpeta:** un `<li>` con un `<button>` que contiene el nombre (puedes anteponer `📁` cerrada o `📂` abierta). El botón lleva `aria-expanded` en `true` o `false`.
- Las carpetas empiezan **cerradas**: sus hijos no están en el DOM.
- Clic en la carpeta: se abre y muestra sus hijos en un `<ul>` anidado. Otro clic: se cierra.
- Cada carpeta se abre y se cierra **por su cuenta**.

## Ejemplo

```jsx
const datos = {
  nombre: "src",
  hijos: [
    { nombre: "app", hijos: [{ nombre: "page.tsx" }] },
    { nombre: "README.md" },
  ],
};

<ul>
  <Arbol nodo={datos} />
</ul>
```

| Acción | Se ve |
|---|---|
| (inicio) | 📁 src |
| Clic en src | 📂 src, y dentro: 📁 app, 📄 README.md |
| Clic en app | 📂 app, y dentro: 📄 page.tsx |
| Clic en app otra vez | se cierra app; README.md sigue visible |

## Por qué importa

Menús anidados, comentarios con respuestas, categorías: todos son árboles. Evalúan si entiendes que un componente puede renderizarse a sí mismo (con un **caso base**) y que cada instancia tiene **su propio estado**.
