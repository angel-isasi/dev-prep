## Idea clave

`map` con una función que devuelve promesas da un **arreglo de promesas**, no de resultados. Las promesas no tienen `nombre`, por eso sale `undefined`. Para esperar varias promesas a la vez se usa `Promise.all`, que las convierte en una sola promesa con todos los resultados, y esa sí se puede esperar con `await`.

## Paso a paso

1. **Lee el síntoma.** La cantidad de filas es correcta y la API responde bien. El problema está entre "llegan los datos" y "se leen los datos".
2. **Aísla.** Un `console.log(usuarios)` muestra `[Promise {<pending>}, Promise {<pending>}]`. No son usuarios: son promesas que todavía no terminan.
3. **Entiende por qué.** `obtenerUsuario` es asíncrona: devuelve una promesa al instante. `map` guarda lo que devuelve, sin esperar nada. Y la función tiene `async`, pero en ningún lugar hay un `await`.
4. **Espera todas con `Promise.all`.**

```js
const usuarios = await Promise.all(ids.map((id) => obtenerUsuario(id)));
return usuarios.map((usuario) => usuario.nombre);
```

## Por qué funciona

1. `ids.map(...)` lanza las tres peticiones **en paralelo** y da `[promesa1, promesa2, promesa3]`.
2. `Promise.all([...])` devuelve una sola promesa que se cumple cuando las tres terminaron, con `[usuario1, usuario2, usuario3]` **en el orden del arreglo original**, no en el orden en que llegaron.
3. `await` espera esa promesa, y `usuarios` ya es un arreglo de objetos con `nombre`.

En el test, el usuario 3 llega primero y el 1 último, y aun así el resultado sale `["Ana", "Luis", "Rosa"]`: el orden lo da la posición, no la llegada.

## Errores comunes

- **Poner `await` dentro del `map`**: `ids.map(async (id) => await obtenerUsuario(id))`. Una función `async` **siempre** devuelve una promesa, así que sigues teniendo un arreglo de promesas.
- **`await` directo sobre el arreglo**: `await ids.map(...)`. `await` sobre algo que no es una promesa devuelve ese mismo valor; el arreglo de promesas pasa sin esperar nada.
- **Un `for` con `await` en cada vuelta.** Funciona, pero pide los usuarios **uno tras otro**: si cada uno tarda 1 segundo, 10 usuarios tardan 10 segundos en vez de 1. El enunciado pide pedirlos a la vez.

## Otra forma de resolverlo

Con `.then`, sin `async/await`:

```js
export function cargarNombres(ids, obtenerUsuario) {
  return Promise.all(ids.map((id) => obtenerUsuario(id))).then((usuarios) => usuarios.map((u) => u.nombre));
}
```

Si quieres que una petición fallida no tumbe a las demás, se usa `Promise.allSettled`, que devuelve el estado de cada una (cumplida o rechazada) en vez de fallar entera.

## Cómo explicarlo en la entrevista

> "La API respondía bien pero los nombres salían `undefined`. Al imprimir vi que tenía un arreglo de promesas: `map` no espera, guarda la promesa que devuelve cada llamada. Lo envolví en `Promise.all` y le puse `await`; así las peticiones corren en paralelo y obtengo los resultados en el orden original. Un `await` dentro de un `for` también funciona, pero las haría una por una."

## Conceptos

- **Promesa**: un objeto que representa un valor que llegará después.
- **`async`**: la función siempre devuelve una promesa y permite usar `await` adentro.
- **`await`**: pausa la función hasta que la promesa se cumple y entrega su valor.
- **`Promise.all`**: espera un arreglo de promesas en paralelo y devuelve sus resultados en el mismo orden; falla si alguna falla.
- **Paralelo y secuencial**: lanzar todo a la vez o esperar cada petición antes de empezar la siguiente.
