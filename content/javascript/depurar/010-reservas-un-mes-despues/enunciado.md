## El problema

Un restaurante usa nuestro formulario de reservas y reclama: "Los clientes eligen el **15/03** y en el correo de confirmación sale **15 de abril**. Y una clienta que reservó para el **31/01** recibió una confirmación para el **3 de marzo**".

## Qué debe hacer

`leerFecha(texto)` recibe la fecha como la escribe el usuario, `"DD/MM/AAAA"`, y devuelve un `Date` de ese mismo día a la medianoche (hora local).

```js
leerFecha("15/03/2026"); // 15 de marzo de 2026
leerFecha("31/01/2026"); // 31 de enero de 2026
leerFecha("01/12/2025"); // 1 de diciembre de 2025
```

## Tu tarea

Encuentra el error y arréglalo cambiando lo mínimo.
