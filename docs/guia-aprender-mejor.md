# Guía de contenido: depurar, Lee y predice, glosario y revisión de código

Contenido para la parte "Aprender mejor". Todo en español neutro (tuteo, sin voseo), sin rayas largas: usa dos puntos o comas. Nivel de entrevista para un puesto junior de frontend.

## 1. Ejercicios de depurar

Colecciones `content/javascript/depurar/` y `content/react/depurar/`. **Mismo formato que cualquier ejercicio** (ver un ejemplo en `content/javascript/ejercicios/001-duplicar/` y `content/react/ejercicios/001-saludo/`): `meta.json`, `enunciado.md`, `inicio.*`, `solucion.*`, `tests.test.*`, `pistas.json` (3) y `explicacion.md` con sus 7 secciones.

Lo distinto:
- `inicio.*` es un código **completo que parece correcto pero tiene un error lógico** (no de sintaxis: tiene que poder importarse y correr). Errores típicos de junior: mutar un arreglo o un estado, `forEach` donde va `map`, olvidar el `return` en una flecha con llaves, comparar con `==`, off-by-one en un bucle, `await` faltante, closure con `var` en un bucle, `key` con el índice que rompe una lista, efecto sin limpieza, dependencia faltante en `useEffect`, `setState` con valor viejo en vez de función, `this` perdido, `sort` sin comparador con números, fechas o decimales mal comparados.
- `solucion.*` es el mismo código con **el error corregido en 1 o 2 líneas** (el validador compara las dos versiones y exige que difieran en 1 o 2 líneas).
- `enunciado.md`: empieza con `## El problema` describiendo **el síntoma** como lo reportaría un usuario o un compañero ("La lista muestra los precios repetidos después de filtrar"), nunca la causa. Luego `## Qué debe hacer` con el comportamiento correcto y ejemplos. Termina con `## Tu tarea`: "Encuentra el error y arréglalo cambiando lo mínimo".
- `meta.json`: `tema` como en las demás colecciones (`arrays`, `objetos`, `closures`, `asincronia`, `react-estado`, `react-efectos`...), `tags` incluye `"depurar"`, ids `js-dep-001`... y `react-dep-001`...
- `pistas.json`: 1) dónde mirar, 2) qué está pasando, 3) casi la respuesta.
- `explicacion.md`: "Idea clave" explica la causa del error; "Paso a paso" cómo encontrarlo (leer el síntoma, reproducir, aislar); "Errores comunes" otras formas de "arreglarlo" que no corrigen la causa.
- Los tests prueban el comportamiento correcto y al menos uno reproduce el síntoma.

Cantidades: 15 de JavaScript y 10 de React, de nivel 1 a 3 (20% fácil, 60% medio, 20% difícil).

Verificación: `npm run validar -- dep-` debe dar todo en verde (la solución pasa, el inicio falla, difieren en 1 o 2 líneas).

## 2. Lee y predice

Archivos `content/predice/NN-tema.json`, cada uno un arreglo:

```json
[
  {
    "id": "pred-001",
    "unidad": "closures-y-scope",
    "nivel": 2,
    "pregunta": "¿Qué imprime este código?",
    "lenguaje": "js",
    "codigo": "for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}",
    "opciones": ["0 1 2", "3 3 3", "0 0 0", "undefined undefined undefined"],
    "correcta": 1,
    "explicacion": "...",
    "verificar": true
  }
]
```

- `unidad`: id de un tema de Aprender (carpetas de `content/aprender/`, campo `id` de su `meta.json`).
- La salida se escribe como la **lista de lo que imprime cada `console.log`, separada por un espacio** (los strings sin comillas). Si se lanza un error no capturado, la opción es `TypeError` (o el tipo que corresponda) seguido de lo impreso antes.
- `verificar: true` (lo normal): el validador ejecuta el código en Node y compara lo impreso con `opciones[correcta]`. Solo imprime **primitivos** (números, strings, booleanos, `undefined`, `null`, `NaN`), no objetos ni arreglos completos (se imprimen distinto en Node y en el navegador; usa `JSON.stringify` o `.length` si hace falta).
- `verificar: false` solo para código de React o del DOM, que no corre en Node; esos los revisa una persona.
- Código de 3 a 15 líneas. Las trampas son las clásicas de entrevista: hoisting, TDZ, closures en bucles, `this`, coerción (`[] + {}`, `"5" - 2`), referencias y copias, orden del event loop (sync, microtareas, macrotareas), `async/await`, `Promise.all`, `typeof`, `sort` por defecto, desestructuración, valores por defecto, spread superficial, getters, clases.
- La explicación dice por qué sale eso, línea por línea si hace falta, y por qué falla la trampa más tentadora.

Cantidad: 60 (unas 50 verificables y 10 de React).

Verificación: `npm run validar:predice`.

## 3. Glosario para entrevistas

Archivos `content/glosario/NN-area.json` (javascript, react, typescript, web y navegador, node y apis, herramientas y trabajo), cada uno:

```json
{
  "categoria": "JavaScript",
  "terminos": [
    {
      "id": "glo-closure",
      "termino": "Closure",
      "en": "closure",
      "pron": "klóuzher",
      "definicion": "Una función que recuerda las variables del lugar donde se creó, aunque se ejecute en otro momento.",
      "ejemplo": "const contador = () => { let n = 0; return () => ++n; };",
      "entrevista": "Lo uso para datos privados y para fábricas de funciones, como un contador o un debounce.",
      "unidad": "closures-y-scope"
    }
  ]
}
```

- `definicion`: **una frase** lista para decir en una entrevista, sin jerga que no se explique.
- `entrevista`: una frase con un uso real o un matiz que suma puntos.
- `pron`: pronunciación del término en inglés para un hispanohablante.
- `unidad`: id de un tema de Aprender, o `null` si no aplica.
- Sin términos repetidos.

Cantidad: 120 términos.

## 4. Revisión de código

Archivos `content/revision/NN-slug.json`, uno por caso:

```json
{
  "id": "rev-001",
  "titulo": "Carrito de compras",
  "unidad": "react-estado-y-eventos",
  "nivel": 2,
  "contexto": "Un compañero te pide revisar su componente antes de subirlo.",
  "lenguaje": "jsx",
  "codigo": "línea 1\nlínea 2\n...",
  "hallazgos": [
    { "linea": 7, "tipo": "error", "titulo": "Muta el estado", "detalle": "...", "arreglo": "setItems([...items, nuevo])" }
  ]
}
```

- Código de 15 a 40 líneas, realista (un componente, un hook, una función de utilidades, un fetch).
- 3 a 5 hallazgos. `linea` empieza en 1 y debe existir. `tipo`: `error` (no funciona o falla en un caso), `caso-borde` (falla con vacío, null, cero, error de red), `rendimiento`, `legibilidad` (nombres, duplicación, código muerto), `accesibilidad` o `seguridad`.
- Cada hallazgo es algo que un senior marcaría de verdad; nada de gustos personales.
- Las líneas sin problemas deben ser correctas (si no, el alumno acertaría algo que no está en la lista).

Cantidad: 25 casos (12 de JavaScript, 13 de React).
