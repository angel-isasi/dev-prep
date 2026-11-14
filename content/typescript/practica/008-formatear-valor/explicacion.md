## Idea clave

Con una unión (`string | number | boolean | null`), TypeScript no te deja usar métodos que no existen en **todos** los tipos. Para tratar cada uno usas **narrowing**: una comprobación (`valor === null`, `typeof valor === "number"`) que, dentro del `if`, angosta el tipo a uno solo. Cada `return` temprano descarta un tipo, y al final solo queda `string`.

## Paso a paso

1. **El tipo.** `export type ValorCelda = string | number | boolean | null;`. Con `unknown` o `any` no tendrías protección: `unknown` no te deja hacer nada sin comprobar, `any` te deja hacer todo sin comprobar.
2. **Descarta `null` primero.** `if (valor === null) return "Sin dato";`. No uses `typeof` para esto: `typeof null` es `"object"`, un error histórico de JavaScript.
3. **Booleanos.** `typeof valor === "boolean"`. Dentro, `valor` es `boolean` y devuelves `"Sí"` o `"No"`.
4. **Números.** `typeof valor === "number"`. Dentro, `valor` es `number` y `toFixed(2)` existe.
5. **Lo que queda es `string`.** Después de los tres `return`, TypeScript sabe que `valor` solo puede ser `string`: `valor.trim()` compila sin otra comprobación.

```ts
export function formatearValor(valor: ValorCelda): string {
  if (valor === null) return "Sin dato";
  if (typeof valor === "boolean") return valor ? "Sí" : "No";
  if (typeof valor === "number") return valor.toFixed(2);
  const limpio = valor.trim();
  return limpio === "" ? "Sin dato" : limpio;
}
```

## Por qué funciona

Así ve TypeScript el tipo de `valor` en cada línea:

| Línea | Tipo de `valor` |
|---|---|
| Al entrar | `string \| number \| boolean \| null` |
| Después de `if (valor === null) return` | `string \| number \| boolean` |
| Después de `if (typeof valor === "boolean") return` | `string \| number` |
| Después de `if (typeof valor === "number") return` | `string` |

Y con valores reales:
- `formatearValor(0)`: no es `null`, no es `boolean`, es `number`: `(0).toFixed(2)` da `"0.00"`.
- `formatearValor(false)`: no es `null`, es `boolean`: `false ? "Sí" : "No"` da `"No"`.
- `formatearValor("   ")`: llega al final, `trim()` da `""`, devuelve `"Sin dato"`.

## Errores comunes

- **Empezar con `if (!valor) return "Sin dato"`.** Atrapa `null`, pero también `0`, `false` y `""`. Los tests de `0` y `false` lo detectan: devuelves `"Sin dato"` en vez de `"0.00"` y `"No"`.
- **Usar `typeof valor === "null"`.** `typeof` nunca devuelve `"null"`; TypeScript incluso lo marca como error porque esa comparación no puede ser verdadera.
- **Llamar `valor.trim()` al principio.** Error de tipos: "La propiedad 'trim' no existe en el tipo 'number'". Es TypeScript diciéndote que falta un narrowing.
- **Dejar `unknown` como tipo.** Entonces los `@ts-expect-error` de `undefined` y objetos quedan sin usar, porque `unknown` acepta cualquier cosa.
- **Usar `String(valor)` para todo.** Devuelve `"null"`, `"true"` y `"12.5"` en vez de lo que pide la tabla.

## Otra forma de resolverlo

**Con `switch (typeof valor)`**:

```ts
export function formatearValor(valor: ValorCelda): string {
  if (valor === null) return "Sin dato";
  switch (typeof valor) {
    case "boolean": return valor ? "Sí" : "No";
    case "number": return valor.toFixed(2);
    case "string": {
      const limpio = valor.trim();
      return limpio === "" ? "Sin dato" : limpio;
    }
  }
}
```

TypeScript también angosta dentro de cada `case`. El `null` va afuera porque su `typeof` es `"object"`.

**¿Cuál conviene?** Los `if` con retorno temprano son lo más común y fácil de leer. El `switch` deja más claro que hay un caso por tipo. Las dos son narrowing: lo que importa es que entiendas que el tipo cambia según la comprobación.

## Cómo explicarlo en la entrevista

> "El valor es una unión de string, number, boolean y null. Con una unión solo puedo usar lo común a todos, así que voy angostando el tipo: primero descarto null con triple igual, porque typeof null da object. Luego typeof boolean y typeof number, cada uno con su return. Lo que queda es string y TypeScript lo sabe. Evito un if con negación al principio porque 0, false y el texto vacío también son falsy y mostraría Sin dato por error."

## Conceptos

- **Unión de tipos**: `A | B | C`, el valor es uno de ellos.
- **Narrowing**: una comprobación que angosta el tipo dentro de un bloque.
- **`typeof`**: devuelve `"string"`, `"number"`, `"boolean"`, `"object"`, `"undefined"`, `"function"`...
- **`typeof null === "object"`**: por eso `null` se comprueba con `===`.
- **Retorno temprano**: cada `return` descarta un tipo para el resto de la función.
- **Valores falsy**: `0`, `""`, `false`, `null`, `undefined`, `NaN`.
- **`unknown` vs `any`**: `unknown` obliga a comprobar, `any` desactiva la revisión.
- **`toFixed(2)`**: número a texto con 2 decimales.
- Tema de Aprender: uniones y narrowing en TypeScript.
