## Idea clave

El tipo `Eventos` es un mapa de "nombre de evento" a "tipo del payload". Cada método es **genérico** en `K extends keyof Eventos` (el nombre del evento), y el payload se escribe `Eventos[K]` (**acceso indexado**): el tipo del valor de la clave `K`. Así, al escribir `"mensaje"`, TypeScript fija `K = "mensaje"` y exige `Eventos["mensaje"]`.

## Paso a paso

1. **El parámetro de la clase.** `Emisor<Eventos extends Record<string, unknown>>` dice: "`Eventos` es un objeto cuyas claves son textos". Eso garantiza que `keyof Eventos` sean nombres de eventos.
2. **Dónde guardar los oyentes.** Un objeto con una lista por evento. Su tipo es un **tipo mapeado**: `{ [K in keyof Eventos]?: Oyente<Eventos[K]>[] }`. Se lee "para cada nombre K de Eventos, una lista opcional de oyentes que reciben `Eventos[K]`". Es opcional (`?`) porque al principio no hay ninguna lista.
3. **`on` genérico.** `on<K extends keyof Eventos>(evento: K, oyente: Oyente<Eventos[K]>)`. Al llamar `chat.on("mensaje", ...)`, TypeScript **infiere** `K = "mensaje"` del primer argumento y con eso sabe el tipo del parámetro del oyente. Por eso en `(m) => m.texto` no tienes que anotar `m`.
4. **Agregar.** Toma la lista existente o una vacía (`?? []`), agrega el oyente y guárdala.
5. **Devolver la baja.** `return () => this.off(evento, oyente)`. Es un closure: la función recuerda qué evento y qué oyente quitar.
6. **`off`.** Reemplaza la lista por una filtrada sin ese oyente. Compara por referencia (`o !== oyente`): por eso para quitar un oyente necesitas la **misma** función que registraste.
7. **`emit`.** Copia la lista y llama a cada oyente con el payload. Si no hay lista, la copia es `[]` y no pasa nada.

```ts
export type Oyente<P> = (payload: P) => void;

export class Emisor<Eventos extends Record<string, unknown>> {
  private oyentes: { [K in keyof Eventos]?: Oyente<Eventos[K]>[] } = {};

  on<K extends keyof Eventos>(evento: K, oyente: Oyente<Eventos[K]>): () => void {
    const lista = this.oyentes[evento] ?? [];
    lista.push(oyente);
    this.oyentes[evento] = lista;
    return () => this.off(evento, oyente);
  }

  off<K extends keyof Eventos>(evento: K, oyente: Oyente<Eventos[K]>): void {
    const lista = this.oyentes[evento];
    if (lista) this.oyentes[evento] = lista.filter((o) => o !== oyente);
  }

  emit<K extends keyof Eventos>(evento: K, payload: Eventos[K]): void {
    const lista = [...(this.oyentes[evento] ?? [])];
    for (const oyente of lista) oyente(payload);
  }
}
```

`private` hace que `chat.oyentes` dé error de tipos fuera de la clase: nadie puede tocar la lista sin pasar por `on` y `off`.

## Por qué funciona

Cómo resuelve TypeScript los tipos con `EventosChat`:

| Llamada | `K` inferido | `Eventos[K]` | ¿Compila? |
|---|---|---|---|
| `chat.on("mensaje", (m) => ...)` | `"mensaje"` | `{ de: string; texto: string }` | sí, `m` queda tipado |
| `chat.emit("escribiendo", true)` | `"escribiendo"` | `boolean` | sí |
| `chat.emit("escribiendo", "sí")` | `"escribiendo"` | `boolean` | **no**: `"sí"` no es `boolean` |
| `chat.emit("mensaje", { de: "Ana" })` | `"mensaje"` | `{ de; texto }` | **no**: falta `texto` |
| `chat.on("desconectado", ...)` | | | **no**: `"desconectado"` no está en `keyof EventosChat` |

Y en tiempo de ejecución, con dos oyentes de `"conectado"` y `off` del primero:

| Operación | `oyentes.conectado` |
|---|---|
| `on("conectado", a)` | `[a]` |
| `on("conectado", b)` | `[a, b]` |
| `off("conectado", a)` | `[b]` |
| `emit("conectado", { usuario: "Ana" })` | llama a `b({ usuario: "Ana" })` |

