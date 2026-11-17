# Discusiones técnicas de alto nivel

## En una frase

En una revisión de arquitectura o en una entrevista de system design nadie espera que lo sepas todo. Esperan que razones en voz alta con números aproximados, que nombres los trade-offs a escala, que defiendas tu decisión sin aferrarte a ella y que digas con precisión qué tan seguro estás: *I'd want to validate that*.

## Cómo se forma

**Razonar a escala**, paso a paso:

| Paso | Frases |
|---|---|
| Supuestos | My working assumption is... / Back-of-the-envelope, that's... |
| Decisión | We're optimizing for reads, at the expense of writes. |
| Cómo falla | What's the failure mode? / The blast radius would be... |
| Riesgos | The biggest risk is... / We could de-risk it by... |

**Ante el pushback**, cuatro movimientos:
1. Reformula: *If I'm hearing you correctly, your concern is cost, not complexity.*
2. Haz **steelman**: presenta la mejor versión de la objeción antes de responder.
3. Concede lo cierto y sostén lo demás: *That's a fair challenge. I still stand by the decision, because...*
4. Di qué te haría cambiar: *If writes grow past that, I'd revisit it.*

Hacer de abogado del diablo (lo viste en C1) aquí sirve para atacar tu propio diseño: *Just to pressure-test this, what if a region goes down?*

**Calibrar tu seguridad**, de más a menos:

| Seguridad | Frase |
|---|---|
| Alta | I'm confident. We've measured it. |
| Media | I'm fairly confident, but I'd want to validate that under load. |
| Baja | My working assumption is X, but it's a known unknown. |
| Ninguna | I don't know yet. Here's how I'd find out. |

**Reversible o no**: una *one-way door* (irreversible) pide ir despacio; una *two-way door* (reversible) se prueba rápido.

## Errores típicos

- "Eventually we use the replica" para decir "a veces" ✗ → "Occasionally we use the replica" ✓: *eventually* significa "tarde o temprano".
- "We made a benchmark" ✗ → "We ran a benchmark" o "We benchmarked it" ✓.
- "I'm one hundred percent sure it scales" ✗ → "I'm fairly confident, but I'd want to validate that" ✓.
- "You don't understand" ante una objeción ✗ → "If I'm hearing you correctly, your concern is..." ✓.
- "The latency is of 200 ms" ✗ → "Latency is 200 ms" o "a latency of 200 ms" ✓.
- "That escapes the scope" ✗ → "That's out of scope" ✓.
- "It just scales" sin números ✗ (suena *hand-wavy*) → "Each node handles about five thousand requests per second" ✓.

## Pronunciación

- **idempotent** → aidempóutent: empieza con "ai" y la fuerza va en "póu".
- **throughput** → zrúput: *through* con la "th" de *think*.
- **orthogonal** → orzágonol: la fuerza en "zá".
- **cache** → késh, igual que *cash*; nunca "káche".
