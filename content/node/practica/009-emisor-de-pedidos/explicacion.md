## Idea clave

`EventEmitter` es el patrón **publicar y suscribirse** de Node: un objeto **emite** eventos con nombre (`emit`) y cualquiera puede **escucharlos** (`on`) sin que el emisor sepa quién escucha. El pedido extiende `EventEmitter`, valida cada cambio de estado antes de aplicarlo y emite un evento por cada cambio; `registrarAvisos` es un módulo que solo escucha.

## Paso a paso

1. **Extiende `EventEmitter`.** `class Pedido extends EventEmitter` le da a cada pedido los métodos `on`, `once`, `off` y `emit`. En el constructor, `super()` va **primero**: inicializa la parte de `EventEmitter`, y antes de llamarlo no puedes usar `this`.
2. **Guarda el estado** en el constructor: `this.id = id` y `this.estado = "creado"`.
3. **Un método auxiliar para los cambios.** Los tres métodos siguen el mismo patrón, así que lo escribes una vez:

   ```js
   cambiarEstado(esperado, nuevo) {
     if (this.estado !== esperado) {
       throw new Error(`No se puede pasar de "${this.estado}" a "${nuevo}"`);
     }
     const anterior = this.estado;
     this.estado = nuevo;
     this.emit("cambioDeEstado", { id: this.id, anterior, nuevo });
   }
   ```

   El orden importa: **primero validas**, después cambias, después avisas. Si lanzas, nada se modificó.
4. **Cada método** llama a `cambiarEstado` y luego emite su propio evento con sus datos. Si `cambiarEstado` lanza, la línea del `emit` nunca se ejecuta.
5. **`registrarAvisos`** crea un arreglo vacío, registra tres oyentes con `pedido.on(...)` y devuelve el arreglo. Está vacío al devolverlo: se va llenando **después**, cada vez que el pedido emite.

```js
import { EventEmitter } from "node:events";

export class Pedido extends EventEmitter {
  constructor(id) {
    super();
    this.id = id;
    this.estado = "creado";
  }

  cambiarEstado(esperado, nuevo) {
    if (this.estado !== esperado) {
      throw new Error(`No se puede pasar de "${this.estado}" a "${nuevo}"`);
    }
    const anterior = this.estado;
    this.estado = nuevo;
    this.emit("cambioDeEstado", { id: this.id, anterior, nuevo });
  }

  pagar(monto) {
    this.cambiarEstado("creado", "pagado");
    this.emit("pagado", { id: this.id, monto });
  }

  enviar() {
    this.cambiarEstado("pagado", "enviado");
    this.emit("enviado", { id: this.id });
  }

  entregar() {
    this.cambiarEstado("enviado", "entregado");
    this.emit("entregado", { id: this.id });
  }
}

export function registrarAvisos(pedido) {
  const avisos = [];
  pedido.on("pagado", ({ id, monto }) => avisos.push(`Pedido ${id}: pago recibido (S/ ${monto.toFixed(2)})`));
  pedido.on("enviado", ({ id }) => avisos.push(`Pedido ${id}: en camino`));
  pedido.on("entregado", ({ id }) => avisos.push(`Pedido ${id}: entregado`));
  return avisos;
}
```

## Por qué funciona

Recorrido del test de `registrarAvisos` con el pedido 7:

| Llamada | Estado | Eventos emitidos | `avisos` |
|---|---|---|---|
| `registrarAvisos(pedido)` | creado | | `[]` |
| `pedido.pagar(50)` | pagado | `cambioDeEstado`, `pagado` | `["Pedido 7: pago recibido (S/ 50.00)"]` |
| `pedido.enviar()` | enviado | `cambioDeEstado`, `enviado` | `[..., "Pedido 7: en camino"]` |
| `pedido.entregar()` | entregado | `cambioDeEstado`, `entregado` | `[..., "Pedido 7: entregado"]` |

`emit` es **síncrono**: llama a los oyentes en ese mismo instante, uno tras otro, y recién después devuelve el control. Por eso el test puede revisar `avisos` justo en la línea siguiente a `pedido.pagar(50)`, sin `await`.