¿Por qué copiar la lista en `emit`? Si un oyente se da de baja **mientras** recorres (por ejemplo, un oyente "de una sola vez"), modificarías el arreglo que estás recorriendo y te saltarías a alguien. Con la copia, cada `emit` trabaja sobre una foto fija.

## Errores comunes

- **`on(evento: keyof Eventos, oyente: (payload: Eventos[keyof Eventos]) => void)`**, sin genérico. `Eventos[keyof Eventos]` es la **unión** de todos los payloads: `emit("escribiendo", { usuario: "Ana" })` compilaría. Necesitas el `K` para atar el nombre con su payload. Falla el test de tipos.
- **Usar `any` en el payload.** Todo compila y el test de tipos falla con "Directiva @ts-expect-error no usada".
- **Quitar con una función nueva**: `chat.off("mensaje", (m) => console.log(m))` no quita nada, porque es otra función (otra referencia). Guarda la función o usa la que devuelve `on`.
- **Lanzar error en `emit` si no hay oyentes** (`this.oyentes[evento].forEach` sin `??`). `undefined.forEach` revienta. Falla "emitir un evento sin oyentes no falla".
- **Recorrer la lista original** mientras un oyente se da de baja: se salta oyentes. No lo prueban los tests, pero es un bug real.
- **Escribir `interface EventosChat`** en vez de `type`: las interfaces no se pueden asignar a `Record<string, unknown>` (no tienen "firma de índice" implícita). Con `type` funciona.

## Otra forma de resolverlo

**Con un `Map` y un `Set`**: el `Set` evita registrar dos veces el mismo oyente y borra en O(1).

```ts
export class Emisor<Eventos extends Record<string, unknown>> {
  private oyentes = new Map<keyof Eventos, Set<Oyente<never>>>();

  on<K extends keyof Eventos>(evento: K, oyente: Oyente<Eventos[K]>) {
    if (!this.oyentes.has(evento)) this.oyentes.set(evento, new Set());
    this.oyentes.get(evento)!.add(oyente as Oyente<never>);
    return () => this.off(evento, oyente);
  }

  off<K extends keyof Eventos>(evento: K, oyente: Oyente<Eventos[K]>) {
    this.oyentes.get(evento)?.delete(oyente as Oyente<never>);
  }

  emit<K extends keyof Eventos>(evento: K, payload: Eventos[K]) {
    for (const o of [...(this.oyentes.get(evento) ?? [])]) (o as Oyente<Eventos[K]>)(payload);
  }
}
```

**¿Cuándo conviene?** El `Map` es más rápido con muchos oyentes, pero un `Map<K, V>` no puede expresar "el valor depende de la clave", así que terminas con `as` (conversiones de tipo). La versión con tipo mapeado mantiene los tipos exactos sin conversiones: es la que conviene mostrar en una entrevista de TypeScript.

## Cómo explicarlo en la entrevista

> "El genérico de la clase es un mapa de nombre de evento a tipo de payload. Cada método es genérico en `K extends keyof Eventos`, y el payload lo tipo como `Eventos[K]`, el acceso indexado. Así, cuando escribo `on('mensaje', ...)`, TypeScript infiere K como 'mensaje' y el oyente recibe exactamente ese payload; si emito con otro tipo o un evento que no existe, no compila. Los oyentes los guardo en un tipo mapeado, una lista por evento. `on` devuelve una función para darse de baja, y en `emit` recorro una copia de la lista para que una baja en medio no me salte oyentes."

## Conceptos

- **Clases genéricas** y métodos genéricos (temas de Aprender: genéricos, clases y módulos).
- **`keyof`**: la unión de las claves de un tipo.
- **Acceso indexado** `T[K]`: el tipo del valor en la clave `K`.
- **Restricción de genéricos** `K extends keyof Eventos`.
- **Inferencia de genéricos**: TypeScript deduce `K` del argumento.
- **Tipos mapeados** `{ [K in keyof T]?: ... }`.
- **`private`** en clases de TypeScript.
- **Patrón observador** (*observer* o *pub/sub*).
- **Closures**: la función de baja recuerda su evento y su oyente.
