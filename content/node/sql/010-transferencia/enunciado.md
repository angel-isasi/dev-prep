La tienda tiene una **billetera** para cada cliente: saldo a favor que se puede usar en compras o regalar a otro cliente. Regalar saldo son **dos** operaciones: restar al que envía y sumar al que recibe. Si la primera se hace y la segunda falla, el dinero **desaparece**. Una **transacción** garantiza que se hagan las dos o ninguna.

## Las tablas

**clientes**

| id | nombre |
|---|---|
| 1 | Ana Torres |
| 2 | Luis Quispe |
| 3 | María Rojas |
| 4 | Jorge Mendoza |
| 5 | Carla Huamán |
| 6 | Diego Flores |

**billeteras**: una fila por cliente que tiene billetera (Carla y Diego no tienen).

| cliente_id | saldo |
|---|---|
| 1 | 1200 |
| 2 | 300 |
| 3 | 4900 |
| 4 | 0 |

Así se creó:

```sql
CREATE TABLE billeteras (
  cliente_id INTEGER PRIMARY KEY REFERENCES clientes(id),
  saldo INTEGER NOT NULL CHECK (saldo >= 0 AND saldo <= 5000)
);
```

El `CHECK` es una regla del negocio que la base hace cumplir: **ninguna billetera puede pasar de S/ 5000**. Si un `UPDATE` intenta dejar un saldo mayor, SQLite lanza un error.

## Qué hacer

Escribe `transferir(db, origenId, destinoId, monto)`:

1. Antes de empezar, valida:
   - `monto` debe ser un número mayor que 0: si no, `Error("El monto debe ser mayor que cero")`.
   - `origenId` y `destinoId` deben ser distintos: si no, `Error("El origen y el destino deben ser distintos")`.
2. Dentro de una **transacción**:
   - Si la billetera de origen no existe: `Error("La billetera de origen no existe")`.
   - Si su saldo es menor que `monto`: `Error("Saldo insuficiente")`.
   - Resta `monto` al origen.
   - Suma `monto` al destino. Si la billetera de destino no existe: `Error("La billetera de destino no existe")`.
3. Si todo salió bien, confirma los cambios. Si **cualquier** cosa falló (tus errores o un error de la base, como el del tope de S/ 5000), **deshaz todo** y vuelve a lanzar el error.

## Cómo se usa una transacción en `node:sqlite`

```js
db.exec("BEGIN");      // empieza: desde aquí nada es definitivo
// ... tus UPDATE ...
db.exec("COMMIT");     // confirma: todos los cambios quedan guardados
// o, si algo salió mal:
db.exec("ROLLBACK");   // deshace todo lo hecho desde el BEGIN
```

## Ejemplos

```js
transferir(db, 1, 2, 200);   // Ana: 1200 -> 1000, Luis: 300 -> 500

transferir(db, 2, 1, 500);   // Error: Saldo insuficiente            (nadie cambia)
transferir(db, 1, 99, 200);  // Error: La billetera de destino no existe   (Ana sigue con 1200)
transferir(db, 1, 3, 200);   // Error de la base: María pasaría a 5100     (Ana sigue con 1200)
transferir(db, 1, 1, 50);    // Error: El origen y el destino deben ser distintos
```

La función no necesita devolver nada: los tests revisan los saldos en la tabla.
