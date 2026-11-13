## En una frase

Una función es un bloque de código reutilizable que recibe datos y devuelve un resultado; en JavaScript además es **un valor más**, así que puedes guardarla en una variable, pasarla a otra función (callback) o devolverla.

## Lo esencial

### Tres formas de crear una función

```js
// 1. Declaración
function sumar(a, b) {
  return a + b;
}

// 2. Expresión (una función guardada en una variable)
const restar = function (a, b) {
  return a - b;
};

// 3. Flecha
const multiplicar = (a, b) => a * b;   // return implícito
```

| | Declaración | Expresión | Flecha |
|---|---|---|---|
| ¿Se puede llamar antes de definirla? | sí | no | no |
| `return` implícito | no | no | sí, si no usas `{ }` |
| `this` propio | sí | sí | no (usa el de afuera) |
| `arguments` | sí | sí | no |

### Hoisting

Las **declaraciones** se elevan completas al inicio de su ámbito. Las expresiones y flechas guardadas en `const`/`let` no.

```js
saludar();        // "hola"
function saludar() {
  console.log("hola");
}

despedir();       // ReferenceError: Cannot access 'despedir' before initialization
const despedir = () => console.log("chau");
```

### return

```js
function sinReturn() {
  const x = 1 + 1;
}
sinReturn();                        // undefined: sin return, devuelve undefined

const doble = (n) => n * 2;         // sin llaves: devuelve n * 2
const dobleConLlaves = (n) => {
  return n * 2;                     // con llaves: return obligatorio
};
const crearUsuario = (nombre) => ({ nombre });   // objeto: envuélvelo en ( )
crearUsuario("Ana");                // { nombre: "Ana" }
```

`return` también **corta** la función: nada después de él se ejecuta.

### Parámetros por defecto

Se usan cuando el argumento no llega o llega como `undefined` (no con `null`).

```js
function saludar(nombre = "invitado") {
  return `Hola, ${nombre}`;
}
saludar();            // "Hola, invitado"
saludar(undefined);   // "Hola, invitado"
saludar(null);        // "Hola, null"
```

### Rest y spread

Los mismos tres puntos hacen cosas opuestas según dónde estén.

```js
// Rest: en los parámetros, JUNTA los argumentos en un array
function sumarTodos(...numeros) {
  return numeros.reduce((suma, n) => suma + n, 0);
}
sumarTodos(1, 2, 3);          // 6

// Spread: al llamar o dentro de [ ] / { }, DESARMA el array
const notas = [12, 18, 15];
Math.max(...notas);           // 18
const copia = [...notas, 20]; // [12, 18, 15, 20]
```

El rest va siempre al final: `function f(a, ...resto)`.

### Funciones como valores

```js
const gritar = (texto) => texto.toUpperCase();
const hablar = gritar;            // guardarla en otra variable
hablar("hola");                   // "HOLA"

function crearMultiplicador(factor) {
  return (n) => n * factor;       // devolver una función
}
const triple = crearMultiplicador(3);
triple(5);                        // 15
```

Una función que recibe o devuelve otra función se llama **función de orden superior** (`map`, `filter`, `setTimeout`, `addEventListener`).

### Callbacks

Un **callback** es una función que le pasas a otra para que **ella** la llame cuando corresponda.

```js
function repetir(veces, accion) {
  for (let i = 0; i < veces; i++) {
    accion(i);
  }
}
repetir(2, (i) => console.log(`vuelta ${i}`));
// "vuelta 0"
// "vuelta 1"

[1, 2, 3].map((n) => n * 10);     // [10, 20, 30]
```

Pasas la función **sin paréntesis** (`accion`), porque quieres entregarla, no ejecutarla.

## Errores típicos

1. **Flecha con llaves y sin `return`.**
   ```js
   const doble = (n) => { n * 2 };
   doble(4);   // undefined
   ```
   Con llaves, el `return` ya no es implícito. Quita las llaves o escribe `return`.

2. **Devolver un objeto desde una flecha sin paréntesis.**
   ```js
   const crear = () => { ok: true };
   crear();    // undefined
   ```
   Las llaves se leen como el cuerpo de la función. Escribe `() => ({ ok: true })`.

3. **Ejecutar el callback en vez de pasarlo.**
   ```js
   boton.addEventListener("click", guardar());   // se ejecuta YA, al cargar
   boton.addEventListener("click", guardar);     // se ejecuta al hacer clic
   ```
   Con `()` pasas lo que **devuelve** `guardar`, no la función.

4. **Llamar una expresión o flecha antes de definirla.**
   ```js
   calcular();   // ReferenceError: Cannot access 'calcular' before initialization
   const calcular = () => 42;
   ```
   Solo las declaraciones con `function` se elevan completas.

5. **Olvidar el `return` en una función normal.**
   ```js
   function area(base, altura) {
     base * altura;
   }
   area(2, 3);   // undefined
   ```

6. **Pasar un array donde se esperan argumentos sueltos.**
   ```js
   Math.max([3, 8, 1]);      // NaN
   Math.max(...[3, 8, 1]);   // 8
   ```

## Chuleta

| Necesito... | Escribo |
|---|---|
| función que pueda usar antes de definir | `function nombre() {}` |
| función corta | `const f = (x) => x * 2;` |
| devolver un objeto desde flecha | `() => ({ clave: valor })` |
| valor por defecto | `function f(x = 10) {}` (solo con `undefined`) |
| cantidad variable de argumentos | `function f(...args) {}` (rest, al final) |
| pasar un array como argumentos | `f(...array)` (spread) |
| callback | pasar `fn`, no `fn()` |
| sin `return` | la función devuelve `undefined` |
| flechas | sin `this` ni `arguments` propios |

## En la entrevista

- **¿Qué diferencia hay entre una declaración de función y una expresión de función?** La declaración se eleva completa (hoisting), así que puedes llamarla antes de la línea donde está escrita; la expresión se asigna a una variable y solo existe después de esa línea.
- **¿En qué se diferencian las funciones flecha de las normales?** Tienen sintaxis más corta con `return` implícito, y no tienen su propio `this` ni `arguments`: usan los del lugar donde se escribieron. Por eso no sirven como métodos que usan `this` ni como constructores.
- **¿Qué es un callback?** Una función que le pasas como argumento a otra para que esa otra la ejecute después, por ejemplo en `map`, `setTimeout` o `addEventListener`.
- **¿Cuál es la diferencia entre rest y spread?** Usan los mismos tres puntos: rest, en los parámetros, junta varios argumentos en un array; spread, al llamar o dentro de un array u objeto, desarma un iterable en elementos sueltos.
- **¿Qué significa que las funciones sean "ciudadanos de primera clase"?** Que son valores como cualquier otro: se pueden guardar en variables, pasar como argumento y devolver desde otra función. Eso es lo que permite callbacks, closures y funciones de orden superior.
