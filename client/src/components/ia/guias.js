// El recorrido de cada herramienta de IA en 3 fichas numeradas: cada ficha ES un paso (qué haces,
// qué pasa, qué te llevas) y trae su propio ejemplo dibujado. Nada se repite entre fichas: juntas
// cuentan una sola historia de izquierda a derecha.
// Tipos de línea (ver Ejemplo en MenuPanel.jsx): ia, tu, cambio, bien, mal, nota, codigo, puntaje, dato.

const entrevistaIngles = [
  {
    titulo: "Eliges cuánta ayuda",
    lineas: [
      { tipo: "dato", clave: "A", texto: "Respuesta completa: la lees en voz alta." },
      { tipo: "dato", clave: "B", texto: "Palabras clave: armas la frase tú." },
      { tipo: "dato", clave: "C", texto: "Sin ayuda: como en la entrevista real." },
    ],
  },
  {
    titulo: "Respondes en inglés",
    lineas: [
      { tipo: "ia", texto: "Tell me about a project you built." },
      { tipo: "tu", texto: "I builded an app to practice interviews." },
      { tipo: "ia", texto: "What was the hardest part?" },
    ],
  },
  {
    titulo: "Te corrige al final",
    lineas: [
      { tipo: "puntaje", texto: "Nivel B1 · 6/10" },
      { tipo: "cambio", mal: "I builded", bien: "I built" },
      { tipo: "bien", texto: "Tu respuesta más floja, reescrita de forma natural." },
    ],
  },
];

