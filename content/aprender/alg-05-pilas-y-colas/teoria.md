## En una frase

Una **pila** saca primero lo último que entró (como una pila de platos) y una **cola** saca primero lo que entró primero (como la cola del banco); en JavaScript las dos se hacen con un array.

## Lo esencial

### Pila (LIFO: last in, first out)

```js
const pila = [];
pila.push("a");     // ["a"]
pila.push("b");     // ["a", "b"]
pila.at(-1);        // "b": mirar el de arriba sin sacarlo
pila.pop();         // "b": sale el último que entró
pila.length === 0;  // ¿está vacía? (false, queda "a")
```

`push` y `pop` trabajan al final del array: O(1). La usas cuando **lo más reciente** es lo que importa: deshacer (Ctrl+Z), el botón Atrás del navegador, la pila de llamadas de las funciones.

### Abrir y cerrar en orden

Cada vez que algo "se abre" lo apilas; cuando "se cierra", tiene que coincidir con el de arriba.

```js
// ¿Las etiquetas están bien anidadas? ["<b>", "<i>", "</i>", "</b>"]
function bienAnidadas(etiquetas) {
  const pila = [];
  for (const e of etiquetas) {
    if (!e.startsWith("</")) {
      pila.push(e);                          // se abre
    } else {
      const abierta = pila.pop();            // la última que se abrió
      if (abierta !== e.replace("/", "")) return false;
    }
  }
  return pila.length === 0;                  // no debe quedar nada abierto
}
bienAnidadas(["<b>", "<i>", "</i>", "</b>"]); // true
bienAnidadas(["<b>", "<i>", "</b>", "</i>"]); // false
```

Si hubiera un solo tipo de símbolo bastaría un contador; con varios tipos necesitas recordar **el orden**, y eso es una pila.

### Pila monotónica: "el siguiente mayor"

Para cada elemento, ¿cuál es el primero a su derecha que es mayor? La pila guarda los **índices que todavía esperan** su respuesta.

```js
function siguienteMayor(nums) {
  const res = new Array(nums.length).fill(-1);
  const esperando = []; // índices, sus valores van de mayor a menor
  for (let i = 0; i < nums.length; i++) {
    while (esperando.length && nums[i] > nums[esperando.at(-1)]) {
      res[esperando.pop()] = nums[i]; // nums[i] es la respuesta de ese índice
    }
    esperando.push(i);
  }
  return res;
}
siguienteMayor([2, 1, 5, 3]); // [5, 5, -1, -1]
```

Cada índice entra y sale de la pila una sola vez: O(n), aunque haya un `while` adentro del `for`.

### Cola (FIFO: first in, first out)

```js
const cola = [];
cola.push("Ana");   // entra al final
cola.push("Luis");
cola.shift();       // "Ana": sale el primero
```

`shift` es O(n) porque mueve a todos. Para colas grandes usa un índice de lectura:

```js
const cola = [1, 2, 3];
let inicio = 0;
while (inicio < cola.length) {
  const actual = cola[inicio++]; // "saca" sin mover nada: O(1)
  console.log(actual);           // aquí lo procesas y, si hace falta, haces cola.push(...)
}
```

### Cola para recorrer por niveles (BFS)

```js
// Árbol como objetos { val, hijos: [] }: imprime nivel por nivel
function porNiveles(raiz) {
  const niveles = [];
  let cola = [raiz];
  while (cola.length) {
    niveles.push(cola.map((n) => n.val));
    cola = cola.flatMap((n) => n.hijos); // la siguiente fila
  }
  return niveles;
}
```

La cola garantiza que visitas todo lo que está a distancia 1 antes de lo que está a distancia 2. Por eso BFS encuentra el camino más corto.

## Errores típicos

**1. Hacer `pop` sobre una pila vacía sin revisar.** Devuelve `undefined`, y comparar `undefined` con algo puede darte un `true` o `false` engañoso. Revisa `pila.length` cuando haga falta.

**2. Olvidar revisar que al final quede vacía.** En `"(("` nunca hay un cierre que falle, pero la respuesta es `false` porque quedaron abiertos.

**3. Guardar valores cuando necesitabas índices.** En "cuántos días faltan para algo mayor" necesitas la posición para calcular la distancia: apila índices.

**4. Confundir `shift` con `pop`.** `pop` saca del final (pila), `shift` saca del inicio (cola). Con el equivocado, tu BFS se vuelve DFS.

**5. Creer que un `while` dentro de un `for` siempre es O(n²).** En la pila monotónica cada elemento se apila y desapila una vez: el total es O(n).

## Chuleta

| | Pila | Cola |
|---|---|---|
| Orden | último en entrar, primero en salir | primero en entrar, primero en salir |
| Entrar | `push` | `push` |
| Salir | `pop` | `shift` (o un índice de lectura) |
| Mirar | `pila.at(-1)` | `cola[0]` |
| Señales | abrir y cerrar, deshacer, "el siguiente mayor", evaluar expresiones | por niveles, camino más corto, procesar en orden de llegada |

## En la entrevista

**¿Cuál es la diferencia entre una pila y una cola?**
La pila saca primero lo último que entró (LIFO), la cola saca primero lo que entró primero (FIFO). En JavaScript la pila es `push` y `pop`, la cola es `push` y `shift`.

**¿Cómo validarías que los paréntesis de un texto están balanceados?**
Recorro el texto con una pila: apilo cada apertura y, en cada cierre, saco el de arriba y verifico que sea su pareja. Al final la pila debe quedar vacía. Es O(n).

**¿Dónde usa una pila JavaScript por dentro?**
En la pila de llamadas (call stack): cada función que llamas se apila y sale al terminar. Si una recursión no se detiene, la pila se llena y sale "Maximum call stack size exceeded".

**¿Por qué el recorrido por niveles usa una cola?**
Porque procesa los nodos en el orden en que los descubrió: primero todos los del nivel 1, luego los del 2. Con una pila iría hasta el fondo de una rama antes de ver las demás.
