## En una frase

Un objeto guarda datos como pares `clave: valor`, se lee por nombre (no por posición) y, como los arrays, **se guarda por referencia**: copiar la variable no copia el objeto.

## Lo esencial

### Crear y leer

```js
const alumno = {
  nombre: "Rosa",
  edad: 20,
  "segundo apellido": "Quispe", // clave con espacio: va entre comillas
};

alumno.nombre;               // "Rosa"   notación de punto
alumno["edad"];              // 20       notación de corchetes
alumno["segundo apellido"];  // "Quispe" (con punto no se puede)
alumno.telefono;             // undefined (no existe, no da error)
```

### Corchetes cuando la clave está en una variable

```js
const campo = "edad";
alumno.campo;   // undefined  (busca una clave llamada "campo")
alumno[campo];  // 20         (usa el valor de la variable)
```

Esto es lo que usas cuando la clave llega como parámetro, por ejemplo `ordenarPor(lista, "edad")`.

### Agregar, cambiar y borrar

```js
const p = { nombre: "Ana" };
p.edad = 25;       // agrega
p.nombre = "Eva";  // cambia
delete p.edad;     // borra
p;                 // { nombre: "Eva" }

const conteo = {};
conteo["hola"] = (conteo["hola"] ?? 0) + 1; // patrón contador
conteo;            // { hola: 1 }
```

Las claves siempre son texto: `o[1]` y `o["1"]` son la misma propiedad.

### Shorthand y claves calculadas

```js
const nombre = "Luis";
const edad = 30;
const persona = { nombre, edad };   // { nombre: "Luis", edad: 30 }

const clave = "color";
const auto = { [clave]: "rojo" };    // { color: "rojo" }
```

### Destructuring

```js
const usuario = { id: 7, nombre: "Ana", dir: { ciudad: "Lima" } };

const { nombre, id } = usuario;            // nombre = "Ana", id = 7
const { nombre: alias } = usuario;         // renombrar: alias = "Ana"
const { rol = "alumno" } = usuario;        // valor por defecto: rol = "alumno"
const { dir: { ciudad } } = usuario;       // anidado: ciudad = "Lima"
const { id: _, ...sinId } = usuario;       // sinId = { nombre: "Ana", dir: {...} }

function saludar({ nombre }) { return `Hola, ${nombre}`; }
saludar(usuario);                          // "Hola, Ana"
```

### Recorrer: keys, values, entries

```js
const precios = { pan: 1, leche: 4 };

Object.keys(precios);    // ["pan", "leche"]
Object.values(precios);  // [1, 4]
Object.entries(precios); // [["pan", 1], ["leche", 4]]

for (const [producto, precio] of Object.entries(precios)) {
  console.log(producto, precio); // "pan 1", luego "leche 4"
}

// entries + map + fromEntries: transformar un objeto
const conIgv = Object.fromEntries(
  Object.entries(precios).map(([k, v]) => [k, v * 1.18])
);
conIgv; // { pan: 1.18, leche: 4.72 }
```

### ¿Existe la clave? `in` vs `Object.hasOwn`

```js
const o = { a: undefined };
o.a !== undefined;        // false  (¡pero la clave sí existe!)
"a" in o;                 // true
Object.hasOwn(o, "a");    // true
"toString" in o;          // true   (in también mira lo heredado)
Object.hasOwn(o, "toString"); // false (solo las propias)
```

### Referencia vs valor

Los primitivos (número, texto, booleano) se copian por valor. Los objetos y arrays se copian por **referencia**: dos variables pueden apuntar al mismo objeto.

```js
let x = 1;
let y = x;
y = 2;
x;            // 1   (copia del valor)

const a = { n: 1 };
const b = a;
b.n = 2;
a.n;          // 2   (mismo objeto)

({ n: 1 }) === ({ n: 1 }); // false: === compara referencias, no contenido
```

### Copia superficial vs profunda

| Forma | Tipo de copia | Ojo con |
|---|---|---|
| `{ ...obj }` / `Object.assign({}, obj)` | Superficial | Los objetos de adentro se comparten |
| `structuredClone(obj)` | Profunda | No copia funciones (lanza error) |
| `JSON.parse(JSON.stringify(obj))` | Profunda | Pierde `undefined` y funciones; las fechas pasan a texto |

```js
const original = { nombre: "Ana", dir: { ciudad: "Lima" } };
const copia = { ...original };
copia.nombre = "Eva";        // no afecta al original
copia.dir.ciudad = "Cusco";  // ¡sí afecta! dir es el mismo objeto
original.dir.ciudad;         // "Cusco"

const profunda = structuredClone(original);
profunda.dir.ciudad = "Puno";
original.dir.ciudad;         // "Cusco" (ya no se comparte)

const actualizado = { ...original, nombre: "Luz" }; // copiar y cambiar una clave
```

