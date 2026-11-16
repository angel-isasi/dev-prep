## El problema

Un compañero armó el menú lateral y te escribe: "Hice un manejador por botón, pero no importa cuál toque, **todos** muestran el mensaje `Elegiste: undefined (n.º 4)`. Y el menú solo tiene 3 opciones".

## Qué debe hacer

`crearAcciones(opciones)` devuelve un arreglo de funciones, una por opción. Al llamar la función de la posición `k`, devuelve el texto con **esa** opción y su número (contando desde 1).

```js
const acciones = crearAcciones(["Inicio", "Perfil", "Salir"]);

acciones[0](); // "Elegiste: Inicio (n.º 1)"
acciones[1](); // "Elegiste: Perfil (n.º 2)"
acciones[2](); // "Elegiste: Salir (n.º 3)"
```

## Tu tarea

Encuentra el error y arréglalo cambiando lo mínimo.
