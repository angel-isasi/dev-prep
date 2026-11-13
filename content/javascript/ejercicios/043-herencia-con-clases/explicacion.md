## Idea clave

`extends` hace que `Editor` reciba todo lo de `Usuario` (constructor y métodos). En `Editor` solo escribes **lo que cambia**: el método `puede`. Para no repetir la regla del padre, `super.puede(accion)` llama a la versión de `Usuario`. Y `this.constructor.name` te dice con qué clase se creó el objeto, así un solo `describir` sirve para los dos.

## Paso a paso

1. **Constructor de `Usuario`**: `this.nombre = nombre` guarda el nombre en el objeto que se está creando.
2. **`puede` de `Usuario`**: `return accion === "leer"`. La comparación ya es un booleano.
3. **`describir`**: arma el texto con un template literal. `this.constructor` es la clase que se usó en el `new`, y toda clase tiene una propiedad `name` con su nombre como texto.
4. **`class Editor extends Usuario`**: `Editor` hereda todo. Como no le escribes `constructor`, JavaScript usa uno automático que le pasa los argumentos al padre: `new Editor("Marilyn")` termina guardando `this.nombre = "Marilyn"`.
5. **Sobrescribe `puede` en `Editor`**: si la acción es `"publicar"`, `true`; si no, delega en el padre con `super.puede(accion)`. Si mañana el usuario normal puede `"comentar"`, el editor también podrá sin tocar `Editor`.

```js
export class Usuario {
  constructor(nombre) {
    this.nombre = nombre;
  }

  puede(accion) {
    return accion === "leer";
  }

  describir() {
    return `${this.nombre} (${this.constructor.name})`;
  }
}

export class Editor extends Usuario {
  puede(accion) {
    return accion === "publicar" || super.puede(accion);
  }
}
```

## Por qué funciona

Cuando llamas a un método, JavaScript lo busca primero en el objeto, luego en la clase del objeto y luego en la clase padre. Con `const e = new Editor("Marilyn")`:

| Llamada | Dónde lo encuentra | Qué pasa | Resultado |
|---|---|---|---|
| `e.puede("publicar")` | en `Editor` | `"publicar" === "publicar"` es `true`; el `\|\|` ya no evalúa lo de la derecha | `true` |
| `e.puede("leer")` | en `Editor` | `"leer" === "publicar"` es `false`, entonces llama `super.puede("leer")`, que es `"leer" === "leer"` | `true` |
| `e.puede("borrar")` | en `Editor` | `false`, y `super.puede("borrar")` también `false` | `false` |
| `e.describir()` | no está en `Editor`, sube a `Usuario` | `this` sigue siendo `e`, y `e.constructor` es `Editor` | `"Marilyn (Editor)"` |

El último caso es la clave: aunque `describir` está escrito en `Usuario`, `this` es el objeto sobre el que lo llamaste (el editor). Por eso `this.constructor.name` da `"Editor"` y no `"Usuario"`.

`e instanceof Usuario` es `true` porque `Usuario` está en la cadena de herencia de `e`: `e` viene de `Editor`, y `Editor` viene de `Usuario`.

## Errores comunes

- **Escribir un constructor en `Editor` sin llamar a `super(nombre)`.** Si pones `constructor(nombre) { this.nombre = nombre; }`, JavaScript lanza "Must call super constructor in derived class before accessing 'this'". En una subclase, `super(...)` debe ir **antes** de usar `this`. O no escribas constructor si no lo necesitas.
- **Copiar la condición del padre:** `return accion === "publicar" || accion === "leer"`. Pasa los tests, pero si cambia la regla del usuario tienes que acordarte de cambiarla en dos sitios. Para eso existe `super.puede`.
- **Llamar `this.puede(accion)` en vez de `super.puede(accion)` dentro de `Editor`.** `this.puede` es el mismo método del editor, que se llama a sí mismo sin fin: "Maximum call stack size exceeded".
- **Escribir el nombre fijo en `describir`:** `` `${this.nombre} (Usuario)` ``. El editor diría `"Marilyn (Usuario)"`. Usa `this.constructor.name`.
- **Olvidar `extends`.** `Editor` no tiene `describir` ni `nombre`, y `instanceof Usuario` da `false`.

## Otra forma de resolverlo

En vez de leer el nombre de la clase, cada clase podría declarar su rol, y `Editor` sobrescribir también `describir` usando `super`:

```js
export class Usuario {
  constructor(nombre) {
    this.nombre = nombre;
  }
  puede(accion) {
    return accion === "leer";
  }
  describir() {
    return `${this.nombre} (Usuario)`;
  }
}

export class Editor extends Usuario {
  puede(accion) {
    return accion === "publicar" || super.puede(accion);
  }
  describir() {
    return super.describir().replace("Usuario", "Editor");
  }
}
```

Funciona, pero es más frágil: depende de reemplazar un texto. Una variante más limpia es un getter `get rol() { return "Usuario"; }` en el padre que `Editor` sobrescribe con `"Editor"`, y `describir` usa `this.rol`.

**¿Cuál conviene?** `this.constructor.name` es la más corta y se adapta sola a cualquier subclase nueva. El getter `rol` conviene cuando el texto que muestras no coincide con el nombre de la clase (por ejemplo, "Administrador" para `class Admin`). Ojo: si el código se minifica para producción, los nombres de clase pueden cambiar, y ahí el getter es más seguro.

## Cómo explicarlo en la entrevista

> "`Editor` extiende a `Usuario`, así que hereda el constructor y los métodos. Solo sobrescribo `puede`: si la acción es publicar, devuelvo true, y si no, le pregunto al padre con `super.puede`, para no duplicar su lógica. En `describir` uso `this.constructor.name`: como `this` es el objeto real, en un editor da 'Editor' aunque el método esté definido en `Usuario`. Por la herencia, un editor es `instanceof` de las dos clases."

## Conceptos

- **`extends`**: crea una clase hija que hereda constructor y métodos de la clase padre.
- **`super.metodo()`**: llama a la versión del padre de un método desde la clase hija.
- **`super(...)`**: en el constructor de una clase hija, llama al constructor del padre; va antes de usar `this`.
- **Sobrescribir (override)**: definir en la hija un método con el mismo nombre que en el padre para cambiar su comportamiento.
- **`this` en métodos heredados**: siempre es el objeto sobre el que llamaste el método, no la clase donde está escrito.
- **`this.constructor.name`**: el nombre de la clase con la que se creó el objeto.
- **`instanceof`**: comprueba si una clase está en la cadena de herencia de un objeto.
