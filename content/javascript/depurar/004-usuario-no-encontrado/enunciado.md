## El problema

Soporte recibe varios reclamos: "Intento recuperar mi contraseña y la página dice **'No existe una cuenta con ese email'**, pero yo me registré con ese correo". Revisaron la base de datos y los usuarios sí están. Pasa con todos los emails, escritos en mayúsculas o en minúsculas.

## Qué debe hacer

`buscarPorEmail(usuarios, email)` devuelve el objeto del usuario cuyo email coincide, sin importar mayúsculas. Si no hay ninguno, devuelve `null`.

```js
const usuarios = [
  { id: 1, email: "ana@correo.com" },
  { id: 2, email: "Luis@Correo.com" },
];

buscarPorEmail(usuarios, "ANA@correo.com");   // { id: 1, email: "ana@correo.com" }
buscarPorEmail(usuarios, "luis@correo.com");  // { id: 2, email: "Luis@Correo.com" }
buscarPorEmail(usuarios, "nadie@correo.com"); // null
```

## Tu tarea

Encuentra el error y arréglalo cambiando lo mínimo.