### JSON

JSON es **texto** con formato de objeto. Así viajan los datos entre el navegador y el servidor.

```js
const texto = JSON.stringify({ id: 1, tags: ["js"] }); // '{"id":1,"tags":["js"]}'
const obj = JSON.parse(texto);                         // { id: 1, tags: ["js"] }
JSON.stringify({ a: 1 }, null, 2);                     // con sangría, para leerlo
```

En JSON las claves van con comillas dobles y no hay funciones, `undefined` ni comas finales.

## Errores típicos

**1. Usar punto con una clave que está en una variable**

```js
function leer(obj, clave) {
  return obj.clave; // siempre undefined
}
```
`obj.clave` busca la propiedad literal `"clave"`. Usa `obj[clave]`.

**2. Creer que el spread copia todo**

```js
const copia = { ...usuario };
copia.dir.ciudad = "Arequipa"; // también cambió usuario.dir.ciudad
```
`{ ...obj }` es superficial. Para objetos anidados usa `structuredClone` o copia también el nivel de adentro: `{ ...usuario, dir: { ...usuario.dir } }`.

**3. Comparar objetos con `===`**

```js
({ a: 1 }) === ({ a: 1 }); // false
```
Son dos objetos distintos en memoria. Compara sus propiedades, o para datos simples `JSON.stringify(a) === JSON.stringify(b)` (sensible al orden de las claves).

**4. Leer una propiedad de algo que es `undefined`**

```js
const u = { nombre: "Ana" };
u.dir.ciudad; // TypeError: Cannot read properties of undefined (reading 'ciudad')
```
`u.dir` no existe. Usa encadenamiento opcional: `u.dir?.ciudad` devuelve `undefined` sin romper.

**5. Usar `if (obj[clave])` para saber si existe**

```js
const stock = { arroz: 0 };
if (stock.arroz) { /* no entra, aunque la clave existe */ }
```
`0`, `""` y `false` son falsy. Usa `Object.hasOwn(stock, "arroz")` o `"arroz" in stock`.

**6. Pensar que `const` congela el objeto**

```js
const config = { tema: "claro" };
config.tema = "oscuro"; // funciona
```
`const` solo impide reasignar la variable (`config = {}`), no cambiar sus propiedades.

## Chuleta

| Herramienta | Qué hace | Devuelve | ¿Muta? |
|---|---|---|---|
| `obj.clave` / `obj[variable]` | Lee una propiedad | Valor o `undefined` | No |
| `obj.x = v` / `delete obj.x` | Agrega o borra | `v` / `true` | Sí |
| `Object.keys(obj)` | Claves | Array de strings | No |
| `Object.values(obj)` | Valores | Array | No |
| `Object.entries(obj)` | Pares | Array de `[clave, valor]` | No |
| `Object.fromEntries(pares)` | Pares a objeto | Objeto nuevo | No |
| `"x" in obj` | ¿Existe? (incluye heredadas) | `true`/`false` | No |
| `Object.hasOwn(obj, "x")` | ¿Existe como propia? | `true`/`false` | No |
| `{ ...obj, x: 1 }` | Copia superficial y cambia | Objeto nuevo | No |
| `structuredClone(obj)` | Copia profunda | Objeto nuevo | No |
| `JSON.stringify(obj)` | Objeto a texto | String | No |
| `JSON.parse(texto)` | Texto a objeto | Objeto | No |

Recuerda: `obj?.a?.b` lee sin romper si algo es `undefined`.

## En la entrevista

**¿Qué diferencia hay entre copia superficial y profunda?**
La superficial (`{ ...obj }`) crea un objeto nuevo pero comparte los objetos de adentro; la profunda (`structuredClone`) copia también todos los niveles, así que nada queda compartido.

**¿Por qué `{} === {}` es `false`?**
Porque `===` con objetos compara referencias (si son el mismo objeto en memoria), no su contenido, y ahí hay dos objetos distintos.

**¿Cuándo usas punto y cuándo corchetes?**
Punto cuando conoces el nombre de la clave al escribir el código; corchetes cuando la clave está en una variable o tiene caracteres como espacios o guiones.

**¿Qué diferencia hay entre `in` y `Object.hasOwn`?**
`in` devuelve `true` también para propiedades heredadas del prototipo (como `toString`); `Object.hasOwn` solo para las propiedades propias del objeto.

**¿Qué pasa si paso un objeto a una función y lo modifico adentro?**
Se modifica el original, porque la función recibe una referencia al mismo objeto; por eso, si no quieres efectos secundarios, trabajas sobre una copia.
