## Idea clave

Una **transacción** agrupa varias sentencias para que sean **todo o nada**: `BEGIN` la abre, `COMMIT` confirma todos los cambios juntos y `ROLLBACK` los deshace todos. El patrón en código es: `BEGIN`, `try { ...; COMMIT }`, `catch { ROLLBACK; throw }`. Así, si la suma al destino falla, la resta al origen también se deshace y el dinero no desaparece.

## Paso a paso

1. **Valida lo que no necesita la base** antes de abrir la transacción. Si falla aquí, no hay nada que deshacer:

   ```js
   if (typeof monto !== "number" || !(monto > 0)) throw new Error("El monto debe ser mayor que cero");
   if (origenId === destinoId) throw new Error("El origen y el destino deben ser distintos");
   ```

2. **Abre la transacción** y, desde ese momento, todo va dentro de un `try`:

   ```js
   db.exec("BEGIN");
   try {
     // ...
   ```

3. **Revisa el origen.** `.get()` devuelve `undefined` si no hay billetera:

   ```js
   const origen = db.prepare("SELECT saldo FROM billeteras WHERE cliente_id = ?").get(origenId);
   if (!origen) throw new Error("La billetera de origen no existe");
   if (origen.saldo < monto) throw new Error("Saldo insuficiente");
   ```

4. **Haz los dos `UPDATE`.** `saldo = saldo - ?` usa el valor actual de la fila. Si el destino no existe, el segundo `UPDATE` no falla, solo devuelve `changes: 0`, así que tú lanzas el error:

   ```js
   db.prepare("UPDATE billeteras SET saldo = saldo - ? WHERE cliente_id = ?").run(monto, origenId);
   const { changes } = db.prepare("UPDATE billeteras SET saldo = saldo + ? WHERE cliente_id = ?").run(monto, destinoId);
   if (changes === 0) throw new Error("La billetera de destino no existe");
   ```

5. **Confirma al final del `try`:** `db.exec("COMMIT")`.

6. **En el `catch`, deshaz y relanza.** `ROLLBACK` devuelve la base al estado del `BEGIN`. `throw error` hace que quien llamó se entere (y que el test vea el mensaje):

   ```js
   } catch (error) {
     db.exec("ROLLBACK");
     throw error;
   }
   ```

## Por qué funciona

Recorrido de `transferir(db, 1, 3, 200)`: Ana (1200) le quiere regalar 200 a María (4900), pero María pasaría a 5100 y el `CHECK` lo prohíbe.

| Paso | Ana | María | ¿Definitivo? |
|---|---|---|---|
| `BEGIN` | 1200 | 4900 | |
| `SELECT` origen: 1200 >= 200 | 1200 | 4900 | |
| `UPDATE` resta | **1000** | 4900 | no, está dentro de la transacción |
| `UPDATE` suma: 5100 viola el `CHECK` | 1000 | 4900 | SQLite lanza `CHECK constraint failed` |
| `catch`: `ROLLBACK` | **1200** | 4900 | sí, todo vuelve al `BEGIN` |
| `throw error` | 1200 | 4900 | el test recibe el error |

**Sin transacción**, la resta ya estaría guardada cuando falla la suma: Ana quedaría con 1000, María con 4900, y 200 soles se habrían esfumado. Lo mismo con el destino 99, que no existe.

El último test revisa `db.isTransaction`, una propiedad de `node:sqlite` que dice si hay una transacción abierta. Si olvidas el `ROLLBACK`, la transacción queda abierta después del error y la siguiente llamada a `BEGIN` falla con `cannot start a transaction within a transaction`.

## Errores comunes

- **No usar transacción.** Validas el destino con un `SELECT` y crees que basta. Pero hay errores que solo aparecen al escribir, como el tope de 5000. Lo reconoces en el test del tope: Ana queda con 1000.
- **Olvidar el `ROLLBACK` en el `catch`.** El cambio parcial queda pendiente y la transacción sigue abierta. Lo reconoces en el test de `isTransaction`.
- **Tragarse el error** (`catch` sin `throw`). La función termina "bien" aunque no transfirió nada; quien la llama cree que funcionó. Lo reconoces porque `toThrow` falla.
- **Hacer `COMMIT` fuera del `try`**, o `ROLLBACK` en un `finally`. Si va en `finally`, también se ejecuta cuando todo salió bien y deshace la transferencia correcta.
- **Validar el monto con `if (!monto)`.** Deja pasar montos negativos: `transferir(db, 1, 2, -50)` le **quitaría** dinero a Luis.
- **Comparar ids de tipos distintos.** Aquí ambos llegan como números; si vinieran de una URL serían textos (`"1"`), y `"1" === 1` es falso: la validación de "distintos" no los detectaría. Conviértelos con `Number()` antes.

## Otra forma de resolverlo

**Un ayudante reutilizable.** Como el patrón `BEGIN / try / COMMIT / catch / ROLLBACK` se repite, es común escribirlo una vez:

```js
function enTransaccion(db, trabajo) {
  db.exec("BEGIN");
  try {
    const resultado = trabajo();
    db.exec("COMMIT");
    return resultado;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

// uso
enTransaccion(db, () => {
  // los dos UPDATE...
});
```

Así la lógica del negocio queda limpia y nadie olvida el `ROLLBACK`. Librerías como `better-sqlite3` traen este ayudante (`db.transaction(fn)`), y los ORMs (Prisma, Sequelize) tienen el suyo.

**Restar con condición en vez de leer antes.** Puedes evitar el `SELECT` y dejar que el `WHERE` haga la comprobación del saldo:

```sql
UPDATE billeteras SET saldo = saldo - ? WHERE cliente_id = ? AND saldo >= ?
```

Si `changes` es 0, o no existe la billetera o no le alcanza. Es una sola sentencia (más difícil que dos peticiones simultáneas se crucen), pero pierdes la distinción entre "no existe" y "no alcanza" en el mensaje.

## Cómo explicarlo en la entrevista

> "Una transferencia son dos escrituras que deben ser atómicas: o se hacen las dos o ninguna. Valido el monto y los ids antes de empezar; luego abro una transacción con BEGIN, compruebo el saldo del origen, resto y sumo con parámetros, y si el destino no existe lanzo un error. Si todo va bien hago COMMIT; si cualquier cosa falla, incluido un error de la base como un CHECK, el catch hace ROLLBACK y vuelve a lanzar el error para que el llamador se entere. Esa es la A de ACID, atomicidad."

## Conceptos

- **Transacción**: grupo de sentencias que se confirma o se deshace como una unidad.
- **`BEGIN` / `COMMIT` / `ROLLBACK`**: abrir, confirmar y deshacer.
- **Patrón `try / catch` con relanzamiento**: `ROLLBACK` en el `catch` y `throw error` para no ocultar el fallo.
- **Restricción `CHECK`**: regla que la base hace cumplir en cada escritura.
- **`db.isTransaction`**: propiedad de `node:sqlite` que indica si hay una transacción abierta.
- **ACID**: Atomicidad (todo o nada), Consistencia (se respetan las reglas), Aislamiento (las transacciones no se pisan), Durabilidad (lo confirmado no se pierde).
