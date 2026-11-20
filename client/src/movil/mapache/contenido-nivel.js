// El inglés del mapache, por franjas de nivel. Te habla UN NIVEL POR ENCIMA del tuyo (si eres A2,
// te habla en B1): entiendes casi todo y siempre aprendes algo. Cada frase trae una expresión útil
// marcada con su traducción. Franjas: A (A1-A2), B (B1-B2), C (C1-C2).

/** La franja en la que te habla el mapache: la de tu nivel siguiente. */
export function franjaDe(nivel) {
  return nivel?.[0] === "C" ? "C" : nivel?.[0] === "B" ? "B" : "A";
}

/** Lo que dice según cómo se siente. {w}: una palabra que aprendiste; {n}: cuántas te escondió. */
export const FRASES_NIVEL = {
  A: {
    nuevo: [{ en: "Hi! I'm your new raccoon. I love English words. Let's start!", es: "¡Hola! Soy tu nuevo mapache. Me encantan las palabras en inglés. ¡Empecemos!", expresion: { en: "Let's start!", es: "¡Empecemos!" } }],
    feliz: [
      { en: "That was a great lesson! \"{w}\" was my favorite snack today.", es: "¡Qué buena lección! \"{w}\" fue mi bocado favorito de hoy.", expresion: { en: "my favorite", es: "mi favorito" } },
      { en: "I'm full! You studied really well today.", es: "¡Estoy lleno! Hoy estudiaste muy bien.", expresion: { en: "I'm full", es: "estoy lleno" } },
      { en: "Thanks for the words! I feel much better than yesterday.", es: "¡Gracias por las palabras! Me siento mucho mejor que ayer.", expresion: { en: "much better than", es: "mucho mejor que" } },
    ],
    normal: [
      { en: "Hi! What are we going to learn today?", es: "¡Hola! ¿Qué vamos a aprender hoy?", expresion: { en: "going to", es: "ir a (un plan)" } },
      { en: "I remember \"{w}\". Do you remember it too?", es: "Me acuerdo de \"{w}\". ¿Tú también te acuerdas?", expresion: { en: "too", es: "también (al final de la frase)" } },
      { en: "I'm not hungry, but I'm not full either.", es: "No tengo hambre, pero tampoco estoy lleno.", expresion: { en: "not... either", es: "tampoco" } },
    ],
    hambriento: [
      { en: "I'm really hungry. Can we do a lesson now, please?", es: "Tengo mucha hambre. ¿Podemos hacer una lección ahora, por favor?", expresion: { en: "really hungry", es: "con mucha hambre" } },
      { en: "My stomach is making noises. Feed me some English!", es: "Mi estómago está haciendo ruidos. ¡Dame un poco de inglés!", expresion: { en: "feed me", es: "dame de comer" } },
      { en: "I didn't eat anything today. Not even \"{w}\"!", es: "Hoy no comí nada. ¡Ni siquiera \"{w}\"!", expresion: { en: "not even", es: "ni siquiera" } },
    ],
    triste: [
      { en: "You didn't come yesterday, and I waited all day.", es: "Ayer no viniste y te esperé todo el día.", expresion: { en: "all day", es: "todo el día" } },
      { en: "I'm a bit sad. Can we start a new streak today?", es: "Estoy un poco triste. ¿Empezamos una nueva racha hoy?", expresion: { en: "a bit", es: "un poco" } },
    ],
    robos: [
      { en: "Oops... I hid {n} of your words under my bed. Can you find them?", es: "Ups... Escondí {n} de tus palabras debajo de mi cama. ¿Puedes encontrarlas?", expresion: { en: "under my bed", es: "debajo de mi cama" } },
      { en: "I took {n} words while you were away. Sorry!", es: "Me llevé {n} palabras mientras no estabas. ¡Perdón!", expresion: { en: "while you were away", es: "mientras no estabas" } },
    ],
    dormido: [{ en: "Zzz...", es: "Zzz... (está dormido; tócalo para despertarlo)" }],
    escapado: [{ en: "I went out to look for food. Please come back with some English!", es: "Salí a buscar comida. ¡Por favor, vuelve con un poco de inglés!", expresion: { en: "look for", es: "buscar" } }],
  },
  B: {
    nuevo: [
      { en: "Hi there! I'm your raccoon, and I'm absolutely starving for English words.", es: "¡Hola! Soy tu mapache y me muero de hambre de palabras en inglés.", expresion: { en: "I'm starving", es: "me muero de hambre" } },
      { en: "Nice to meet you! I eat English words for breakfast, lunch and dinner.", es: "¡Mucho gusto! Como palabras en inglés en el desayuno, el almuerzo y la cena.", expresion: { en: "nice to meet you", es: "mucho gusto" } },
      { en: "So this is where I live now? Great. Let's kick things off with a lesson.", es: "¿Así que aquí vivo ahora? Genial. Arranquemos con una lección.", expresion: { en: "kick things off", es: "arrancar, dar inicio" } },
    ],
    feliz: [
      { en: "I've eaten so well today that I could take a nap right now.", es: "Hoy comí tan bien que podría echarme una siesta ahora mismo.", expresion: { en: "take a nap", es: "echarse una siesta" } },
      { en: "You've really stepped up your game today. \"{w}\" was delicious!", es: "Hoy de verdad subiste tu nivel. ¡\"{w}\" estuvo delicioso!", expresion: { en: "step up your game", es: "mejorar, esforzarse más" } },
      { en: "If we keep this up, you'll be fluent before you know it.", es: "Si seguimos así, vas a hablar con fluidez antes de que te des cuenta.", expresion: { en: "before you know it", es: "antes de que te des cuenta" } },
      { en: "You smashed it today. I'm too full to even think about snacks.", es: "Hoy la rompiste. Estoy tan lleno que ni pienso en piqueos.", expresion: { en: "smash it", es: "romperla, hacerlo genial" } },
      { en: "That session went really smoothly. No bugs, no drama, just progress.", es: "Esa sesión salió muy fluida. Sin bugs, sin drama, solo avance.", expresion: { en: "go smoothly", es: "salir sin problemas" } },
      { en: "I'm stuffed. Remind me to skip breakfast tomorrow.", es: "Estoy repleto. Recuérdame saltarme el desayuno mañana.", expresion: { en: "I'm stuffed", es: "estoy repleto" } },
      { en: "You're on fire today. Keep going like this and I'll have to loosen my belt.", es: "Hoy estás imparable. Si sigues así, voy a tener que aflojarme el cinturón.", expresion: { en: "on fire", es: "imparable, encendido" } },
      { en: "Goal reached! Now we can call it a day without feeling guilty.", es: "¡Meta cumplida! Ahora podemos dar el día por terminado sin culpa.", expresion: { en: "call it a day", es: "dar el día por terminado" } },
      { en: "\"{w}\" tasted even better the second time. Practice really pays off.", es: "\"{w}\" supo aún mejor la segunda vez. La práctica de verdad da frutos.", expresion: { en: "pay off", es: "dar frutos, valer la pena" } },
      { en: "You did more than you planned today. That's how good developers are made.", es: "Hoy hiciste más de lo que tenías planeado. Así se forman los buenos desarrolladores.", expresion: { en: "that's how ... are made", es: "así se forman los..." } },
      { en: "I'm so full I could sleep through a production outage.", es: "Estoy tan lleno que podría dormir durante una caída de producción sin enterarme.", expresion: { en: "sleep through", es: "dormir sin enterarse de algo" } },
      { en: "Daily goal: done. Feels good to cross it off the list, right?", es: "Meta diaria: hecha. Se siente bien tacharla de la lista, ¿no?", expresion: { en: "cross something off", es: "tachar algo (de una lista)" } },
      { en: "You've been really consistent lately, and it shows.", es: "Últimamente has sido muy constante, y se nota.", expresion: { en: "it shows", es: "se nota" } },
      { en: "If every day were like today, I'd be the happiest raccoon in Peru.", es: "Si todos los días fueran como hoy, sería el mapache más feliz del Perú.", expresion: { en: "If every day were..., I'd...", es: "si todos los días fueran..., yo... (condicional)" } },
      { en: "Nice work. You didn't just study today, you actually used what you learned.", es: "Buen trabajo. Hoy no solo estudiaste: de verdad usaste lo que aprendiste.", expresion: { en: "nice work", es: "buen trabajo (se dice mucho en el trabajo)" } },
      { en: "That was a productive session. Let's not push our luck with another one.", es: "Fue una sesión productiva. No tentemos a la suerte con otra.", expresion: { en: "push your luck", es: "tentar a la suerte" } },
      { en: "My belly is full and my vocabulary is growing. Win-win.", es: "Mi panza está llena y mi vocabulario crece. Todos ganamos.", expresion: { en: "win-win", es: "todos ganan" } },
      { en: "You showed up and got it done. That's what matters.", es: "Viniste y lo sacaste adelante. Eso es lo que importa.", expresion: { en: "get it done", es: "sacarlo adelante" } },
      { en: "I've had a lovely meal of words. My compliments to the chef.", es: "Me di un banquete de palabras. Mis felicitaciones al cocinero.", expresion: { en: "my compliments to the chef", es: "mis felicitaciones al cocinero" } },
      { en: "We're ahead of schedule today. I could get used to this pace.", es: "Hoy vamos adelantados. Podría acostumbrarme a este ritmo.", expresion: { en: "ahead of schedule", es: "adelantados (respecto al plan)" } },
      { en: "Look at you, finishing the goal before dinner. I'm impressed.", es: "Mírate, terminando la meta antes de la cena. Estoy impresionado.", expresion: { en: "Look at you", es: "mírate (para felicitar)" } },
      { en: "That went way better than I expected. Don't tell anyone I doubted you.", es: "Salió muchísimo mejor de lo que esperaba. No le digas a nadie que dudé de ti.", expresion: { en: "way better", es: "muchísimo mejor" } },
      { en: "I'm full, happy and slightly smarter. All thanks to you.", es: "Estoy lleno, feliz y un poquito más inteligente. Todo gracias a ti.", expresion: { en: "slightly", es: "ligeramente, un poco" } },
      { en: "Today's English was like clean code: short, clear and easy to digest.", es: "El inglés de hoy fue como código limpio: corto, claro y fácil de digerir.", expresion: { en: "easy to digest", es: "fácil de digerir" } },
      { en: "You've earned a break. Go stretch your legs, I'll guard the words.", es: "Te ganaste un descanso. Ve a estirar las piernas, yo cuido las palabras.", expresion: { en: "stretch your legs", es: "estirar las piernas" } },
      { en: "All tests passing, all words eaten. Today was a green day.", es: "Todos los tests en verde, todas las palabras comidas. Hoy fue un día en verde.", expresion: { en: "all tests passing", es: "todos los tests en verde" } },
      { en: "You nailed the goal. Same time, same place tomorrow?", es: "Cumpliste la meta. ¿Mañana a la misma hora y en el mismo lugar?", expresion: { en: "same time, same place", es: "a la misma hora, en el mismo lugar" } },
      { en: "I don't want to brag, but my human is getting really good at English.", es: "No es por presumir, pero mi humano está mejorando mucho en inglés.", expresion: { en: "I don't want to brag, but...", es: "no es por presumir, pero..." } },
      { en: "Full belly, happy raccoon. That's the deal, and you kept your side of it.", es: "Panza llena, mapache feliz. Ese es el trato, y tú cumpliste tu parte.", expresion: { en: "keep your side of the deal", es: "cumplir tu parte del trato" } },
      { en: "That's what I call a solid day's work.", es: "A eso le llamo una buena jornada de trabajo.", expresion: { en: "That's what I call...", es: "a eso le llamo..." } },
      { en: "I could listen to you practice all day. Well, after my nap.", es: "Podría escucharte practicar todo el día. Bueno, después de mi siesta.", expresion: { en: "I could ... all day", es: "podría ... todo el día" } },
      { en: "You picked up \"{w}\" so fast. It's like it was always there.", es: "Aprendiste \"{w}\" tan rápido. Es como si siempre hubiera estado ahí.", expresion: { en: "pick up", es: "aprender (casi sin esfuerzo)" } },
      { en: "Small steps every day add up. Today's step was a big one.", es: "Los pasos pequeños de cada día se van sumando. El de hoy fue grande.", expresion: { en: "add up", es: "sumarse, acumularse" } },
      { en: "We're on a roll. Let's not break the chain tomorrow.", es: "Estamos en racha. No rompamos la cadena mañana.", expresion: { en: "break the chain", es: "romper la cadena (la racha)" } },
      { en: "I'm in such a good mood that I might even share my snacks. Might.", es: "Estoy de tan buen humor que hasta podría compartir mis piqueos. Podría.", expresion: { en: "in a good mood", es: "de buen humor" } },
      { en: "You handled that lesson like a pro. Seriously.", es: "Manejaste esa lección como un profesional. En serio.", expresion: { en: "like a pro", es: "como un profesional" } },
      { en: "Goal met, streak safe, raccoon happy. Everything is working as expected.", es: "Meta cumplida, racha a salvo, mapache feliz. Todo funciona como se esperaba.", expresion: { en: "working as expected", es: "funciona como se esperaba" } },
      { en: "I feel like a merged pull request: finished and proud.", es: "Me siento como un pull request ya fusionado: terminado y orgulloso.", expresion: { en: "I feel like...", es: "me siento como..." } },
      { en: "Thanks for feeding me so well. I owe you one.", es: "Gracias por alimentarme tan bien. Te debo una.", expresion: { en: "I owe you one", es: "te debo una" } },
      { en: "That was hard work, but you made it look easy.", es: "Fue trabajo duro, pero hiciste que pareciera fácil.", expresion: { en: "make it look easy", es: "hacer que parezca fácil" } },
      { en: "You kept going even when it got tricky. That's the real skill.", es: "Seguiste aunque se puso complicado. Esa es la verdadera habilidad.", expresion: { en: "get tricky", es: "complicarse" } },
      { en: "I'm so full I've lost count of the words. Let's just say it was a lot.", es: "Estoy tan lleno que perdí la cuenta de las palabras. Digamos que fueron muchas.", expresion: { en: "lose count", es: "perder la cuenta" } },
      { en: "Your future interviewer doesn't know it yet, but today you got a bit closer.", es: "Tu futuro entrevistador todavía no lo sabe, pero hoy te acercaste un poco más.", expresion: { en: "get closer", es: "acercarse" } },
    ],
    normal: [
      { en: "I've been thinking about \"{w}\" all morning. Shall we practice it?", es: "He estado pensando en \"{w}\" toda la mañana. ¿La practicamos?", expresion: { en: "Shall we...?", es: "¿Qué tal si...?" } },
      { en: "I could do with a few more words before dinner.", es: "No me vendrían mal unas palabras más antes de la cena.", expresion: { en: "could do with", es: "no me vendría mal" } },
      { en: "Let's get down to business: one lesson and I'm happy.", es: "Pongámonos manos a la obra: una lección y estoy feliz.", expresion: { en: "get down to business", es: "ponerse manos a la obra" } },
      { en: "Hey! How's your day going so far?", es: "¡Hola! ¿Cómo va tu día hasta ahora?", expresion: { en: "so far", es: "hasta ahora" } },
      { en: "I'm doing alright, but a couple more words wouldn't hurt.", es: "Estoy bien, pero un par de palabras más no estarían de más.", expresion: { en: "wouldn't hurt", es: "no estaría de más" } },
      { en: "Let's warm up with something easy and then move on to the hard stuff.", es: "Calentemos con algo fácil y después pasemos a lo difícil.", expresion: { en: "warm up", es: "calentar, entrar en ritmo" } },
      { en: "Ten minutes now beats an hour you keep putting off.", es: "Diez minutos ahora le ganan a una hora que sigues postergando.", expresion: { en: "put off", es: "postergar" } },
      { en: "I've been going over \"{w}\" in my head. Can you use it in a sentence?", es: "He estado repasando \"{w}\" en mi cabeza. ¿Puedes usarla en una oración?", expresion: { en: "go over", es: "repasar" } },
      { en: "We're about halfway to today's goal. Let's keep going.", es: "Vamos más o menos a la mitad de la meta de hoy. Sigamos.", expresion: { en: "halfway", es: "a la mitad" } },
      { en: "Quick question: what did you work on today?", es: "Pregunta rápida: ¿en qué trabajaste hoy?", expresion: { en: "work on", es: "trabajar en algo" } },
      { en: "I'm not starving, but a short lesson would sort me out.", es: "No me muero de hambre, pero una lección corta me lo resolvería.", expresion: { en: "sort someone out", es: "resolverle algo a alguien" } },
      { en: "Got a minute? A quick review now saves a lot of time later.", es: "¿Tienes un minuto? Un repaso rápido ahora ahorra mucho tiempo después.", expresion: { en: "Got a minute?", es: "¿tienes un minuto?" } },
      { en: "Today's plan: one lesson, a few words, zero excuses.", es: "Plan de hoy: una lección, unas cuantas palabras y cero excusas.", expresion: { en: "zero excuses", es: "cero excusas" } },
      { en: "Let's pick up where we left off yesterday.", es: "Retomemos donde lo dejamos ayer.", expresion: { en: "pick up where we left off", es: "retomar donde lo dejamos" } },
      { en: "I'm fine, thanks for asking. Well, you didn't ask, but I'm fine.", es: "Estoy bien, gracias por preguntar. Bueno, no preguntaste, pero estoy bien.", expresion: { en: "thanks for asking", es: "gracias por preguntar" } },
      { en: "Learning English is like learning Git: confusing at first, then you can't live without it.", es: "Aprender inglés es como aprender Git: confuso al principio, después no puedes vivir sin él.", expresion: { en: "at first", es: "al principio" } },
      { en: "Try saying one thing about your project in English today. Just one.", es: "Intenta decir una cosa sobre tu proyecto en inglés hoy. Solo una.", expresion: { en: "try + -ing", es: "probar a hacer algo" } },
      { en: "We're doing okay. Not great, not terrible. Let's aim for great.", es: "Vamos bien. Ni genial ni terrible. Apuntemos a genial.", expresion: { en: "aim for", es: "apuntar a" } },
      { en: "I've got room for a few more words. Just saying.", es: "Me queda espacio para unas palabras más. Solo digo.", expresion: { en: "just saying", es: "solo digo" } },
      { en: "What's on your to-do list today? Hopefully English is near the top.", es: "¿Qué tienes en tu lista de pendientes hoy? Ojalá el inglés esté cerca de arriba.", expresion: { en: "to-do list", es: "lista de pendientes" } },
      { en: "Let's break it down: one lesson now, the rest later.", es: "Dividámoslo: una lección ahora y el resto después.", expresion: { en: "break it down", es: "dividirlo en partes" } },
      { en: "I'm in the mood for some phrasal verbs. Got any?", es: "Tengo ganas de unos phrasal verbs. ¿Tienes alguno?", expresion: { en: "in the mood for", es: "con ganas de" } },
      { en: "You don't need to be perfect. You just need to keep showing up.", es: "No necesitas ser perfecto. Solo necesitas seguir viniendo.", expresion: { en: "keep + -ing", es: "seguir haciendo algo" } },
      { en: "If you're short on time, a five-minute review still counts.", es: "Si tienes poco tiempo, un repaso de cinco minutos igual cuenta.", expresion: { en: "short on time", es: "con poco tiempo" } },
      { en: "Let's run through today's words before they get cold.", es: "Repasemos rápido las palabras de hoy antes de que se enfríen.", expresion: { en: "run through", es: "repasar rápido" } },
      { en: "I'm not complaining, but my bowl is only half full.", es: "No me quejo, pero mi plato está solo a la mitad.", expresion: { en: "I'm not complaining, but...", es: "no me quejo, pero..." } },
      { en: "Reading code in English every day is free practice. Docs count too!", es: "Leer código en inglés todos los días es práctica gratis. ¡La documentación también cuenta!", expresion: { en: "count", es: "contar, valer" } },
      { en: "Any plans for this evening? I vote for English.", es: "¿Algún plan para esta noche? Yo voto por inglés.", expresion: { en: "I vote for", es: "yo voto por" } },
      { en: "Steady progress beats random marathons. Let's do a little now.", es: "El avance constante le gana a los maratones de vez en cuando. Hagamos un poco ahora.", expresion: { en: "steady progress", es: "avance constante" } },
      { en: "Let me guess: busy day at university?", es: "Déjame adivinar: ¿día ocupado en la universidad?", expresion: { en: "Let me guess", es: "déjame adivinar" } },
      { en: "When you're ready, I'm ready. I'm always ready, actually.", es: "Cuando estés listo, yo estoy listo. En realidad, siempre estoy listo.", expresion: { en: "actually", es: "en realidad" } },
      { en: "I tried to read the React docs, but I got distracted by a snack.", es: "Intenté leer la documentación de React, pero me distraje con un piqueo.", expresion: { en: "get distracted by", es: "distraerse con" } },
      { en: "We can do better than yesterday. Not by much, just a little.", es: "Podemos hacerlo mejor que ayer. No por mucho, solo un poco.", expresion: { en: "not by much", es: "no por mucho" } },
      { en: "Mind if we practice some interview phrases today?", es: "¿Te molesta si practicamos unas frases de entrevista hoy?", expresion: { en: "Mind if...?", es: "¿te molesta si...?" } },
      { en: "Think of a lesson as a small commit. Do one now and push it.", es: "Piensa en una lección como un commit pequeño. Haz uno ahora y súbelo.", expresion: { en: "think of ... as", es: "ver algo como..." } },
      { en: "I'll keep it short: one lesson, then you're free.", es: "Seré breve: una lección y quedas libre.", expresion: { en: "keep it short", es: "ser breve" } },
      { en: "You know what would make my day? A little more English.", es: "¿Sabes qué me alegraría el día? Un poco más de inglés.", expresion: { en: "make my day", es: "alegrarme el día" } },
      { en: "Don't overthink it. Start the lesson and see how it goes.", es: "No le des tantas vueltas. Empieza la lección y mira cómo va.", expresion: { en: "overthink", es: "darle demasiadas vueltas" } },
      { en: "I've been practicing small talk. So... nice weather today, isn't it?", es: "He estado practicando conversación casual. Entonces... lindo clima hoy, ¿no?", expresion: { en: "small talk", es: "conversación casual" } },
      { en: "\"{w}\" keeps popping up in my head. That's a good sign.", es: "\"{w}\" sigue apareciendo en mi cabeza. Es una buena señal.", expresion: { en: "pop up", es: "aparecer de repente" } },
      { en: "No rush, but the day won't last forever.", es: "Sin apuro, pero el día no dura para siempre.", expresion: { en: "no rush", es: "sin apuro" } },
      { en: "Let's tackle something new today. Easy stuff gets boring.", es: "Enfrentemos algo nuevo hoy. Lo fácil aburre.", expresion: { en: "tackle", es: "abordar, enfrentar" } },
      { en: "If I could type, I'd write my own flashcards. Sadly, paws.", es: "Si pudiera escribir en el teclado, haría mis propias tarjetas. Lástima, tengo patas.", expresion: { en: "If I could..., I'd...", es: "si pudiera..., yo... (condicional)" } },
      { en: "They say interviews in English get easier with practice. Let's find out.", es: "Dicen que las entrevistas en inglés se hacen más fáciles con práctica. Averigüémoslo.", expresion: { en: "find out", es: "averiguar, descubrir" } },
      { en: "We've got a decent start. Let's build on it.", es: "Tenemos un buen comienzo. Aprovechémoslo.", expresion: { en: "build on", es: "aprovechar, construir sobre algo" } },
      { en: "One more lesson and I'll stop staring at you like this.", es: "Una lección más y dejo de mirarte así.", expresion: { en: "stare at", es: "quedarse mirando" } },
      { en: "Fun fact: raccoons can remember things for years. I remember every word you skip.", es: "Dato curioso: los mapaches recuerdan cosas durante años. Yo recuerdo cada palabra que te saltas.", expresion: { en: "fun fact", es: "dato curioso" } },
      { en: "Let's keep the momentum going. It's my favorite food after words.", es: "Mantengamos el impulso. Es mi comida favorita después de las palabras.", expresion: { en: "keep the momentum going", es: "mantener el impulso" } },
      { en: "Today's a good day to learn something you'll actually use at work.", es: "Hoy es un buen día para aprender algo que de verdad vas a usar en el trabajo.", expresion: { en: "a good day to", es: "un buen día para" } },
      { en: "How about a quick round of Repeat after me? Your accent will thank you.", es: "¿Qué tal una ronda rápida de Repite conmigo? Tu acento te lo va a agradecer.", expresion: { en: "How about...?", es: "¿qué tal si...?" } },
      { en: "I'm keeping an eye on the goal bar. It could use a little push.", es: "Estoy pendiente de la barra de la meta. Le vendría bien un empujoncito.", expresion: { en: "keep an eye on", es: "estar pendiente de" } },
      { en: "Let's get the hard part out of the way first.", es: "Saquémonos lo difícil de encima primero.", expresion: { en: "get something out of the way", es: "sacarse algo de encima" } },
      { en: "A bit of English before bed? I promise it won't keep you up.", es: "¿Un poco de inglés antes de dormir? Te prometo que no te va a quitar el sueño.", expresion: { en: "keep someone up", es: "quitarle el sueño a alguien" } },
    ],
    hambriento: [
      { en: "I'm running on empty. Could you squeeze in a quick lesson?", es: "Estoy sin energía. ¿Podrías hacerte un espacio para una lección rápida?", expresion: { en: "squeeze in", es: "hacerse un espacio para algo" } },
      { en: "I haven't had a single word since yesterday. I'm starving!", es: "No he comido ni una palabra desde ayer. ¡Me muero de hambre!", expresion: { en: "since yesterday", es: "desde ayer (present perfect)" } },
      { en: "If you fed me \"{w}\" again, I'd stop complaining. Promise.", es: "Si me dieras \"{w}\" otra vez, dejaría de quejarme. Lo prometo.", expresion: { en: "If you fed me..., I'd...", es: "si me dieras..., yo... (condicional)" } },
      { en: "My stomach is growling louder than your laptop fan.", es: "Mi estómago gruñe más fuerte que el ventilador de tu laptop.", expresion: { en: "growl", es: "gruñir (el estómago)" } },
      { en: "Just one lesson, please. I'm not asking for a whole sprint.", es: "Solo una lección, por favor. No te pido un sprint entero.", expresion: { en: "I'm not asking for...", es: "no te pido..." } },
      { en: "I've been waiting all day. Could you spare five minutes?", es: "Estuve esperando todo el día. ¿Puedes regalarme cinco minutos?", expresion: { en: "spare", es: "regalar, disponer de (tiempo)" } },
      { en: "Low battery: 10%. Please plug me into some English.", es: "Batería baja: 10%. Por favor, conéctame a un poco de inglés.", expresion: { en: "plug into", es: "conectar a" } },
      { en: "I'd settle for a single word. Even \"{w}\" would do.", es: "Me conformaría con una sola palabra. Hasta \"{w}\" me serviría.", expresion: { en: "settle for", es: "conformarse con" } },
      { en: "I'm so hungry I started chewing on your keyboard. Kidding. Mostly.", es: "Tengo tanta hambre que empecé a mordisquear tu teclado. Es broma. Casi.", expresion: { en: "chew on", es: "mordisquear" } },
      { en: "Feed me now, and I promise I won't steal any more words. Today.", es: "Dame de comer ahora y te prometo que no robo más palabras. Hoy.", expresion: { en: "I promise I won't...", es: "te prometo que no voy a..." } },
      { en: "Today has been really quiet. Too quiet. Let's make some noise in English.", es: "Hoy estuvo muy tranquilo. Demasiado. Hagamos algo de ruido en inglés.", expresion: { en: "too quiet", es: "demasiado tranquilo" } },
      { en: "I know you're busy, but a hungry raccoon can't wait forever.", es: "Sé que estás ocupado, pero un mapache con hambre no puede esperar para siempre.", expresion: { en: "can't wait forever", es: "no puede esperar para siempre" } },
      { en: "Even a quick round of Trash panda would keep me going.", es: "Hasta una ronda rápida de Trash panda me daría energía para seguir.", expresion: { en: "keep someone going", es: "darle energía para seguir" } },
    ],
    triste: [
      { en: "We broke our streak, but it's not the end of the world. Let's start over.", es: "Rompimos la racha, pero no es el fin del mundo. Empecemos de nuevo.", expresion: { en: "start over", es: "empezar de nuevo" } },
      { en: "I've been feeling a bit down since you skipped yesterday.", es: "He estado un poco bajoneado desde que ayer no viniste.", expresion: { en: "feel down", es: "estar bajoneado" } },
      { en: "Our streak is gone, but the words you learned are still here.", es: "La racha se fue, pero las palabras que aprendiste siguen aquí.", expresion: { en: "be gone", es: "haberse ido, desaparecer" } },
      { en: "Missing one day happens. Missing two in a row is a pattern. Let's break it.", es: "Faltar un día pasa. Faltar dos seguidos ya es un patrón. Rompámoslo.", expresion: { en: "in a row", es: "seguidos" } },
      { en: "I missed you these last two days. Shall we make up for it?", es: "Te extrañé estos dos días. ¿Lo compensamos?", expresion: { en: "make up for", es: "compensar" } },
      { en: "Starting from zero isn't fun, but day one is the easiest day to win.", es: "Empezar de cero no es divertido, pero el día uno es el más fácil de ganar.", expresion: { en: "start from zero", es: "empezar de cero" } },
      { en: "I'm a bit down, but one lesson would cheer me right up.", es: "Estoy un poco bajoneado, pero una lección me animaría al toque.", expresion: { en: "cheer up", es: "animar" } },
    ],
    robos: [
      { en: "I'll be honest: I've hidden {n} of your words. You'll have to win them back.", es: "Te seré sincero: escondí {n} de tus palabras. Tendrás que recuperarlas.", expresion: { en: "win back", es: "recuperar (ganándolo)" } },
      { en: "{n} words have gone missing... I might have had something to do with it.", es: "Se perdieron {n} palabras... Puede que yo haya tenido algo que ver.", expresion: { en: "might have had", es: "puede que haya tenido" } },
    ],
    dormido: [
      { en: "Zzz... just five more minutes...", es: "Zzz... solo cinco minutitos más..." },
      { en: "Zzz... npm install... still installing...", es: "Zzz... npm install... sigue instalando..." },
      { en: "Zzz... one more word... and then I'll sleep...", es: "Zzz... una palabra más... y después duermo..." },
      { en: "Zzz... no, I don't want to join the meeting...", es: "Zzz... no, no quiero entrar a la reunión..." },
      { en: "Zzz... it works on my machine...", es: "Zzz... en mi máquina funciona..." },
      { en: "Zzz... the bug is on line forty-two...", es: "Zzz... el bug está en la línea cuarenta y dos..." },
    ],
    escapado: [
      { en: "I've gone out to look for food. Come back when you've done some English!", es: "Salí a buscar comida. ¡Vuelve cuando hayas hecho algo de inglés!", expresion: { en: "when you've done", es: "cuando hayas hecho" } },
      { en: "I'm out looking for snacks. Do a lesson and I'll be right back.", es: "Salí a buscar piqueos. Haz una lección y vuelvo enseguida.", expresion: { en: "be right back", es: "volver enseguida" } },
      { en: "Gone fishing for words. Do some English and I'll find my way home.", es: "Salí a pescar palabras. Haz algo de inglés y encontraré el camino a casa.", expresion: { en: "find your way home", es: "encontrar el camino a casa" } },
    ],
  },
  C: {
    nuevo: [
      { en: "Pleased to meet you. Fair warning: I have an insatiable appetite for English.", es: "Encantado. Te advierto: tengo un apetito insaciable de inglés.", expresion: { en: "fair warning", es: "te lo advierto" } },
      { en: "So this is my new home? Cosy. It could do with a few more words, though.", es: "¿Así que esta es mi nueva casa? Acogedora. Aunque le vendrían bien unas cuantas palabras más.", expresion: { en: "could do with", es: "le vendría bien" } },
      { en: "Let's get off on the right foot: one lesson, and I'm yours for life.", es: "Empecemos con el pie derecho: una lección y soy tuyo de por vida.", expresion: { en: "get off on the right foot", es: "empezar con el pie derecho" } },
    ],
    feliz: [
      { en: "You've been firing on all cylinders today. I could get used to this.", es: "Hoy estuviste a toda máquina. Podría acostumbrarme a esto.", expresion: { en: "firing on all cylinders", es: "a toda máquina" } },
      { en: "I'm so full I can barely keep my eyes open. Worth every word.", es: "Estoy tan lleno que apenas puedo mantener los ojos abiertos. Valió cada palabra.", expresion: { en: "worth every...", es: "valió cada..." } },
      { en: "Credit where credit's due: that was a seriously solid session.", es: "Hay que reconocerlo: fue una sesión muy sólida.", expresion: { en: "credit where credit's due", es: "hay que reconocerlo" } },
      { en: "Not only did you show up, but you nailed it. I'm stuffed.", es: "No solo viniste, sino que lo hiciste perfecto. Estoy repleto.", expresion: { en: "Not only did you..., but...", es: "no solo..., sino que... (inversión)" } },
      { en: "Had I known you'd study this much, I'd have saved room for dessert.", es: "Si hubiera sabido que ibas a estudiar tanto, habría dejado espacio para el postre.", expresion: { en: "save room for", es: "dejar espacio para" } },
      { en: "\"{w}\" went down a treat. Honestly, you're on a roll.", es: "\"{w}\" me encantó. La verdad, estás en racha.", expresion: { en: "on a roll", es: "en racha" } },
    ],
    normal: [
      { en: "Reasonably fed, mildly ambitious. Shall we push it a bit further?", es: "Razonablemente alimentado, algo ambicioso. ¿Vamos un poco más allá?", expresion: { en: "push it further", es: "ir más allá" } },
      { en: "I wouldn't say no to a quick review of \"{w}\", for old times' sake.", es: "No le diría que no a un repaso rápido de \"{w}\", por los viejos tiempos.", expresion: { en: "wouldn't say no to", es: "no le diría que no a" } },
      { en: "No pressure, but my dinner plans depend entirely on you.", es: "Sin presión, pero mis planes de cena dependen por completo de ti.", expresion: { en: "No pressure, but...", es: "sin presión, pero... (ironía)" } },
      { en: "We're halfway there. It'd be a shame to call it a day just yet.", es: "Vamos a la mitad. Sería una pena dar el día por terminado todavía.", expresion: { en: "call it a day", es: "dar el día por terminado" } },
      { en: "I'm peckish rather than starving, which, frankly, is progress.", es: "Tengo algo de hambre, no muchísima, lo cual, francamente, es un avance.", expresion: { en: "peckish", es: "con algo de hambre" } },
      { en: "One more lesson and I'll stop dropping hints. Probably.", es: "Una lección más y dejo de lanzarte indirectas. Probablemente.", expresion: { en: "drop hints", es: "lanzar indirectas" } },
    ],
    hambriento: [
      { en: "I'm so hungry I could eat a dictionary. Cover to cover.", es: "Tengo tanta hambre que me comería un diccionario. De principio a fin.", expresion: { en: "cover to cover", es: "de principio a fin" } },
      { en: "Were you to do one lesson now, I'd be eternally grateful.", es: "Si hicieras una lección ahora, te estaría eternamente agradecido.", expresion: { en: "Were you to...", es: "si hicieras... (inversión formal)" } },
      { en: "Not a single word all day. I'm beginning to take it personally.", es: "Ni una palabra en todo el día. Empiezo a tomármelo personal.", expresion: { en: "take it personally", es: "tomárselo personal" } },
      { en: "My stomach is making noises I can only describe as passive-aggressive.", es: "Mi estómago hace ruidos que solo puedo describir como pasivo-agresivos.", expresion: { en: "I can only describe as", es: "que solo puedo describir como" } },
      { en: "Just a handful of words would tide me over until dinner.", es: "Un puñado de palabras me ayudaría a aguantar hasta la cena.", expresion: { en: "tide someone over", es: "ayudar a aguantar" } },
      { en: "I've been running on empty since this morning. Throw me a bone?", es: "Ando con el tanque vacío desde la mañana. ¿Me tiras un hueso?", expresion: { en: "running on empty", es: "con el tanque vacío" } },
    ],
    triste: [
      { en: "Our streak has gone down the drain, but there's no use crying over spilt milk.", es: "La racha se fue al tacho, pero a lo hecho, pecho.", expresion: { en: "no use crying over spilt milk", es: "a lo hecho, pecho" } },
      { en: "I won't hold it against you. Just don't make a habit of it.", es: "No te lo voy a reprochar. Solo no lo conviertas en costumbre.", expresion: { en: "hold it against someone", es: "reprocharle algo a alguien" } },
      { en: "Every streak starts at day one. Let's dust ourselves off and get back on track.", es: "Toda racha empieza en el día uno. Sacudámonos el polvo y volvamos al camino.", expresion: { en: "get back on track", es: "retomar el rumbo" } },
      { en: "I've been moping around all day. A lesson would cheer me up no end.", es: "Estuve desanimado todo el día. Una lección me alegraría muchísimo.", expresion: { en: "no end", es: "muchísimo" } },
      { en: "It's not the end of the world, but I did miss you, you know.", es: "No es el fin del mundo, pero sí te extrañé, ¿sabes?", expresion: { en: "I did miss you", es: "sí te extrañé (did para enfatizar)" } },
    ],
    robos: [
      { en: "Full disclosure: {n} of your words are in my secret stash. Earn them back.", es: "Para ser sincero: {n} de tus palabras están en mi escondite secreto. Recupéralas.", expresion: { en: "full disclosure", es: "para ser totalmente sincero" } },
      { en: "Let's just say {n} words mysteriously vanished on my watch.", es: "Digamos que {n} palabras desaparecieron misteriosamente mientras yo vigilaba.", expresion: { en: "on my watch", es: "bajo mi responsabilidad" } },
      { en: "I've got {n} of your words tucked away. Finders keepers, unless you review them.", es: "Tengo {n} de tus palabras bien guardadas. El que lo encuentra se lo queda, a menos que las repases.", expresion: { en: "finders keepers", es: "el que lo encuentra se lo queda" } },
      { en: "{n} words are gathering dust in my den. Rescue them before I grow attached.", es: "{n} palabras están juntando polvo en mi madriguera. Rescátalas antes de que me encariñe.", expresion: { en: "grow attached", es: "encariñarse" } },
    ],
    dormido: [{ en: "Zzz... wake me up when the code compiles...", es: "Zzz... despiértame cuando el código compile..." }],
    escapado: [{ en: "Off foraging. Should you feel like practicing, you know where to find me.", es: "Salí a buscar comida. Si te animas a practicar, ya sabes dónde encontrarme.", expresion: { en: "Should you feel like...", es: "si te animas a... (inversión formal)" } }],
  },
};

