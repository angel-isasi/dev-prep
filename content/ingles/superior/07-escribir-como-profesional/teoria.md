# Escribir como profesional

## En una frase

Al escribir un RFC, un README o la descripción de un PR, el inglés cambia: más sustantivos (*the implementation of the cache*), frases más cortas, conectores formales (*whereas*, *thereby*) y voz activa por defecto. La meta no es sonar sofisticado, sino que alguien ocupado lo entienda a la primera.

## Cómo se forma

**Sustantivación**: el verbo se vuelve sustantivo y la frase habla de la idea, no de las personas.

| Hablado | Escrito |
|---|---|
| We implemented the cache, so the page loads faster. | The implementation of the cache led to a reduction in load time. |
| We removed the old API. | The removal of the old API... |

- Cada sustantivo lleva su preposición: a reduction **in**, an increase **in**, the implementation **of**, the impact **on**, the need **for**.
- Con medida: tres *of* seguidos (*the review of the implementation of the migration*) cansan a cualquiera.

**Activa o pasiva**:
- Activa por defecto, sobre todo en PRs: *This PR removes the old endpoint.*
- Pasiva cuando el actor no importa o es obvio: *The token is stored in memory.*
- En un postmortem, nunca la pasiva que esconde la causa: *Mistakes were made* ✗.

**Conectores formales**:

| Conector | Para | Ejemplo |
|---|---|---|
| whereas | contrastar dos cosas | REST returns full objects, whereas GraphQL returns only what you ask for. |
| thereby | consecuencia, con -ing | We cache the results, thereby reducing API calls. |
| notwithstanding | a pesar de, con sustantivo | Notwithstanding these risks, we recommend the upgrade. |
| hence | de ahí, con sustantivo | The API is slow; hence the cache. |
| provided that | condición | It's safe, provided that the flag stays off. |

**Concisión**: *in order to* → *to*; *at this point in time* → *now*; *utilize* → *use*.

## Errores típicos

- "A reduction of the load time" ✗ → "A reduction **in** load time" ✓. Ojo: la cantidad sí va con *of*: *a reduction **of** 40% **in** load time*.
- "Whereas" para el tiempo ✗: solo contrasta → para "mientras tanto" se usa *meanwhile* ✓.
- "..., thereby we reduce calls" ✗ → "..., thereby reducing calls" ✓.
- "Notwithstanding, it works" ✗ → "Nevertheless, it works" ✓: *notwithstanding* necesita un sustantivo después.
- Oraciones de 40 palabras con tres "que" encadenados, como en un texto académico en español ✗ → dos o tres oraciones cortas ✓.
- "It was decided to remove the endpoint" ✗ (¿quién?) → "The team decided to remove the endpoint" ✓.
- "Utilize", "leverage" y "facilitate" para todo ✗ → *use* y *help* ✓.

## Pronunciación

- **whereas** → ueráz: la fuerza va al final.
- **thereby** → derbái: la "th" suena como una "d" suave, y la fuerza va en "bái".
- **notwithstanding** → natuizstándin: fuerza en "stán".
- **rationale** → rashonál: la fuerza al final, y "tio" suena "sho".
