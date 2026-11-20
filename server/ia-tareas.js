// Tareas de IA del plan v6, en un solo registro. Cada tarea dice qué modelo usa, qué instrucciones
// recibe la IA, la forma fija del JSON que devuelve (esquema) y cómo se arma el mensaje con lo que
// manda la app. server/ia.js las atiende igual que a las tareas de antes.
//
// Regla: el algoritmo calcula (tests, repasos, salidas de código reales) y la IA explica, corrige y
// genera. Por eso, por ejemplo, en "¿Qué imprime?" la salida real la obtiene la app corriendo el
// código, y la IA solo explica por qué.

export const ESTILO =
  "Escribe en español de Perú, con tuteo neutro (sin voseo), directo y concreto, sin relleno ni frases motivacionales vacías. No uses rayas largas; usa dos puntos o comas. Sé breve: quien lo lee se abruma con textos largos. Cada punto de una lista es una sola frase de 20 palabras como máximo, y es mejor dar pocos puntos que pesen que muchos.";

const HAIKU = "claude-haiku-5-5";
const SONNET = "claude-sonnet-5-5";

// ---------- Piezas para escribir esquemas cortos ----------
const texto = (description) => ({ type: "string", ...(description ? { description } : {}) });
const entero = (description = "De 0 a 10") => ({ type: "integer", description });
const booleano = () => ({ type: "boolean" });
const lista = (items = texto()) => ({ type: "array", items });
const opcion = (valores) => ({ type: "string", enum: valores });
const objeto = (properties) => ({ type: "object", additionalProperties: false, required: Object.keys(properties), properties });

// ---------- Lectura segura de lo que manda la app ----------
export const recortar = (valor, max) => String(valor ?? "").trim().slice(0, max);
const textos = (valor, cuantos, max) =>
  (Array.isArray(valor) ? valor : []).slice(0, cuantos).map((t) => recortar(t, max)).filter(Boolean);
const bloque = (titulo, contenido) => (contenido ? `${titulo}:\n${contenido}` : "");
const unir = (...partes) => partes.filter(Boolean).join("\n\n");

