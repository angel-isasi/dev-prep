# Auditorías

Registro de cada auditoría (se pide escribiendo "audita").

## 2026-11-17: inglés

Base: commit 8d0faa6. Tres revisiones: código, diseño (capturas a 400×820 y 1280×900) y contenido (muestreo de 16 unidades, todas las historias y roleplays de trabajo, y un script sobre las 47 unidades).

Arreglado:
- El cofre del día no se abría cuando la misión "hablar" estaba entre las 3 del día (se verificaba sin micrófono).
- Fallar un concepto lo contaba como aprendido (caja 1) y subía su dificultad; podía abrir cofres y el legendario sin saber nada.
- Un resultado de voz tardío calificaba el paso siguiente; ahora la escucha se detiene al salir y no se puede saltar mientras escucha.
- La prueba de nivel solo preguntaba gramática y dejaba fuera las últimas 7 unidades; ahora 1 pregunta por unidad, alternando gramática y vocabulario.
- Escribir aceptaba menos de lo correcto: contracciones sin apóstrofo (Im, dont), ok/okay, he'll, she'd, should've y otras, "'s" como has y "'d" como had, y números en cifras al hablar.
- La racha de inglés no contaba historias ni parejas; Parejas sumaba 60 s aunque cerraras al instante.
- En historias y roleplays la correcta casi siempre estaba en el mismo lugar: ahora las opciones se barajan.
- "¿Qué significa?" podía mostrar dos opciones correctas ("gracias" y "gracias (informal)").
- Final de lección: cifras casi invisibles y "Para repasar" con el mismo enlace repetido. Historias sin márgenes en móvil. Aviso falso de "no hay voz en inglés" cuando las voces cargaban tarde.
- Contenido (77 cambios en 46 archivos): palabras con la misma traducción aclaradas, "su/sus" con de quién, pronunciaciones con z (close, use, lose, choose, raise, news...), acentos de EE. UU., la "I" en mayúscula, "must not" en vez de "mustn't", "a water" (que sí es natural), asteriscos visibles y un texto en español dentro de una opción en inglés, explicaciones de doubt y "thank you to you", y otras frases.

Propuesto (sin construir):
1. Pantalla de inglés con el camino primero y los modos extra en "Más práctica".
2. Escuchar de verdad: ocultar el texto del diálogo y la traducción del hueco hasta responder.
3. Final de lección con las frases falladas, su audio y "Repasar estas ahora".
4. Primera lección más variada (al menos un emparejar, un armar y un escuchar).
5. Progreso de inglés (cofres, legendarias, historias) en su propia colección: hoy vive en ajustes, no se borra con "Empezar de cero" y entre dispositivos gana el más reciente.
6. Unidades que no llegan a "completa" sin voz o con ítems reportados (en-basico-22).
7. Contenido: verbos repetidos entre basico-05, 16 y 22, unas 25 frases idénticas entre unidades, personajes que cambian de rol (Tom, Sarah), log out / sign out como sinónimos aceptados, roleplays donde decide el tono y no la gramática, y un validador de pronunciación.

## 2026-11-19: toda la app (menos letra)

Base: commit 7e3edc3. Tres revisiones (código e IA, diseño con capturas de 36 pantallas a 1280 y 400, contenido completo salvo inglés) y cuatro tandas de arreglos.

Arreglado:
- IA: la entrevista por voz descarta la respuesta que llega después de terminar o salir; contraseña rechazada a mitad sin perder lo respondido; tiempo límite y mensaje sin conexión; el gasto cuenta los pedidos fallidos y usa el mes de Perú.
- El modo visita ya no deja nada en el navegador (teoría leída, ofertas vistas, etapa de proyecto).
- Laptop: la sesión de hoy enlazaba a /diario, que no existe, y nunca se completaba.
- Contenido: 20 correcciones (isNaN, valores falsy, ejemplo de any, reduce, 304, this, GROUP BY, CORS, AWS, tope de tiempo libre y otras).
- El quiz de cada tema no barajaba: la correcta era la B en más de la mitad. Ahora baraja en cada intento.

