## Idea clave

Una **unión discriminada** es una unión de objetos que comparten una propiedad con un **valor literal distinto** en cada variante (aquí, `estado`). Cuando revisas esa propiedad (`if (pedido.estado === "pagado")` o un `switch`), TypeScript **estrecha** el tipo a esa variante y te deja usar sus datos. Así cada estado tiene solo sus datos y los estados imposibles no compilan.

## Paso a paso

1. **Una variante por estado.** Cada una con `estado` como literal y solo sus campos. `enviado` y `entregado` repiten `pagadoEn` y `codigoSeguimiento` porque esos datos siguen siendo ciertos.
2. **`transicionar` compara estado y acción a la vez.** Hay 5 transiciones válidas (cancelar cuenta doble). Cada una es un `if` con las dos condiciones. Dentro, TypeScript sabe la variante exacta de las dos: en `pedido.estado === "pendiente" && accion.tipo === "pagar"`, `accion.fecha` existe.
3. **Construir el nuevo pedido.** `pagar` crea uno desde cero (`pendiente` no tenía datos). `enviar` y `entregar` copian con spread `{ ...pedido, ... }` y cambian `estado`. `cancelar` crea uno nuevo con solo `id` y `motivo`: si copiaras con spread, arrastrarías `pagadoEn`, que un `cancelado` no tiene.
4. **Todo lo demás es error.** Si ningún `if` devolvió, la combinación no está permitida: `throw new Error(...)` con el tipo y el estado.
5. **`mensajeDeEstado` con `switch`.** Un `case` por estado. En cada `case`, `pedido` está estrechado: en `"pagado"` existe `pedido.pagadoEn`, en `"cancelado"` existe `pedido.motivo`.
6. **El `default` con `never`.** Si cubriste todos los estados, en el `default` `pedido` es de tipo `never` (no queda ninguna variante). Asignarlo a una variable `never` compila. Si mañana agregas `"devuelto"` y olvidas su `case`, esa línea da error: TypeScript te avisa de **todos** los lugares que debes actualizar.

```ts
export function transicionar(pedido: Pedido, accion: Accion): Pedido {
  if (pedido.estado === "pendiente" && accion.tipo === "pagar") {
    return { estado: "pagado", id: pedido.id, pagadoEn: accion.fecha };
  }
  if (pedido.estado === "pagado" && accion.tipo === "enviar") {
    return { ...pedido, estado: "enviado", codigoSeguimiento: accion.codigoSeguimiento };
  }
  if (pedido.estado === "enviado" && accion.tipo === "entregar") {
    return { ...pedido, estado: "entregado" };
  }
  if ((pedido.estado === "pendiente" || pedido.estado === "pagado") && accion.tipo === "cancelar") {
    return { estado: "cancelado", id: pedido.id, motivo: accion.motivo };
  }
  throw new Error(`No se puede ${accion.tipo} un pedido ${pedido.estado}`);
}
```

## Por qué funciona

Recorrido del flujo completo:

| Paso | `pedido.estado` | `accion.tipo` | `if` que coincide | Resultado |
|---|---|---|---|---|
| 1 | `pendiente` | `pagar` | el primero | `{ estado: "pagado", id: "P-1", pagadoEn: "2026-11-14" }` |
| 2 | `pagado` | `enviar` | el segundo | `{ ...pedido, estado: "enviado", codigoSeguimiento: "OLV-123" }` |
| 3 | `enviado` | `cancelar` | ninguno | `Error: No se puede cancelar un pedido enviado` |
| 3 bis | `enviado` | `entregar` | el tercero | `{ ...pedido, estado: "entregado" }` |

Y cómo cambia el tipo de `pedido` en `mensajeDeEstado`:

| Dónde | Tipo de `pedido` | ¿Puedo leer `pedido.motivo`? |
|---|---|---|
| antes del `switch` | `Pedido` (las 5 variantes) | no: no todas lo tienen |
| `case "cancelado":` | `{ estado: "cancelado"; id; motivo }` | sí |
| `case "pagado":` | `{ estado: "pagado"; id; pagadoEn }` | no |
| `default:` | `never` | (no queda nada) |

