## En una frase

`this` es el objeto que **llama** a la función: no depende de dónde la escribiste sino de **cómo la llamas**, salvo en las funciones flecha, que no tienen `this` propio y usan el del lugar donde nacieron.

## Lo esencial

### La regla del punto

```js
const usuario = {
  nombre: "Ana",
  saludar() {
    return `Hola, soy ${this.nombre}`;
  },
};

usuario.saludar();   // "Hola, soy Ana": this es lo que está antes del punto
```

El mismo método, llamado desde otro objeto, usa el `this` de ese otro objeto:

```js
const luis = { nombre: "Luis", saludar: usuario.saludar };
luis.saludar();      // "Hola, soy Luis"
```

### Función suelta: el `this` se pierde

```js
const saludar = usuario.saludar;   // copias la función, no el objeto
saludar();
// TypeError: Cannot read properties of undefined (reading 'nombre')
```

Sin nada antes del punto, `this` es `undefined` en módulos (`import`/`export`), en clases y con `"use strict"`, que es como se escribe hoy. En un script antiguo sin modo estricto, `this` sería el objeto global (`window`) y saldría `"Hola, soy undefined"` sin error, que es peor porque el bug pasa desapercibido.

### Funciones flecha: no tienen `this` propio

Una flecha usa el `this` del código que la rodea. Por eso es mala como método, pero perfecta como callback **dentro** de un método:

```js
const equipo = {
  nombre: "Los Pumas",
  jugadores: ["Ana", "Luis"],

  listar() {
    // la flecha usa el this de listar, que es equipo
    return this.jugadores.map((j) => `${j} de ${this.nombre}`);
  },

  listarMal() {
    // una function normal tiene su propio this: aquí es undefined
    // (en un módulo o en modo estricto; sin eso sería el objeto global)
    return this.jugadores.map(function (j) {
      return `${j} de ${this.nombre}`;   // TypeError
    });
  },
};

equipo.listar();   // ["Ana de Los Pumas", "Luis de Los Pumas"]
```

### `call`, `apply` y `bind`: elegir el `this` a mano

```js
function presentarse(saludo, signo) {
  return `${saludo}, soy ${this.nombre}${signo}`;
}
const ana = { nombre: "Ana" };

presentarse.call(ana, "Hola", "!");      // "Hola, soy Ana!"
presentarse.apply(ana, ["Hola", "!"]);   // "Hola, soy Ana!"
const deAna = presentarse.bind(ana);     // no ejecuta: devuelve una función nueva
deAna("Buenas", ".");                    // "Buenas, soy Ana."
```

| Método | ¿Ejecuta ya? | Argumentos | Devuelve |
|---|---|---|---|
| `call` | sí | separados por **c**omas | el resultado |
| `apply` | sí | en un **a**rreglo | el resultado |
| `bind` | no | opcionales, quedan fijos | una función con `this` fijo para siempre |

### Perder el `this` al pasar un método como callback

Pasar `obj.metodo` entrega **solo la función**. Quien la llame decide su `this`:

```js
class Contador {
  constructor() {
    this.clics = 0;
  }
  sumar() {
    this.clics++;
  }
}
const contador = new Contador();

[1, 2, 3].forEach(contador.sumar);              // TypeError: this es undefined
[1, 2, 3].forEach(() => contador.sumar());      // bien: se llama con el punto
[1, 2, 3].forEach(contador.sumar.bind(contador)); // bien: this fijado

// En el navegador pasa lo mismo:
boton.addEventListener("click", contador.sumar);              // this será el botón
boton.addEventListener("click", () => contador.sumar());      // bien
```

### `this` en clases

```js
class Persona {
  constructor(nombre) {
    this.nombre = nombre;   // con new, this es el objeto nuevo
  }
  saludar() {
    return `Hola, soy ${this.nombre}`;
  }
  saludarFlecha = () => `Hola, soy ${this.nombre}`;   // campo con flecha
}

const rosa = new Persona("Rosa");
const { saludar, saludarFlecha } = rosa;
saludarFlecha();   // "Hola, soy Rosa": la flecha quedó atada a la instancia
saludar();         // TypeError: las clases siempre están en modo estricto
```

### Resumen: ¿cuánto vale `this`?

