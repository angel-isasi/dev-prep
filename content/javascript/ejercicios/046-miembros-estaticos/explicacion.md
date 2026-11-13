## Idea clave

Lo que declaras con `static` pertenece a la **clase**, no a los objetos que creas con ella. Hay un solo `#total` para toda la clase, y cada voto lo incrementa en su constructor. Como `desde` también llama a `new Voto(...)`, esos votos se cuentan solos. Y como `total` es un getter sin setter, desde fuera se puede leer pero no cambiar.

## Paso a paso

1. **`static #total = 0`**: un campo estático (uno solo para la clase) y privado (solo el código de la clase lo ve). Se crea una vez, cuando se define la clase.
2. **`static get total()`**: un getter estático. Se lee como `Voto.total` y devuelve `Voto.#total`. No defines `set total`, así que no hay forma de asignarlo.
3. **`constructor(corto)`**: `this.corto = corto` guarda el texto **en este voto**, y `Voto.#total++` suma 1 **en la clase**. Todo voto pasa por el constructor, así que el conteo nunca se escapa.
4. **`static desde(texto)`**: un método de fábrica. Limpia el texto con `trim()` (quita espacios de los extremos) y `toLowerCase()`, y devuelve `new Voto(textoLimpio)`. No duplica el conteo: lo hace el constructor.

```js
export class Voto {
  static #total = 0;

  static get total() {
    return Voto.#total;
  }

  static desde(texto) {
    return new Voto(texto.trim().toLowerCase());
  }

  constructor(corto) {
    this.corto = corto;
    Voto.#total++;
  }
}
```

## Por qué funciona

Sigue el contador de la clase y lo que se guarda en cada voto:

| Instrucción | `Voto.#total` después | Qué devuelve |
|---|---|---|
| (se carga el archivo) | `0` | |
| `Voto.desde("  Bajo La Arena ")` | `1` | un voto con `corto: "bajo la arena"` |
| `const v = new Voto("luz de desierto")` | `2` | un voto con `corto: "luz de desierto"` |
| `Voto.total` | `2` | `2` |
| `v.total` | `2` | `undefined` |
| `Voto.total = 100` | `2` | lanza `TypeError` |

Por qué `v.total` es `undefined`: `v` solo tiene la propiedad `corto`. Al buscar `total`, JavaScript mira en `v` y luego en `Voto.prototype` (donde están los métodos de instancia). Los miembros estáticos no están ahí, están en la función `Voto` misma, así que no los encuentra.

Por qué `Voto.total = 100` lanza error: `total` es una propiedad que solo tiene getter. Los módulos de JavaScript (archivos con `import`/`export`) corren en **modo estricto**, y en modo estricto asignar a una propiedad sin setter lanza un `TypeError` con el mensaje "Cannot set property total of class Voto ... which has only a getter" (en los puntos suspensivos aparece el código de la clase).

## Errores comunes

- **Guardar el contador en `this.total`.** Cada voto tendría su propio total y siempre valdría 1. El test "son de la clase, no de cada voto" falla porque `voto.total` deja de ser `undefined`.
- **Usar `static total = 0` (público) y hacer `Voto.total++`.** Cuenta bien, pero cualquiera puede escribir `Voto.total = 100` y romper la cuenta. Falla el test de solo lectura.
- **Sumar 1 dentro de `desde` además del constructor.** Los votos hechos con `desde` cuentan doble: el test espera `antes + 2` y recibe `antes + 3`.
- **Escribir `this.#total++` dentro del constructor.** En el constructor, `this` es el voto nuevo, no la clase, y el voto no tiene `#total`: "Cannot read private member #total from an object whose class did not declare it". Usa `Voto.#total`.
- **Olvidar el `return` en `desde`.** Se crea el voto (y se cuenta), pero `desde` devuelve `undefined`.

## Otra forma de resolverlo

Antes de los campos estáticos, el contador se escondía en un **closure** de módulo: una variable en el archivo, fuera de la clase, que nadie más puede importar:

```js
let total = 0;

export class Voto {
  static get total() {
    return total;
  }

  static desde(texto) {
    return new Voto(texto.trim().toLowerCase());
  }

  constructor(corto) {
    this.corto = corto;
    total++;
  }
}
```

Como `total` no se exporta, es tan privado como `#total`. Además, dentro de un método estático puedes usar `this` en lugar de `Voto` (`return new this(...)`): en un método estático, `this` es la clase. Eso hace que `desde` funcione bien también en subclases.

**¿Cuál conviene?** `static #total` deja todo dentro de la clase, que es más ordenado y es lo que se espera hoy. La variable de módulo es válida y la verás en código más antiguo. Escribir `Voto.#total` en vez de `this.#total` en los estáticos es más explícito y evita confusiones con `this`.

## Cómo explicarlo en la entrevista

> "Uso miembros estáticos porque el total es de la clase, no de cada voto. Tengo un campo estático privado `#total` y un getter estático para leerlo; al no tener setter, es de solo lectura. El constructor es el único lugar donde sumo, así cuento todos los votos sin importar cómo se crearon. `desde` es un método de fábrica: limpia el texto y llama al constructor. Las instancias no ven los estáticos porque esos viven en la clase, no en su prototipo."

## Conceptos

- **Miembro estático (`static`)**: propiedad o método que pertenece a la clase y se usa como `Clase.miembro`.
- **Miembro de instancia**: propiedad o método que tiene cada objeto creado con `new`.
- **Campo estático privado (`static #campo`)**: uno solo para toda la clase y solo accesible desde dentro de ella.
- **Getter estático**: `static get nombre()`; se lee como `Clase.nombre`. Sin setter, es de solo lectura.
- **Método de fábrica**: método estático que prepara los datos y devuelve una instancia nueva, como `Array.from` o `Voto.desde`.
- **Modo estricto**: los módulos lo activan siempre; convierte errores silenciosos (como asignar a un getter) en errores visibles.
- **`trim()`**: devuelve una copia del texto sin espacios al inicio ni al final.
