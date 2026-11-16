## Idea clave

Cuando una función devuelve arreglos u objetos, hay dos cosas nuevas que probar. La primera es **cómo comparar**: `toEqual` revisa el contenido, propiedad por propiedad, mientras que `toBe` revisa si es **el mismo objeto** en memoria. La segunda es **lo que la función no debe hacer**: modificar lo que recibe. Ese error no se ve en el valor que devuelve, así que solo lo atrapa un test que revise **la entrada después de llamar a la función**.

## Paso a paso

1. **Prepara datos frescos en cada test.** `crearCatalogo()` devuelve un arreglo nuevo cada vez. Si todos los tests compartieran un solo arreglo y una versión lo desordenara, los tests siguientes recibirían datos alterados y fallarían por la razón equivocada.
2. **Prueba el orden con precios de distintas cifras.** Con `9`, `25`, `100` y `500`, ordenar como número da `[9, 25, 100, 500]` y ordenar como texto da `[100, 25, 500, 9]`, porque el texto se compara letra por letra y `"1"` va antes que `"2"`. Con `10`, `20` y `30` no verías la diferencia.
3. **Prueba el límite del filtro.** Con un máximo de `100`, el Teclado de `100` debe entrar. Ese test atrapa el `<` que debió ser `<=`.
4. **Compara objetos completos con `toEqual`.** `toEqual([{ id: 4, nombre: "Cable USB", precio: 9 }, ...])` falla si falta el `id`. Si solo revisaras `.map((p) => p.nombre)`, la versión que pierde propiedades pasaría.
5. **Prueba la inmutabilidad.** Guarda `const copia = [...productos]` antes de llamar a la función y, después, `expect(productos).toEqual(copia)`. La versión que hace `productos.sort(...)` primero reordena el arreglo original, y la copia lo delata.

## Por qué funciona

| Mutante | Qué rompe | Test que lo atrapa |
|---|---|---|
| Usa `<` en vez de `<=` | límite del filtro | con máximo `100`, el Teclado entra |
| Ordena de mayor a menor | orden | precios `[9, 25, 100, 500]` |
| Ordena antes de filtrar | no modificar el original | `productos` sigue igual a `copia` |
| Ordena como texto | orden numérico | precios `[9, 25, 100, 500]` |
| Pierde propiedades | productos completos | `toEqual` con `id`, `nombre` y `precio` |

¿Por qué sirve `[...productos]` como copia? Crea un **arreglo nuevo** con los mismos objetos adentro. Si la función reordena el original, la copia conserva el orden de antes. Es una copia superficial: si la función cambiara el `precio` de un objeto, la copia también lo vería, porque comparten los objetos. Para revisar eso necesitarías `structuredClone(productos)`.

## Errores comunes

- **Usar `toBe` con arreglos.** `expect(productosBaratos(...)).toBe([...])` falla siempre, incluso con la función correcta: son dos arreglos distintos aunque tengan lo mismo. `toBe` es para números, textos y booleanos, o para comprobar que algo es el mismo objeto.
- **Compartir un solo arreglo entre tests.** Si una versión lo desordena en el primer test, los demás fallan en cadena y el reporte confunde. Crea los datos dentro de cada test.
- **Guardar la "copia" sin copiar.** `const copia = productos` no copia nada: es otro nombre para el mismo arreglo. Si la función lo reordena, `copia` también cambia y el test pasa siempre.
- **Elegir precios que no muestran el error.** `[10, 20, 30]` queda igual ordenado como número o como texto. Mete cifras distintas.

## Otra forma de resolverlo

Para la inmutabilidad, en vez de una copia puedes **congelar** la entrada. Con `Object.freeze`, métodos como `sort` o `push` lanzan un error si intentan modificar el arreglo:

```js
test("no modifica el arreglo original", () => {
  const productos = Object.freeze(crearCatalogo());
  expect(() => productosBaratos(productos, 1000)).not.toThrow();
});
```

La versión que hace `productos.sort(...)` intenta reordenar un arreglo congelado y lanza un `TypeError`. Es más corto, pero el mensaje es menos claro que comparar con una copia.

## Cómo explicarlo en la entrevista

> "Usé `toEqual` porque compara el contenido; con `toBe` dos arreglos iguales no pasan. Elegí precios de distintas cifras para que un orden como texto se notara, y probé el precio justo en el máximo. Además verifiqué que la función no modificara la entrada: guardé una copia antes y la comparé después, porque en React mutar el estado es un error clásico que no se ve en el valor que devuelve la función."

## Conceptos

- **`toEqual`**: compara contenido, propiedad por propiedad y posición por posición.
- **`toBe`**: compara con `Object.is`; para objetos, solo pasa si es el mismo objeto en memoria.
- **Inmutabilidad**: no modificar los datos que recibes; devolver datos nuevos.
- **`sort` modifica el arreglo**: ordena en el lugar. `filter`, `map` y `toSorted` devuelven uno nuevo.
- **Copia superficial**: `[...arr]` crea un arreglo nuevo, pero los objetos de adentro son los mismos.
