## Idea clave

Una clase junta datos y las operaciones que los cambian. Con `private` escondes el saldo para que solo cambie a través de `depositar` y `retirar`, que validan antes de tocar nada; con `readonly` el titular se fija una vez. Eso se llama **encapsulamiento**: el objeto protege sus propias reglas.

## Paso a paso

1. **Declara las propiedades con su modificador.** En TypeScript las propiedades de una clase se declaran arriba, con su tipo:

   ```ts
   readonly titular: string;
   private saldo: number;
   private movimientos: Movimiento[] = [];
   ```

   - Sin modificador, una propiedad es `public`: cualquiera la lee y la cambia.
   - `readonly`: se puede leer desde fuera, pero solo se asigna en la declaración o en el constructor.
   - `private`: solo el código dentro de la clase la ve. Desde fuera, `cuenta.saldo` es un error de tipos.

2. **El constructor valida y asigna.** Si el saldo inicial es negativo, lanzas el error **antes** de crear un objeto inválido. `saldoInicial = 0` es un parámetro por defecto, y TypeScript infiere que es `number`.

3. **Un método privado para no repetir.** `depositar` y `retirar` comparten la regla "el monto debe ser mayor que cero". Un `private validarMonto(monto)` la escribe una vez, y nadie desde fuera puede llamarlo.

4. **Primero validar, después modificar.** En `retirar`, las dos comprobaciones van antes de cambiar el saldo y de registrar el movimiento. Si lanzas el error a la mitad (después de restar), el objeto queda en un estado inconsistente.

   ```ts
   retirar(monto: number): void {
     this.validarMonto(monto);
     if (monto > this.saldo) throw new Error("Saldo insuficiente");
     this.saldo -= monto;
     this.movimientos.push({ tipo: "retiro", monto });
   }
   ```

5. **Devuelve copias de lo interno.** `historial()` devuelve `[...this.movimientos]`. Si devolvieras el arreglo privado, quien lo reciba podría hacer `push` y alterar el historial: `private` protege el nombre de la propiedad, no el objeto al que apunta.

## Por qué funciona

Recorrido de `new CuentaBancaria("Ana", 100)`, luego `depositar(50)`, `retirar(30)` y `retirar(500)`:

| Operación | Validaciones | `saldo` | `movimientos` |
|---|---|---|---|
| `constructor("Ana", 100)` | 100 no es negativo | 100 | `[]` |
| `depositar(50)` | 50 > 0 | 150 | `[depósito 50]` |
| `retirar(30)` | 30 > 0, 30 no supera 150 | 120 | `[depósito 50, retiro 30]` |
| `retirar(500)` | 500 > 0, pero 500 supera 120: **lanza** | 120 (sin cambios) | sin cambios |

Como el error se lanza antes de modificar, `verSaldo()` sigue en 120. El test usa `expect(() => cuenta.retirar(500)).toThrow(...)`: se pasa una **función** para que `expect` pueda atrapar el error.

Un detalle importante: `private` y `readonly` son revisiones de **TypeScript**, no de JavaScript. Al ejecutar, `saldo` es una propiedad normal. Te protegen mientras programas, que es donde se cometen los errores.

## Errores comunes

- **Modificar antes de validar.** Si restas y después compruebas, un retiro inválido deja el saldo negativo o un movimiento registrado de más.
- **Devolver `this.movimientos` directamente.** El test que hace `push` sobre el historial encuentra 3 movimientos en vez de 2.
- **Olvidar `this.`** dentro de los métodos. `saldo += monto` busca una variable local llamada `saldo` y da error "No se encuentra el nombre 'saldo'".
- **Llamar `toThrow` sin envolver en una función** (`expect(cuenta.retirar(500)).toThrow()`): el error se lanza antes de que `expect` lo pueda atrapar y el test falla.
- **Usar `<` en lugar de `<=` para el monto.** `depositar(0)` no lanzaría error y el test de "montos de 0" falla.

## Otra forma de resolverlo

**Propiedades en el constructor** (parameter properties), un atajo de TypeScript:

```ts
export class CuentaBancaria {
  private movimientos: Movimiento[] = [];

  constructor(readonly titular: string, private saldo = 0) {
    if (saldo < 0) throw new Error("El saldo inicial no puede ser negativo");
  }
  // ...
}
```

Poner `readonly` o `private` delante de un parámetro del constructor lo declara y lo asigna en un solo paso. Es muy común en Angular y NestJS. La forma larga es más fácil de leer cuando estás aprendiendo.

**Campos privados de JavaScript** (`#saldo`): son privados también al ejecutar, no solo para TypeScript. Se usan cuando de verdad necesitas que nada externo pueda leerlos; en código de aplicación, `private` suele bastar.

**Un getter** en vez de `verSaldo()`: `get saldoActual() { return this.saldo; }` se lee como propiedad (`cuenta.saldoActual`) pero no se puede asignar.

## Cómo explicarlo en la entrevista

> "Usé una clase para encapsular el saldo: es private, así que solo cambia mediante depositar y retirar, que validan el monto y el saldo disponible antes de modificar nada; si algo falla, lanzan un error y el estado queda intacto. El titular es readonly porque no debe cambiar. historial devuelve una copia del arreglo, porque private protege la propiedad pero no el arreglo si lo entrego. Y aclararía que private es una revisión de TypeScript; si necesito privacidad real en tiempo de ejecución, uso los campos con numeral de JavaScript."

## Conceptos

- **Clase**: molde que junta datos (propiedades) y comportamiento (métodos).
- **Constructor**: método que se ejecuta con `new` y prepara el objeto.
- **`private`**: solo accesible dentro de la clase (lo revisa TypeScript).
- **`readonly`**: se asigna una vez y luego solo se lee.
- **Encapsulamiento**: el objeto controla cómo cambia su estado.
- **`throw new Error(...)`**: interrumpe la operación y avisa del problema.
- **Validar antes de modificar**: evita estados a medias.
- **Copia defensiva**: devolver copias de lo interno para que no lo alteren desde fuera.
- Repasa el tema de Aprender "TS: clases y módulos" y, en la Referencia, el spread de arreglos.