`registrarAvisos` devuelve el arreglo vacío, pero los oyentes lo tienen "guardado" por **closure**: cuando el pedido emite, hacen `push` sobre ese mismo arreglo, que es el que tiene el test.

Y en "no se puede enviar sin pagar": `enviar()` llama a `cambiarEstado("pagado", "enviado")`, el estado es `"creado"`, se lanza el error y ni `this.estado = nuevo` ni ningún `emit` llegan a ejecutarse. El contador de eventos queda en 0.

## Errores comunes

- **Olvidar `super()`** o usar `this` antes: "Must call super constructor in derived class before accessing 'this'".
- **Cambiar el estado antes de validar**: si lanzas después, el pedido queda en un estado inválido. El test "no cambia ni emite nada" lo detecta.
- **Escribir mal el nombre del evento** (`"pagada"` en vez de `"pagado"`): `emit` no da error, simplemente nadie escucha. Es el error más difícil de ver con eventos; por eso conviene tener los nombres en un solo lugar.
- **Emitir con varios argumentos** (`emit("pagado", id, monto)`) en vez de un objeto: funciona, pero el oyente recibe `(id, monto)` y el test espera un objeto `{ id, monto }`.
- **Crear un `EventEmitter` compartido fuera de la clase** (un solo emisor para todos los pedidos): los oyentes de un pedido reciben eventos de otros. El test "cada pedido tiene sus propios oyentes" lo revisa.
- **Emitir `"error"` sin oyentes.** En Node ese evento es especial: si nadie lo escucha, `emit("error")` lanza una excepción y puede tumbar el proceso. Aquí usamos `throw` directo, que es más claro.

## Otra forma de resolverlo

**Composición en vez de herencia**: el pedido **tiene** un emisor en vez de **ser** uno.

```js
export function crearPedido(id) {
  const eventos = new EventEmitter();
  let estado = "creado";
  return {
    id,
    on: (nombre, oyente) => eventos.on(nombre, oyente),
    get estado() { return estado; },
    pagar(monto) { /* validar, cambiar estado, eventos.emit(...) */ },
  };
}
```

Expones solo lo que quieres (nadie de afuera puede hacer `pedido.emit("pagado")` falso). Es más control a cambio de más código. Extender `EventEmitter` es lo más común en Node (así están hechos `http.Server`, los streams y `process`).

**Una tabla de transiciones** en vez de un método por cambio: `const SIGUIENTE = { creado: "pagado", pagado: "enviado", enviado: "entregado" }`. Útil si hay muchos estados; con cuatro, los métodos con nombre se leen mejor.

## Cómo explicarlo en la entrevista

> "Uso EventEmitter para desacoplar: el pedido no sabe quién manda correos o actualiza stock, solo emite eventos, y cada módulo se suscribe con on a lo que le interesa. La clase extiende EventEmitter y llama a super en el constructor. Cada transición pasa por un método que primero valida el estado actual, y si no corresponde lanza un error sin modificar nada; si es válida, cambia el estado y emite cambioDeEstado y el evento específico. Hay que tener en cuenta que emit es síncrono: los oyentes corren en ese momento y en el orden en que se registraron. Es el mismo patrón que usan en Node los servidores HTTP y los streams."

## Conceptos

- **`EventEmitter`** (`node:events`): objeto que emite eventos con nombre y mantiene una lista de oyentes por evento.
- **`on(evento, oyente)`**: suscribe una función; **`once`** la suscribe para una sola vez; **`off`** la quita.
- **`emit(evento, ...datos)`**: llama a los oyentes de ese evento, de forma **síncrona** y en orden de registro.
- **Publicar y suscribirse (pub/sub)**: quien emite no conoce a quien escucha; desacopla módulos.
- **`extends` y `super()`**: herencia de clases; `super()` inicializa la clase padre y va antes de usar `this`.
- **Máquina de estados**: un objeto con estados fijos y transiciones permitidas entre ellos.
- **Closure**: los oyentes recuerdan el arreglo `avisos` aunque `registrarAvisos` ya haya terminado.
- **Evento `"error"`**: especial en Node; si se emite sin oyentes, lanza una excepción.