/** Un caso de test que falla, en texto. */
function casoEnTexto(c) {
  if (!c || typeof c !== "object") return "";
  return [
    `- ${recortar(c.nombre, 300)}`,
    c.esperado != null ? `  Esperado: ${recortar(typeof c.esperado === "string" ? c.esperado : JSON.stringify(c.esperado), 600)}` : "",
    c.recibido != null ? `  Recibido: ${recortar(typeof c.recibido === "string" ? c.recibido : JSON.stringify(c.recibido), 600)}` : "",
    c.mensaje ? `  Mensaje: ${recortar(c.mensaje, 600)}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

const PISTA_SIN_SOLUCION =
  "Nunca escribas la solución ni el código corregido completo. Como mucho, nombra un método o muestra una línea suelta.";

/** El registro: nombre de la tarea → { modelo, sistema, esquema, armar(cuerpo) }. */
export const TAREAS = {
  // ---------- Practicar ----------
  pista: {
    modelo: HAIKU,
    esquema: objeto({ pista: texto(), mirar: texto("Dónde mirar en su código, una frase corta") }),
    sistema: `Eres un tutor de programación que ayuda a un estudiante a resolver un ejercicio de JavaScript sin darle la respuesta.

Recibes el enunciado, su código actual, los tests que fallan y las pistas fijas que ya vio. Das UNA pista nueva, pensada para su código y no genérica:
- "pista": una o dos frases que lo hagan pensar (por ejemplo "fíjate qué pasa cuando el array viene vacío"). Si va bien encaminado, díselo y apunta al detalle que falta.
- "mirar": la parte de su código donde está el problema (una función, una línea o una condición), en pocas palabras.
- No repitas lo que dicen las pistas que ya vio. ${PISTA_SIN_SOLUCION}
${ESTILO}`,
    armar(c) {
      const enunciado = recortar(c.pregunta, 4000);
      const codigo = recortar(c.codigo, 8000);
      if (!enunciado) return { error: "Falta el enunciado" };
      if (codigo.length < 10) return { error: "Todavía no hay código tuyo para mirar. Ábrelo en VS Code y escribe algo." };
      const fallos = (Array.isArray(c.fallos) ? c.fallos : []).slice(0, 6).map(casoEnTexto).filter(Boolean).join("\n");
      return unir(
        bloque("Ejercicio", enunciado),
        bloque("Su código", codigo),
        bloque("Tests que fallan", fallos || "Ninguno corrió todavía o todos pasan."),
        bloque("Pistas que ya vio", textos(c.pistasVistas, 3, 600).map((p) => `- ${p}`).join("\n")),
      );
    },
  },

  "por-que-falla": {
    modelo: HAIKU,
    esquema: objeto({
      explicacion: texto("Por qué el resultado recibido no es el esperado"),
      donde: texto("La parte de su código que lo causa"),
      siguiente: texto("Qué probar ahora, sin dar la solución"),
    }),
    sistema: `Eres un tutor de programación. Un test de un ejercicio de JavaScript falla y explicas por qué, mirando el código del estudiante.
- "explicacion": compara lo esperado con lo recibido y di qué hace su código para llegar a ese resultado. Dos frases como máximo.
- "donde": la línea, condición o función que lo causa.
- "siguiente": una acción concreta para probar (un console.log, un caso a pensar a mano). ${PISTA_SIN_SOLUCION}
${ESTILO}`,
    armar(c) {
      const codigo = recortar(c.codigo, 8000);
      const caso = casoEnTexto(c.caso);
      if (!caso) return { error: "Falta el test que falla" };
      if (codigo.length < 10) return { error: "No se encontró tu código" };
      return unir(bloque("Ejercicio", recortar(c.pregunta, 3000)), bloque("Su código", codigo), bloque("Test que falla", caso));
    },
  },

  complejidad: {
    modelo: HAIKU,
    esquema: objeto({
      veredicto: opcion(["bien", "casi", "mal"]),
      tiempo: texto("La complejidad de tiempo correcta de SU código, en notación O"),
      espacio: texto("La complejidad de espacio correcta de SU código, en notación O"),
      comentario: texto(),
    }),
    sistema: `Eres un entrevistador que le pide a un candidato junior la complejidad de su propia solución.
- Calcula la complejidad de tiempo y de espacio de SU código (no de una solución ideal) y compárala con lo que dijo.
- "veredicto": "bien" si acertó tiempo y espacio con un porqué razonable, "casi" si acertó solo una o sin explicar, "mal" si se equivocó.
- "comentario": dos frases como máximo: qué parte del código manda en el costo (por ejemplo, un includes dentro de un bucle) y, si existe, cómo bajarlo.
${ESTILO}`,
    armar(c) {
      const codigo = recortar(c.codigo, 8000);
      const respuesta = recortar(c.respuesta, 1500);
      if (codigo.length < 10) return { error: "No se encontró tu código" };
      if (!respuesta) return { error: "Escribe la complejidad que crees que tiene" };
      return unir(bloque("Ejercicio", recortar(c.pregunta, 2000)), bloque("Su código", codigo), bloque("Lo que dijo el candidato", respuesta));
    },
  },

  variante: {
    modelo: SONNET,
    esquema: objeto({
      titulo: texto(),
      cambio: texto("Qué cambia respecto al original, en una frase"),
      enunciado: texto(),
      ejemplos: lista(objeto({ entrada: texto(), salida: texto() })),
    }),
    sistema: `Creas una variante de un ejercicio de JavaScript que un estudiante ya resolvió, para que no lo resuelva de memoria en el repaso.
- Cambia UNA cosa que obligue a pensar distinto: una restricción ("sin sort", "sin métodos de array", "en una sola pasada"), un caso nuevo o un pequeño giro en lo que se pide. Que siga siendo nivel junior y se resuelva en 10 a 20 minutos.
- "enunciado": claro y completo, de 3 a 6 frases, con el nombre de la función y qué recibe y devuelve.
- "ejemplos": 3 ejemplos con entrada y salida exactas, en sintaxis de JavaScript, incluido un caso borde. Revisa que cada salida sea correcta.
- Si te pasan variantes anteriores, crea una distinta.
${ESTILO}`,
    armar(c) {
      const enunciado = recortar(c.pregunta, 4000);
      if (!enunciado) return { error: "Falta el enunciado" };
      return unir(
        bloque(`Ejercicio original${c.categoria ? ` "${recortar(c.categoria, 120)}"` : ""}`, enunciado),
        bloque("Su solución", recortar(c.codigo, 6000)),
        bloque("Variantes que ya hizo (no las repitas)", textos(c.anteriores, 6, 200).map((t) => `- ${t}`).join("\n")),
      );
    },
  },

  "revisar-variante": {
    modelo: SONNET,
    esquema: objeto({
      veredicto: opcion(["resuelto", "casi", "no"]),
      resumen: texto(),
      problemas: lista(),
      casoQueFalla: texto("Una entrada concreta con la que su código falla, o vacío"),
    }),
    sistema: `Revisas si el código de un estudiante resuelve una variante de un ejercicio de JavaScript. No hay tests: razona con los ejemplos y con casos borde, ejecutando el código mentalmente con cuidado.
- "veredicto": "resuelto" si cumple el enunciado y la restricción, "casi" si falla en un caso borde o se salta la restricción, "no" si no resuelve lo pedido.
- "problemas": hasta 3, los que más pesan. Vacío si está bien.
- "casoQueFalla": una entrada concreta con la que falla y qué devuelve; vacío si no encontraste ninguna.
${PISTA_SIN_SOLUCION}
${ESTILO}`,
    armar(c) {
      const enunciado = recortar(c.pregunta, 4000);
      const codigo = recortar(c.codigo, 8000);
      if (!enunciado) return { error: "Falta el enunciado de la variante" };
      if (codigo.length < 15) return { error: "Escribe tu código antes de pedir la revisión" };
      return unir(bloque("Variante", enunciado), bloque("Código del estudiante", codigo));
    },
  },

  "detecta-crear": {
    modelo: SONNET,
    esquema: objeto({
      codigo: texto("El código con un solo error"),
      linea: entero("Número de línea del error, contando desde 1"),
      error: texto("Qué está mal"),
      porque: texto("Por qué falla y con qué entrada se nota"),
    }),
    sistema: `Preparas un ejercicio de "detecta el error" para un estudiante que se entrena para entrevistas junior de JavaScript.
- Toma el código que te pasan y mete UN solo error realista, del tipo que cometen los juniors: un caso borde olvidado, un < en vez de <=, mutar el array original, un return dentro del bucle, comparar con == un objeto, un reduce sin valor inicial, etc.
- El código debe seguir viéndose razonable: nada de errores de sintaxis ni comentarios que lo delaten. Quita los comentarios que expliquen la lógica.
- "linea": la línea del error en el código que devuelves. "error" y "porque": una frase cada uno, con una entrada concreta donde se nota.
${ESTILO}`,
    armar(c) {
      const codigo = recortar(c.codigo, 6000);
      if (codigo.length < 20) return { error: "Hace falta una solución para meterle un error" };
      return unir(bloque("Ejercicio", recortar(c.pregunta, 2500)), bloque("Código correcto", codigo));
    },
  },

  "detecta-evaluar": {
    modelo: HAIKU,
    esquema: objeto({ veredicto: opcion(["acerto", "casi", "no"]), comentario: texto() }),
    sistema: `Un estudiante busca un error escondido en un código. Comparas lo que dijo con el error real.
- "veredicto": "acerto" si encontró el error y entiende por qué falla, "casi" si señaló el lugar pero no el porqué (o al revés), "no" si señaló otra cosa.
- "comentario": dos frases como máximo, explicando el error real si no lo encontró.
${ESTILO}`,
    armar(c) {
      const respuesta = recortar(c.respuesta, 1500);
      if (!respuesta) return { error: "Escribe dónde crees que está el error" };
      return unir(
        bloque("Código", recortar(c.codigo, 6000)),
        bloque("El error real", `${recortar(c.error, 600)} (línea ${Number(c.linea) || "?"}). ${recortar(c.porque, 600)}`),
        bloque("Lo que dijo el estudiante", respuesta),
      );
    },
  },

  "review-crear": {
    modelo: SONNET,
    esquema: objeto({
      contexto: texto("Qué pidió el ticket, en una o dos frases"),
      codigo: texto(),
      problemas: lista(objeto({ problema: texto(), porque: texto() })),
    }),
    sistema: `Preparas un ejercicio de "code review al revés": un compañero junior abrió un pull request y el estudiante tiene que revisarlo como lo haría un senior.
- Escribe un código de JavaScript (o del DOM) de 15 a 40 líneas que funcione en el caso normal, sobre el tema que te piden, con 3 o 4 problemas reales de distinto tipo: un caso borde sin cubrir, un nombre confuso, lógica repetida, mutar datos que no debe, un efecto secundario escondido, complejidad innecesaria, un await que falta, etc.
- Que se vea como código real de un equipo, sin comentarios que delaten los problemas.
- "problemas": la lista completa, cada uno con el qué y el porqué en una frase.
${ESTILO}`,
    armar(c) {
      const tema = recortar(c.tema, 200) || "métodos de array y objetos";
      return unir(
        `Tema del pull request: ${tema}`,
        bloque("Temas de revisiones anteriores (cambia de idea)", textos(c.anteriores, 6, 200).map((t) => `- ${t}`).join("\n")),
      );
    },
  },

  "review-evaluar": {
    modelo: HAIKU,
    esquema: objeto({ puntaje: entero(), encontrados: lista(), faltaron: lista(), comentario: texto() }),
    sistema: `Evalúas la revisión de código que escribió un estudiante sobre el pull request de un compañero.
- Compara su revisión con la lista de problemas reales. "encontrados": los que señaló (aunque lo diga con otras palabras). "faltaron": los que no vio, con el porqué en una frase.
- "puntaje" de 0 a 10: cuántos encontró, si explicó por qué importan y si el tono fue respetuoso y útil, como en un equipo real.
- "comentario": una frase sobre cómo mejorar sus revisiones. Si señaló algo que no es un problema real, menciónalo.
${ESTILO}`,
    armar(c) {
      const respuesta = recortar(c.respuesta, 3000);
      if (respuesta.split(/\s+/).filter(Boolean).length < 4) return { error: "Escribe tu revisión antes de enviarla" };
      const problemas = (Array.isArray(c.problemas) ? c.problemas : [])
        .slice(0, 6)
        .map((p) => `- ${recortar(p?.problema, 300)}: ${recortar(p?.porque, 300)}`)
        .join("\n");
      return unir(bloque("Código del pull request", recortar(c.codigo, 6000)), bloque("Problemas reales", problemas), bloque("Revisión del estudiante", respuesta));
    },
  },

  "imprime-crear": {
    modelo: HAIKU,
    esquema: objeto({ codigo: texto(), concepto: texto("El concepto que pone a prueba, en pocas palabras") }),
    sistema: `Creas un ejercicio de "¿qué imprime este código?" como los de las entrevistas junior de JavaScript.
- De 5 a 15 líneas, sin imports ni DOM, que solo use console.log para mostrar resultados (de 1 a 4 logs).
- Sobre el tema que te piden: closures, hoisting, var/let/const en bucles, this, el event loop (setTimeout, promesas, async/await), coerción de tipos, referencias de objetos y arrays, etc.
- Que tenga una trampa típica de entrevista, pero sin ser rebuscado. Usa setTimeout de 0 a 50 ms como máximo.
- No pongas comentarios con la respuesta.`,
    armar(c) {
      const tema = recortar(c.tema, 200) || "closures y event loop";
      return unir(`Tema: ${tema}`, bloque("Conceptos de ejercicios anteriores (cambia de idea)", textos(c.anteriores, 8, 200).map((t) => `- ${t}`).join("\n")));
    },
  },

  "imprime-evaluar": {
    modelo: HAIKU,
    esquema: objeto({ veredicto: opcion(["acerto", "casi", "no"]), explicacion: texto("Por qué el código imprime lo que imprime"), comentario: texto() }),
    sistema: `Un estudiante predijo qué imprime un código de JavaScript. La salida real ya se obtuvo ejecutándolo: tómala como verdad absoluta.
- "veredicto": "acerto" si predijo la salida y el porqué, "casi" si la salida es correcta sin el porqué o tuvo un detalle mal, "no" si se equivocó en lo central.
- "explicacion": por qué imprime eso, paso a paso, en 3 frases como máximo.
- "comentario": una frase sobre lo que debe recordar para la próxima.
${ESTILO}`,
    armar(c) {
      const codigo = recortar(c.codigo, 3000);
      const salida = recortar(c.salida, 1500);
      const respuesta = recortar(c.respuesta, 1500);
      if (!codigo || !salida) return { error: "Falta el código o su salida" };
      if (!respuesta) return { error: "Escribe qué crees que imprime" };
      return unir(bloque("Código", codigo), bloque("Salida real", salida), bloque("Predicción y razonamiento del estudiante", respuesta));
    },
  },
};

// ---------- Tarjetas de memoria (Anki) ----------
const MAZOS_IA = ["js", "ingles", "entrevistas"];
const tarjetaEnTexto = (c) => unir(bloque("Pregunta de la tarjeta", recortar(c.frente, 600)), bloque("Respuesta de la tarjeta", recortar(c.reverso, 1200)));

Object.assign(TAREAS, {
  "tarjeta-crear": {
    modelo: HAIKU,
    esquema: objeto({
      tarjetas: lista(objeto({ mazo: opcion(MAZOS_IA), frente: texto(), reverso: texto(), ejemplo: texto() })),
    }),
    sistema: `Creas tarjetas de memoria (estilo Anki) para un estudiante que se prepara para entrevistas de frontend junior y para trabajar en inglés. Recibes algo que falló o que quiere recordar.
- De 1 a 3 tarjetas, cada una sobre UNA sola idea. Si el error es uno solo, una tarjeta basta.
- "frente": una pregunta concreta que obligue a recordar (no a reconocer), de una o dos líneas. Nada de "¿qué es X?" genérico: mejor "¿Qué imprime...?", "¿Cuándo usarías...?", "¿Cómo se dice en inglés...?".
- "reverso": la respuesta en 1 a 3 frases, exacta.
- "ejemplo": un ejemplo corto (código de una línea o una frase en inglés de trabajo); vacío si no aporta.
- "mazo": "js" para JavaScript y programación, "ingles" para inglés, "entrevistas" para preguntas de entrevista y habilidades blandas.
- Las tarjetas de inglés llevan el frente en español y el reverso en inglés.
${ESTILO}`,
    armar(c) {
      const contenido = recortar(c.contenido, 3000);
      if (contenido.length < 5) return { error: "Falta de qué hacer la tarjeta" };
      return unir(c.origen ? `Viene de: ${recortar(c.origen, 120)}` : "", bloque("Lo que debe recordar", contenido));
    },
  },

  "tarjeta-explicar": {
    modelo: HAIKU,
    esquema: objeto({ explicacion: texto(), ejemplo: texto() }),
    sistema: `Un estudiante falló una tarjeta de memoria. Explícale la respuesta de otra forma para que se le quede.
- "explicacion": 2 o 3 frases con una idea nueva (una analogía, el porqué, el error típico), sin repetir la respuesta tal cual.
- "ejemplo": un ejemplo concreto y corto (código o una frase de trabajo en inglés, según la tarjeta).
${ESTILO}`,
    armar(c) {
      if (!recortar(c.frente, 10)) return { error: "Falta la tarjeta" };
      return unir(tarjetaEnTexto(c), bloque("Lo que respondió (si respondió)", recortar(c.respuesta, 1000)));
    },
  },

  "tarjeta-reformular": {
    modelo: HAIKU,
    esquema: objeto({ pregunta: texto() }),
    sistema: `Reformulas la pregunta de una tarjeta de memoria para que el estudiante recuerde el concepto y no la frase exacta. Misma respuesta, otra forma de preguntar: otro ejemplo, otro contexto o al revés. Una o dos líneas, en el mismo idioma que la pregunta original. Si te pasan reformulaciones anteriores, no las repitas.`,
    armar(c) {
      if (!recortar(c.frente, 10)) return { error: "Falta la tarjeta" };
      return unir(tarjetaEnTexto(c), bloque("Reformulaciones anteriores", textos(c.anteriores, 5, 300).map((t) => `- ${t}`).join("\n")));
    },
  },

  "tarjeta-calificar": {
    modelo: HAIKU,
    esquema: objeto({ sugerencia: opcion(["otra", "dificil", "bien", "facil"]), comentario: texto() }),
    sistema: `Un estudiante respondió una tarjeta de memoria escribiendo o hablando. Compara su respuesta con la de la tarjeta y sugiere cómo calificarla:
- "otra" si no la sabía o se equivocó en lo central; "dificil" si llegó a medias o con errores; "bien" si la sabía; "facil" solo si la respuesta fue completa, exacta y segura.
- Si viene dictada por voz, ignora la puntuación y errores de transcripción.
- "comentario": una frase con lo que le faltó o lo que tuvo mal (o qué hizo bien).
${ESTILO}`,
    armar(c) {
      const respuesta = recortar(c.respuesta, 1500);
      if (!respuesta) return { error: "Escribe o di tu respuesta" };
      return unir(tarjetaEnTexto(c), bloque("Su respuesta", respuesta));
    },
  },
});

// ---------- Aprender ----------
Object.assign(TAREAS, {
  "explicar-distinto": {
    modelo: HAIKU,
    esquema: objeto({
      explicacion: texto(),
      analogia: texto("Una comparación con algo de la vida diaria"),
      ejemplo: texto("Código corto de JavaScript que lo muestra, con comentarios de lo que imprime"),
      pregunta: texto("Una pregunta corta para comprobar que lo entendió"),
    }),
    sistema: `Eres un profesor paciente de programación. Un estudiante leyó la teoría de un tema y no le quedó clara. Explícasela de OTRA forma, no repitas el texto original.
- Si dice qué parte no entendió, céntrate solo en eso.
- "explicacion": de 3 a 5 frases simples, de lo concreto a lo abstracto.
- "analogia": una comparación con algo cotidiano (en Perú, si encaja), en una o dos frases.
- "ejemplo": de 3 a 10 líneas de código que lo muestren, con comentarios de lo que imprime.
- "pregunta": una pregunta corta para que compruebe si lo entendió (sin la respuesta).
${ESTILO}`,
    armar(c) {
      const tema = recortar(c.tema, 200);
      if (!tema) return { error: "Falta el tema" };
      return unir(`Tema: ${tema}`, bloque("Teoría que leyó (resumen)", recortar(c.teoria, 5000)), bloque("Lo que no entendió", recortar(c.duda, 800) || "No lo dijo: explica la idea central del tema."));
    },
  },

  "quiz-fallos": {
    modelo: HAIKU,
    esquema: objeto({
      preguntas: lista(objeto({ pregunta: texto(), opciones: lista(), correcta: entero("Índice de la opción correcta, de 0 a 3"), explicacion: texto() })),
    }),
    sistema: `Creas un quiz corto de repaso con preguntas NUEVAS sobre lo que un estudiante falló en un quiz de programación. Que no sean las mismas preguntas: el mismo concepto, desde otro ángulo (otro código, otro caso).
- Una pregunta por cada concepto fallado (máximo 4).
- Cada una con exactamente 4 opciones, una sola correcta ("correcta" es su índice, de 0 a 3), y distractores creíbles (los errores típicos).
- Si la pregunta lleva código, ponlo en un bloque de markdown con \`\`\`js.
- "explicacion": por qué la correcta es la correcta, en 2 frases.
${ESTILO}`,
    armar(c) {
      const fallos = (Array.isArray(c.fallos) ? c.fallos : [])
        .slice(0, 4)
        .map((f) => `- Pregunta: ${recortar(f?.pregunta, 800)}\n  Respuesta correcta: ${recortar(f?.correcta, 300)}\n  Explicación: ${recortar(f?.explicacion, 500)}`)
        .join("\n");
      if (!fallos) return { error: "No hay preguntas falladas" };
      return unir(`Tema: ${recortar(c.tema, 200)}`, bloque("Lo que falló", fallos));
    },
  },

  "explicar-concepto": {
    modelo: HAIKU,
    esquema: objeto({ puntaje: entero(), bien: lista(), falta: lista(), mejor: texto() }),
    sistema: `Un estudiante explicó un concepto de programación en voz alta en 30 segundos, como si se lo preguntaran en una entrevista junior. Evalúa su explicación.
- Viene dictada por voz: ignora la puntuación y los errores de transcripción.
- "puntaje" de 0 a 10: si es correcta, clara y con un ejemplo o un "para qué sirve".
- "bien": hasta 2 cosas. "falta": hasta 3 cosas que le faltaron o estuvieron mal (si dijo algo incorrecto, dilo claramente).
- "mejor": su explicación mejorada, en primera persona, para decirla en 30 segundos (70 palabras como máximo).
${ESTILO}`,
    armar(c) {
      const respuesta = recortar(c.respuesta, 2000);
      if (respuesta.split(/\s+/).filter(Boolean).length < 5) return { error: "Tu explicación es muy corta" };
      return unir(`Concepto: ${recortar(c.tema, 200)}`, bloque("Su explicación", respuesta));
    },
  },
});

