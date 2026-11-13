// Una frase corta por día, sin cursilería. Se elige según la fecha.
const FRASES = [
  "Un ejercicio hecho vale más que tres videos vistos.",
  "No necesitas ganas, necesitas empezar. Las ganas llegan después.",
  "Si te trabas, es justo ahí donde estás aprendiendo.",
  "Lo que hoy te cuesta, en un mes lo haces sin pensar.",
  "El entrevistador no espera que sepas todo: espera que sepas pensar.",
  "Leer la solución no es aprender. Escribirla sin mirar, sí.",
  "Hoy no tiene que ser perfecto. Tiene que estar hecho.",
  "Explicar en voz alta es la mitad de la entrevista. Practícalo.",
  "La constancia le gana al talento que no practica.",
  "Cada error que entiendes es uno que no repetirás en la entrevista.",
  "Primero que funcione. Después, que sea bonito.",
  "Nadie nace sabiendo closures. Se aprenden escribiéndolos.",
  "Media hora diaria le gana a un maratón de domingo.",
  "Si ya lo resolviste una vez, vuelve a resolverlo sin ayuda. Ahí se fija.",
  "La meta no es terminar ejercicios: es poder explicarlos.",
  "Tu yo de marzo te va a agradecer lo que hagas hoy.",
  "Divide el problema. Un paso pequeño también es avance.",
  "Escribe ejemplos antes de escribir código.",
  "Un test en rojo no es un fracaso, es una pista.",
  "El código que entiendes vale más que el código que copias.",
  "Practicar cuando no tienes ganas es lo que separa a los que llegan.",
  "Pregúntate qué pasa con el arreglo vacío. Siempre.",
  "Hoy aprende una cosa bien en vez de diez a medias.",
  "Lo difícil de hoy es la base de lo fácil de mañana.",
  "Las entrevistas se preparan como un deporte: repeticiones.",
  "No compares tu capítulo uno con el capítulo veinte de otro.",
  "Si puedes enseñarlo, lo sabes.",
  "Dos ejercicios hoy. Mañana, dos más. Así se llega.",
  "Equivocarte aquí es gratis. En la entrevista, no tanto.",
  "Avanzar lento sigue siendo avanzar.",
];

/** La frase de un día "AAAA-MM-DD" (siempre la misma para ese día). */
export function fraseDelDia(fecha) {
  const [a, m, d] = fecha.split("-").map(Number);
  const diaDelAno = Math.floor((Date.UTC(a, m - 1, d) - Date.UTC(a, 0, 0)) / 86_400_000);
  return FRASES[(diaDelAno + a) % FRASES.length];
}
