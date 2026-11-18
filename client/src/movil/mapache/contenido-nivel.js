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
    nuevo: [{ en: "Hi there! I'm your raccoon, and I'm absolutely starving for English words.", es: "¡Hola! Soy tu mapache y me muero de hambre de palabras en inglés.", expresion: { en: "I'm starving", es: "me muero de hambre" } }],
    feliz: [
      { en: "I've eaten so well today that I could take a nap right now.", es: "Hoy comí tan bien que podría echarme una siesta ahora mismo.", expresion: { en: "take a nap", es: "echarse una siesta" } },
      { en: "You've really stepped up your game today. \"{w}\" was delicious!", es: "Hoy de verdad subiste tu nivel. ¡\"{w}\" estuvo delicioso!", expresion: { en: "step up your game", es: "mejorar, esforzarse más" } },
      { en: "If we keep this up, you'll be fluent before you know it.", es: "Si seguimos así, vas a hablar con fluidez antes de que te des cuenta.", expresion: { en: "before you know it", es: "antes de que te des cuenta" } },
    ],
    normal: [
      { en: "I've been thinking about \"{w}\" all morning. Shall we practice it?", es: "He estado pensando en \"{w}\" toda la mañana. ¿La practicamos?", expresion: { en: "Shall we...?", es: "¿Qué tal si...?" } },
      { en: "I could do with a few more words before dinner.", es: "No me vendrían mal unas palabras más antes de la cena.", expresion: { en: "could do with", es: "no me vendría mal" } },
      { en: "Let's get down to business: one lesson and I'm happy.", es: "Pongámonos manos a la obra: una lección y estoy feliz.", expresion: { en: "get down to business", es: "ponerse manos a la obra" } },
    ],
    hambriento: [
      { en: "I'm running on empty. Could you squeeze in a quick lesson?", es: "Estoy sin energía. ¿Podrías hacerte un espacio para una lección rápida?", expresion: { en: "squeeze in", es: "hacerse un espacio para algo" } },
      { en: "I haven't had a single word since yesterday. I'm starving!", es: "No he comido ni una palabra desde ayer. ¡Me muero de hambre!", expresion: { en: "since yesterday", es: "desde ayer (present perfect)" } },
      { en: "If you fed me \"{w}\" again, I'd stop complaining. Promise.", es: "Si me dieras \"{w}\" otra vez, dejaría de quejarme. Lo prometo.", expresion: { en: "If you fed me..., I'd...", es: "si me dieras..., yo... (condicional)" } },
    ],
    triste: [
      { en: "We broke our streak, but it's not the end of the world. Let's start over.", es: "Rompimos la racha, pero no es el fin del mundo. Empecemos de nuevo.", expresion: { en: "start over", es: "empezar de nuevo" } },
      { en: "I've been feeling a bit down since you skipped yesterday.", es: "He estado un poco bajoneado desde que ayer no viniste.", expresion: { en: "feel down", es: "estar bajoneado" } },
    ],
    robos: [
      { en: "I'll be honest: I've hidden {n} of your words. You'll have to win them back.", es: "Te seré sincero: escondí {n} de tus palabras. Tendrás que recuperarlas.", expresion: { en: "win back", es: "recuperar (ganándolo)" } },
      { en: "{n} words have gone missing... I might have had something to do with it.", es: "Se perdieron {n} palabras... Puede que yo haya tenido algo que ver.", expresion: { en: "might have had", es: "puede que haya tenido" } },
    ],
    dormido: [{ en: "Zzz... just five more minutes...", es: "Zzz... solo cinco minutitos más..." }],
    escapado: [{ en: "I've gone out to look for food. Come back when you've done some English!", es: "Salí a buscar comida. ¡Vuelve cuando hayas hecho algo de inglés!", expresion: { en: "when you've done", es: "cuando hayas hecho" } }],
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

/** Lo que dice cuando lo sigues tocando: consejos y comentarios en C1 que valen para cualquier estado despierto. */
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
