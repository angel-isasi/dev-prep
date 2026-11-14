En un chat quieres mostrar el **último mensaje** de cada conversación; en una tienda, el **primer producto** destacado. Es la misma operación con datos distintos, y no quieres escribir una función para números, otra para textos y otra para mensajes.

Para eso existen los **genéricos**: una función con un tipo "comodín" `<T>` que se adapta a lo que le pases.

Escribe dos funciones genéricas:

1. `primero(lista)`: devuelve el primer elemento de la lista, o `undefined` si está vacía.
2. `ultimo(lista)`: devuelve el último elemento de la lista, o `undefined` si está vacía.

Las dos deben recibir un `T[]` y devolver `T | undefined`, de modo que:

- `primero([1, 2, 3])` tenga tipo `number | undefined`.
- `ultimo(["a", "b"])` tenga tipo `string | undefined`.
- Si la lista es de `Mensaje`, el resultado sea `Mensaje | undefined`, y TypeScript te obligue a comprobar el `undefined` antes de leer `.texto`.

## Reglas

- No modifiques la lista.
- Devuelve el **mismo** elemento (no una copia).
- No uses `any`.

## Ejemplos

```ts
primero([10, 20, 30]);     // 10
ultimo(["hola", "chau"]);  // "chau"
primero([]);               // undefined
ultimo([]);                // undefined

const mensajes: Mensaje[] = [{ autor: "Ana", texto: "Hola" }, { autor: "Luis", texto: "¿Vamos?" }];
const m = ultimo(mensajes);  // tipo Mensaje | undefined
m.texto;                     // error de tipos: m puede ser undefined
m?.texto;                    // "¿Vamos?"
```