/**
 * Lo que dice cuando lo sigues tocando: consejos y comentarios (los primeros en C1, el resto en B1 y B2)
 * que valen para cualquier estado despierto. No se repiten hasta pasar por todos (ver sin-repetir.js).
 */
export const CHARLA = [
  { en: "Quick tip: in an interview, \"I'm not sure, but I'd start by...\" beats silence every time.", es: "Consejo rápido: en una entrevista, \"I'm not sure, but I'd start by...\" le gana siempre al silencio.", expresion: { en: "beats ... every time", es: "siempre le gana a" } },
  { en: "Remember: you \"make\" a mistake, but you \"do\" your homework. I learned that the hard way.", es: "Recuerda: \"make\" a mistake, pero \"do\" your homework. Lo aprendí a la mala.", expresion: { en: "the hard way", es: "a la mala" } },
  { en: "If a recruiter says \"we'll be in touch\", don't hold your breath. Keep applying.", es: "Si un reclutador dice \"we'll be in touch\", no esperes sentado. Sigue postulando.", expresion: { en: "don't hold your breath", es: "no esperes sentado" } },
  { en: "Between you and me, \"actually\" doesn't mean \"actualmente\". It means \"en realidad\".", es: "Entre nos, \"actually\" no significa \"actualmente\". Significa \"en realidad\".", expresion: { en: "between you and me", es: "entre nos" } },
  { en: "I've been meaning to tell you: your pronunciation is coming along nicely.", es: "Hace rato quería decírtelo: tu pronunciación está mejorando bastante.", expresion: { en: "come along", es: "ir mejorando" } },
  { en: "Pro tip: when a word escapes you, describe it. Nobody expects a walking dictionary.", es: "Consejo: cuando se te escape una palabra, descríbela. Nadie espera un diccionario andante.", expresion: { en: "a word escapes you", es: "se te escapa una palabra" } },
  { en: "Whenever you're stuck on a bug, explain it out loud. To me, ideally. I'm a great listener.", es: "Cuando te trabes con un bug, explícalo en voz alta. A mí, de preferencia. Sé escuchar muy bien.", expresion: { en: "be stuck on", es: "estar trabado con" } },
  { en: "\"I look forward to hearing from you\": the line that wraps up any decent email.", es: "\"I look forward to hearing from you\": la frase que cierra cualquier buen correo.", expresion: { en: "wrap up", es: "cerrar, concluir" } },
  { en: "Raccoons wash their food before eating it. I'd rather wash mine down with phrasal verbs.", es: "Los mapaches lavan su comida antes de comerla. Yo prefiero bajar la mía con phrasal verbs.", expresion: { en: "wash something down", es: "bajar la comida con algo" } },
  { en: "Little by little, a little becomes a lot. That's my whole philosophy, and my diet.", es: "Poco a poco, lo poco se vuelve mucho. Esa es toda mi filosofía, y mi dieta.", expresion: { en: "little by little", es: "poco a poco" } },
  // Consejos en B1 y B2: inglés del trabajo, falsos amigos y errores típicos de quien habla español
  { en: "In stand-ups, keep it simple: what you did, what you'll do and what's blocking you.", es: "En las dailies, sé simple: qué hiciste, qué vas a hacer y qué te está bloqueando.", expresion: { en: "what's blocking you", es: "qué te está bloqueando" } },
  { en: "\"Can you walk me through your code?\" means: explain it step by step.", es: "\"Can you walk me through your code?\" significa: explícalo paso a paso.", expresion: { en: "walk someone through", es: "explicarle algo paso a paso" } },
  { en: "Say \"I'll get back to you on that\" when you need time to check something.", es: "Di \"I'll get back to you on that\" cuando necesites tiempo para revisar algo.", expresion: { en: "get back to someone", es: "responderle a alguien más tarde" } },
  { en: "\"Deadline\" is the date. \"Due\" is how you say it: the task is due on Friday.", es: "\"Deadline\" es la fecha. \"Due\" es cómo lo dices: the task is due on Friday.", expresion: { en: "be due on", es: "tocar entregarlo el, vencer el" } },
  { en: "Careful: \"I'm agree\" is wrong. It's just \"I agree\", because agree is already a verb.", es: "Ojo: \"I'm agree\" está mal. Es solo \"I agree\", porque agree ya es un verbo.", expresion: { en: "I agree", es: "estoy de acuerdo" } },
  { en: "\"Assist\" means \"ayudar\". To go to a class or a meeting, you \"attend\" it.", es: "\"Assist\" significa \"ayudar\". Para decir que vas a una clase o a una reunión, usas \"attend\".", expresion: { en: "attend", es: "asistir (a una clase o reunión)" } },
  { en: "\"Carpeta\" is \"folder\", not \"carpet\". Unless you code on the floor.", es: "\"Carpeta\" es \"folder\", no \"carpet\" (alfombra). A menos que programes en el piso.", expresion: { en: "folder", es: "carpeta" } },
  { en: "When you don't understand, say \"Sorry, could you say that again?\" Nobody minds.", es: "Cuando no entiendas, di \"Sorry, could you say that again?\". A nadie le molesta.", expresion: { en: "Could you say that again?", es: "¿puedes repetirlo?" } },
  { en: "\"I'm used to working with React\" means it's normal for you. Note the -ing after \"to\".", es: "\"I'm used to working with React\" significa que para ti es normal. Fíjate en el -ing después de \"to\".", expresion: { en: "be used to + -ing", es: "estar acostumbrado a" } },
  { en: "\"Eventually\" means \"al final, con el tiempo\", not \"eventualmente\".", es: "\"Eventually\" significa \"al final, con el tiempo\", no \"eventualmente\".", expresion: { en: "eventually", es: "al final, con el tiempo" } },
  { en: "\"Realize\" means \"darte cuenta\". To carry out a task, you just \"do\" it.", es: "\"Realize\" significa \"darte cuenta\". Para \"realizar\" una tarea, usas \"do\" o \"carry out\".", expresion: { en: "carry out", es: "llevar a cabo, realizar" } },
  { en: "In English, you \"make a decision\" but you \"take a break\". Don't ask me why.", es: "En inglés, \"make a decision\" pero \"take a break\". No me preguntes por qué.", expresion: { en: "take a break", es: "tomarse un descanso" } },
  { en: "A good PR description answers three things: what changed, why, and how to test it.", es: "Una buena descripción de PR responde tres cosas: qué cambió, por qué y cómo probarlo.", expresion: { en: "what changed", es: "qué cambió" } },
  { en: "\"It works on my machine\" is not a valid excuse. Trust me, I've tried.", es: "\"En mi máquina funciona\" no es una excusa válida. Créeme, lo intenté.", expresion: { en: "trust me", es: "créeme" } },
  { en: "Instead of \"I don't know\", try \"I haven't worked with that yet, but I'd like to learn it\".", es: "En vez de \"I don't know\", prueba con \"I haven't worked with that yet, but I'd like to learn it\".", expresion: { en: "I haven't ... yet", es: "todavía no he..." } },
  { en: "A \"library\" lends books and a \"bookstore\" sells them. In code, you import libraries.", es: "Una \"library\" presta libros (biblioteca) y una \"bookstore\" los vende (librería). En código, importas libraries.", expresion: { en: "bookstore", es: "librería" } },
  { en: "You \"fix\" a bug, \"solve\" a problem and \"handle\" an error. Three verbs, three jobs.", es: "Un bug se \"fix\", un problema se \"solve\" y un error se \"handle\". Tres verbos, tres trabajos.", expresion: { en: "handle an error", es: "manejar un error" } },
  { en: "To sound natural, say \"I'm working on it\" instead of \"I am doing it now\".", es: "Para sonar natural, di \"I'm working on it\" en vez de \"I am doing it now\".", expresion: { en: "I'm working on it", es: "estoy en eso" } },
  { en: "Pronunciation tip: \"developer\" stresses the second syllable: de-VEL-o-per.", es: "Tip de pronunciación: en \"developer\" se acentúa la segunda sílaba: de-VEL-o-per.", expresion: { en: "stress a syllable", es: "acentuar una sílaba" } },
  { en: "\"Live\" (vivir) and \"leave\" (irse) are different words. Stretch the \"ee\" in leave.", es: "\"Live\" (vivir) y \"leave\" (irse) son palabras distintas. Alarga la \"ee\" de leave.", expresion: { en: "leave", es: "irse, dejar" } },
  { en: "When you're stuck in an interview, say \"Let me think about that for a second\". It buys you time.", es: "Cuando te trabes en una entrevista, di \"Let me think about that for a second\". Te hace ganar tiempo.", expresion: { en: "buy time", es: "ganar tiempo" } },
  { en: "Recruiters love the word \"impact\": not just what you built, but what it changed.", es: "A los reclutadores les encanta la palabra \"impact\": no solo qué construiste, sino qué cambió.", expresion: { en: "not just..., but...", es: "no solo..., sino..." } },
  { en: "\"Sensible\" means \"sensato\". If someone cries at every movie, they're \"sensitive\".", es: "\"Sensible\" significa \"sensato\". Si alguien llora con todas las películas, es \"sensitive\".", expresion: { en: "sensitive", es: "sensible" } },
  { en: "\"Since\" goes with a starting point and \"for\" with a period: since 2024, for two years.", es: "\"Since\" va con un punto de inicio y \"for\" con un periodo: since 2024, for two years.", expresion: { en: "since / for", es: "desde / durante" } },
  { en: "In emails, \"Just a quick follow-up\" is the polite way to say \"Hello? Anyone there?\"", es: "En los correos, \"Just a quick follow-up\" es la forma educada de decir \"¿Hola? ¿Hay alguien?\".", expresion: { en: "follow-up", es: "seguimiento" } },
  { en: "Code review tip: \"Could we...?\" sounds much nicer than \"You should...\".", es: "Tip para code review: \"Could we...?\" suena mucho más amable que \"You should...\".", expresion: { en: "Could we...?", es: "¿podríamos...?" } },
  { en: "You \"run into\" a problem when you find it by surprise. Developers run into a lot of things.", es: "\"Run into\" a problem es encontrártelo de sorpresa. Los desarrolladores se topan con muchas cosas.", expresion: { en: "run into", es: "toparse con" } },
  { en: "\"Set up\" is the verb and \"setup\" is the noun: I set up my setup. Yes, really.", es: "\"Set up\" es el verbo y \"setup\" el sustantivo: I set up my setup. Sí, en serio.", expresion: { en: "set up", es: "configurar, armar" } },
  { en: "\"Log in\" is what you do and \"login\" is the page. Same trick as setup.", es: "\"Log in\" es lo que haces y \"login\" es la página. El mismo truco que con setup.", expresion: { en: "log in", es: "iniciar sesión" } },
  { en: "When they say \"Tell me about yourself\", they want your pitch, not your whole life story.", es: "Cuando te dicen \"Tell me about yourself\", quieren tu pitch, no la historia de tu vida.", expresion: { en: "Tell me about yourself", es: "háblame de ti" } },
  { en: "\"Pretty\" also means \"bastante\": the code is pretty good.", es: "\"Pretty\" también significa \"bastante\": the code is pretty good.", expresion: { en: "pretty + adjective", es: "bastante" } },
  { en: "Don't say \"I have 21 years\". Say \"I'm 21\". Even raccoons know this one.", es: "No digas \"I have 21 years\". Di \"I'm 21\". Hasta los mapaches lo sabemos.", expresion: { en: "I'm 21", es: "tengo 21 años" } },
  { en: "\"Explain me\" is a classic mistake. It's \"explain it to me\" or \"can you explain it?\".", es: "\"Explain me\" es un error clásico. Es \"explain it to me\" o \"can you explain it?\".", expresion: { en: "explain it to me", es: "explícamelo" } },
  { en: "To \"discuss\" is to talk about ideas calmly. When voices get loud, people \"argue\".", es: "\"Discuss\" es conversar sobre ideas con calma. Cuando sube el tono, es \"argue\".", expresion: { en: "argue", es: "discutir (pelear)" } },
  { en: "Small talk starter: \"How was your weekend?\" It works in every office in the world.", es: "Para empezar una conversación: \"How was your weekend?\". Funciona en cualquier oficina del mundo.", expresion: { en: "How was your weekend?", es: "¿qué tal tu fin de semana?" } },
  { en: "If you push a bug, say \"My bad, I'll fix it\". Owning your mistakes earns respect.", es: "Si subes un bug, di \"My bad, I'll fix it\". Hacerte cargo de tus errores te da respeto.", expresion: { en: "my bad", es: "mi culpa" } },
  { en: "\"Pair programming\" is two people, one keyboard. The raccoon version is one raccoon, many snacks.", es: "\"Pair programming\" es dos personas y un teclado. La versión mapache es un mapache y muchos piqueos.", expresion: { en: "pair programming", es: "programar en pareja" } },
  { en: "\"Ship\" means release: \"We shipped the new feature yesterday\". No boats involved.", es: "\"Ship\" significa lanzar: \"We shipped the new feature yesterday\". No hay barcos de por medio.", expresion: { en: "ship", es: "lanzar, publicar" } },
  { en: "\"Heads up\" is a warning before something happens: \"Heads up, the API will be down tonight\".", es: "\"Heads up\" es un aviso antes de que algo pase: \"Heads up, the API will be down tonight\".", expresion: { en: "heads up", es: "aviso, alerta" } },
  { en: "\"ASAP\" means as soon as possible. Use it carefully, or everything becomes urgent.", es: "\"ASAP\" significa lo antes posible. Úsalo con cuidado, o todo se vuelve urgente.", expresion: { en: "as soon as possible", es: "lo antes posible" } },
  { en: "Reading error messages out loud is great English practice. Sometimes it even fixes the bug.", es: "Leer los mensajes de error en voz alta es buena práctica de inglés. A veces hasta arregla el bug.", expresion: { en: "out loud", es: "en voz alta" } },
  { en: "\"Could you elaborate?\" is a polite way to ask for more details.", es: "\"Could you elaborate?\" es una forma educada de pedir más detalles.", expresion: { en: "elaborate", es: "dar más detalles" } },
  { en: "Native speakers say \"gonna\" and \"wanna\" a lot. Understand them, but write \"going to\" and \"want to\".", es: "Los nativos dicen mucho \"gonna\" y \"wanna\". Entiéndelos, pero escribe \"going to\" y \"want to\".", expresion: { en: "gonna / wanna", es: "going to / want to (al hablar)" } },
  { en: "Ending an explanation with \"Does that make sense?\" invites questions. Interviewers like that.", es: "Cerrar una explicación con \"Does that make sense?\" invita a preguntar. A los entrevistadores les gusta.", expresion: { en: "Does that make sense?", es: "¿se entiende?" } },
  { en: "\"It's done\" is fine, but \"It's ready for review\" sounds more professional.", es: "\"It's done\" está bien, pero \"It's ready for review\" suena más profesional.", expresion: { en: "ready for review", es: "listo para revisión" } },
  { en: "\"Work\" is uncountable: \"a lot of work\", never \"a lot of works\".", es: "\"Work\" es incontable: \"a lot of work\", nunca \"a lot of works\".", expresion: { en: "uncountable", es: "incontable" } },
  { en: "\"Advice\" is uncountable too: \"some advice\" or \"a piece of advice\". Here's one: keep practicing.", es: "\"Advice\" también es incontable: \"some advice\" o \"a piece of advice\". Aquí va uno: sigue practicando.", expresion: { en: "a piece of advice", es: "un consejo" } },
];