Nuevo (menos letra en toda la app):
- El subtítulo de cada pantalla vive detrás de un "?" junto al título.
- Explicaciones y enunciados: a la vista lo necesario; "Por qué funciona", "Errores comunes", "Otra forma", "Cómo explicarlo", "Conceptos", "Por qué importa" y "Reto extra" quedan plegados.
- Progreso y Ajustes en tres pestañas; la ruta muestra 3 semanas; Hoy con cifras cortas y la semana bajo las cifras.
- Lecciones, Todos los ejercicios (por tema, plegado), Entrevistas por etapa, Simulacro, Ofertas (chips en vez de frases), Inglés (camino plegado por etapa, Más práctica en rejilla), Teoría, Glosario, Referencia, Insignias (filtro) y Mapache reorganizados.
- La IA responde más corto (2 aciertos, 3 faltas, 5 correcciones, plan de 3 pasos) y en la voz no escribe lo que no se muestra.

Propuesto (sin construir):
1. Partir los temas largos (react-03, react-08, 09-promesas, 05-objetos): tope de 5 conceptos por tema.
2. Una sola fuente por concepto: "Conceptos" de las explicaciones y "En la entrevista" de las teorías como enlaces al glosario y al banco (unas 40.000 palabras menos).
3. Quizzes: alargar los distractores (la correcta es la opción más larga en 107 de 210).
4. Pistas: la 2 regala más que la 3 en varios ejercicios; que la 2 solo nombre las herramientas.
5. Preguntas de entrevista duplicadas con respuestas distintas (ent-073/112, 072/113, 088/126, 082/128, 098/201, 099/204, 095/206, 100/208).
6. Tope de gasto de IA en el servidor (hoy solo vive en el navegador) y guardar la entrevista por voz por si se recarga.
7. Un test que falle si la parte visible de un contenido nuevo pasa de un tope de palabras.

## 2026-11-19 (noche): Inglés rediseñado

Pedido de Angel: que Inglés se entienda mucho mejor, que deje de parecerse al camino de círculos, que use los costados y que el mapache (ahora Map) no estorbe. Un agente auditó la lógica y las demás pantallas; lo confirmado se arregló.

**Rediseño**
- Portada en 4 franjas a todo el ancho: Hoy y Map, Temario, Practica por habilidad y Tu progreso. De unos 4.000 px de alto a unos 2.000 en la laptop.
- Temario en lugar del camino: etapas como pestañas con su avance, unidades en fichas y el detalle de la unidad al costado (en el celular, debajo de la ficha, con 5 unidades a la vista).
- Map: nombre nuevo, franja corta arriba (frase con traducción a la vista y meta de hoy), pestañas reordenadas (Hoy, Leer, Jugar, Su casa) y la escena de su casa dentro de "Su casa". Textos sobre tu práctica en vez de hambre y palabras escondidas. La pregunta del día muestra su traducción y ya no dice "¡Bien!": la corrección es la de la IA.

**Arreglado**
- El shadowing de cada unidad nunca aparecía: el exportador no incluía las frases.
- Conversa con IA perdía tu mensaje si la IA fallaba (ahora queda y hay "Reintentar").
- Repetir el examen de nivel con peor resultado te hacía retroceder de unidad.
- El dictado de la pregunta del día fallaba en silencio; tras responder, el formulario seguía activo.
- Botones de audio que faltaban al abrir en frío (la voz se revisaba una sola vez); la voz seguía hablando al salir de una historia; "✓" aunque hubieras fallado; cargas sin mensaje de error en Historias y Parejas; un ejercicio de armar que mostraba la respuesta.
- La velocidad del audio y el micrófono ya no se guardan en el navegador en modo visita.

**Se mantiene por decisión de Angel:** Map habla en B2 y C1 sin importar tu nivel.

**Propuesto, sin hacer:** que Map se adapte a tu nivel real (el contenido por nivel ya existe); que los repasos vencidos no lo pongan "triste"; quitar tienda, ropa y álbum si no los usas; que repetir el examen con peor resultado no reduzca las unidades aprobadas.

## Última auditoría

2026-11-19, toda la app (ver arriba). Siguiente: priorizar lo cambiado después de este commit.
