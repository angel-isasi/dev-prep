## Idea clave

Un `return` dentro del callback de `forEach` solo termina **esa vuelta del callback**, no la función de afuera. Además, `forEach` descarta lo que devuelve el callback. La variable `encontrado` nunca se actualiza, así que `buscarPorEmail` siempre devuelve `null`.

## Paso a paso

1. **Lee el síntoma.** Falla con **todos** los emails, existan o no. Si fuera un problema de mayúsculas, al menos los emails escritos igual funcionarían.
2. **Reprodúcelo.** `buscarPorEmail(usuarios, "rosa@correo.com")` con el email exacto devuelve `null`. Eso descarta la comparación.
3. **Sigue el valor que se devuelve.** La función devuelve `encontrado`. ¿Dónde se le asigna algo? Solo en `let encontrado = null`. Nunca cambia.
4. **Mira el `return usuario`.** Está dentro de `(usuario) => { ... }`, que es otra función. Devuelve el usuario a `forEach`, que lo ignora.
5. **Guarda el usuario en la variable.**

```js
usuarios.forEach((usuario) => {
  if (usuario.email.toLowerCase() === buscado) encontrado = usuario;
});
return encontrado;
```

## Por qué funciona

Hay **dos funciones**: `buscarPorEmail` y la flecha que le pasas a `forEach`. Cada `return` pertenece a la función más cercana que lo rodea. Al asignar `encontrado = usuario`, el dato sale de la flecha a través de una variable que vive en `buscarPorEmail` (la flecha la ve gracias al closure), y esa función sí la devuelve al final.

El objeto que se guarda es el mismo de la lista (no una copia), por eso el test con `toBe` pasa.

## Errores comunes

- **Cambiar `return usuario` por `return true`** o por cualquier otro valor: `forEach` ignora todo lo que devuelva el callback, sea lo que sea.
- **Escribir `return usuarios.forEach(...)`**: `forEach` siempre devuelve `undefined`, así que ahora la función devuelve `undefined` en vez de `null`.
- **Pensar que el problema son las mayúsculas** y agregar más `toLowerCase()`. La comparación siempre estuvo bien.

## Otra forma de resolverlo

`find` está hecho justo para esto: devuelve el primer elemento que cumple la condición, o `undefined` si ninguno la cumple. Además se detiene apenas encuentra uno, mientras que `forEach` recorre siempre toda la lista.

```js
export function buscarPorEmail(usuarios, email) {
  const buscado = email.toLowerCase();
  return usuarios.find((u) => u.email.toLowerCase() === buscado) ?? null;
}
```

Un `for...of` con `return` adentro también funciona, porque ahí el `return` sí es de `buscarPorEmail`.

## Cómo explicarlo en la entrevista

> "Fallaba con todos los emails, así que el problema no era la comparación. El `return` estaba dentro del callback de `forEach`, y eso solo sale del callback; `forEach` ignora lo que devuelve. La variable que la función retornaba nunca cambiaba. Lo arreglé asignando el usuario a esa variable, aunque lo ideal es usar `find`, que devuelve el elemento y además corta apenas lo encuentra."

## Conceptos

- **Callback**: una función que le pasas a otra para que la llame (aquí, la flecha que recibe `forEach`).
- **Alcance del `return`**: termina la función más cercana que lo contiene, no las de afuera.
- **`forEach`**: recorre el arreglo, ignora lo que devuelve el callback y siempre devuelve `undefined`.
- **`find`**: devuelve el primer elemento que cumple una condición y deja de recorrer.
- **`??`**: devuelve el lado derecho si el izquierdo es `null` o `undefined`.
