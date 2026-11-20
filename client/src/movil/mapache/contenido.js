// Lo que tiene el mapache: preguntas del día por nivel, postales de sus viajes, sueños, la tienda y
// los muebles que gana tu casa (lo que dice y su diario, por nivel, están en contenido-nivel.js). Todo en inglés con su traducción.

/** Pregunta del día por nivel: pregunta, traducción, mínimo de palabras y una forma de responder. */
export const PREGUNTAS = {
  A1: [
    { en: "What's your name, and where are you from?", es: "¿Cómo te llamas y de dónde eres?", modelo: "My name is Angel. I'm from Peru." },
    { en: "What do you do?", es: "¿A qué te dedicas?", modelo: "I'm a student. I study Systems Engineering." },
    { en: "What's your favorite food?", es: "¿Cuál es tu comida favorita?", modelo: "My favorite food is ceviche. I eat it on Sundays." },
    { en: "What time do you get up?", es: "¿A qué hora te levantas?", modelo: "I get up at seven o'clock." },
    { en: "What do you do on weekends?", es: "¿Qué haces los fines de semana?", modelo: "I play video games and I see my friends." },
    { en: "Do you have any brothers or sisters?", es: "¿Tienes hermanos o hermanas?", modelo: "Yes, I have one sister. She is twelve." },
    { en: "What's on your desk right now?", es: "¿Qué hay en tu escritorio ahora?", modelo: "There is a laptop, a cup and a phone." },
    { en: "Do you like coffee or tea?", es: "¿Te gusta el café o el té?", modelo: "I like coffee. I drink it in the morning." },
  ],
  A2: [
    { en: "What did you do yesterday?", es: "¿Qué hiciste ayer?", modelo: "Yesterday I went to class and then I studied JavaScript at home." },
    { en: "What did you eat for lunch today?", es: "¿Qué almorzaste hoy?", modelo: "I had chicken and rice with my family." },
    { en: "What are your plans for this weekend?", es: "¿Qué planes tienes para este fin de semana?", modelo: "I'm going to finish a project and watch a movie on Saturday." },
    { en: "How do you get to your university?", es: "¿Cómo llegas a tu universidad?", modelo: "I usually take the bus. It takes about forty minutes." },
    { en: "What's the weather like today?", es: "¿Cómo está el clima hoy?", modelo: "It's sunny and a little hot, so I'm wearing a T-shirt." },
    { en: "What do you like about programming?", es: "¿Qué te gusta de programar?", modelo: "I like it because I can build things and solve problems." },
    { en: "Tell me about your last trip.", es: "Cuéntame de tu último viaje.", modelo: "Last year I went to Cusco with my friends. It was cold but beautiful." },
    { en: "What's your favorite movie, and why?", es: "¿Cuál es tu película favorita y por qué?", modelo: "My favorite movie is Interstellar because the story is very interesting." },
  ],
  B1: [
    { en: "Tell me about a project you're working on.", es: "Cuéntame de un proyecto en el que estés trabajando.", modelo: "I'm building a study app with React. It works offline and it tracks my progress every day." },
    { en: "What's the hardest bug you've ever fixed?", es: "¿Cuál es el bug más difícil que has arreglado?", modelo: "Once my app showed old data. It took me hours to find out that the problem was the cache." },
    { en: "What would you do if you had a free week?", es: "¿Qué harías si tuvieras una semana libre?", modelo: "If I had a free week, I would finish my portfolio and travel to the beach for two days." },
    { en: "Why do you want to work in tech?", es: "¿Por qué quieres trabajar en tecnología?", modelo: "I want to work in tech because I enjoy solving problems and I can keep learning all the time." },
    { en: "What's a skill you want to learn this year?", es: "¿Qué habilidad quieres aprender este año?", modelo: "I want to learn TypeScript well, because a lot of job offers ask for it." },
    { en: "Describe your ideal workday.", es: "Describe tu día de trabajo ideal.", modelo: "I would start with a short meeting, then code for a few hours and finish by helping a teammate." },
    { en: "What's a mistake you learned from?", es: "¿De qué error aprendiste?", modelo: "I once deleted a file without a backup. Since then, I always use Git before I change anything." },
    { en: "How do you stay focused when you study?", es: "¿Cómo te mantienes concentrado al estudiar?", modelo: "I put my phone in another room and I study in blocks of twenty-five minutes." },
  ],
  B2: [
    { en: "How would you explain React to someone who isn't a programmer?", es: "¿Cómo le explicarías React a alguien que no programa?", modelo: "I'd say it's like building with Lego: you make small pieces, and when your data changes, the screen updates by itself." },
    { en: "What's the best feedback you've ever received?", es: "¿Cuál es el mejor feedback que has recibido?", modelo: "A teacher told me that my code worked but nobody could read it. Since then, I've been naming things much more carefully." },
    { en: "How do you deal with a deadline you can't meet?", es: "¿Qué haces con un plazo que no vas a poder cumplir?", modelo: "I tell my lead as early as possible, explain what's blocking me and suggest what I can deliver on time." },
    { en: "What makes a good teammate?", es: "¿Qué hace a un buen compañero de equipo?", modelo: "A good teammate asks for help early, shares what they learn and doesn't blame others when something breaks." },
    { en: "Which technology do you think is overrated, and why?", es: "¿Qué tecnología crees que está sobrevalorada y por qué?", modelo: "I think some frameworks are overrated for small projects, because they add complexity you don't really need." },
    { en: "Tell me about a time you had to learn something fast.", es: "Cuéntame de una vez que tuviste que aprender algo rápido.", modelo: "Before a project deadline I had to learn SQL in a week, so I focused on the queries we actually needed." },
    { en: "What do you do when you disagree with your team?", es: "¿Qué haces cuando no estás de acuerdo con tu equipo?", modelo: "I explain my reasons with examples, listen to theirs, and if we still disagree, we try the simplest option first." },
    { en: "If you could change one thing about how you study, what would it be?", es: "Si pudieras cambiar una cosa de cómo estudias, ¿qué sería?", modelo: "I'd spend less time watching tutorials and more time building small things on my own." },
  ],
  C1: [
    { en: "To what extent do you think AI will change junior developer jobs?", es: "¿Hasta qué punto crees que la IA cambiará los trabajos de junior?", modelo: "I think it'll shift the focus from writing boilerplate to understanding and reviewing code, which makes fundamentals even more important." },
    { en: "How would you convince your team to pay down technical debt?", es: "¿Cómo convencerías a tu equipo de pagar deuda técnica?", modelo: "I'd frame it in terms of cost: show how much time each bug in that module takes, and propose fixing it in small, low-risk steps." },
    { en: "What's something you used to believe about programming that you no longer do?", es: "¿Qué creías de la programación que ya no crees?", modelo: "I used to think good developers memorize everything. Now I believe the real skill is knowing how to find and evaluate answers quickly." },
    { en: "How do you balance speed and quality in your work?", es: "¿Cómo equilibras velocidad y calidad?", modelo: "It depends on how reversible the decision is: I move fast on things that are easy to undo and slow down on the ones that aren't." },
    { en: "What would you prioritize in your first 90 days at a new job?", es: "¿Qué priorizarías en tus primeros 90 días en un trabajo nuevo?", modelo: "Understanding how the product makes money, learning the codebase through small tasks and building trust with my team." },
    { en: "Describe a decision you made with incomplete information.", es: "Describe una decisión que tomaste sin toda la información.", modelo: "I had to pick a library before knowing all the requirements, so I chose the one that would be easiest to replace later." },
    { en: "What's the most underrated skill for a developer?", es: "¿Cuál es la habilidad más subestimada en un desarrollador?", modelo: "Writing clearly. A well-written pull request or message saves hours of meetings and misunderstandings." },
    { en: "How do you give feedback that someone might not want to hear?", es: "¿Cómo das un feedback que alguien quizá no quiere oír?", modelo: "I focus on the work, not the person, give a concrete example and ask how they see it before suggesting anything." },
  ],
  C2: [
    { en: "Make the case for a technology you personally dislike.", es: "Defiende una tecnología que no te gusta.", modelo: "I'm not a fan of heavy frameworks, but I'll admit they shine in large teams: the conventions spare you countless arguments." },
    { en: "How would you explain a trade-off to a non-technical stakeholder without oversimplifying?", es: "¿Cómo explicarías un trade-off a alguien no técnico sin simplificar de más?", modelo: "I'd translate it into what they care about, time, risk and money, and be upfront about what we'd be giving up." },
    { en: "What's a widely held belief in tech that you think is wrong?", es: "¿Qué creencia muy extendida en tecnología crees que está equivocada?", modelo: "That more tools mean more productivity. Quite often, every new tool quietly adds another thing to maintain." },
    { en: "Describe a moment when you changed your mind in the middle of a discussion.", es: "Describe un momento en que cambiaste de opinión en plena discusión.", modelo: "I was convinced we needed a rewrite, but a colleague showed me the data, and I had to concede that a gradual refactor made more sense." },
    { en: "How do you read between the lines when a client says 'it's fine'?", es: "¿Cómo lees entre líneas cuando un cliente dice 'está bien'?", modelo: "I pay attention to what they don't say. If 'it's fine' comes with no questions, I usually follow up and ask what would make it great." },
    { en: "If you were mentoring your past self, what would you push back on?", es: "Si fueras mentor de tu yo del pasado, ¿en qué le llevarías la contraria?", modelo: "I'd push back on my habit of polishing things nobody had asked for, instead of shipping and learning from real feedback." },
    { en: "What does 'good enough' mean in software, and who gets to decide?", es: "¿Qué significa 'suficientemente bueno' en software y quién lo decide?", modelo: "It's good enough when it solves the user's problem reliably; the team decides, but the users ultimately have the final say." },
    { en: "Should juniors specialize early or stay generalists? Argue both sides.", es: "¿Los juniors deberían especializarse pronto o ser generalistas? Defiende las dos posturas.", modelo: "Specializing gets you hired faster, whereas staying broad helps you adapt; on balance, I'd go deep in one area without losing sight of the basics." },
  ],
};

