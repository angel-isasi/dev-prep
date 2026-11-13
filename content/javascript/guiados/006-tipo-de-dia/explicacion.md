## Idea clave

Un `switch` compara un valor contra varios `case` usando `===`. Cuando encuentra uno que coincide, ejecuta el código **desde ahí hacia abajo** hasta encontrar un `break` o un `return`. Ese "caer" al siguiente `case` (fall-through) es lo que permite agrupar varios días con una sola respuesta.

## Paso a paso

1. **Normaliza** el texto con `dia.toLowerCase()` dentro del `switch`. Así comparas siempre en minúsculas.
2. **Agrupa los días laborales**: cinco `case` seguidos sin código entre ellos y un solo `return "laboral"` al final.
3. **Agrupa el fin de semana** igual.
4. **Usa `default`** para todo lo que no coincidió.

```js
export function tipoDeDia(dia) {
  switch (dia.toLowerCase()) {
    case "lunes":
    case "martes":
    case "miércoles":
    case "jueves":
    case "viernes":
      return "laboral";
    case "sábado":
    case "domingo":
      return "fin de semana";
    default:
      return "día inválido";
  }
}
```

## Por qué funciona

Con `tipoDeDia("Martes")`:

1. `"Martes".toLowerCase()` da `"martes"`.
2. `"martes" === "lunes"` es `false`, sigue buscando.
3. `"martes" === "martes"` es `true`: entra en ese `case`.
4. Como ese `case` no tiene código, **cae** al siguiente, y al siguiente, hasta llegar a `return "laboral"`.
5. El `return` sale de la función, así que no hace falta `break`.

Con `"feriado"`, ningún `case` coincide y se ejecuta `default`.

## Errores comunes

- **Olvidar el `break` cuando no usas `return`.** Si en vez de `return` asignas `resultado = "laboral"` y no pones `break`, el código sigue cayendo y termina asignando `"fin de semana"` y luego `"día inválido"`. Lo reconoces porque todo devuelve lo del `default`.
- **No normalizar mayúsculas.** `"Viernes" === "viernes"` es `false`, así que cae en `default`. Falla el test de mayúsculas.
- **Escribir `case "lunes" || "martes":`.** Eso evalúa `"lunes" || "martes"`, que da `"lunes"`, y solo compara contra `"lunes"`. Para agrupar se apilan los `case`.
- **Olvidar las tildes.** `"miercoles"` sin tilde no es igual a `"miércoles"`. El test usa la forma con tilde.
- **Olvidar el `default`.** La función devolvería `undefined` para textos inválidos.

## Otra forma de resolverlo

Con arrays e `includes`, sin `switch`:

```js
const LABORALES = ["lunes", "martes", "miércoles", "jueves", "viernes"];
const FIN_DE_SEMANA = ["sábado", "domingo"];

export function tipoDeDia(dia) {
  const d = dia.toLowerCase();
  if (LABORALES.includes(d)) return "laboral";
  if (FIN_DE_SEMANA.includes(d)) return "fin de semana";
  return "día inválido";
}
```

`includes` devuelve `true` si el array contiene ese valor (también compara con igualdad estricta).

**¿Cuál conviene?** Para pocas opciones fijas, el `switch` se lee bien. Si la lista de valores puede crecer o venir de datos, la versión con arrays es más fácil de mantener. Mencionar las dos en una entrevista suma.

## Cómo explicarlo en la entrevista

> "Normalizo el texto a minúsculas y uso un `switch`. Agrupo los cinco días laborales apilando los `case`, porque el `switch` sigue ejecutando hacia abajo hasta encontrar un `break` o un `return`. Uso `return` en cada grupo, así no necesito `break`, y el `default` atrapa cualquier texto que no sea un día."

## Conceptos

- **`switch`**: compara un valor con varios `case` usando `===`.
- **Fall-through**: sin `break` ni `return`, la ejecución sigue al siguiente `case`.
- **`break`**: sale del `switch` (o de un bucle).
- **`default`**: se ejecuta si ningún `case` coincide.
- **`toLowerCase()`**: copia del texto en minúsculas, útil para comparar sin importar mayúsculas.
- **`includes()`**: dice si un array (o string) contiene un valor.
