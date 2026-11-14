## Idea clave

`UPDATE tabla SET columna = valor WHERE condición` modifica filas y `DELETE FROM tabla WHERE condición` las borra. Se ejecutan con `.run()`, que devuelve `changes`: cuántas filas se afectaron. El `WHERE` es lo que decide **qué filas**: sin él, la sentencia afecta a la tabla entera.

## Paso a paso

1. **Valida primero.** Si el precio no sirve, lanza el error antes de tocar la base. `typeof` descarta textos y `!(x > 0)` descarta 0, negativos y `NaN`:

   ```js
   if (typeof nuevoPrecio !== "number" || !(nuevoPrecio > 0)) {
     throw new Error("El precio debe ser mayor que cero");
   }
   ```

2. **Actualiza una fila con `UPDATE ... WHERE id = ?`:**

   ```js
   const { changes } = db.prepare("UPDATE productos SET precio = ? WHERE id = ?").run(nuevoPrecio, productoId);
   ```

   Los `?` se llenan en orden: primero el del `SET`, luego el del `WHERE`.

3. **Usa `changes` para saber si existía.** Si el id no existe, el `UPDATE` no falla: simplemente no cambia ninguna fila y `changes` es 0.

   ```js
   return changes > 0;
   ```

4. **Actualiza varias filas a partir de su propio valor.** En el `SET`, `precio` significa "el precio actual de esta fila". Para un 10% de descuento, el nuevo precio es `precio * 90 / 100`:

   ```sql
   UPDATE productos SET precio = ROUND(precio * (100 - ?) / 100.0, 2) WHERE categoria = ?
   ```

   Se escribe `100.0` y no `100` para asegurar una división con decimales: en SQL, entero entre entero da entero (`7 / 2` es `3`).

5. **Borra con `DELETE ... WHERE`:**

   ```js
   const { changes } = db.prepare("DELETE FROM productos WHERE stock = 0").run();
   ```

## Por qué funciona

Recorrido de `aplicarDescuento(db, "monitores", 15)`. Los `?` se llenan con 15 y `"monitores"`, y la base revisa cada fila:

| id | categoria | ¿`WHERE`? | precio antes | `precio * 85 / 100.0` | `ROUND(..., 2)` |
|---|---|---|---|---|---|
| 3 | monitores | sí | 649 | 551.65 | 551.65 |
| 8 | monitores | sí | 999 | 849.15 | 849.15 |
| 4 | computadoras | no | 2899 | (no se toca) | 2899 |
| ... | ... | no | ... | (no se toca) | ... |

`changes` vale 2. El test revisa también que la Laptop siga en 2899 y el Teclado en 189: es la prueba de que tu `WHERE` funciona.

`borrarAgotados` la primera vez encuentra una fila con `stock = 0` (Audífonos) y devuelve 1. La segunda vez no hay ninguna: devuelve 0 sin error.

## Errores comunes

- **Olvidar el `WHERE`.** `UPDATE productos SET precio = ?` pone el mismo precio a los 8 productos; `DELETE FROM productos` vacía la tabla. En producción es uno de los errores más caros que existen. Lo reconoces en los tests que comparan las demás filas.
- **Invertir los parámetros** (`.run(productoId, nuevoPrecio)`). El producto 2 queda con precio 2 y se busca el id 49. El test dice que el precio es 2 en vez de 49.
- **Pensar que un id inexistente da error.** No lo da. Si no miras `changes`, devuelves `true` aunque no hayas cambiado nada.
- **Dividir entre `100` en vez de `100.0`.** En SQLite `precio` es `REAL`, así que aquí no se nota; pero si la columna fuera entera, `59 * 90 / 100` daría `53` y no `53.1`. Escribir `100.0` te protege en cualquier base.
- **Calcular el descuento en JavaScript fila por fila** (leer todos, calcular, hacer un `UPDATE` por cada uno). Funciona, pero son N+1 consultas; un solo `UPDATE` con la fórmula lo hace de una vez.
- **Validar con `if (!nuevoPrecio)`.** Deja pasar `-10` (es "truthy") y textos como `"barato"`.

## Otra forma de resolverlo

**Probar con `SELECT` antes de borrar.** Es la costumbre más útil del trabajo real: escribe primero el `SELECT` con el mismo `WHERE`, mira qué filas devuelve, y recién entonces cámbialo por `DELETE`:

```sql
SELECT * FROM productos WHERE stock = 0;   -- ¿son estas las que quiero borrar?
DELETE FROM productos WHERE stock = 0;
```

**Borrado lógico** (soft delete): muchas empresas no borran filas, las marcan. Se agrega una columna `activo` y el "borrado" es un `UPDATE`:

```sql
UPDATE productos SET activo = 0 WHERE stock = 0
```

Así puedes recuperar datos y mantener el historial de pedidos que apuntan a ese producto. El costo es que todas las consultas deben filtrar `WHERE activo = 1`.

**`RETURNING`** para saber **qué** filas cambiaron, no solo cuántas:

```js
db.prepare("DELETE FROM productos WHERE stock = 0 RETURNING nombre").all();   // [{ nombre: "Audífonos con micrófono" }]
```

## Cómo explicarlo en la entrevista

> "Valido los datos en el código antes de escribir. Luego hago un UPDATE con SET y un WHERE por id, con parámetros, y uso changes del resultado para saber si la fila existía, porque un UPDATE sobre un id inexistente no da error, solo afecta cero filas. Para el descuento uso una sola sentencia que calcula el nuevo precio a partir del actual, con ROUND a dos decimales. Lo más importante en UPDATE y DELETE es el WHERE: sin él se modifica la tabla entera. Por eso, antes de un DELETE en producción, pruebo el mismo WHERE con un SELECT."

## Conceptos

- **`UPDATE tabla SET col = valor WHERE ...`**: modifica filas existentes.
- **`DELETE FROM tabla WHERE ...`**: borra filas.
- **`changes`**: cantidad de filas afectadas, viene en el resultado de `.run()`.
- **Expresiones en `SET`**: el valor nuevo puede calcularse con el actual (`precio * 0.9`).
- **División entera vs decimal**: `7 / 2 = 3`, `7 / 2.0 = 3.5`.
- **Borrado lógico**: marcar como inactivo en vez de borrar.
