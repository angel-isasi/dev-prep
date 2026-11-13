Escribe la función `montarBuscador(contenedor, nombres)` que arme un **buscador** dentro de `contenedor`: un campo de texto y debajo una lista que se filtra **mientras escribes**.

Tiene que agregar al contenedor, en este orden:

```html
<input type="search" placeholder="Buscar...">
<ul>
  <li>Ana</li>
  <li>Bruno</li>
  ...
</ul>
```

## Reglas

- Al montarlo, la lista muestra **todos** los nombres, en el orden del arreglo.
- Cada vez que cambia el texto del input (evento `input`), la lista muestra solo los nombres que **contienen** lo escrito.
- No distingue mayúsculas de minúsculas, e ignora los espacios al inicio y al final de lo escrito.
- Si ningún nombre coincide, la lista tiene un único `<li class="vacio">Sin resultados</li>`.
- Si borras el texto, vuelven a aparecer todos.
- No modifiques el arreglo `nombres`.
- Muestra los nombres con `textContent`.

## Ejemplos

```js
const caja = document.createElement("div");
montarBuscador(caja, ["Ana", "Bruno", "Mariana", "Luis", "Juan"]);

const input = caja.querySelector("input");
const lista = caja.querySelector("ul");

// Lo que hace el usuario al escribir "an":
input.value = "an";
input.dispatchEvent(new Event("input"));

[...lista.children].map((li) => li.textContent);
// ["Ana", "Mariana", "Juan"]

input.value = "  LU ";
input.dispatchEvent(new Event("input"));
// ["Luis"]

input.value = "zzz";
input.dispatchEvent(new Event("input"));
// ["Sin resultados"]  (un solo <li class="vacio">)
```

## Por qué importa

"Haz un buscador que filtre una lista" es probablemente el ejercicio práctico de DOM más pedido en entrevistas junior. Combina todo: eventos, leer `input.value`, `filter`, vaciar y volver a pintar una lista, y manejar el caso vacío.