/** Palabras mínimas de la respuesta según tu nivel. */
export const MINIMO_PALABRAS = { A1: 3, A2: 5, B1: 8, B2: 12, C1: 15, C2: 15 };

/** Postales de sus viajes, todas en B2 o C1 y abiertas desde el inicio. `nivel` es solo su id (postal:A1...). */
export const POSTALES = [
  {
    nivel: "A1",
    etiqueta: "B2",
    ciudad: "London",
    texto:
      "Greetings from London, where it has been drizzling non-stop since I arrived. Locals don't seem to mind; they just turn up their collars and carry on. Yesterday I wandered into a tech meetup near King's Cross, where a speaker argued that most bugs aren't caused by bad code, but by unclear requirements. I'd never thought of it that way, but it rang true. Tomorrow I'm planning to visit the British Museum, provided the rain eases off a little.",
    preguntas: [
      { pregunta: "According to the speaker, what causes most bugs?", opciones: ["Bad code", "Unclear requirements", "Slow computers"], correcta: 1, explicacion: "\"Most bugs aren't caused by bad code, but by unclear requirements.\"" },
      { pregunta: "What does \"provided the rain eases off\" mean?", opciones: ["Only if it rains less", "Because it is raining", "Even though it rains"], correcta: 0, explicacion: "Provided (that) = siempre y cuando. Ease off = disminuir: irá si la lluvia baja un poco." },
    ],
  },
  {
    nivel: "A2",
    etiqueta: "B2",
    ciudad: "New York",
    texto:
      "Hello from New York! I've been here for three days and I've already walked more than I usually do in a month. The city never really slows down: even at midnight, the streets were packed. I spent this morning in a co-working space where everyone seemed to be either pitching an idea or fixing a production issue. One developer told me that the most valuable skill she'd learned wasn't a framework, but knowing when to ask for help. I'm off to Central Park now, assuming I can find my way out of the subway.",
    preguntas: [
      { pregunta: "What was the developer's most valuable skill?", opciones: ["A JavaScript framework", "Knowing when to ask for help", "Pitching ideas"], correcta: 1, explicacion: "\"The most valuable skill she'd learned wasn't a framework, but knowing when to ask for help.\"" },
      { pregunta: "What does \"assuming I can find my way out\" suggest?", opciones: ["He knows the subway perfectly", "He might get lost", "He doesn't want to leave"], correcta: 1, explicacion: "Assuming = suponiendo que: no está seguro de poder salir del metro, así que podría perderse." },
    ],
  },
  {
    nivel: "B1",
    etiqueta: "C1",
    ciudad: "Sydney",
    texto:
      "G'day from Sydney, where the sun is relentless and the surfers are, frankly, unbothered by it. I've spent the week shadowing a small dev team that works almost entirely asynchronously, given that half of them live in other time zones. What struck me was how much they rely on writing: every decision is documented, every pull request explained. Had they not been so disciplined about it, I suspect the whole thing would have fallen apart within a month. Something to bear in mind if you ever work remotely.",
    preguntas: [
      { pregunta: "Why does the team work asynchronously?", opciones: ["They don't like meetings", "Half of them live in other time zones", "Their manager told them to"], correcta: 1, explicacion: "\"Given that half of them live in other time zones\": given that = dado que." },
      { pregunta: "What does \"Had they not been so disciplined\" mean?", opciones: ["They were not disciplined", "If they hadn't been so disciplined", "They will be disciplined"], correcta: 1, explicacion: "Es una inversión: Had they not been = If they hadn't been. Como sí lo fueron, todo funcionó." },
    ],
  },
  {
    nivel: "B2",
    etiqueta: "B2",
    ciudad: "Toronto",
    texto:
      "Greetings from Toronto! I managed to sneak into a tech meetup last night, and honestly, it was eye-opening. A junior developer gave a talk about her first year at work, and she said the hardest part wasn't the code, it was asking for help without feeling embarrassed. By the end, half the room was nodding. I should have taken notes, but I was too busy eating the free snacks.",
    preguntas: [
      { pregunta: "According to the speaker, what was the hardest part of her first year?", opciones: ["Writing the code", "Asking for help", "Finding a job"], correcta: 1, explicacion: "\"The hardest part wasn't the code, it was asking for help.\"" },
      { pregunta: "What does \"I should have taken notes\" show?", opciones: ["He took a lot of notes", "He regrets not taking notes", "He will take notes next time for sure"], correcta: 1, explicacion: "Should have + participio expresa que algo habría sido buena idea y no se hizo." },
    ],
  },
  {
    nivel: "C1",
    etiqueta: "C1",
    ciudad: "Dublin",
    texto:
      "Hello from Dublin, where it has rained, by my count, every single day. Not that anyone here seems bothered: people simply carry on, umbrella or no umbrella. I spent the afternoon in a café near a big tech office, eavesdropping on engineers debating whether to rewrite an old system. The more senior ones kept asking the same question: what problem would the rewrite actually solve? It struck me that the best engineers weren't the ones with the flashiest ideas, but the ones who asked the most uncomfortable questions.",
    preguntas: [
      { pregunta: "What question did the senior engineers keep asking?", opciones: ["How long the rewrite would take", "What problem the rewrite would solve", "Who would pay for the rewrite"], correcta: 1, explicacion: "\"What problem would the rewrite actually solve?\"" },
      { pregunta: "What is the main idea of the last sentence?", opciones: ["Good engineers have exciting ideas", "Good engineers ask difficult questions", "Good engineers avoid meetings"], correcta: 1, explicacion: "\"Not the ones with the flashiest ideas, but the ones who asked the most uncomfortable questions.\"" },
    ],
  },
  {
    nivel: "C2",
    etiqueta: "C1",
    ciudad: "San Francisco",
    texto:
      "Dispatch from San Francisco, the city where every coffee shop doubles as a pitch meeting. I overheard a founder insisting that his product was 'disrupting' the sandwich, which, frankly, has held up remarkably well for a few centuries. Still, beneath the hype, there's something worth taking seriously: people here aren't afraid to look foolish. They ship half-finished ideas, get torn apart, and come back the following week with something better. Perhaps that's the real lesson, and it applies to your English as much as to any start-up: perfection is overrated, momentum isn't.",
    preguntas: [
      { pregunta: "What is the writer's attitude towards the founder 'disrupting' the sandwich?", opciones: ["Admiring", "Ironic", "Angry"], correcta: 1, explicacion: "Dice que el sándwich \"has held up remarkably well for a few centuries\": se burla con ironía." },
      { pregunta: "What lesson does he draw from the city?", opciones: ["Avoid sharing unfinished ideas", "Keep moving instead of waiting for perfection", "Only listen to experts"], correcta: 1, explicacion: "\"Perfection is overrated, momentum isn't.\"" },
    ],
  },
];

