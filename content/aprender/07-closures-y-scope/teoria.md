## En una frase

El **scope** decide desde dónde se puede usar una variable, y un **closure** es una función que recuerda las variables del lugar donde fue creada, aunque ese lugar ya haya terminado de ejecutarse.

## Lo esencial

### Tres niveles de scope

```js
const app = "dev-prep";        // global: se ve en todo el archivo

function probar() {
  const nombre = "Ana";        // de función: solo dentro de probar
  if (true) {
    let x = 1;                 // de bloque: solo dentro de las llaves del if
    var y = 2;                 // var IGNORA el bloque: vive en toda la función
  }
  console.log(app, nombre);    // "dev-prep" "Ana"
  console.log(y);              // 2
  console.log(x);              // ReferenceError: x is not defined
}
```

| | `var` | `let` | `const` |
|---|---|---|---|
| Scope | función | bloque `{ }` | bloque `{ }` |
| Se puede reasignar | sí | sí | no |
| Si la usas antes de su línea | `undefined` | ReferenceError | ReferenceError |

Regla práctica: `const` por defecto, `let` si vas a reasignar, `var` nunca.

### Scope léxico

Cuando usas una variable, JavaScript la busca primero en el scope actual y luego hacia afuera, según **dónde está escrito** el código, no desde dónde se llama la función.

```js
const color = "rojo";

function mostrar() {
  console.log(color);
}

function otra() {
  const color = "azul";
  mostrar();
}

otra();   // "rojo": mostrar se escribió afuera, así que ve el color de afuera
```

### Closure

```js
function crearContador() {
  let cuenta = 0;
  return function () {
    cuenta++;
    return cuenta;
  };
}

const contar = crearContador();
contar();   // 1
contar();   // 2

const otro = crearContador();
otro();     // 1  (cada llamada a crearContador crea su propia cuenta)
```

`crearContador` ya terminó, pero la función que devolvió sigue viendo `cuenta`. Eso es un closure: **la función más las variables que la rodeaban al nacer**. Guarda la variable viva, no una copia de su valor.

### Estado privado

```js
function crearCuenta(saldoInicial) {
  let saldo = saldoInicial;
  return {
    depositar(monto) {
      saldo += monto;
    },
    verSaldo() {
      return saldo;
    },
  };
}

const cuenta = crearCuenta(100);
cuenta.depositar(50);
cuenta.verSaldo();   // 150
cuenta.saldo;        // undefined: desde afuera no hay forma de tocarlo
```

Así se protegen datos sin clases: solo los métodos que tú devuelves pueden leer o cambiar `saldo`.

### El clásico: `var` en un bucle con `setTimeout`

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0);
}
// 3, 3, 3

for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 0);
}
// 0, 1, 2
```

Con `var` hay **una sola** `i` para todo el bucle. Los `setTimeout` se ejecutan cuando el bucle ya terminó, y para entonces `i` vale 3. Con `let`, cada vuelta crea **una `j` nueva**, y cada callback recuerda la suya.

### Hoisting y TDZ

Antes de ejecutar un scope, JavaScript registra todas sus declaraciones ("las sube"). Lo que cambia es con qué valor quedan:

```js
console.log(a);   // undefined
var a = 1;

console.log(b);   // ReferenceError: Cannot access 'b' before initialization
let b = 2;

