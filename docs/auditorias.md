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

## Última auditoría

2026-11-17, inglés (ver arriba). Siguiente: priorizar lo cambiado después de este commit.