Por eso en el test, `p.codigoSeguimiento` sin revisar el estado debe dar error: `p` podría ser un pedido pendiente.

El spread no modifica el original: `{ ...pedido }` crea un objeto **nuevo** con las mismas propiedades. Y cuando escribes `estado: "enviado"` **después** del spread, pisa el `estado` copiado.

## Errores comunes

- **Un tipo con todo opcional** (`pagadoEn?: string; codigoSeguimiento?: string; ...`). Compila, pero acepta pedidos imposibles: fallan los `@ts-expect-error` del último test.
- **`estado: string`** en las variantes. Sin literales no hay discriminante: TypeScript no puede estrechar y `"perdido"` sería válido.
- **Usar spread al cancelar.** `{ ...pedido, estado: "cancelado", motivo }` desde `pagado` arrastra `pagadoEn`. TypeScript no siempre lo marca (las propiedades extra en un spread se permiten), pero el test de `toEqual` falla.
- **Poner el spread al final**: `{ estado: "enviado", ...pedido }`. El `estado` viejo del spread pisa el nuevo y el pedido sigue `"pagado"`.
- **Modificar el pedido** (`pedido.estado = "pagado"`). Además de cambiar el original (falla "no modifica el pedido original"), TypeScript se queja porque el objeto pasaría a ser una variante distinta sin los datos que necesita.
- **Olvidar `cancelar` desde `pagado`.** Solo cubres `pendiente` y el test de cancelar falla con "No se puede cancelar un pedido pagado".

## Otra forma de resolverlo

**Una tabla de transiciones** en vez de varios `if`. Separa "qué se permite" de "cómo se construye el nuevo pedido":

```ts
const permitidas: Record<Accion["tipo"], Pedido["estado"][]> = {
  pagar: ["pendiente"],
  enviar: ["pagado"],
  entregar: ["enviado"],
  cancelar: ["pendiente", "pagado"],
};

if (!permitidas[accion.tipo].includes(pedido.estado)) {
  throw new Error(`No se puede ${accion.tipo} un pedido ${pedido.estado}`);
}
```

`Accion["tipo"]` es la unión `"pagar" | "enviar" | "entregar" | "cancelar"` y `Pedido["estado"]`, la unión de estados: el `Record` te obliga a cubrir todas las acciones. Después de esa revisión todavía necesitas un `switch (accion.tipo)` para construir el pedido, y ahí TypeScript no sabe qué estado tiene `pedido`, así que tendrás que estrecharlo otra vez.

**¿Cuándo conviene?** La tabla se lee como un diagrama y se vuelve cómoda cuando hay muchos estados (por ejemplo, un flujo de aprobación con 10 pasos). Los `if` con las dos condiciones son más directos y dejan los tipos estrechados sin trabajo extra: con 5 transiciones, son la mejor opción. Para flujos grandes existen librerías como **XState**.

## Cómo explicarlo en la entrevista

> "Modelé el pedido como una unión discriminada por `estado`: cada variante tiene solo los datos que existen en ese estado, así que un pedido pendiente con código de seguimiento ni siquiera compila. En `transicionar` reviso estado y acción juntos; dentro de cada `if` TypeScript estrecha los dos tipos y puedo leer, por ejemplo, la fecha del pago sin comprobar `undefined`. Devuelvo siempre un objeto nuevo y, si la combinación no está permitida, lanzo un error claro. En `mensajeDeEstado` uso un `switch` con un `default` que asigna a `never`: si alguien agrega un estado y olvida el caso, no compila."

## Conceptos

- **Uniones discriminadas** (tema de Aprender: uniones y narrowing).
- **Tipos literales** como discriminante: `estado: "pagado"`.
- **Narrowing** con `===`, `&&` y `switch`.
- **Comprobación exhaustiva con `never`**.
- **Acceso indexado a una unión**: `Pedido["estado"]` da la unión de estados.
- **Spread** para copiar y cambiar sin mutar.
- **Máquina de estados**: estados finitos y transiciones permitidas.
- **"Haz que los estados imposibles no se puedan representar"**: diseñar los tipos para que el error no se pueda escribir.