/** Lo que sueña cuando lo despiertas de noche. */
export const SUENOS = [
  { en: "I dreamed I'd been promoted to tech lead, only to discover the whole team was made of rubber ducks.", es: "Soñé que me habían ascendido a tech lead, solo para descubrir que todo el equipo eran patitos de hule." },
  { en: "In my dream, a cookie kept insisting it was a cache. Oddly enough, it had a point.", es: "En mi sueño, una galleta insistía en que era una caché. Curiosamente, tenía razón." },
  { en: "I dreamed you aced an interview in English, and the interviewer asked for your autograph.", es: "Soñé que la rompías en una entrevista en inglés y el entrevistador te pedía un autógrafo." },
  { en: "I was chasing a bug across the city, and it turned out to be wearing my scarf. The nerve!", es: "Perseguía un bug por la ciudad y resultó que llevaba puesta mi bufanda. ¡Qué descaro!" },
  { en: "I dreamed I could only fly if I got my phrasal verbs right. I didn't get very far off the ground.", es: "Soñé que solo podía volar si usaba bien los phrasal verbs. No llegué muy alto." },
  { en: "Five more minutes, please. I was just about to wrap up a rather heated code review.", es: "Cinco minutitos más, por favor. Estaba a punto de cerrar un code review bastante acalorado." },
];

/** Lo que se pone al subir de nivel. `parte`: dónde va en el dibujo. */
export const ROPA_NIVEL = {
  mochila: { id: "mochila", en: "backpack", es: "mochila", parte: "espalda" },
  lentes: { id: "lentes", en: "glasses", es: "lentes", parte: "ojos" },
  corbata: { id: "corbata", en: "tie", es: "corbata", parte: "cuello" },
  birrete: { id: "birrete", en: "graduation cap", es: "birrete", parte: "cabeza" },
};

/** Entrevistas de trabajo en inglés (roleplays de las unidades B2 y C1) que te propone el mapache. */
export const ENTREVISTAS = [
  { id: "en-avanzado-04-r01", nivel: "B2", titulo: "Tu forma de trabajar" },
  { id: "en-avanzado-07-r01", nivel: "B2", titulo: "Cuéntame de una vez que algo salió mal" },
  { id: "en-superior-01-r01", nivel: "C1", titulo: "Defender tu propuesta" },
  { id: "en-superior-08-r01", nivel: "C1", titulo: "Un proyecto del que estés orgulloso" },
];