/** Una línea de su diario por día, a tu franja de nivel; cambia según el día para no repetirse. */
export function lineaDiario({ minutos, palabras, lecciones, historias, franja = "A", semilla = 0 }) {
  const pl = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;
  const hizo = minutos > 0 || palabras > 0 || lecciones > 0 || historias > 0;
  const v = semilla % 3;
  if (!hizo) {
    const vacio = {
      A: [
        { en: "No English today. I was very hungry and a little bored.", es: "Hoy no hubo inglés. Tuve mucha hambre y me aburrí un poco." },
        { en: "Today was quiet. I waited by the door, but nobody came.", es: "Hoy fue un día tranquilo. Esperé en la puerta, pero nadie vino." },
        { en: "No lessons today. I ate an old cookie. It wasn't good.", es: "Hoy no hubo lecciones. Me comí una galleta vieja. No estaba rica." },
      ],
      B: [
        { en: "No English today. I spent the afternoon staring at an empty plate.", es: "Hoy no hubo inglés. Pasé la tarde mirando un plato vacío." },
        { en: "We took a day off. I'm not complaining... well, maybe a little.", es: "Nos tomamos el día libre. No me quejo... bueno, quizá un poco." },
        { en: "Not a single word today. I've started talking to the plant.", es: "Ni una palabra hoy. Empecé a hablarle a la planta." },
      ],
      C: [
        { en: "A day off, which, in fairness, everyone needs. My stomach begs to differ.", es: "Un día libre, que, siendo justos, todos necesitamos. Mi estómago opina distinto." },
        { en: "Radio silence today. I've drafted a strongly worded letter to the management.", es: "Silencio total hoy. Redacté una carta muy enérgica a la gerencia." },
        { en: "No English whatsoever. I'll put it down to a well-deserved rest.", es: "Nada de inglés. Lo atribuiré a un merecido descanso." },
      ],
    };
    return vacio[franja][v];
  }
  const en = [];
  const es = [];
  if (franja === "A") {
    if (minutos > 0) (en.push(`We studied for ${minutos} minutes.`), es.push(`Estudiamos ${minutos} minutos.`));
    if (palabras > 0) (en.push(`I ate ${pl(palabras, "new word", "new words")}.`), es.push(`Me comí ${palabras} ${palabras === 1 ? "palabra nueva" : "palabras nuevas"}.`));
    if (lecciones > 0) (en.push(`We finished ${pl(lecciones, "lesson", "lessons")}.`), es.push(`Terminamos ${lecciones} ${lecciones === 1 ? "lección" : "lecciones"}.`));
    if (historias > 0) (en.push("We read a story together!"), es.push("¡Leímos una historia juntos!"));
    const cierre = [
      ["It was a good day!", "¡Fue un buen día!"],
      ["Yummy!", "¡Rico!"],
      ["I'm happy and full.", "Estoy feliz y lleno."],
    ][v];
    return { en: `${en.join(" ")} ${cierre[0]}`, es: `${es.join(" ")} ${cierre[1]}` };
  }
  if (franja === "B") {
    if (minutos > 0) (en.push(`We put in ${minutos} minutes of English.`), es.push(`Le dedicamos ${minutos} minutos al inglés.`));
    if (palabras > 0) (en.push(`I've picked up ${pl(palabras, "new word", "new words")}.`), es.push(`Aprendí ${palabras} ${palabras === 1 ? "palabra nueva" : "palabras nuevas"}.`));
    if (lecciones > 0) (en.push(`We got through ${pl(lecciones, "lesson", "lessons")}.`), es.push(`Sacamos adelante ${lecciones} ${lecciones === 1 ? "lección" : "lecciones"}.`));
    if (historias > 0) (en.push("We even managed to read a story."), es.push("Hasta logramos leer una historia."));
    const cierre = [
      ["If we keep this up, I'll need a bigger plate.", "Si seguimos así, voy a necesitar un plato más grande."],
      ["Not bad at all for a weekday.", "Nada mal para un día de semana."],
      ["I could get used to this.", "Podría acostumbrarme a esto."],
    ][v];
    return { en: `${en.join(" ")} ${cierre[0]}`, es: `${es.join(" ")} ${cierre[1]}` };
  }
  if (minutos > 0) (en.push(`We clocked ${minutos} minutes of English`), es.push(`Sumamos ${minutos} minutos de inglés`));
  if (palabras > 0) (en.push(`added ${pl(palabras, "word", "words")} to the collection`), es.push(`agregamos ${palabras} ${palabras === 1 ? "palabra" : "palabras"} a la colección`));
  if (lecciones > 0) (en.push(`saw off ${pl(lecciones, "lesson", "lessons")}`), es.push(`despachamos ${lecciones} ${lecciones === 1 ? "lección" : "lecciones"}`));
  if (historias > 0) (en.push("and squeezed in a story for good measure"), es.push("y de yapa metimos una historia"));
  const unir = (l) => (l.length > 1 ? `${l.slice(0, -1).join(", ")} and ${l.at(-1).replace(/^and /, "")}` : l[0]);
  const unirEs = (l) => (l.length > 1 ? `${l.slice(0, -1).join(", ")} y ${l.at(-1).replace(/^y /, "")}` : l[0]);
  const cierre = [
    ["Frankly, I'm impressed.", "La verdad, estoy impresionado."],
    ["That's more than most people manage on a Monday.", "Eso es más de lo que la mayoría logra un lunes."],
    ["Consistency, as it turns out, is rather delicious.", "La constancia, por lo visto, es bastante deliciosa."],
  ][v];
  return { en: `${unir(en)}. ${cierre[0]}`, es: `${unirEs(es)}. ${cierre[1]}` };
}

