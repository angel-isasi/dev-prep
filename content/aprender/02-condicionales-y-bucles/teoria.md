## En una frase

Los condicionales eligen **qué** código se ejecuta según una condición y los bucles repiten código **mientras** haga falta; dominar el orden de las condiciones y cuándo cortar un bucle es la mitad de cualquier ejercicio de entrevista.

## Lo esencial

### if / else y el return temprano

```js
function precioFinal(precio, esSocio) {
  if (precio < 0) return null;          // descarta lo inválido primero
  if (esSocio) return precio * 0.9;
  return precio;
}
precioFinal(100, true);   // 90
precioFinal(-5, false);   // null
```

Cada `return` corta la función: así evitas anidar `else` dentro de `else`.

### Ternario

Para elegir **un valor** entre dos. Formato: `condición ? siEsVerdad : siEsFalso`.

```js
const edad = 20;
const tipo = edad >= 18 ? "adulto" : "menor";   // "adulto"
```

Si necesitas más de dos opciones, usa `if` o `switch`: los ternarios anidados cuestan leer.

### switch

Compara un valor contra varios `case` usando `===`. Sin `break` (o `return`), **sigue ejecutando** el `case` de abajo.

```js
function emoji(estado) {
  switch (estado) {
    case "ok":
      return "✅";
    case "error":
    case "fallo":          // dos case con el mismo resultado
      return "❌";
    default:
      return "❓";
  }
}
emoji("fallo");   // "❌"
```

### &&, || y ?? (cortocircuito)

No devuelven `true`/`false`: devuelven **uno de los dos valores**.

| Expresión | Resultado | Regla |
|---|---|---|
| `"Ana" \|\| "anónimo"` | `"Ana"` | `\|\|` devuelve el primer truthy |
| `"" \|\| "anónimo"` | `"anónimo"` | |
| `0 \|\| 10` | `10` | ojo: el 0 se pierde |
| `0 ?? 10` | `0` | `??` solo reemplaza `null` y `undefined` |
| `null ?? 10` | `10` | |
| `"Ana" && "ok"` | `"ok"` | `&&` devuelve el primer falsy, o el último |
| `0 && "ok"` | `0` | |

```js
const usuario = { nombre: "Ana" };
usuario.logueado && console.log("Bienvenida");   // no imprime nada
```

### Encadenamiento opcional ?.

Lee una propiedad sin explotar si lo anterior es `null` o `undefined`.

```js
const pedido = { cliente: null };
pedido.cliente.nombre;              // TypeError: Cannot read properties of null
pedido.cliente?.nombre;             // undefined
pedido.cliente?.nombre ?? "Anónimo" // "Anónimo"
```

### for y while

```js
for (let i = 0; i < 3; i++) {
  console.log(i);         // 0, 1, 2
}

let intentos = 0;
while (intentos < 3) {
  intentos++;             // sin esto, bucle infinito
}
console.log(intentos);    // 3
```

Usa `for` cuando sabes cuántas vueltas das, y `while` cuando depende de una condición.

### for...of vs for...in

| | `for...of` | `for...in` |
|---|---|---|
| Recorre | los **valores** | las **claves** (como string) |
| Úsalo con | arrays, strings | objetos |

```js
const frutas = ["mango", "lúcuma"];
for (const fruta of frutas) console.log(fruta);   // "mango", "lúcuma"
for (const i in frutas) console.log(i);           // "0", "1"  (strings)

const precios = { mango: 3, lúcuma: 5 };
for (const clave in precios) console.log(clave, precios[clave]);
// "mango" 3
// "lúcuma" 5
```

### break y continue

`break` sale del bucle; `continue` salta a la siguiente vuelta.

```js
for (const n of [1, -2, 3, 0, 5]) {
  if (n === 0) break;       // al ver 0, termina
  if (n < 0) continue;      // los negativos se saltan
  console.log(n);           // 1, 3
}
```

`forEach` no admite `break`: si necesitas cortar, usa `for...of`.

## Errores típicos

1. **Asignar en vez de comparar.**
   ```js
   let rol = "invitado";
   if (rol = "admin") console.log("acceso total");   // siempre entra
   ```
   `=` asigna `"admin"` (truthy). Para comparar es `===`.

2. **Olvidar el `break` en un `switch`.**
   ```js
   switch (1) {
     case 1: console.log("uno");
     case 2: console.log("dos");
   }
   // "uno" y "dos"
   ```
   Sin `break`, la ejecución cae al siguiente `case`.

3. **Usar `||` cuando 0 o "" son válidos.**
   ```js
   const volumen = 0;
   const v = volumen || 50;    // 50, aunque el usuario eligió 0
   const w = volumen ?? 50;    // 0
   ```

4. **Recorrer un array con `for...in`.**
   ```js
   for (const i in [10, 20]) console.log(i + 1);   // "01", "11"
   ```
   Las claves son strings, así que `+` concatena. Para valores usa `for...of`.

5. **Pasarte del final del array.**
   ```js
   const notas = [12, 15];
   for (let i = 0; i <= notas.length; i++) console.log(notas[i]);
   // 12, 15, undefined
   ```
   El último índice es `length - 1`: la condición es `i < notas.length`.

6. **Escribir rangos como en matemáticas.**
   ```js
   const nota = 25;
   if (11 <= nota <= 20) console.log("aprobado");   // entra, aunque 25 no es válido
   ```
   Se evalúa `(11 <= 25) <= 20`, o sea `true <= 20`, que es `true`. Se escribe `nota >= 11 && nota <= 20`.

## Chuleta

| Herramienta | Para qué |
|---|---|
| `if (...) return ...;` | descartar casos y cortar temprano |
| `a ? b : c` | elegir entre dos valores |
| `switch` + `case` + `return/break` | un valor contra muchas opciones fijas |
| `a \|\| b` | `b` si `a` es falsy |
| `a ?? b` | `b` solo si `a` es `null` o `undefined` |
| `a && b` | `b` solo si `a` es truthy |
| `obj?.prop` | leer sin explotar si `obj` es `null`/`undefined` |
| `for (let i = 0; i < n; i++)` | cuando necesitas el índice |
| `for (const x of array)` | valores de un array o string |
| `for (const k in objeto)` | claves de un objeto |
| `while (cond)` | repetir mientras algo sea cierto |
| `break` / `continue` | salir del bucle / saltar a la siguiente vuelta |

## En la entrevista

- **¿Qué diferencia hay entre `for...of` y `for...in`?** `for...of` recorre los valores de un iterable como un array o un string; `for...in` recorre las claves de un objeto como strings. Para arrays uso `for...of`.
- **¿Qué diferencia hay entre `||` y `??`?** `||` usa el valor de la derecha si el de la izquierda es cualquier falsy, incluido `0` o `""`; `??` solo si es `null` o `undefined`. Uso `??` cuando `0` o `""` son valores válidos.
- **¿Qué diferencia hay entre `break` y `continue`?** `break` termina el bucle completo; `continue` termina solo la vuelta actual y sigue con la siguiente.
- **¿Cuándo usarías `switch` en vez de `if`?** Cuando comparo un mismo valor contra muchas opciones fijas, como el estado de un pedido o la acción de un reducer; para rangos o condiciones distintas uso `if`.
- **¿Qué es el cortocircuito?** `&&` y `||` dejan de evaluar apenas conocen el resultado: `false && f()` nunca llama a `f`. Por eso se usan para ejecutar algo solo si una condición se cumple o para dar valores por defecto.
