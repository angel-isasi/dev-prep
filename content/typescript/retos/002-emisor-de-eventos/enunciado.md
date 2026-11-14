Crea la clase genérica `Emisor<Eventos>`: un **emisor de eventos** (como `addEventListener` del DOM o `EventEmitter` de Node) donde cada evento tiene un **payload tipado**. Si emites `"mensaje"`, TypeScript exige un `{ de, texto }`; si escuchas `"escribiendo"`, tu función recibe un `boolean`.

`Eventos` es un tipo objeto que funciona como "mapa": cada clave es el nombre de un evento y su valor es el tipo del payload.

```ts
type EventosChat = {
  mensaje: { de: string; texto: string };
  conectado: { usuario: string };
  escribiendo: boolean;
};
```

## Reglas

- `class Emisor<Eventos extends Record<string, unknown>>`.
- `on(evento, oyente)`: registra `oyente` para ese evento y **devuelve una función** que, al llamarla, lo da de baja.
- `off(evento, oyente)`: quita ese oyente (solo ese) de ese evento.
- `emit(evento, payload)`: llama a todos los oyentes de ese evento, en el orden en que se registraron, pasándoles el payload. Si no hay oyentes, no hace nada (no lanza error).
- **Los tipos son la mitad del reto**:
  - `evento` solo acepta nombres que existan en `Eventos`.
  - El `payload` de `emit` y el parámetro del `oyente` tienen el tipo que `Eventos` define **para ese evento**.
- Sin `any`.

## Ejemplos

```ts
const chat = new Emisor<EventosChat>();

const darseDeBaja = chat.on("mensaje", (m) => {
  console.log(`${m.de}: ${m.texto}`);   // m es { de: string; texto: string }
});

chat.emit("mensaje", { de: "Ana", texto: "Hola" });  // imprime "Ana: Hola"
chat.emit("conectado", { usuario: "Luis" });         // nadie escucha: no pasa nada
darseDeBaja();
chat.emit("mensaje", { de: "Ana", texto: "¿Hay alguien?" });  // ya no imprime

chat.emit("mensaje", { de: "Ana" });     // Error de TypeScript: falta "texto"
chat.emit("escribiendo", "sí");          // Error de TypeScript: debe ser boolean
chat.on("desconectado", () => {});       // Error de TypeScript: ese evento no existe
```

## Por qué importa

Es el **patrón observador**, que está detrás de los eventos del DOM, de Node y de muchas librerías de estado. En entrevistas con TypeScript es una pregunta favorita porque obliga a usar a la vez genéricos, `keyof` y el acceso indexado `Eventos[K]`: si lo resuelves bien, demuestras que entiendes cómo un tipo puede depender de otro.
