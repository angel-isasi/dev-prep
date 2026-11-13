## Idea clave

Lo que escribe el usuario llega sucio. En vez de limpiarlo en varios sitios, lo pasas por **una sola función pura** justo antes de enviarlo: entra el formulario crudo, sale un objeto nuevo y limpio.

## Paso a paso

1. **Devuelve un objeto nuevo** con `return { ... }`. Así nunca modificas el estado del formulario (que en React es inmutable) y el usuario sigue viendo lo que escribió.
2. **Nombre**: `trim()` quita los espacios de los extremos. Luego `replace(/\s+/g, " ")` reemplaza cada grupo de espacios seguidos por uno solo. En la expresión regular, `\s` es "un espacio en blanco" (espacio, tab, salto de línea), `+` es "uno o más" y `g` es "todas las veces, no solo la primera".
3. **Correo**: `trim()` y `toLowerCase()`. Los correos no distinguen mayúsculas en la práctica, así que normalizarlos evita duplicados.
4. **Teléfono**: `replace(/\D/g, "")`. `\D` (D mayúscula) es "cualquier cosa que **no** sea dígito"; al cambiarla por `""` se borra. Queda como texto para no perder un `0` inicial.
5. **Cantidad**: tres pasos encadenados:
   - `Number.parseInt(texto, 10)` lee el número entero del inicio del texto (`"2.7"` da `2`, `"abc"` da `NaN`). El `10` indica base decimal.
   - `|| 1`: si el resultado es "falsy" (`NaN` o `0`), usa `1`.
   - `Math.max(1, ...)`: si quedó negativo, lo sube a `1`.

```jsx
export function normalizarPedido(formulario) {
  return {
    nombre: formulario.nombre.trim().replace(/\s+/g, " "),
    correo: formulario.correo.trim().toLowerCase(),
    telefono: formulario.telefono.replace(/\D/g, ""),
    cantidad: Math.max(1, Number.parseInt(formulario.cantidad, 10) || 1),
  };
}
```

## Por qué funciona

Recorrido con el ejemplo del enunciado:

| Campo | Entrada | Paso a paso | Salida |
|---|---|---|---|
| nombre | `"  Angel   Isasi "` | `trim` da `"Angel   Isasi"`, `replace` junta los 3 espacios | `"Angel Isasi"` |
| correo | `" ANGEL@Unica.edu.pe "` | `trim` y `toLowerCase` | `"angel@unica.edu.pe"` |
| telefono | `"+51 987-654-321"` | se borran `+`, espacio y guiones | `"51987654321"` |
| cantidad | `"abc"` | `parseInt` da `NaN`, `NaN \|\| 1` da `1`, `max(1, 1)` | `1` |

Más casos de `cantidad`, que es la parte con trampa:

| Entrada | `parseInt` | `\|\| 1` | `Math.max(1, ...)` |
|---|---|---|---|
| `"3"` | `3` | `3` | `3` |
| `"2.7"` | `2` | `2` | `2` |
| `"0"` | `0` | `1` (0 es falsy) | `1` |
| `"-3"` | `-3` | `-3` (es truthy) | `1` |
| `""` | `NaN` | `1` | `1` |

Por eso hacen falta **las dos** defensas: `|| 1` cubre `NaN` y `0`, y `Math.max` cubre los negativos.

## Errores comunes

- **Usar `Number(texto)` en vez de `parseInt`.** `Number("2.7")` da `2.7` (no entero) y `Number("")` da `0`. Lo reconoces porque falla el caso `"2.7"`.
- **Olvidar la `g` en la regex.** `"+51 987-654-321".replace(/\D/, "")` solo quita el primer `+`. Con `g` se borran todos.
- **Usar `replace(" ", "")` para el nombre.** Con un texto (no regex) solo reemplaza la primera aparición, y además borraría el espacio entre nombre y apellido.
- **Modificar el objeto recibido** (`formulario.nombre = formulario.nombre.trim()`). Si `formulario` es tu estado de React, lo estás mutando: React no se entera y el input muestra cosas raras.
- **Convertir el teléfono a número.** `Number("056213456")` da `56213456`: se pierde el cero inicial.

## Otra forma de resolverlo

Con una **tabla de limpiadores**, una función por campo, y `Object.fromEntries` para armar el resultado:

```jsx
const LIMPIADORES = {
  nombre: (v) => v.trim().replace(/\s+/g, " "),
  correo: (v) => v.trim().toLowerCase(),
  telefono: (v) => v.replace(/\D/g, ""),
  cantidad: (v) => Math.max(1, Number.parseInt(v, 10) || 1),
};

export function normalizarPedido(formulario) {
  return Object.fromEntries(
    Object.entries(LIMPIADORES).map(([campo, limpiar]) => [campo, limpiar(formulario[campo])]),
  );
}
```

**¿Cuándo conviene?** Cuando el formulario tiene muchos campos o varios formularios comparten limpiadores (todos los correos se limpian igual). Para cuatro campos, la versión directa se lee más rápido, y en una entrevista es mejor empezar por ella.

## Cómo explicarlo en la entrevista

> "Asumo que lo que escribe el usuario viene sucio, así que antes de enviarlo lo paso por una función pura que devuelve un objeto nuevo. Recorto espacios y los repetidos con una regex, paso el correo a minúsculas, dejo solo los dígitos del teléfono y convierto la cantidad a un entero de al menos uno, cubriendo `NaN`, cero y negativos. Como no muta el estado y no depende de React, la pruebo con tests unitarios sin montar el formulario."

## Conceptos

- **Función pura**: no modifica sus argumentos y siempre da el mismo resultado para la misma entrada.
- **`trim`, `toLowerCase`**: métodos de string que devuelven un texto nuevo.
- **Expresiones regulares**: `\s` (espacio), `\D` (no dígito), `+` (uno o más), bandera `g` (todas las coincidencias).
- **`Number.parseInt(texto, 10)`**: lee un entero del inicio del texto; da `NaN` si no puede.
- **Valores falsy**: `0`, `NaN`, `""`, `null`, `undefined` y `false`; con ellos `||` usa el valor de la derecha.
- **`Math.max`**: para poner un límite inferior.
- **Inmutabilidad**: devolver un objeto nuevo en vez de cambiar el que llega.
