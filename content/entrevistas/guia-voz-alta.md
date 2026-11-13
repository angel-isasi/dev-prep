## Por qué pensar en voz alta

En una entrevista técnica no evalúan solo si llegas a la respuesta: evalúan **cómo piensas**. Un candidato que se queda callado 10 minutos y escribe la solución perfecta da menos información que uno que explica su razonamiento, se equivoca, lo nota y lo corrige. Si te quedas en silencio, el entrevistador no puede ayudarte ni darte puntos por el camino.

## Los 5 pasos (dilos en este orden)

### 1. Entender: repite el problema con tus palabras

> "Entonces, recibo un arreglo de números y un objetivo, y tengo que devolver los índices de los dos que suman ese objetivo. ¿Siempre hay solución? ¿Puede haber números repetidos?"

Preguntas que casi siempre conviene hacer:

- ¿Qué pasa si la entrada está vacía?
- ¿Puede haber negativos, repetidos, `null`?
- ¿Puedo modificar la entrada o debo devolver algo nuevo?
- ¿Importa el orden del resultado?

Hacer preguntas **no** se ve mal: se ve profesional.

### 2. Ejemplos: escribe uno normal y uno borde

> "Probemos con `[2, 7, 11, 15]` y 9: el resultado sería `[0, 1]`. Y con `[3, 3]` y 6 debería dar `[0, 1]`, no usar el mismo 3 dos veces."

Los ejemplos te sirven para entender y, al final, para probar tu código.

### 3. Plan: di la idea antes de escribir código

Empieza por la solución más simple, aunque sea lenta, y dila:

> "La forma directa es probar todas las parejas con dos bucles. Eso es O(n²). Puedo mejorarlo guardando lo que ya vi en un Map para buscar en O(1)."

Si el entrevistador está de acuerdo con el plan, recién escribes. Si no, te lo dirá ahora y no después de 15 minutos.

### 4. Código: narra mientras escribes

No hace falta hablar sin parar, pero sí explicar cada bloque:

> "Recorro el arreglo... para cada número calculo cuánto falta... si ya lo vi, devuelvo los índices... si no, lo guardo."

Usa nombres claros (`vistos`, `falta`), no `a`, `b`, `x`. Si te trabas, dilo: "aquí dudo entre usar un objeto o un Map; voy con Map porque...". Eso también suma.

### 5. Probar: recorre tu código con un ejemplo

> "Con `[3, 2, 4]` y 6: en la vuelta 0 falta 3, no está; guardo el 3. En la 1 falta 4, no está... en la 2 falta 2, está en el índice 1. Devuelvo `[1, 2]`. Correcto."

Después menciona casos borde y la **complejidad**: "es O(n) en tiempo y O(n) en memoria".

## Frases que te salvan

| Situación | Qué decir |
|---|---|
| No entiendes algo | "¿Me das un ejemplo de entrada y salida?" |
| Te bloqueas | "Déjame pensar en voz alta un momento..." y empieza por la solución más simple |
| Ves un error tuyo | "Ah, aquí me equivoqué: si el arreglo está vacío esto falla. Lo corrijo." |
| No sabes la respuesta teórica | "No lo he usado, pero por lo que sé funciona así... ¿lo estoy razonando bien?" |
| Se acaba el tiempo | "No llegué a optimizarlo, pero la idea sería..." |

## Errores que más restan

- Empezar a escribir código sin haber entendido el problema.
- Quedarse callado mucho rato.
- Defender una idea equivocada en vez de aceptar la pista del entrevistador.
- No probar el código al final.
- Decir "no sé" y quedarse ahí. Siempre intenta razonar algo.
