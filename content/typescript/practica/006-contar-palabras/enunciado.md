Una tienda online quiere saber qué palabras se repiten más en las reseñas de un producto, para mostrar etiquetas como "rápido (12)" o "cómodo (8)". Escribe dos funciones:

1. `contarPalabras(texto: string): Record<string, number>`: devuelve un objeto donde cada **clave** es una palabra y cada **valor** es cuántas veces aparece.
2. `masFrecuente(conteo: Record<string, number>): string | null`: recibe ese objeto y devuelve la palabra con más apariciones, o `null` si el objeto está vacío.

Las claves no se conocen de antemano (dependen del texto), por eso no sirve una interface con propiedades fijas: se usa `Record<string, number>`, que significa "un objeto con claves de texto y valores numéricos".

## Reglas

- Cuenta sin distinguir mayúsculas: guarda las palabras en minúsculas.
- Quita los signos `. , ; : ! ? ¡ ¿` antes de contar.
- Las palabras se separan por uno o más espacios (o saltos de línea). No cuentes palabras vacías.
- Un texto vacío o solo con espacios devuelve `{}`.
- En `masFrecuente`, si hay empate, gana la palabra que aparece **primero** en el objeto.

## Ejemplos

```ts
contarPalabras("hola mundo hola");
// { hola: 2, mundo: 1 }

contarPalabras("Muy bueno. ¡Muy rápido!   Bueno");
// { muy: 2, bueno: 2, rápido: 1 }

contarPalabras("   ");
// {}

masFrecuente({ hola: 2, mundo: 1 });     // "hola"
masFrecuente({ muy: 2, bueno: 2 });      // "muy" (empate: la primera)
masFrecuente({});                        // null
```

## Reto extra

`Record<string, number>` es lo mismo que la **firma de índice** `{ [palabra: string]: number }`. Prueba las dos formas en VS Code y pasa el cursor sobre el tipo: TypeScript las trata igual.
