// Lo que se muestra DEBAJO de cada herramienta de IA para que se entienda sin leer párrafos:
// tres fichas con ejemplos dibujados (qué recibes al final, errores típicos y qué decir o recordar).
// Cada línea usa los mismos tipos que "Así se ve" (ver Ejemplo en MenuPanel.jsx):
// ia, tu, cambio, bien, mal, nota, codigo, puntaje y dato (una insignia corta + texto).

const entrevistaIngles = [
  {
    titulo: "Al final recibes",
    lineas: [
      { tipo: "puntaje", texto: "Nivel B1 · 6/10" },
      { tipo: "cambio", mal: "I have 20 years", bien: "I am 20 years old" },
      { tipo: "cambio", mal: "I am agree", bien: "I agree" },
      { tipo: "bien", texto: "Tu respuesta más floja, reescrita de forma natural." },
    ],
  },
  {
    titulo: "Las 3 ayudas",
    lineas: [
      { tipo: "dato", clave: "1", texto: "Respuesta completa: la lees en voz alta." },
      { tipo: "dato", clave: "2", texto: "Palabras clave: armas la frase tú." },
      { tipo: "dato", clave: "3", texto: "Sin ayuda: como en la entrevista real." },
    ],
  },
  {
    titulo: "Te van a preguntar",
    lineas: [
      { tipo: "ia", texto: "Tell me about yourself." },
      { tipo: "ia", texto: "What was the hardest part of your project?" },
      { tipo: "ia", texto: "Why do you want this job?" },
    ],
  },
];

