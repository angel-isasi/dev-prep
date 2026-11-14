En una tienda en línea, cuando un pedido cambia de estado pasan varias cosas: se manda un correo, se actualiza el inventario, se avisa al repartidor. En vez de que el pedido conozca a todos esos módulos, el pedido **emite eventos** y cada módulo **escucha** los que le interesan. Así funciona `EventEmitter`, una pieza central de Node.

Crea en `solucion.js`:

### 1. La clase `Pedido`, que extiende `EventEmitter`

- `new Pedido(id)`: guarda `id` y empieza con `estado = "creado"`.
- `pagar(monto)`: pasa de `"creado"` a `"pagado"` y emite `"pagado"` con `{ id, monto }`.
- `enviar()`: pasa de `"pagado"` a `"enviado"` y emite `"enviado"` con `{ id }`.
- `entregar()`: pasa de `"enviado"` a `"entregado"` y emite `"entregado"` con `{ id }`.
- En **cada** cambio, además, emite `"cambioDeEstado"` con `{ id, anterior, nuevo }`.
- Si el pedido no está en el estado correcto (por ejemplo, enviar sin pagar), **lanza un error** y no cambia nada ni emite nada.

### 2. La función `registrarAvisos(pedido)`

Escucha los eventos del pedido y devuelve un arreglo `avisos` que se va llenando con mensajes para el cliente:

- `"pagado"` → `"Pedido 7: pago recibido (S/ 50.00)"`
- `"enviado"` → `"Pedido 7: en camino"`
- `"entregado"` → `"Pedido 7: entregado"`

## Lo que necesitas de Node

```js
import { EventEmitter } from "node:events";

const emisor = new EventEmitter();
emisor.on("saludo", (datos) => console.log("Hola", datos.nombre)); // escuchar
emisor.emit("saludo", { nombre: "Ana" });                           // emitir: llama a los oyentes
```

`emit` llama a todos los oyentes de ese evento **en el momento** (de forma síncrona), en el orden en que se registraron. Para que tu clase tenga `on` y `emit`, la extiendes: `class Pedido extends EventEmitter` y llamas a `super()` en el constructor.

## Ejemplos

```js
const pedido = new Pedido(7);
const avisos = registrarAvisos(pedido);

pedido.on("pagado", ({ monto }) => console.log("Facturar", monto));

pedido.pagar(50);   // Facturar 50
pedido.enviar();
pedido.estado;      // "enviado"
avisos;             // ["Pedido 7: pago recibido (S/ 50.00)", "Pedido 7: en camino"]

new Pedido(8).enviar(); // Error: No se puede pasar de "creado" a "enviado"
```
