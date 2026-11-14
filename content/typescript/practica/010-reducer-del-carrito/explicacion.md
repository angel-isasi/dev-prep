## Idea clave

Las acciones del reducer son una **unión discriminada** por `tipo`: cada una trae solo sus datos, y en cada `case` TypeScript sabe cuáles son. En el `default`, una función que recibe `never` garantiza la **exhaustividad**: si todas las acciones tienen su `case`, ahí no queda ninguna (el tipo es `never`) y compila; si falta una, `tsc` marca el error. El reducer nunca modifica el estado: devuelve uno nuevo.

## Paso a paso

1. **Tipa las acciones.** Una variante por acción, con `tipo` literal y sus datos:

   ```ts
   export type AccionCarrito =
     | { tipo: "agregar"; producto: Producto }
     | { tipo: "quitar"; id: number }
     | { tipo: "cambiarCantidad"; id: number; cantidad: number }
     | { tipo: "vaciar" };
   ```

   Así `{ tipo: "quitar" }` sin `id` no compila, y `{ tipo: "vaciar", id: 3 }` tampoco.

2. **La función de exhaustividad.** `never` es el tipo "vacío": ningún valor real lo tiene. Una función que **recibe** `never` solo se puede llamar donde TypeScript ya descartó todas las posibilidades.

   ```ts
   export function asegurarNunca(valor: never): never {
     throw new Error(`Acción desconocida: ${JSON.stringify(valor)}`);
   }
   ```

   Devuelve `never` porque nunca termina normal: siempre lanza.

3. **El `switch`.** En `case "agregar":` la variable `accion` es la variante de agregar, así que existe `accion.producto`. En `case "quitar":` existe `accion.id`. Cada `case` va entre llaves `{ }` para poder declarar `const` sin que choquen los nombres.
4. **Agregar.** Con `some` preguntas si ya está. Si está, `map` devuelve un array nuevo donde ese ítem es un objeto nuevo con `cantidad + 1`. Si no está, `[...estado.items, { ...producto, cantidad: 1 }]`.
5. **Quitar, cambiar y vaciar.** `filter` para quitar, `map` para cambiar (y `filter` si la cantidad es 0 o menos), `[]` para vaciar.
6. **El `default`.** `return asegurarNunca(accion);`. Pasa el cursor sobre `accion` ahí: su tipo es `never`.

## Por qué funciona

Recorrido de una sesión de compra, empezando con `{ items: [] }`:

| Acción | `case` | Qué hace | `items` después |
|---|---|---|---|
| agregar Inca Kola | `"agregar"` | no está: la agrega | `[Inca x1]` |
| agregar Pan | `"agregar"` | no está: la agrega | `[Inca x1, Pan x1]` |
| agregar Inca Kola | `"agregar"` | ya está: `map` suma 1 | `[Inca x2, Pan x1]` |
| cambiarCantidad Pan a 6 | `"cambiarCantidad"` | 6 > 0: `map` | `[Inca x2, Pan x6]` |
| quitar id 1 | `"quitar"` | `filter` | `[Pan x6]` |
| vaciar | `"vaciar"` | array nuevo vacío | `[]` |

Cada paso devuelve un objeto **nuevo**. El estado anterior queda igual, y por eso React detecta el cambio comparando referencias (`anterior !== nuevo`).

Cómo ve TypeScript la variable `accion` a lo largo del `switch`: al entrar es la unión de 4; cada `case` que retorna saca una variante. En el `default` ya no queda nada: `never`. Si mañana agregas `{ tipo: "aplicarCupon"; codigo: string }` y olvidas su `case`, en el `default` `accion` es esa variante, y `asegurarNunca(accion)` falla: "El argumento de tipo '{ tipo: "aplicarCupon"; ... }' no se puede asignar al parámetro de tipo 'never'". Es un recordatorio automático en el lugar exacto.

## Errores comunes

- **Mutar el estado**: `estado.items.push(...)` o `item.cantidad++`. En React la pantalla no se actualiza porque la referencia es la misma. El test "no modifica el estado original" congela el estado con `Object.freeze`: cualquier mutación lanza un error.
- **Crear el array nuevo pero mutar el ítem**: `estado.items.map((item) => { item.cantidad++; return item; })`. El array es nuevo, pero el objeto de adentro es el mismo y lo modificaste. Usa `{ ...item, cantidad: item.cantidad + 1 }`.
- **Olvidar el `return` en un `case`.** La ejecución "cae" al siguiente `case` (fall-through). TypeScript con `strict` no siempre lo avisa; revisa que cada `case` termine con `return`.
- **Escribir `default: return estado;`.** Compila, pero pierdes la exhaustividad: una acción nueva sin `case` pasa en silencio.
- **Declarar `const` en dos `case` sin llaves.** `const id` en `"quitar"` y en `"cambiarCantidad"` chocan porque todo el `switch` es un solo bloque. Las llaves de cada `case` lo resuelven.
- **Dejar `asegurarNunca` sin `throw`.** Una función que devuelve `never` no puede terminar normal: `tsc` da "Una función que devuelve 'never' no puede tener un punto de conexión alcanzable".

## Otra forma de resolverlo

**`satisfies never` en vez de una función**:

```ts
default: {
  accion satisfies never;
  throw new Error("Acción desconocida");
}
```

Hace la misma revisión de tipos sin crear una función, pero es una sintaxis más nueva (TypeScript 4.9) y menos conocida. La función `asegurarNunca` (en inglés suele llamarse `assertNever`) es el patrón clásico.

**Un `if` por acción** también funciona y angosta igual, pero con 4 o más acciones el `switch` es más ordenado y es lo que verás en los reducers de React.

Sobre la inmutabilidad: en proyectos grandes se usa **Immer** (incluido en Redux Toolkit), que te deja escribir `item.cantidad++` sobre un borrador y genera el estado nuevo por ti. Antes de usarlo, conviene dominar el spread como aquí.

## Cómo explicarlo en la entrevista

> "Tipo las acciones como una unión discriminada por tipo, así cada acción lleva solo sus datos y en cada case TypeScript sabe qué propiedades existen. El reducer es un switch que nunca muta el estado: uso spread, map y filter para devolver un estado nuevo, porque React compara referencias para re-renderizar. En el default llamo a asegurarNunca, que recibe never: si cubrí todas las acciones compila, y si alguien agrega una acción sin su case, TypeScript marca el error ahí. Es exhaustividad comprobada en compilación."

## Conceptos

- **Reducer**: función pura `(estado, accion) => nuevoEstado`, la base de `useReducer` y Redux.
- **Unión discriminada**: acciones con un `tipo` literal distinto.
- **`never`**: el tipo sin valores; aparece cuando el narrowing descartó todo.
- **Exhaustividad**: `asegurarNunca(accion)` en el `default` obliga a cubrir cada caso.
- **Inmutabilidad**: spread de objetos y arrays, `map`, `filter`; nunca `push` ni asignar sobre el estado.
- **`extends` en interfaces**: `ItemCarrito extends Producto` hereda sus propiedades.
- **`Object.freeze`**: congela un objeto; en modo estricto, modificarlo lanza un error.
- **`satisfies`**: comprueba que un valor encaja con un tipo sin cambiar su tipo.
- Tema de Aprender: uniones y narrowing en TypeScript; React: `useReducer`.
