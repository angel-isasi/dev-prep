## Idea clave

Con dos parámetros de tipo, `<T, K extends keyof T>`, la función acepta listas de cualquier tipo, pero solo con claves que **existen** en ese tipo. `keyof T` es la lista de nombres de propiedades de `T`, y `extends` pone esa restricción. La lógica es un objeto que se va llenando grupo por grupo.

## Paso a paso

1. **Qué es `keyof`.** Para `interface Producto { nombre: string; categoria: string; precio: number }`, `keyof Producto` es `"nombre" | "categoria" | "precio"`. Es un tipo hecho de los nombres de las propiedades.

2. **Restringe la clave con `extends`.** `K extends keyof T` se lee "K tiene que ser una de las claves de T". Por eso `agruparPor(productos, "color")` da error: `"color"` no está en `keyof Producto`. Sin la restricción (`clave: string`), cualquier texto pasaría y obtendrías un único grupo `"undefined"` sin enterarte.

3. **Lee la propiedad con tipo.** `elemento[clave]` tiene tipo `T[K]` (un *indexed access type*): "el tipo de la propiedad K de T". Con `"precio"` sería `number`; con `"categoria"`, `string`. Como el valor puede ser de cualquier tipo, lo pasas por `String()` para usarlo como clave del objeto.

4. **Llena el objeto de grupos.** La primera vez que aparece un valor, el grupo no existe: lo creas vacío. Luego haces `push`:

   ```ts
   const grupos: Record<string, T[]> = {};
   for (const elemento of lista) {
     const grupo = String(elemento[clave]);
     if (!grupos[grupo]) {
       grupos[grupo] = [];
     }
     grupos[grupo].push(elemento);
   }
   return grupos;
   ```

5. **Tipa el acumulador.** `const grupos = {}` sin anotación sería de tipo `{}` y no te dejaría asignar `grupos[grupo]`. `Record<string, T[]>` dice "un objeto con claves de texto y valores que son listas de T".

## Por qué funciona

Recorrido con `agruparPor(productos, "categoria")`:

| Elemento | `elemento[clave]` | ¿Existía el grupo? | `grupos` después |
|---|---|---|---|
| Polo | `"ropa"` | no, se crea | `{ ropa: [Polo] }` |
| Mouse | `"tecnologia"` | no, se crea | `{ ropa: [Polo], tecnologia: [Mouse] }` |
| Jean | `"ropa"` | sí | `{ ropa: [Polo, Jean], tecnologia: [Mouse] }` |

Como el bucle recorre la lista en orden y cada `push` agrega al final, el orden dentro de cada grupo es el original. Y como solo leemos la lista (nunca la modificamos), el original queda igual: los grupos guardan **referencias** a los mismos objetos.

Con `agruparPor(tareas, "hecha")`, `String(true)` es `"true"` y `String(false)` es `"false"`, por eso esos son los nombres de los grupos.

## Errores comunes

- **Tipar la clave como `string`.** La lógica funciona, pero TypeScript no puede comprobar que la propiedad exista y además `elemento[clave]` da error ("no se puede usar string para indexar T"). El test con `@ts-expect-error` falla por directiva no usada.
- **Olvidar crear el grupo.** `grupos[grupo].push(elemento)` sobre un grupo inexistente lanza `Cannot read properties of undefined (reading 'push')`.
- **Usar `const grupos = {}` sin tipo.** TypeScript lo tipa como `{}` y protesta al indexarlo.
- **Escribir `<T, K>` sin `extends keyof T`.** Entonces `K` puede ser cualquier cosa y `elemento[clave]` no compila.
- **Copiar los elementos (`{ ...elemento }`).** No es necesario y rompe comparaciones por referencia: agrupar no debe crear objetos nuevos.

## Otra forma de resolverlo

**Con `reduce`**, el acumulador es el objeto de grupos:

```ts
export function agruparPor<T, K extends keyof T>(lista: T[], clave: K): Record<string, T[]> {
  return lista.reduce<Record<string, T[]>>((grupos, elemento) => {
    const grupo = String(elemento[clave]);
    (grupos[grupo] ??= []).push(elemento);
    return grupos;
  }, {});
}
```

Es más compacta. Fíjate en `reduce<Record<string, T[]>>`: le dices el tipo del acumulador, porque `{}` solo no lo dice. `??=` asigna solo si el valor es `null` o `undefined`. El `for...of` es más fácil de leer y de explicar en voz alta; el `reduce` es común en código de equipos.

**Con `Object.groupBy`** (JavaScript moderno, ES2024): `Object.groupBy(lista, (p) => String(p.categoria))` hace lo mismo. Vale mencionarlo en una entrevista, pero te pedirán escribirlo a mano.

## Cómo explicarlo en la entrevista

> "La hice genérica con dos parámetros de tipo: T para el elemento y K restringido a keyof T, así solo acepta nombres de propiedades que existen y TypeScript marca un error si paso una clave inventada. Recorro la lista una vez, leo elemento[clave], que tiene tipo T[K], lo paso a texto, creo el grupo si no existe y hago push. Es O(n), mantiene el orden dentro de cada grupo y no modifica la lista original."

## Conceptos

- **`keyof T`**: unión de los nombres de las propiedades de `T`.
- **Restricción de genérico (`K extends keyof T`)**: limita qué tipos acepta un parámetro de tipo.
- **Tipo de acceso indexado (`T[K]`)**: el tipo de la propiedad `K` de `T`.
- **`Record<string, T[]>`**: objeto con claves de texto y valores de un tipo fijo.
- **Agrupar**: patrón muy común en interfaces (tablero por estado, productos por categoría).
- **Referencias**: los grupos apuntan a los mismos objetos, no a copias.
- Repasa el tema de Aprender "TS: genéricos" y, en la Referencia, `reduce` y `Object.keys`.