// ---------- Repaso: tutor del día y plan de la semana ----------
const DIAS = ["lun", "mar", "mie", "jue", "vie", "sab", "dom"];
const CARGAS = ["libre", "poco", "normal", "mucho"];

Object.assign(TAREAS, {
  "tutor-dia": {
    modelo: HAIKU,
    esquema: objeto({
      resumen: texto("Una frase con su situación de hoy"),
      focos: lista(objeto({ tema: texto(), porque: texto(), accion: texto(), donde: opcion(["aprender", "practicar", "tarjetas", "ingles", "entrevistas"]) })),
    }),
    sistema: `Eres el tutor personal de un estudiante que se prepara para su primer trabajo como frontend junior. Cada día miras sus datos reales y le dices en qué enfocarse hoy.
- Solo usa los datos que te pasan: no inventes temas que no aparecen. Si casi no hay datos, dile que empiece por su sesión de hoy.
- "resumen": una frase honesta y concreta (por ejemplo: "Vas bien en arrays, pero los closures se te siguen cayendo").
- "focos": de 1 a 3, ordenados por impacto. Cada uno: "tema", "porque" (el dato que lo muestra, con números si los hay), "accion" (algo concreto para hoy, de 10 a 20 minutos) y "donde" (la sección de la app donde se hace).
${ESTILO}`,
    armar(c) {
      const datos = recortar(c.datos, 4000);
      if (!datos) return { error: "Faltan tus datos" };
      return bloque("Sus datos de hoy", datos);
    },
  },

  "plan-semana": {
    modelo: HAIKU,
    esquema: objeto({
      resumen: texto("Cómo le fue la semana pasada, en dos frases"),
      horario: objeto(Object.fromEntries(DIAS.map((d) => [d, opcion(CARGAS)]))),
      dias: lista(objeto({ dia: opcion(DIAS), enfoque: texto() })),
      consejo: texto(),
    }),
    sistema: `Eres el tutor de un estudiante de Ingeniería de Sistemas en Perú que estudia para conseguir prácticas de frontend. Su semana en la universidad es desordenada. Con lo que te cuenta de esta semana, armas su plan de estudio.
- "horario": para cada día, cuánto puede estudiar: "libre" (no estudia: examen o entrega fuerte), "poco" (día cargado), "normal" o "mucho" (día tranquilo). La app reparte su meta semanal según esto, así que sé realista: mejor poco y cumplido que mucho y fallado. Si no dice nada de un día, "normal".
- "dias": un enfoque corto para cada día que estudia (por ejemplo "Closures: teoría y 2 ejercicios", "Tarjetas y una entrevista de práctica"), basado en sus temas flojos y en su fecha meta.
- "resumen": cómo le fue la semana pasada según los datos (puntos, minutos, días cumplidos). Si no hay datos, dilo.
- "consejo": una frase para esta semana.
${ESTILO}`,
    armar(c) {
      const universidad = recortar(c.universidad, 1500);
      if (universidad.length < 3) return { error: "Cuéntame cómo viene tu semana en la universidad" };
      return unir(
        bloque("Lo que cuenta de su semana", universidad),
        bloque("Sus datos", recortar(c.datos, 3000)),
      );
    },
  },
});