export const MAS = {
  // ---------- Practicar > Entrena con IA ----------
  imprime: [
    {
      titulo: "Al final ves",
      lineas: [
        { tipo: "puntaje", texto: "Casi" },
        { tipo: "codigo", texto: "2\n2" },
        { tipo: "bien", texto: "var se comparte: cuando corre el timeout, i ya vale 2." },
      ],
    },
    {
      titulo: "Trampas que más salen",
      lineas: [
        { tipo: "dato", clave: "1", texto: "var dentro de un bucle con setTimeout" },
        { tipo: "dato", clave: "2", texto: "Promesas antes que setTimeout" },
        { tipo: "dato", clave: "3", texto: "this dentro de una función suelta" },
        { tipo: "dato", clave: "4", texto: "Copiar un objeto copia la referencia" },
      ],
    },
    {
      titulo: "Dilo así en la entrevista",
      lineas: [
        { tipo: "tu", texto: "Primero corre lo síncrono, luego las promesas y al final los timeouts." },
        { tipo: "nota", texto: "Explicar el porqué vale más que acertar la salida." },
      ],
    },
  ],
  review: [
    {
      titulo: "Al final ves",
      lineas: [
        { tipo: "puntaje", texto: "7/10 · encontraste 2 de 3" },
        { tipo: "bien", texto: "Viste: map usado para sumar." },
        { tipo: "mal", texto: "Se te pasó: muta el array original." },
      ],
    },
    {
      titulo: "Qué buscar",
      lineas: [
        { tipo: "dato", clave: "1", texto: "Casos borde: vacío, null, un solo elemento" },
        { tipo: "dato", clave: "2", texto: "Nombres que no dicen nada" },
        { tipo: "dato", clave: "3", texto: "Datos que se modifican sin querer" },
        { tipo: "dato", clave: "4", texto: "Código repetido o de más" },
      ],
    },
    {
      titulo: "Escríbelo así",
      lineas: [
        { tipo: "mal", texto: "Esto está mal." },
        { tipo: "bien", texto: "Línea 4: si items viene vacío falla. ¿Agregamos un valor inicial?" },
        { tipo: "nota", texto: "Línea, porqué y propuesta: así se revisa en un equipo." },
      ],
    },
  ],

  // ---------- Inglés > Con IA ----------
  entrevista: entrevistaIngles,
  ingles: entrevistaIngles,
  daily: [
    {
      titulo: "La fórmula",
      lineas: [
        { tipo: "dato", clave: "1", texto: "Yesterday I fixed / finished / worked on..." },
        { tipo: "dato", clave: "2", texto: "Today I'm going to..." },
        { tipo: "dato", clave: "3", texto: "I'm blocked by... / No blockers." },
      ],
    },
    {
      titulo: "Errores típicos",
      lineas: [
        { tipo: "cambio", mal: "Yesterday I work", bien: "Yesterday I worked" },
        { tipo: "cambio", mal: "I will to fix", bien: "I'm going to fix" },
        { tipo: "cambio", mal: "I have a doubt", bien: "I have a question" },
      ],
    },
    {
      titulo: "Al final recibes",
      lineas: [
        { tipo: "puntaje", texto: "Nivel B1 · 7/10" },
        { tipo: "bien", texto: "Tu daily reescrito, listo para decirlo y escucharlo." },
        { tipo: "nota", texto: "Dura 30 segundos en una reunión real." },
      ],
    },
  ],
  dice: [
    {
      titulo: "Pregunta cosas como",
      lineas: [
        { tipo: "tu", texto: "me quedé trabado con esto" },
        { tipo: "tu", texto: "¿me das una mano?" },
        { tipo: "tu", texto: "lo subo en un rato" },
      ],
    },
    {
      titulo: "Y recibes",
      lineas: [
        { tipo: "bien", texto: "I'm stuck on this." },
        { tipo: "bien", texto: "Could you give me a hand?" },
        { tipo: "bien", texto: "I'll push it in a bit." },
      ],
    },
    {
      titulo: "Ojo con los falsos amigos",
      lineas: [
        { tipo: "cambio", mal: "actually = actualmente", bien: "actually = en realidad" },
        { tipo: "cambio", mal: "assist = asistir", bien: "attend = asistir" },
        { tipo: "nota", texto: "Guarda con + Tarjeta las que vas a usar seguido." },
      ],
    },
  ],
  escrito: [
    {
      titulo: "Pedir ayuda por Slack",
      lineas: [{ tipo: "bien", texto: "Hi! I'm stuck on a bug in the login form. Could you take a look when you have a minute?" }],
    },
    {
      titulo: "Descripción de un PR",
      lineas: [
        { tipo: "dato", clave: "1", texto: "What: adds a search filter to the list." },
        { tipo: "dato", clave: "2", texto: "Why: users couldn't find products." },
        { tipo: "dato", clave: "3", texto: "How to test: type in the search box." },
      ],
    },
    {
      titulo: "Avisar un retraso",
      lineas: [
        { tipo: "mal", texto: "Sorry, I can't finish." },
        { tipo: "bien", texto: "Quick update: this will take one more day because of a bug in the API." },
      ],
    },
  ],
  errores: [
    {
      titulo: "De dónde salen",
      lineas: [
        { tipo: "dato", clave: "1", texto: "La pregunta del día de Map" },
        { tipo: "dato", clave: "2", texto: "Conversa y la entrevista en inglés" },
        { tipo: "dato", clave: "3", texto: "Tu daily y el inglés escrito" },
      ],
    },
    {
      titulo: "Una mini lección",
      lineas: [
        { tipo: "puntaje", texto: "La edad va con to be" },
        { tipo: "cambio", mal: "I have 20 years", bien: "I am 20 years old" },
        { tipo: "nota", texto: "En inglés la edad se es, no se tiene." },
      ],
    },
    {
      titulo: "Y la practicas",
      lineas: [
        { tipo: "ia", texto: "Dilo en inglés: Mi hermano tiene 15 años." },
        { tipo: "tu", texto: "My brother is 15 years old." },
        { tipo: "bien", texto: "Correcto." },
      ],
    },
  ],
  conversa: [
    {
      titulo: "Así se ve",
      lineas: [
        { tipo: "ia", texto: "What did you work on yesterday?" },
        { tipo: "tu", texto: "I fixed a bug in the login form." },
        { tipo: "ia", texto: "Nice. Anything blocking you today?" },
      ],
    },
    {
      titulo: "Al final recibes",
      lineas: [
        { tipo: "puntaje", texto: "Nivel B1 · 7/10" },
        { tipo: "cambio", mal: "I didn't went", bien: "I didn't go" },
        { tipo: "bien", texto: "Tu frase más floja, reescrita de forma natural." },
      ],
    },
    {
      titulo: "Para que rinda",
      lineas: [
        { tipo: "dato", clave: "1", texto: "Responde con frases completas, no con una palabra." },
        { tipo: "dato", clave: "2", texto: "Usa el micrófono: hablar es lo que más cuesta." },
        { tipo: "dato", clave: "3", texto: "No te corrige en medio: sigue aunque dudes." },
      ],
    },
  ],

  // ---------- Entrevistas > Simular ----------
  simulacro: [
    {
      titulo: "Las 4 etapas",
      lineas: [
        { tipo: "dato", clave: "1", texto: "Recursos humanos · 15 min" },
        { tipo: "dato", clave: "2", texto: "Entrevista técnica · 45 min" },
        { tipo: "dato", clave: "3", texto: "Presentación de proyecto · 15 min" },
        { tipo: "dato", clave: "4", texto: "Cierre · 5 min" },
      ],
    },
    {
      titulo: "Así se ve",
      lineas: [
        { tipo: "ia", texto: "¿Qué diferencia hay entre let y const?" },
        { tipo: "tu", texto: "La respondes en voz alta y te pones nota." },
        { tipo: "puntaje", texto: "Lo sabía · Dudé · No lo sabía" },
      ],
    },
    {
      titulo: "Al final recibes",
      lineas: [
        { tipo: "puntaje", texto: "7/10 · casi listo" },
        { tipo: "bien", texto: "Fuerte en: JavaScript, tu pitch." },
        { tipo: "mal", texto: "Refuerza: React y el cierre." },
        { tipo: "nota", texto: "Con un plan de 3 pasos para los próximos días." },
      ],
    },
  ],
  voz: [
    {
      titulo: "Elige al entrevistador",
      lineas: [
        { tipo: "dato", clave: "1", texto: "Amable: reconoce lo bueno primero." },
        { tipo: "dato", clave: "2", texto: "Exigente: no deja pasar respuestas vagas." },
        { tipo: "dato", clave: "3", texto: "Apurado: quiere respuestas cortas." },
      ],
    },
    {
      titulo: "Al final recibes",
      lineas: [
        { tipo: "puntaje", texto: "6/10 · casi listo" },
        { tipo: "bien", texto: "Explicas con tus palabras." },
        { tipo: "mal", texto: "No das ejemplos concretos." },
        { tipo: "nota", texto: "Y tu respuesta mejorada, lista para decirla." },
      ],
    },
    {
      titulo: "Para que salga bien",
      lineas: [
        { tipo: "dato", clave: "1", texto: "Usa audífonos y Chrome." },
        { tipo: "dato", clave: "2", texto: "Responde en 30 a 60 segundos." },
        { tipo: "dato", clave: "3", texto: "Cierra cada respuesta con un ejemplo." },
      ],
    },
  ],
  examen: [
    {
      titulo: "Las 4 preguntas",
      lineas: [
        { tipo: "dato", clave: "1", texto: "Un concepto de JavaScript o React" },
        { tipo: "dato", clave: "2", texto: "¿Qué imprime este código?" },
        { tipo: "dato", clave: "3", texto: "Una pregunta en inglés" },
        { tipo: "dato", clave: "4", texto: "Una de comportamiento" },
      ],
    },
    {
      titulo: "Tu informe",
      lineas: [
        { tipo: "puntaje", texto: "7/10 · casi listo" },
        { tipo: "bien", texto: "Fortalezas: conceptos claros." },
        { tipo: "mal", texto: "Mejorar: inglés hablado." },
        { tipo: "nota", texto: "Y un plan de 3 pasos." },
      ],
    },
    {
      titulo: "Mes a mes",
      lineas: [
        { tipo: "dato", clave: "Oct", texto: "5/10 · falta" },
        { tipo: "dato", clave: "Nov", texto: "7/10 · casi listo" },
        { tipo: "bien", texto: "Subiste 2 puntos." },
      ],
    },
  ],
  proyecto: [
    {
      titulo: "Te va a preguntar por",
      lineas: [
        { tipo: "dato", clave: "1", texto: "Por qué elegiste cada tecnología" },
        { tipo: "dato", clave: "2", texto: "Cómo funciona una parte por dentro" },
        { tipo: "dato", clave: "3", texto: "Un bug que tuviste y cómo lo resolviste" },
        { tipo: "dato", clave: "4", texto: "Qué harías distinto hoy" },
      ],
    },
    {
      titulo: "Responde así",
      lineas: [
        { tipo: "mal", texto: "Usé React porque es lo que se usa." },
        { tipo: "bien", texto: "Usé React porque la pantalla cambia mucho y los componentes me ordenan." },
      ],
    },
    {
      titulo: "Tu balance",
      lineas: [
        { tipo: "puntaje", texto: "7/10" },
        { tipo: "bien", texto: "Explicas decisiones con un porqué." },
        { tipo: "mal", texto: "Te falta hablar de cómo lo probaste." },
        { tipo: "nota", texto: "Con 3 frases listas para la próxima." },
      ],
    },
  ],
  preguntas: [
    {
      titulo: "Suman",
      lineas: [
        { tipo: "bien", texto: "¿Cómo es un día normal de alguien junior?" },
        { tipo: "bien", texto: "¿Cómo revisan el código en el equipo?" },
        { tipo: "bien", texto: "¿Qué esperan de mí en 3 meses?" },
      ],
    },
    {
      titulo: "Restan",
      lineas: [
        { tipo: "mal", texto: "¿Cuánto pagan? (en la primera entrevista)" },
        { tipo: "mal", texto: "¿Qué hace la empresa?" },
        { tipo: "mal", texto: "No, ninguna pregunta." },
      ],
    },
    {
      titulo: "Al final recibes",
      lineas: [
        { tipo: "puntaje", texto: "8/10" },
        { tipo: "nota", texto: "Un comentario por cada pregunta tuya." },
        { tipo: "bien", texto: "Y 3 preguntas mejores para llevar." },
      ],
    },
  ],
  sueldo: [
    {
      titulo: "Las 3 situaciones",
      lineas: [
        { tipo: "dato", clave: "1", texto: "Prácticas en Lima" },
        { tipo: "dato", clave: "2", texto: "Junior en Lima, híbrido" },
        { tipo: "dato", clave: "3", texto: "Remoto en dólares" },
      ],
    },
    {
      titulo: "Dilo así",
      lineas: [
        { tipo: "mal", texto: "Lo que ustedes paguen está bien." },
        { tipo: "bien", texto: "Por lo que investigué, busco entre 3000 y 3500 soles." },
        { tipo: "bien", texto: "¿Me das un día para pensarlo?" },
      ],
    },
    {
      titulo: "Tu balance",
      lineas: [
        { tipo: "puntaje", texto: "6/10" },
        { tipo: "bien", texto: "Diste una cifra con argumentos." },
        { tipo: "mal", texto: "No preguntaste por beneficios ni horario." },
      ],
    },
  ],

  // ---------- Entrevistas > Estudiar > Pitch y STAR ----------
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