| Cómo se llama la función | `this` |
|---|---|
| `obj.metodo()` | `obj` |
| `fn()` suelta | `undefined` (modo estricto) o el objeto global (scripts antiguos) |
| `fn.call(x)`, `fn.apply(x)`, `fn.bind(x)()` | `x` |
| `new Clase()` | el objeto recién creado |
| Función flecha | el `this` del lugar donde se escribió |
| Listener normal en `addEventListener` | el elemento que tiene el listener |

## Errores típicos

**1. Usar una flecha como método de objeto.** No tiene `this` propio y toma el de afuera.

```js
const gato = {
  nombre: "Michi",
  hablar: () => `Soy ${this.nombre}`,
};
gato.hablar();   // en un módulo: TypeError (this es undefined)
```

Escribe los métodos con la forma corta `hablar() { ... }`.

**2. Sacar el método del objeto.** Al guardarlo en una variable o desestructurarlo, deja de tener un objeto delante.

```js
const { saludar } = usuario;
saludar();   // TypeError: Cannot read properties of undefined (reading 'nombre')
```

**3. Pasar un método como callback.** `forEach`, `setTimeout` y `addEventListener` lo llaman sin tu objeto.

```js
setTimeout(usuario.saludar, 1000);   // this no será usuario
```

Envuélvelo: `setTimeout(() => usuario.saludar(), 1000)`, o usa `usuario.saludar.bind(usuario)`.

**4. Usar `function` dentro de un método.** La función interna tiene su propio `this`. En un módulo o en modo estricto es `undefined` y lanza TypeError; sin modo estricto es el objeto global y sale `undefined` en el texto.

```js
const tienda = {
  nombre: "Bodega Lucho",
  etiquetar(productos) {
    return productos.map(function (p) {
      return `${p} - ${this.nombre}`;   // TypeError: this es undefined
    });
  },
};
```

Usa una flecha en el `map`: ``(p) => `${p} - ${this.nombre}` ``.

**5. Confundir `bind` con `call`.** `call` ejecuta en el momento; `bind` devuelve una función para después.

```js
boton.addEventListener("click", contador.sumar.call(contador));
// sumar se ejecutó YA, una vez, y el listener recibió undefined
```

Para registrar un listener se usa `bind` (o una flecha), nunca `call`.

## Chuleta

- `this` = lo que está antes del punto **al momento de llamar**.
- Sin punto: `undefined` en módulos, clases y modo estricto.
- Flecha: no tiene `this`, usa el de afuera. Sí para callbacks dentro de métodos; no como método.
- `call(obj, a, b)` y `apply(obj, [a, b])` ejecutan ya; `bind(obj)` devuelve una función atada.
- Pasar `obj.metodo` como callback pierde el `this`: usa `() => obj.metodo()` o `obj.metodo.bind(obj)`.
- `new Clase()`: `this` es la instancia nueva.
- Un `bind` es para siempre: ni otro `bind` ni `call` lo cambian.

## En la entrevista

**¿Qué es `this` en JavaScript?**
Es una referencia al objeto que está ejecutando la función, y se decide al momento de la llamada, no al definirla. En `obj.metodo()` es `obj`; en una función suelta es `undefined` en modo estricto; con `new` es el objeto nuevo; con `call`, `apply` o `bind` es el que tú indiques. Las flechas son la excepción: no tienen `this` propio y usan el del scope donde se escribieron.

**¿Cuál es la diferencia entre `call`, `apply` y `bind`?**
Los tres fijan el `this`. `call` ejecuta la función ya, con argumentos separados por comas; `apply` también la ejecuta ya, pero con los argumentos en un arreglo; `bind` no la ejecuta, devuelve una función nueva con el `this` fijado para siempre.

**¿Por qué no se usan funciones flecha como métodos de un objeto?**
Porque no tienen `this` propio: tomarían el `this` de afuera del objeto (en un módulo, `undefined`) y no el objeto. Sí se usan dentro de los métodos, en callbacks como `map` o `setTimeout`, justamente para conservar el `this` del método.

**Pasé un método a `addEventListener` y `this` no es mi objeto, ¿por qué y cómo lo arreglas?**
Porque al pasar `obj.metodo` pasas solo la función; el navegador la llama con `this` igual al elemento del evento. Lo arreglo con una flecha, `() => obj.metodo()`, o con `obj.metodo.bind(obj)`. Si después necesito `removeEventListener`, guardo la función atada en una variable para usar la misma referencia.

**¿Qué hace `new`?**
Crea un objeto vacío, lo enlaza al prototipo de la clase, ejecuta el constructor con `this` apuntando a ese objeto y lo devuelve (a menos que el constructor devuelva otro objeto).
