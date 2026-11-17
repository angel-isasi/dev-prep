## En una frase

En el inglés profesional casi nada se dice en absoluto: se **matiza** (hedging) para no sonar arrogante ni brusco y para dejar espacio a la otra persona. Donde un hispanohablante dice "This is slow", un nativo dice "This might be a bit slow". En una reunión o un code review, la diferencia entre sonar colaborativo o agresivo está en estas palabras.

## Cómo se forma

| Herramienta | Ejemplos | Efecto |
|---|---|---|
| Verbos que toman distancia | it seems to be, it appears, it looks like | Lo presentas como observación, no como verdad absoluta |
| Tendencia | tend to + verbo | Generalizas sin decir "siempre" |
| Modales | might, could, may | This might break on Safari. |
| Grado | somewhat, a bit, fairly, to some extent, for the most part | It's somewhat slower. |
| Cifras aproximadas | roughly, or so, give or take | It takes roughly two seconds. |
| Opinión con cuidado | I'd argue that, arguably, I'm inclined to think | I'd argue that we don't need Redux here. |
| Preguntas en vez de órdenes | Have you considered...? What if we...? I wonder if... | What if we moved this to a hook? |

**Discrepar en tres pasos**: reconoces, contrastas y propones.
I see where you're coming from, **but** I'm not sure it scales. **What if** we tried a cache first?

**En un code review**, marca el peso de cada comentario: *Nit:* (detalle), *Just a thought:* (idea opcional), *Not a blocker, but...* (no impide el merge). Lo que sí es grave se dice claro, con un solo matiz.

Ejemplos:
- It seems to be a timezone issue. → Parece ser un problema de zona horaria.
- Big PRs tend to get slower reviews. → Los PR grandes suelen revisarse más lento.
- I agree to some extent. → Estoy de acuerdo hasta cierto punto.

## Errores típicos

- "You're wrong." ✗ → "I'm not sure that's the case." ✓
- "This code is bad." ✗ → "This part might be hard to maintain." ✓
- "It seems that is slow." ✗ → "It seems to be slow." ✓ (el sujeto no desaparece)
- "I use to work at night." ✗ → "I tend to work at night." ✓ (*use to* no existe en presente)
- "In some extent" ✗ → "**To** some extent" ✓
- "Arguably" no es negativo: *arguably the best* = se podría decir que es el mejor.
- Matizar de más: "I think maybe it could possibly be slow." ✗ → "It might be slow." ✓ Con un solo matiz basta; con tres suenas inseguro.
- "With all due respect" suaviza poco: en EE. UU. anuncia un desacuerdo fuerte. Úsalo con cuidado.

## Pronunciación

- **arguably** → "árgiuabli": fuerza en "ár".
- **somewhat** → "sámuat": una sola palabra, fuerza en "sám".
- **roughly** → "ráfli": la *gh* suena como *f*.
- **I'd argue** se une: "aidárgiu".
