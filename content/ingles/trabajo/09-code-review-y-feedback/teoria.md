# Code review y feedback

## En una frase

En una revisión de código el tono importa tanto como el contenido: propones con preguntas ("Could we extract this into a function?"), agradeces lo que te señalan ("Good catch, fixed!") y nunca te pones a la defensiva.

## Cómo se forma

**Dar feedback**: suaviza con una pregunta o con "I'd".

| Directo (suena brusco) | Profesional |
|---|---|
| Extract this. | **Could we extract this into a function?** |
| This name is bad. | **I'd suggest** a more descriptive name, like `userCount`. |
| Wrong. | **I think** this breaks when the array is empty. **What do you think?** |

**Etiquetas que vas a ver:**
- **nit:** detalle pequeño, no bloquea. "nit: extra space here."
- **suggestion / non-blocking:** idea opcional.
- **LGTM** (looks good to me): aprobado.
- **Approve** / **Request changes**: los dos botones de GitHub.

**Recibir feedback**: agradece, acepta o explica con calma.
- "**Good catch**, I'll fix it." / "**Fair point**, updated."
- "**Happy to change it.** I used a loop because..." (explicas sin pelear).
- "**I'm not sure I follow.** Could you give me an example?"

## Errores típicos

- "You must change this" ✗ → "**Could we** change this?" ✓: must suena a orden.
- "Your code is wrong" ✗ → "**I think this** might fail when..." ✓: habla del código, no de la persona.
- "I did it like that because I wanted" ✗ → "I did it this way **because** it's easier to test" ✓: da una razón técnica.
- "Thanks for the feedbacks" ✗ → "Thanks for the **feedback**" ✓: feedback no tiene plural.
- "I disagree with you totally" ✗ → "**I see your point, but**..." ✓.

## Pronunciación

- **LGTM** se lee letra por letra: el yi ti ém. En voz alta casi siempre se dice "looks good to me".
- **nit** → nít: corta, como "nit" de "nítido".
- **suggest** → sayést: la "g" suena como "y" fuerte.
- **approve** → aprúv: la fuerza en "prúv".