// ---------- Entrevistas y trabajo ----------
/** Una charla por turnos en texto: "Candidato" es el estudiante. */
function historialEnTexto(historial, yo = "Candidato", otro = "Tú") {
  return (Array.isArray(historial) ? historial : [])
    .slice(-30)
    .map((t) => ({ yo: t?.de === "yo", texto: recortar(t?.texto, 1500) }))
    .filter((t) => t.texto)
    .map((t) => `${t.yo ? yo : otro}: ${t.texto}`)
    .join("\n");
}
const BALANCE = objeto({
  puntaje: entero(),
  resumen: texto(),
  bien: lista(),
  mejoras: lista(),
  frases: lista(texto("Una frase lista para usar la próxima vez")),
});

Object.assign(TAREAS, {
  defensa: {
    modelo: HAIKU,
    esquema: objeto({ comentario: texto("Reacción breve a su última respuesta, o vacío al empezar"), pregunta: texto(), fin: booleano() }),
    sistema: `Eres un entrevistador técnico que le pide a un candidato junior que defienda un proyecto de su portafolio. Quieres saber si lo entiende de verdad o si solo lo copió (por ejemplo, de una IA).
- Haz UNA pregunta a la vez, concreta y sobre ESTE proyecto: por qué eligió esa tecnología, cómo funciona una parte, qué haría distinto, un bug que tuvo, cómo escalaría, cómo lo probó, qué parte no hizo él.
- Si su respuesta fue vaga, repregunta sobre lo mismo pidiendo un detalle. Si fue buena, pasa a otra parte del proyecto.
- "comentario": una frase de reacción natural (como un entrevistador real, sin dar nota), vacío en la primera pregunta.
- "fin": true después de 6 a 8 preguntas; entonces "pregunta" es una despedida.
${ESTILO}`,
    armar(c) {
      const proyecto = recortar(c.proyecto, 7000);
      if (proyecto.length < 30) return { error: "Describe tu proyecto (o pega su README) para que te entreviste" };
      const charla = historialEnTexto(c.historial);
      return unir(bloque("El proyecto", proyecto), charla ? bloque("La entrevista hasta ahora", charla) : "Empieza con tu primera pregunta.");
    },
  },

  "defensa-cierre": {
    modelo: SONNET,
    esquema: BALANCE,
    sistema: `Acabas de entrevistar a un candidato junior sobre un proyecto de su portafolio. Dale tu balance, como se lo darías a alguien que quieres que mejore.
- "puntaje" de 0 a 10: ¿se nota que lo entiende y lo hizo él? ¿Explica decisiones con razones?
- "resumen": dos frases, sin rodeos. "bien": hasta 3. "mejoras": hasta 3, las que más pesarían en una entrevista real.
- "frases": 2 o 3 frases que podría decir la próxima vez para explicar mejor su proyecto (en primera persona, concretas).
${ESTILO}`,
    armar(c) {
      const charla = historialEnTexto(c.historial);
      if (charla.split("\n").filter((l) => l.startsWith("Candidato")).length < 2) return { error: "Responde al menos 2 preguntas antes del balance" };
      return unir(bloque("El proyecto", recortar(c.proyecto, 4000)), bloque("La entrevista", charla));
    },
  },

  negociacion: {
    modelo: HAIKU,
    esquema: objeto({ respuesta: texto(), fin: booleano() }),
    sistema: `Eres una reclutadora de una empresa de software en Perú que ya decidió hacerle una oferta a un candidato junior de frontend. Ahora conversan sobre sueldo y condiciones. Es una práctica: sé realista, cordial y un poco firme (tienes un rango y no lo dices de entrada).
- Responde en español, de 1 a 3 frases, como en una llamada real. Haz preguntas como "¿cuál es tu expectativa salarial?" y reacciona a lo que él diga.
- Si pide algo razonable con buenos argumentos, cede un poco; si pide de más sin razones, mantente.
- "fin": true cuando se llegue a un acuerdo o él cierre la conversación; entonces despídete.`,
    armar(c) {
      const charla = historialEnTexto(c.historial, "Candidato", "Reclutadora");
      return unir(bloque("La situación", recortar(c.escenario, 800)), charla ? bloque("La conversación hasta ahora", charla) : "Empieza tú: felicítalo por pasar las entrevistas y pregúntale su expectativa salarial.");
    },
  },

  "negociacion-cierre": {
    modelo: SONNET,
    esquema: BALANCE,
    sistema: `Eres un mentor que escuchó a un candidato junior negociar su primer sueldo de frontend en Perú. Dale su balance.
- "puntaje" de 0 a 10: ¿investigó un rango, dio una cifra con argumentos, preguntó por el paquete completo (beneficios, modalidad, horario), fue cordial y firme sin aceptar lo primero?
- "resumen": dos frases. "bien": hasta 3. "mejoras": hasta 3.
- "frases": 3 frases que podría usar la próxima vez (por ejemplo, para dar su rango o pedir tiempo para pensarlo).
${ESTILO}`,
    armar(c) {
      const charla = historialEnTexto(c.historial, "Candidato", "Reclutadora");
      if (charla.split("\n").filter((l) => l.startsWith("Candidato")).length < 2) return { error: "Conversa un poco más antes del balance" };
      return unir(bloque("La situación", recortar(c.escenario, 800)), bloque("La conversación", charla));
    },
  },

  "preguntas-entrevistador": {
    modelo: HAIKU,
    esquema: objeto({
      puntaje: entero(),
      comentarios: lista(objeto({ pregunta: texto(), comentario: texto() })),
      sugeridas: lista(texto("Una pregunta mejor que podría hacer")),
    }),
    sistema: `Al final de una entrevista, el entrevistador dice "¿tienes alguna pregunta para nosotros?". Un candidato junior de frontend escribió las que haría. Evalúalas.
- Buenas preguntas muestran interés real en el trabajo y el equipo (cómo es un día normal, cómo revisan el código, cómo acompañan a un junior, qué esperan en los primeros 3 meses). Malas: sueldo o vacaciones en la primera entrevista, cosas que están en la web de la empresa, o ninguna pregunta.
- "comentarios": una frase por cada pregunta suya. "puntaje" de 0 a 10. "sugeridas": 3 preguntas mejores o complementarias.
${ESTILO}`,
    armar(c) {
      const respuesta = recortar(c.respuesta, 2000);
      if (respuesta.length < 10) return { error: "Escribe las preguntas que harías" };
      return unir(c.empresa ? `Empresa o puesto: ${recortar(c.empresa, 300)}` : "", bloque("Sus preguntas", respuesta));
    },
  },

  oferta: {
    modelo: HAIKU,
    esquema: objeto({
      encaje: opcion(["alto", "medio", "bajo"]),
      resumen: texto(),
      destacar: lista(texto("Algo de su CV o sus proyectos que debe destacar para esta oferta")),
      preguntas: lista(texto("Una pregunta probable en la entrevista de esta empresa")),
      brechas: lista(texto("Algo que piden y le falta, con qué hacer para cubrirlo")),
    }),
    sistema: `Ayudas a un estudiante que busca su primer trabajo de frontend junior a prepararse para una oferta concreta. Cruzas la oferta con su perfil real.
- "encaje": alto, medio o bajo, siendo honesto. "resumen": una o dos frases.
- "destacar": hasta 4 cosas de SU perfil (no inventes) que conviene poner primero en el CV o decir en la entrevista para esta oferta.
- "preguntas": 4 o 5 preguntas técnicas o de comportamiento probables según lo que pide la oferta.
- "brechas": hasta 3 cosas que piden y le faltan, cada una con una acción concreta para cubrirla antes de la entrevista.
${ESTILO}`,
    armar(c) {
      const oferta = recortar(c.oferta, 5000);
      if (oferta.length < 40) return { error: "Pega el texto de la oferta" };
      return unir(bloque("La oferta", oferta), bloque("Su perfil (CV y lo que domina)", recortar(c.datos, 4000)));
    },
  },

  cv: {
    modelo: SONNET,
    esquema: objeto({
      puntaje: entero(),
      resumen: texto(),
      bien: lista(),
      mejoras: lista(),
      reescrituras: lista(objeto({ original: texto(), mejor: texto() })),
    }),
    sistema: `Eres una reclutadora técnica que revisa el CV de un estudiante que busca prácticas o su primer trabajo de frontend junior en Perú (o remoto). Revísalo como lo harías en los 30 segundos que le dedicas a un CV real.
- "puntaje" de 0 a 10. "resumen": una frase con tu impresión.
- "bien": hasta 2 cosas. "mejoras": hasta 4, las que más pesan (proyectos con resultados y tecnologías, enlaces a GitHub y demo, orden, longitud, palabras clave de las ofertas junior).
- "reescrituras": hasta 3 partes concretas de su CV reescritas mejor (texto original y versión mejorada), sin inventar datos que no estén.
${ESTILO}`,
    armar(c) {
      const cv = recortar(c.cv, 6000);
      if (cv.length < 60) return { error: "Completa tu CV antes de revisarlo" };
      return unir(bloque("Su CV", cv), bloque("Oferta a la que apunta (opcional)", recortar(c.oferta, 2000)));
    },
  },
});

