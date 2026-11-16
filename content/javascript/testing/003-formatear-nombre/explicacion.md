## Idea clave

Con textos, los errores se esconden en lo que **no se ve**: un espacio al final, dos espacios en el medio, una letra con tilde. La técnica es pensar en **las clases de texto** que puede escribir un usuario real (con espacios en los bordes, con espacios repetidos, en mayúsculas, con tildes, vacío) y probar **una clase por test**. Un único test con "todos los problemas juntos" se ve completo, pero cuando falla no te dice qué regla está rota, y cuando pasa puede esconder versiones que fallan en otro caso.

## Paso a paso

1. **Lista las entradas raras que escribe la gente.** Espacios al inicio o al final (copiar y pegar los trae), espacios dobles, el teclado con Bloq Mayús activado, nombres con tilde o ñ, y el campo vacío.
2. **Un test por regla, con un texto donde solo esa regla importe.** `"  Ana Pérez  "` ya tiene bien las mayúsculas y no tiene espacios dobles en el medio: si el resultado sale mal, el culpable son los bordes.
3. **Espacios del medio aparte.** `"Ana     Pérez"` no tiene espacios en los bordes. Así separas la versión que no usa `trim` de la que divide con `split(" ")`.
4. **Mayúsculas en las dos direcciones.** `"ana pérez"` prueba que sube la inicial; `"JUAN CARLOS"` prueba que baja el resto. Son dos errores distintos.
5. **La tilde y la ñ en la inicial, en minúscula.** `"ángel ñuñez"`. Si escribes `"Ángel"`, la inicial ya viene bien y el test no revisa nada.
6. **El caso vacío.** `"   "` debe dar `""`. Una versión descuidada intenta leer `palabra[0]` de una palabra vacía y lanza un error.

## Por qué funciona

| Mutante | Qué rompe | Test que lo atrapa |
|---|---|---|
| No quita espacios de los bordes | `trim` | `"  Ana Pérez  "` da `"Ana Pérez"` |
| No junta espacios repetidos | `split(/\s+/)` | `"Ana     Pérez"` da `"Ana Pérez"` |
| No pasa a minúscula el resto | `toLowerCase` | `"JUAN CARLOS"` da `"Juan Carlos"` |
| Solo la primera palabra con mayúscula | una mayúscula por palabra | `"ana pérez"` da `"Ana Pérez"` |
| Solo convierte de la a a la z | tildes y ñ | `"ángel ñuñez"` da `"Ángel Ñuñez"` |
| Se rompe con solo espacios | texto vacío | `"   "` da `""` |

Si un test **lanza un error** en vez de devolver algo, también cuenta como fallido. Por eso el último mutante cae con un `toBe("")` normal: ni siquiera llega a devolver.

## Errores comunes

- **Escribir el esperado con un espacio invisible.** `toBe("Ana Pérez ")` (con espacio al final) hace fallar el test con la función correcta. Si un test de textos falla sin razón, revisa los bordes del esperado.
- **Usar solo nombres sin tildes.** `"maria lopez"` pasa en la versión que solo convierte de la a a la z. En Perú hay muchos nombres con tilde y con ñ: son casos reales, no exóticos.
- **Juntar todo en un solo test.** `"  ana   PÉREZ "` atrapa a varios mutantes a la vez, pero no al de las tildes ni al del texto vacío, y cuando falla no sabes cuál regla fue.
- **Probar el texto vacío solo con `""`.** Un texto de puros espacios es lo que llega cuando alguien toca la barra espaciadora sin querer. Pruébalo también.

## Otra forma de resolverlo

Una tabla con la entrada, lo esperado y qué regla revisa cada fila:

```js
const casos = [
  ["  Ana Pérez  ", "Ana Pérez", "bordes"],
  ["Ana     Pérez", "Ana Pérez", "espacios repetidos"],
  ["JUAN CARLOS", "Juan Carlos", "minúsculas"],
  ["ángel ñuñez", "Ángel Ñuñez", "tildes y ñ"],
  ["   ", "", "vacío"],
];
for (const [entrada, esperado, regla] of casos) {
  test(`regla: ${regla}`, () => {
    expect(formatearNombre(entrada)).toBe(esperado);
  });
}
```

Poner la regla en el nombre del test hace que el reporte diga directamente qué se rompió.

## Cómo explicarlo en la entrevista

> "Pensé en lo que escriben los usuarios de verdad: espacios pegados al copiar, espacios dobles, Bloq Mayús, nombres con tilde y campos vacíos. Hice un test por cada clase de entrada, con un texto donde solo esa regla importara, para que cuando falle sepa exactamente qué arreglar. Incluí tildes y ñ porque es fácil que una función solo funcione con letras sin acento."

## Conceptos

- **Partición de equivalencia**: dividir las entradas en grupos que la función trata igual y probar al menos una de cada grupo.
- **`trim`**: quita espacios, tabulaciones y saltos de línea del inicio y del final.
- **`split(/\s+/)`**: divide por uno o más espacios seguidos; `split(" ")` deja palabras vacías cuando hay espacios dobles.
- **`toUpperCase` y `toLowerCase`**: funcionan con tildes y ñ; una expresión como `/[a-z]/` no las incluye.
- **Un error lanzado es un test fallido**: si la función revienta, el test falla aunque no hayas usado `toThrow`.
