## El problema

Los usuarios escriben su nombre como sea: con espacios de más, todo en mayúsculas o todo en minúsculas. Antes de mostrarlo en el perfil, la app lo ordena con una función que ya está escrita y funciona. Te toca escribir **sus tests**.

La app tiene **la función correcta y 6 versiones con un error escondido cada una**. Tus tests tienen que pasar con la correcta y **fallar** con cada versión con error.

## La función que vas a probar

`formatearNombre(texto)` devuelve el nombre ordenado:

- Quita los espacios del **inicio y del final**.
- Si hay **varios espacios seguidos** entre palabras, deja uno solo.
- Cada palabra empieza con **mayúscula** y el resto va en **minúscula**. Esto incluye letras con tilde y la `ñ`.
- Si el texto está vacío o solo tiene espacios, devuelve `""`.

```js
formatearNombre("  ana   PÉREZ ");  // "Ana Pérez"
formatearNombre("JUAN carlos");     // "Juan Carlos"
formatearNombre("ángel ñuñez");     // "Ángel Ñuñez"
formatearNombre("   ");             // ""
```

## Tu tarea

En tu archivo, la función `misTests` recibe `test`, `expect` y la función a probar. Escribe ahí tus tests, igual que en Vitest:

```js
export function misTests({ test, expect }, formatearNombre) {
  test("pone mayúscula a cada palabra", () => {
    expect(formatearNombre("ana pérez")).toBe("Ana Pérez");
  });
}
```

Con textos, `toBe` compara letra por letra: un espacio de más al final ya hace fallar el test, que es justo lo que quieres.

Escribe **al menos 3 tests**. Prueba cada regla con un caso donde solo esa regla importe.