export const MAS = {
  // ---------- Practicar > Entrena con IA ----------
  imprime: [
    {
      titulo: "Te toca un código",
      lineas: [
        { tipo: "codigo", texto: "for (var i = 0; i < 2; i++) {\n  setTimeout(() => console.log(i));\n}" },
        { tipo: "nota", texto: "Del tema que elijas: closures, this, promesas..." },
      ],
    },
    {
      titulo: "Predices y explicas",
      lineas: [
        { tipo: "tu", texto: "Imprime 0 y 1, porque i va subiendo." },
        { tipo: "nota", texto: "Explicar el porqué vale más que acertar." },
      ],
    },
    {
      titulo: "Ves la salida real",
      lineas: [
        { tipo: "codigo", texto: "2\n2" },
        { tipo: "bien", texto: "var se comparte: cuando corre el timeout, i ya vale 2." },
        { tipo: "nota", texto: "El código se corre de verdad: la salida nunca es inventada." },
      ],
    },
  ],
  review: [
    {
      titulo: "Te llega un pull request",
      lineas: [
        { tipo: "codigo", texto: "let t = 0;\nitems.map((i) => (t += i.price));\nreturn t;" },
        { tipo: "nota", texto: "Funciona, pero esconde 3 o 4 problemas." },
      ],
    },
    {
      titulo: "Lo revisas como senior",
      lineas: [
        { tipo: "mal", texto: "Esto está mal." },
        { tipo: "bien", texto: "Línea 2: map no es para sumar. ¿Usamos reduce?" },
        { tipo: "nota", texto: "Línea, porqué y propuesta." },
      ],
    },
    {
      titulo: "Ves qué se te pasó",
      lineas: [
        { tipo: "puntaje", texto: "7/10 · encontraste 2 de 3" },
        { tipo: "mal", texto: "Se te pasó: falla si items viene vacío." },
      ],
    },
  ],

  // ---------- Inglés > Con IA ----------
  entrevista: entrevistaIngles,
  ingles: entrevistaIngles,
  daily: [
    {
      titulo: "Dices tu actualización",
      lineas: [
        { tipo: "dato", clave: "Ayer", texto: "Yesterday I fixed / finished..." },
        { tipo: "dato", clave: "Hoy", texto: "Today I'm going to..." },
        { tipo: "dato", clave: "Traba", texto: "I'm blocked by... / No blockers." },
      ],
    },
    {
      titulo: "Ves cada error corregido",
      lineas: [
        { tipo: "tu", texto: "Yesterday I fix a bug in the login." },
        { tipo: "cambio", mal: "I fix", bien: "I fixed" },
        { tipo: "nota", texto: "Cada corrección trae su porqué en español." },
      ],
    },
    {
      titulo: "Te llevas la versión natural",
      lineas: [
        { tipo: "puntaje", texto: "Nivel B1 · 7/10" },
        { tipo: "bien", texto: "Yesterday I fixed a login bug. Today I'm going to add tests." },
        { tipo: "nota", texto: "La puedes escuchar y repetir." },
      ],
    },
  ],
  dice: [
    {
      titulo: "Lo escribes en español",
      lineas: [
        { tipo: "tu", texto: "ya casi lo termino" },
        { tipo: "tu", texto: "¿me das una mano?" },
        { tipo: "nota", texto: "Frases completas del trabajo, no palabras sueltas." },
      ],
    },
    {
      titulo: "Recibes 2 o 3 formas",
      lineas: [
        { tipo: "bien", texto: "I'm almost done." },
        { tipo: "bien", texto: "I'm nearly finished with it." },
        { tipo: "nota", texto: "Cada una dice cuándo usarla." },
      ],
    },
    {
      titulo: "Guardas la que te sirve",
      lineas: [
        { tipo: "dato", clave: "+", texto: "Con + Tarjeta entra a tus tarjetas de memoria." },
        { tipo: "cambio", mal: "actually = actualmente", bien: "actually = en realidad" },
        { tipo: "nota", texto: "También te avisa de falsos amigos como ese." },
      ],
    },
  ],
  escrito: [
    {
      titulo: "Eliges la situación",
      lineas: [
        { tipo: "dato", clave: "1", texto: "Pedir ayuda por Slack" },
        { tipo: "dato", clave: "2", texto: "Descripción de un pull request" },
        { tipo: "dato", clave: "3", texto: "Avisar un retraso o escribir a un reclutador" },
      ],
    },
    {
      titulo: "Lo escribes como te salga",
      lineas: [
        { tipo: "tu", texto: "hola, necesito ayuda con un bug del login" },
        { tipo: "nota", texto: "En español o en inglés a medias: vale igual." },
      ],
    },
    {
      titulo: "Queda listo para enviar",
      lineas: [
        { tipo: "bien", texto: "Hi! I'm stuck on a bug in the login form. Could you take a look when you have a minute?" },
        { tipo: "nota", texto: "Con cada cambio explicado." },
      ],
    },
  ],
  errores: [
    {
      titulo: "La app guarda tus errores",
      lineas: [
        { tipo: "dato", clave: "1", texto: "La pregunta del día de Map" },
        { tipo: "dato", clave: "2", texto: "Conversa y la entrevista en inglés" },
        { tipo: "dato", clave: "3", texto: "Tu daily y el inglés escrito" },
      ],
    },
    {
      titulo: "Se agrupan por patrón",
      lineas: [
        { tipo: "puntaje", texto: "La edad va con to be" },
        { tipo: "cambio", mal: "I have 20 years", bien: "I am 20 years old" },
        { tipo: "nota", texto: "En inglés la edad se es, no se tiene." },
      ],
    },
    {
      titulo: "Practicas cada regla",
      lineas: [
        { tipo: "ia", texto: "Dilo en inglés: Mi hermano tiene 15 años." },
        { tipo: "tu", texto: "My brother is 15 years old." },
        { tipo: "bien", texto: "Correcto." },
      ],
    },
  ],
  conversa: [
    {
      titulo: "Eliges la reunión",
      lineas: [
        { tipo: "dato", clave: "8", texto: "Daily, revisión de código, planning, demo con un cliente..." },
        { tipo: "nota", texto: "Cada una empieza con la frase que ves en su ficha." },
      ],
    },
    {
      titulo: "Conversas en inglés",
      lineas: [
        { tipo: "ia", texto: "What did you work on yesterday?" },
        { tipo: "tu", texto: "I fixed a bug in the login form." },
        { tipo: "nota", texto: "No te corrige en medio: sigue aunque dudes." },
      ],
    },
    {
      titulo: "Te corrige al final",
      lineas: [
        { tipo: "puntaje", texto: "Nivel B1 · 7/10" },
        { tipo: "cambio", mal: "I didn't went", bien: "I didn't go" },
        { tipo: "bien", texto: "Tu frase más floja, reescrita de forma natural." },
      ],
    },
  ],

  // ---------- Entrevistas > Simular ----------
  simulacro: [
    {
      titulo: "Eliges todo o una etapa",
      lineas: [
        { tipo: "dato", clave: "1", texto: "Recursos humanos · 15 min" },
        { tipo: "dato", clave: "2", texto: "Entrevista técnica · 45 min" },
        { tipo: "dato", clave: "3", texto: "Presentación de proyecto · 15 min" },
        { tipo: "dato", clave: "4", texto: "Cierre · 5 min" },
      ],
    },
    {
      titulo: "Respondes en voz alta",
      lineas: [
        { tipo: "ia", texto: "¿Qué diferencia hay entre let y const?" },
        { tipo: "tu", texto: "La dices en voz alta y te pones nota." },
        { tipo: "puntaje", texto: "Lo sabía · Dudé · No lo sabía" },
      ],
    },
    {
      titulo: "Ves tu plan de refuerzo",
      lineas: [
        { tipo: "bien", texto: "Fuerte en: JavaScript, tu pitch." },
        { tipo: "mal", texto: "Refuerza: React y el cierre." },
        { tipo: "nota", texto: "Y, si quieres, un informe con IA." },
      ],
    },
  ],
  voz: [
    {
      titulo: "Eliges tema y entrevistador",
      lineas: [
        { tipo: "dato", clave: "A", texto: "Amable: reconoce lo bueno primero." },
        { tipo: "dato", clave: "B", texto: "Exigente: no deja pasar respuestas vagas." },
        { tipo: "dato", clave: "C", texto: "Apurado: quiere respuestas cortas." },
      ],
    },
    {
      titulo: "Respondes hablando",
      lineas: [
        { tipo: "ia", texto: "¿Qué es un closure?" },
        { tipo: "tu", texto: "Una función que recuerda las variables de donde nació." },
        { tipo: "ia", texto: "¿Y para qué lo usarías?" },
      ],
    },
    {
      titulo: "Ves tu informe",
      lineas: [
        { tipo: "puntaje", texto: "6/10 · casi listo" },
        { tipo: "mal", texto: "No das ejemplos concretos." },
        { tipo: "bien", texto: "Y tu respuesta mejorada, lista para decirla." },
      ],
    },
  ],
  examen: [
    {
      titulo: "4 preguntas sin ayuda",
      lineas: [
        { tipo: "dato", clave: "1", texto: "Un concepto de JavaScript o React" },
        { tipo: "dato", clave: "2", texto: "¿Qué imprime este código?" },
        { tipo: "dato", clave: "3", texto: "Una pregunta en inglés" },
        { tipo: "dato", clave: "4", texto: "Una de comportamiento" },
      ],
    },
    {
      titulo: "Ves tu informe",
      lineas: [
        { tipo: "puntaje", texto: "7/10 · casi listo" },
        { tipo: "bien", texto: "Fortalezas: conceptos claros." },
        { tipo: "mal", texto: "Mejorar: inglés hablado." },
      ],
    },
    {
      titulo: "Te comparas mes a mes",
      lineas: [
        { tipo: "dato", clave: "Oct", texto: "5/10 · falta" },
        { tipo: "dato", clave: "Nov", texto: "7/10 · casi listo" },
        { tipo: "bien", texto: "Subiste 2 puntos." },
      ],
    },
  ],
  proyecto: [
    {
      titulo: "Te pregunta por tu proyecto",
      lineas: [
        { tipo: "dato", clave: "1", texto: "Por qué elegiste cada tecnología" },
        { tipo: "dato", clave: "2", texto: "Un bug que tuviste y cómo lo resolviste" },
        { tipo: "dato", clave: "3", texto: "Qué harías distinto hoy" },
      ],
    },
    {
      titulo: "Respondes con un porqué",
      lineas: [
        { tipo: "ia", texto: "¿Por qué elegiste React?" },
        { tipo: "mal", texto: "Porque es lo que se usa." },
        { tipo: "bien", texto: "Porque la pantalla cambia mucho y los componentes me ordenan." },
      ],
    },
    {
      titulo: "Pides tu balance",
      lineas: [
        { tipo: "puntaje", texto: "7/10" },
        { tipo: "mal", texto: "Te falta hablar de cómo lo probaste." },
        { tipo: "nota", texto: "Con 3 frases listas para la próxima." },
      ],
    },
  ],
  preguntas: [
    {
      titulo: "Escribes 2 o 3 preguntas",
      lineas: [
        { tipo: "tu", texto: "¿Cómo acompañan a un junior?" },
        { tipo: "tu", texto: "¿Cuánto pagan?" },
      ],
    },
    {
      titulo: "Ves cuáles suman",
      lineas: [
        { tipo: "bien", texto: "Acompañar a un junior: muestra ganas de aprender." },
        { tipo: "mal", texto: "El sueldo: mejor para otra etapa." },
      ],
    },
    {
      titulo: "Te llevas 3 mejores",
      lineas: [
        { tipo: "bien", texto: "¿Cómo es un día normal de alguien junior?" },
        { tipo: "bien", texto: "¿Cómo revisan el código en el equipo?" },
        { tipo: "bien", texto: "¿Qué esperan de mí en 3 meses?" },
      ],
    },
  ],
  sueldo: [
    {
      titulo: "Eliges la situación",
      lineas: [
        { tipo: "dato", clave: "1", texto: "Prácticas en Lima" },
        { tipo: "dato", clave: "2", texto: "Junior en Lima, híbrido" },
        { tipo: "dato", clave: "3", texto: "Remoto en dólares" },
      ],
    },
    {
      titulo: "Conversas con la reclutadora",
      lineas: [
        { tipo: "ia", texto: "¿Cuál es tu expectativa salarial?" },
        { tipo: "tu", texto: "Por lo que investigué, entre 3000 y 3500 soles." },
        { tipo: "ia", texto: "Podemos ofrecer 2800." },
      ],
    },
    {
      titulo: "Pides tu balance",
      lineas: [
        { tipo: "puntaje", texto: "6/10" },
        { tipo: "bien", texto: "Diste una cifra con argumentos." },
        { tipo: "mal", texto: "No preguntaste por beneficios ni horario." },
      ],
    },
  ],

  // ---------- Entrevistas > Estudiar > Pitch y STAR (dos fichas de ejemplo, sin numerar) ----------
  pitch: [
    {
      titulo: "Tu pitch en 3 partes",
      lineas: [
        { tipo: "dato", clave: "1", texto: "Quién eres hoy" },
        { tipo: "dato", clave: "2", texto: "Qué has construido" },
        { tipo: "dato", clave: "3", texto: "Qué buscas" },
        { tipo: "bien", texto: "Soy estudiante de Sistemas, construí una app para practicar entrevistas y busco mis primeras prácticas de frontend." },
      ],
    },
    {
      titulo: "Una historia STAR",
      lineas: [
        { tipo: "dato", clave: "S", texto: "Situación: la app tardaba en cargar." },
        { tipo: "dato", clave: "T", texto: "Tarea: bajar el tiempo de carga." },
        { tipo: "dato", clave: "A", texto: "Acción: cargué cada pantalla solo al abrirla." },
        { tipo: "dato", clave: "R", texto: "Resultado: abrió en la mitad del tiempo." },
      ],
    },
  ],
};
