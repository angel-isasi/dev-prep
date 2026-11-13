Escribe y exporta dos clases: `Usuario` y `Editor`. Un editor **es un** usuario con un permiso extra, así que `Editor` debe **heredar** de `Usuario` en vez de repetir su código.

## Reglas

**`Usuario`**

- `new Usuario(nombre)` guarda el nombre en `this.nombre`.
- `puede(accion)`: devuelve `true` solo si la acción es `"leer"`. Para cualquier otra acción, `false`.
- `describir()`: devuelve `"<nombre> (<nombre de la clase>)"`. Para un usuario, `"Ana (Usuario)"`.

**`Editor`**

- Hereda de `Usuario`: tiene `nombre` y `describir()` sin volver a escribirlos.
- `puede(accion)`: devuelve `true` si la acción es `"publicar"` **o** si un usuario normal ya podía hacerla (o sea, `"leer"`). Reutiliza el método del padre, no copies la condición.
- `describir()` de un editor debe decir `"(Editor)"`, sin que escribas un `describir` nuevo en `Editor`.
- Un editor es `instanceof Editor` y también `instanceof Usuario`.

## Ejemplos

```js
const ana = new Usuario("Ana");
ana.puede("leer");      // true
ana.puede("publicar");  // false
ana.describir();        // "Ana (Usuario)"

const marilyn = new Editor("Marilyn");
marilyn.puede("leer");      // true   (lo hereda)
marilyn.puede("publicar");  // true   (su permiso extra)
marilyn.puede("borrar");    // false
marilyn.describir();        // "Marilyn (Editor)"
marilyn instanceof Usuario; // true
```

## Por qué importa

La herencia es una de las preguntas fijas de programación orientada a objetos: qué hace `extends`, para qué sirve `super` y cómo se sobrescribe un método. En React moderno casi no se usa herencia, pero la vas a encontrar en clases de errores (`class MiError extends Error`), en Web Components y en mucho código existente.