/**
 * Reto de gramática de la pregunta del día, según tu nivel. Si lo usas, ganas XP extra.
 * La detección es aproximada (busca la estructura en tu respuesta), por eso es un extra y no obliga.
 */
export const RETOS = {
  A1: { texto: "Da una razón con because.", ejemplo: "I like coffee because it wakes me up.", patron: /\bbecause\b/i },
  A2: { texto: "Usa el pasado (went, had, worked...).", ejemplo: "Yesterday I worked on my project and went to bed late.", patron: /\b(was|were|went|had|did|made|got|saw|ate|took|came|left|bought|wrote|met|thought|felt|\w{3,}ed)\b/i },
  B1: { texto: "Usa el present perfect (I've done, I have never...).", ejemplo: "I've never fixed a bug that hard before.", patron: /\b(have|has|'ve)\s+(never\s+|already\s+|just\s+|always\s+)?(\w+ed|been|done|gone|seen|made|had|written|taken|learnt|built|found|got|gotten|met|known|given|tried)\b/i },
  B2: { texto: "Usa un condicional (If I had..., I would...).", ejemplo: "If I had more time, I would build a mobile app.", patron: /\bif\b[^.?!]*\b(would|could|might|'d)\b|\b(would|could|'d)\b[^.?!]*\bif\b/i },
  C1: { texto: "Contrasta ideas con although, whereas o nevertheless.", ejemplo: "Although speed matters, I'd rather ship something reliable.", patron: /\b(although|though|whereas|however|nevertheless|nonetheless|despite|in spite of)\b/i },
  C2: { texto: "Usa una inversión o una frase enfática (Not only..., Rarely..., What I value is...).", ejemplo: "Not only does it save time, but it also prevents bugs.", patron: /\b(not only (do|does|did|have|has|had|is|are|was|were|will|would|can|could)|rarely (do|does|did|have|has|had)|seldom|never (have|has|had|did) i|had i|were i|should you|what i \w+ is)\b/i },
};

/** ¿Usó la estructura del reto? */
export const cumpleReto = (nivel, texto) => !!RETOS[nivel]?.patron.test(String(texto ?? ""));

/** Expresión del día: phrasal verbs, frases hechas e idioms que se usan en el trabajo, por nivel. */
export const EXPRESIONES = {
  A: [
    { en: "How's it going?", es: "¿Cómo va todo?", ej: { en: "Hey Lisa, how's it going?", es: "Hola, Lisa, ¿cómo va todo?" } },
    { en: "I'm on my way", es: "voy en camino", ej: { en: "Sorry, I'm on my way to the meeting.", es: "Perdón, voy en camino a la reunión." } },
    { en: "take your time", es: "tómate tu tiempo", ej: { en: "No rush, take your time.", es: "Sin apuro, tómate tu tiempo." } },
    { en: "no worries", es: "no te preocupes", ej: { en: "No worries, I can fix it later.", es: "No te preocupes, lo arreglo después." } },
    { en: "I'm running late", es: "se me hace tarde", ej: { en: "I'm running late, start without me.", es: "Se me hace tarde, empiecen sin mí." } },
    { en: "see you around", es: "nos vemos por ahí", ej: { en: "Nice to meet you. See you around!", es: "Un gusto. ¡Nos vemos por ahí!" } },
  ],
  B: [
    { en: "figure out", es: "averiguar, descifrar", ej: { en: "I can't figure out why the test fails.", es: "No logro averiguar por qué falla el test." } },
    { en: "look into", es: "investigar, revisar", ej: { en: "I'll look into the bug this afternoon.", es: "Voy a revisar el bug esta tarde." } },
    { en: "catch up", es: "ponerse al día", ej: { en: "Let's catch up after the meeting.", es: "Pongámonos al día después de la reunión." } },
    { en: "come up with", es: "proponer, ocurrírsele", ej: { en: "She came up with a better solution.", es: "A ella se le ocurrió una mejor solución." } },
    { en: "get the hang of", es: "agarrarle la mano a algo", ej: { en: "You'll get the hang of hooks soon.", es: "Pronto le vas a agarrar la mano a los hooks." } },
    { en: "on the same page", es: "de acuerdo, alineados", ej: { en: "Let's make sure we're on the same page.", es: "Asegurémonos de estar alineados." } },
    { en: "bear in mind", es: "tener en cuenta", ej: { en: "Bear in mind that the API is slow.", es: "Ten en cuenta que la API es lenta." } },
    { en: "cut corners", es: "hacer las cosas a medias", ej: { en: "Don't cut corners on testing.", es: "No hagas los tests a medias." } },
  ],
  C: [
    { en: "the bottom line", es: "lo esencial, en resumen", ej: { en: "The bottom line is that we need more tests.", es: "En resumen, necesitamos más tests." } },
    { en: "a blessing in disguise", es: "no hay mal que por bien no venga", ej: { en: "Losing that client was a blessing in disguise.", es: "Perder ese cliente fue un mal que vino para bien." } },
    { en: "go the extra mile", es: "dar más de lo que se espera", ej: { en: "She always goes the extra mile with documentation.", es: "Ella siempre da más de lo que se espera con la documentación." } },
    { en: "play it by ear", es: "ir viendo sobre la marcha", ej: { en: "We don't have a plan yet, so let's play it by ear.", es: "Todavía no hay plan, así que vamos viendo sobre la marcha." } },
    { en: "move the goalposts", es: "cambiar las reglas a mitad de camino", ej: { en: "The client keeps moving the goalposts.", es: "El cliente sigue cambiando las reglas a mitad de camino." } },
    { en: "a double-edged sword", es: "un arma de doble filo", ej: { en: "Microservices can be a double-edged sword.", es: "Los microservicios pueden ser un arma de doble filo." } },
    { en: "err on the side of caution", es: "pecar de prudente", ej: { en: "Let's err on the side of caution and add a backup.", es: "Pequemos de prudentes y agreguemos un respaldo." } },
    { en: "have a lot on your plate", es: "tener mucho que hacer", ej: { en: "I know you have a lot on your plate this week.", es: "Sé que tienes mucho que hacer esta semana." } },
  ],
};
