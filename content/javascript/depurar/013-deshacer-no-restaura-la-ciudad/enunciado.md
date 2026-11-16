## El problema

QA reporta dos fallas en la pantalla **"Editar perfil"**:

1. Al cambiar la ciudad, el recuadro **"Antes"** también muestra la ciudad nueva.
2. El botón **"Deshacer"** ya no restaura nada: el usuario guardado como "antes" tiene la ciudad nueva.

El compañero que lo programó dice: "No entiendo, si hago una copia con spread justamente para no tocar el original".

## Qué debe hacer

`cambiarCiudad(usuario, ciudad)` devuelve un usuario **nuevo** con la ciudad cambiada. Ni el usuario original ni su dirección se modifican.

```js
const antes = { nombre: "Ana", direccion: { calle: "Av. Sol 123", ciudad: "Lima" } };
const despues = cambiarCiudad(antes, "Cusco");

despues.direccion.ciudad; // "Cusco"
antes.direccion.ciudad;   // "Lima" (sigue igual)
```

## Tu tarea

Encuentra el error y arréglalo cambiando lo mínimo.
