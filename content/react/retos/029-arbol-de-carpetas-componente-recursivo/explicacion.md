## Idea clave

Un componente puede **usarse a sí mismo**. `Arbol` tiene un **caso base** (un archivo: se pinta y termina) y un **caso recursivo** (una carpeta: se pinta y, si está abierta, renderiza un `<Arbol>` por cada hijo). Cada `<Arbol>` es una instancia distinta con **su propio estado** `abierto`.

## Paso a paso

1. **Estado local:** `const [abierto, setAbierto] = useState(false)`. Cada carpeta del árbol tiene el suyo.
2. **Caso base:** si `!nodo.hijos`, devuelve `<li>📄 {nodo.nombre}</li>`. Sin esto, la recursión no terminaría.
3. **Carpeta:** un `<li>` con un `<button>` que alterna `abierto`. `aria-expanded` le dice al lector de pantalla si está abierta.
4. **Caso recursivo:** si está abierta, un `<ul>` con `nodo.hijos.map((hijo) => <Arbol key={hijo.nombre} nodo={hijo} />)`.
5. **Estructura HTML válida:** `Arbol` siempre devuelve un `<li>` y los hijos van dentro de un `<ul>`. Por eso quien lo usa lo envuelve en `<ul>`.

```jsx
import { useState } from "react";

// Cada nodo es { nombre, hijos? }. Si tiene `hijos`, es una carpeta; si no, un archivo.
export function Arbol({ nodo }) {
  const [abierto, setAbierto] = useState(false);

  // Caso base: un archivo no tiene hijos, no se abre ni se cierra.
  if (!nodo.hijos) {
    return <li>📄 {nodo.nombre}</li>;
  }

  return (
    <li>
      <button type="button" aria-expanded={abierto} onClick={() => setAbierto((a) => !a)}>
        {abierto ? "📂" : "📁"} {nodo.nombre}
      </button>
      {abierto && (
        <ul>
          {nodo.hijos.map((hijo) => (
            // Recursión: el componente se usa a sí mismo para cada hijo.
            <Arbol key={hijo.nombre} nodo={hijo} />
          ))}
        </ul>
      )}
    </li>
  );
}
```

Ojo: el `useState` va **antes** del `if` del caso base. Los hooks deben llamarse siempre, en el mismo orden, sin depender de condiciones.

## Por qué funciona

Con los datos del ejemplo, React arma un árbol de instancias:

| Acción | `Arbol(src)` | `Arbol(app)` | `Arbol(README.md)` | `Arbol(page.tsx)` | Se pinta |
|---|---|---|---|---|---|
| (inicio) | abierto: false | no existe | no existe | no existe | 📁 src |
| Clic en src | abierto: true | se monta, abierto: false | se monta | no existe | 📂 src, 📁 app, 📄 README.md |
| Clic en app | true | abierto: true | sigue | se monta | ... 📂 app, 📄 page.tsx |
| Clic en app | true | abierto: false | sigue | se desmonta | 📂 src, 📁 app, 📄 README.md |
| Clic en src | abierto: false | se desmonta | se desmonta | | 📁 src |

Cada `Arbol` recuerda su `abierto` porque React guarda el estado **por posición en el árbol**. Cerrar `app` no toca el estado de `src`. Un detalle: al cerrar `src`, `app` se desmonta y pierde su estado; si vuelves a abrir `src`, `app` aparece cerrada.

## Errores comunes

- **Olvidar el caso base.** Si tratas los archivos como carpetas, `nodo.hijos.map` falla con "Cannot read properties of undefined".
- **Un solo estado global de "abierto"** en el componente de más arriba (por ejemplo, un booleano). Abrir una carpeta abriría todas. Si necesitas controlar todo desde arriba, se guarda un `Set` de rutas abiertas (ver abajo).
- **Llamar `useState` después del `return` del caso base.** Rompe la regla de los hooks: en un render se llamaría y en otro no.
- **`key` repetida.** Usar el nombre como `key` funciona si no hay dos hijos con el mismo nombre en la misma carpeta (como en un sistema de archivos real). Si pudieran repetirse, usa un `id`.
- **`<li>` sin `<ul>`**: devolver `<li>` sueltos fuera de una lista es HTML inválido. Por eso los hijos van en un `<ul>` y el uso de ejemplo envuelve la raíz.

## Otra forma de resolverlo

**Estado controlado desde arriba** con un `Set` de rutas abiertas, útil para "expandir todo" o recordar qué estaba abierto:

```jsx
function Nodo({ nodo, ruta, abiertas, alternar }) {
  if (!nodo.hijos) return <li>📄 {nodo.nombre}</li>;
  const abierta = abiertas.has(ruta);
  return (
    <li>
      <button aria-expanded={abierta} onClick={() => alternar(ruta)}>{nodo.nombre}</button>
      {abierta && (
        <ul>
          {nodo.hijos.map((h) => (
            <Nodo key={h.nombre} nodo={h} ruta={`${ruta}/${h.nombre}`} abiertas={abiertas} alternar={alternar} />
          ))}
        </ul>
      )}
    </li>
  );
}
```

El componente padre guarda `const [abiertas, setAbiertas] = useState(new Set())` y `alternar` crea un `Set` nuevo agregando o quitando la ruta.

**¿Cuándo conviene?** Cuando algo de afuera necesita saber o cambiar qué está abierto (botón "colapsar todo", guardar en localStorage). Si cada carpeta es independiente, el estado local es más simple.

## Cómo explicarlo en la entrevista

> "Es un componente recursivo: se renderiza a sí mismo para cada hijo. El caso base es un archivo, que no tiene hijos y solo se pinta. Cada carpeta tiene su propio estado de abierta o cerrada, porque React guarda el estado por cada instancia, así que se abren de forma independiente. Uso `aria-expanded` en el botón para que sea accesible. Si me pidieran 'colapsar todo', subiría el estado al padre con un Set de rutas abiertas. Este patrón sirve para menús anidados, comentarios con respuestas o un explorador de archivos."

## Conceptos

- **Componente recursivo**: un componente que se renderiza a sí mismo.
- **Caso base**: la condición que detiene la recursión.
- **Estado por instancia**: cada uso de un componente tiene su propio estado.
- **Montar y desmontar**: al ocultar un componente, su estado se pierde.
- **Reglas de los hooks**: llamarlos siempre antes de cualquier `return` condicional.
- **`aria-expanded`**: indica si un elemento desplegable está abierto.
- **Listas anidadas** `<ul>` / `<li>` y `key` en cada nivel.
