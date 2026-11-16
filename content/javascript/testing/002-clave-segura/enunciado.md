## El problema

El formulario de registro usa una función que decide si una contraseña es aceptable. La función ya está escrita y funciona. Falta lo que todo equipo pide antes de aprobar un cambio: **sus tests**.

La app tiene **la función correcta y 6 versiones con un error escondido cada una**. Tus tests tienen que pasar con la correcta y **fallar** con cada versión con error.

## La función que vas a probar

`esClaveSegura(clave)` devuelve `true` si la contraseña cumple **todas** estas reglas, y `false` si falla alguna:

- Tiene **entre 8 y 20 caracteres**, ambos incluidos.
- Tiene **al menos un número** (`0` a `9`).
- Tiene **al menos una mayúscula** (`A` a `Z`).

```js
esClaveSegura("Segura123");   // true
esClaveSegura("Abcdefg1");    // true  (8 caracteres justos)
esClaveSegura("Abcdef1");     // false (7 caracteres)
esClaveSegura("Abcdefgh");    // false (no tiene número)
esClaveSegura("abcdefg1");    // false (no tiene mayúscula)
```

## Tu tarea

En tu archivo, la función `misTests` recibe `test`, `expect` y la función a probar. Escribe ahí tus tests, igual que en Vitest:

```js
export function misTests({ test, expect }, esClaveSegura) {
  test("acepta una contraseña normal", () => {
    expect(esClaveSegura("Segura123")).toBe(true);
  });
}
```

Para comprobar `true` o `false` usa `toBe(true)` y `toBe(false)`. Para armar textos largos sin contar letras a mano: `"A1" + "x".repeat(18)` tiene 20 caracteres.

Escribe **al menos 3 tests**. Una regla "entre 8 y 20" tiene cuatro números que importan: ¿cuáles son?