saludar();        // "hola"
function saludar() {
  console.log("hola");
}
```

| Declaración | Antes de su línea vale |
|---|---|
| `var x` | `undefined` |
| `let x` / `const x` | no se puede tocar: ReferenceError |
| `function f() {}` | la función completa: ya se puede llamar |
| `const f = () => {}` | igual que `const`: ReferenceError |

La **TDZ** (zona muerta temporal) es el tramo entre el inicio del bloque y la línea del `let` o `const`: la variable ya existe, pero tocarla lanza error.

## Errores típicos

**1. `var` en un bucle con callbacks.** Todos los callbacks comparten la misma variable y ven su valor final.

```js
const botones = [];
for (var i = 0; i < 3; i++) {
  botones.push(() => i);
}
botones[0]();   // 3, no 0
```

Usa `let` en el bucle y cada vuelta tendrá su propia `i`.

**2. Creer que el closure guarda una foto del valor.** Guarda la variable; si cambia, el closure ve el cambio.

```js
let mensaje = "hola";
const decir = () => mensaje;
mensaje = "chau";
decir();   // "chau"
```

**3. Poner el estado fuera de la fábrica.** Todos los contadores terminan compartiéndolo.

```js
let cuenta = 0;                         // afuera: una sola para todos
function crearContador() {
  return () => ++cuenta;
}
const a = crearContador();
const b = crearContador();
a();   // 1
b();   // 2  (esperabas 1)
```

La variable va **dentro** de `crearContador`, para que cada llamada cree la suya.

**4. Tocar un `let` antes de su línea (TDZ),** aunque exista otra variable con el mismo nombre afuera.

```js
let precio = 10;
function total() {
  console.log(precio);   // ReferenceError, no 10
  let precio = 20;
}
```

El `let precio` de adentro "tapa" al de afuera desde el inicio de la función, pero recién se puede usar después de su línea.

**5. Sombrear (shadowing) sin querer.** Declarar de nuevo crea otra variable; la de afuera no cambia.

```js
let usuario = null;
function login() {
  let usuario = "Ana";   // variable NUEVA, solo vive aquí
}
login();
usuario;   // null
```

Si querías cambiar la de afuera, escribe `usuario = "Ana"`, sin `let`.

## Chuleta

- Scope: global, de función y de bloque. `let` y `const` respetan las llaves; `var` solo respeta funciones.
- Las variables se buscan de adentro hacia afuera según **dónde está escrito** el código (scope léxico).
- **Closure** = función + las variables del lugar donde nació. Guarda la variable viva, no una copia.
- Cada llamada a una función fábrica crea variables nuevas: estado independiente y privado.
- `var` + bucle + callback = todos ven el valor final. Con `let`, cada vuelta tiene su variable.
- Hoisting: `var` vale `undefined` antes de su línea; `let` y `const` lanzan ReferenceError (TDZ); las declaraciones `function` se pueden llamar antes.
- `const` por defecto, `let` si reasignas, `var` nunca.

## En la entrevista

**¿Qué es un closure?**
Es una función que recuerda las variables del scope donde fue creada, incluso después de que ese scope terminó. Por ejemplo, una función `crearContador` que tiene `let cuenta = 0` y devuelve una función que la incrementa: la función devuelta sigue accediendo a `cuenta` aunque `crearContador` ya terminó.

**¿Para qué sirven en el trabajo real?**
Para estado privado (datos que nadie puede tocar desde afuera), fábricas de funciones, funciones como `once` o `debounce`, y listeners que recuerdan datos. En React, los hooks funcionan sobre closures: cada render crea funciones que recuerdan las props y el estado de ese render.

**¿Por qué este bucle con `var` y `setTimeout` imprime 3, 3, 3? ¿Cómo lo arreglas?**
Porque `var` tiene scope de función: hay una sola `i` compartida, y los callbacks se ejecutan cuando el bucle ya terminó y `i` vale 3. Se arregla con `let`, que crea una variable nueva por vuelta. Antes de `let` se usaba una IIFE para capturar el valor en cada vuelta.

**¿Diferencia entre `var`, `let` y `const`?**
`var` tiene scope de función y vale `undefined` antes de su línea. `let` y `const` tienen scope de bloque y están en la TDZ hasta su línea. `const` no se puede reasignar, aunque si guarda un objeto o arreglo, su contenido sí se puede modificar.

**¿Qué es el hoisting? ¿Y la TDZ?**
Hoisting es que JavaScript registra las declaraciones antes de ejecutar el scope. Con `var` la variable existe desde el inicio con `undefined`; las declaraciones `function` se pueden llamar antes de su línea. `let` y `const` también se registran, pero quedan en la zona muerta temporal: usarlas antes de su línea lanza ReferenceError.