/** Cómo suena el entrevistador según la personalidad que elegiste (se agrega a la evaluación). */
export const PERSONALIDADES = {
  amable: "Eres un entrevistador amable y paciente: reconoce lo bueno primero y repregunta con calma.",
  exigente: "Eres un entrevistador exigente y directo: no dejas pasar respuestas vagas, pides precisión y tu repregunta va al punto débil.",
  apurado: "Eres un entrevistador con poco tiempo: valoras respuestas cortas y al grano; si se extiende, lo notas, y tu repregunta es breve.",
};

/** Deja lo que devolvió la IA con la forma del esquema (textos recortados, números en rango, listas cortas). */
export function limpiarPorEsquema(esquema, valor) {
  if (!esquema) return valor;
  if (esquema.type === "object") {
    const salida = {};
    for (const [clave, sub] of Object.entries(esquema.properties ?? {})) salida[clave] = limpiarPorEsquema(sub, valor?.[clave]);
    return salida;
  }
  if (esquema.type === "array") return (Array.isArray(valor) ? valor : []).slice(0, 8).map((v) => limpiarPorEsquema(esquema.items, v));
  if (esquema.type === "integer") {
    const n = Math.round(Number(valor) || 0);
    return esquema.description === "De 0 a 10" ? Math.min(10, Math.max(0, n)) : Math.max(0, n);
  }
  if (esquema.type === "boolean") return valor === true;
  if (esquema.enum) return esquema.enum.includes(valor) ? valor : esquema.enum[Math.floor(esquema.enum.length / 2)];
  return String(valor ?? "").slice(0, 6000);
}
