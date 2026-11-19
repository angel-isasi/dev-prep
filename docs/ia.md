# Evaluación con IA

La app puede evaluar tus respuestas de entrevista y corregir tu inglés con IA. Todo está listo en el
código; solo falta que tú pongas tu API key en Vercel. Mientras no la pongas, la app muestra
"Evaluación con IA: se activa cuando configures tu API key en Vercel" y no gasta nada.

## Qué hace

- **Entrevistas** (tarjetas y simulacro): escribes o dictas tu respuesta y la IA te da un puntaje de
  0 a 10, lo que hiciste bien, lo que te faltó, tu misma respuesta mejorada (con tu pitch y tus
  historias STAR, si las llenaste) y una repregunta que puedes responder ahí mismo. Al revelar la
  respuesta modelo, marca la nota que sugiere.
- **Informe del simulacro**: al terminar un simulacro, "Pedir mi informe" mira toda la entrevista
  junta (tus notas y las respuestas que evaluaste con IA) y te da una nota general, qué tan cerca
  estás, tus fortalezas, lo que más te pesaría y un plan de pocos pasos.
- **Entrevista por voz** (Entrevistas, pestaña "Por voz"): el entrevistador dice la pregunta en voz
  alta, tú respondes hablando y él repregunta sobre lo que dijiste (1 o 2 veces). No corrige en
  medio: al final ves cada respuesta evaluada y el informe. La voz y el micrófono son los del
  navegador (gratis); sin micrófono puedes escribir. Funciona mejor en Chrome y con audífonos.
- **Mapache**: después de responder la pregunta del día, "Corregir mi inglés" te muestra cada error
  con su corrección, tu respuesta en nivel C1 y el nivel que mostraste.
- **Ejercicios** (pestaña "Explícalo", al resolver): "Evaluar mi explicación" juzga cómo explicas tu
  solución con tu código a la vista, y "Revisar mi código" te da la revisión de un senior: qué está
  bien, qué subiría tu nivel y qué te preguntaría el entrevistador. Tu código sale de workspace/, así
  que la revisión solo aparece en la laptop (en localhost o en la web con dev-prep abierto).
- **Pitch y STAR**: "Evaluar mi pitch" y "Evaluar mi historia" con lo que pide el entrevistador.
- **Conversa con IA** (Inglés, Más práctica): una charla de trabajo en inglés (entrevista, daily,
  explicar tu código, pedir ayuda, primer día). Respondes escribiendo o dictando; al terminar te da
  tus errores corregidos. El tiempo cuenta para tus minutos de inglés.

La app de la laptop no tiene la API key: su servidor le pasa los pedidos de IA a la función de
Vercel (`/api/ia` en `server/app.js`). Sin internet, la IA aparece apagada.

## Modelos y costo

Cada tarea usa el modelo más barato que la hace bien (tabla en `server/ia-precios.js`):

| Tarea | Modelo | Costo aproximado |
|---|---|---|
| Evaluar una respuesta de entrevista | `claude-sonnet-5-5` | alrededor de 1 centavo de dólar |
| Informe de una entrevista completa | `claude-sonnet-5-5` | de 1 a 2 centavos |
| Corregir inglés | `claude-haiku-5-5` | menos de 0,1 centavos |
| Revisar tu código | `claude-sonnet-5-5` | de 1 a 2 centavos |
| Un turno de Conversa | `claude-haiku-5-5` | menos de 0,1 centavos |
| Corrección final de Conversa | `claude-sonnet-5-5` | alrededor de 1 centavo |

Una entrevista por voz de 3 preguntas con 1 repregunta son 7 pedidos: unos 8 centavos. Una charla
de Conversa de 10 turnos con su corrección: unos 2 centavos.

"Uso de IA este mes", debajo de cada panel de IA, muestra lo que llevas gastado y tu tope mensual
(20 USD por defecto, lo cambias ahí mismo). Al llegar al tope la app deja de pedir evaluaciones. La
cuenta se lleva en cada navegador con los tokens reales de cada pedido; el gasto exacto de toda tu
cuenta está en la consola de la API.

## Cómo funciona (y por qué es seguro)

- La app nunca habla directo con la IA: llama a una función de Vercel (`api/ia.js`, lógica en
  `server/ia.js`). La API key vive solo en Vercel como variable secreta: no está en el código ni en
  tu navegador, así que aunque el repositorio sea público nadie la ve.
- Cada pedido lleva tu **contraseña de IA**. Sin ella, la función no llama a la IA, así que nadie más
  puede gastar tu saldo. La escribes una vez en la app y queda guardada en ese navegador.
- No usa AWS. Las funciones de Vercel están incluidas en el plan gratuito (Hobby).
- Cada pedido tiene topes de tamaño, y la app tiene un tope de gasto mensual (ver "Modelos y costo").

## Activarla (lo haces tú, una sola vez)

1. Cuando tengas tu crédito, entra a la consola de la API (platform.claude.com), crea una API key y
   cópiala. Recomendado: en Billing, pon un límite de gasto mensual.
2. En Vercel: tu proyecto, **Settings**, **Environment Variables**. Agrega dos variables para
   *Production*:
   - `ANTHROPIC_API_KEY`: la key que copiaste.
   - `DEVPREP_IA_CLAVE`: una contraseña que inventes (larga, por ejemplo 20 caracteres).
   - Opcional: `IA_MODELO` si quieres forzar un solo modelo para todas las tareas (por defecto cada
     tarea usa el suyo, ver "Modelos y costo").
3. En Vercel, **Deployments**, el último, **Redeploy** (las variables se leen al publicar).
4. En la app, abre una tarjeta de entrevista: te pedirá la contraseña de IA. Escribe la misma de
   `DEVPREP_IA_CLAVE`.

## Código de invitado (opcional)

Para que otra persona pruebe la IA sin usar tu contraseña ni tu saldo:

1. En la consola de la API crea un espacio de trabajo nuevo (por ejemplo "Invitados") y ponle un límite de gasto mensual bajo (por ejemplo 1 USD). Ese límite lo aplica la consola: no se puede saltar desde la app.
2. Crea una API key dentro de ese espacio de trabajo.
3. En Vercel agrega dos variables: ANTHROPIC_API_KEY_INVITADO (esa key) y DEVPREP_IA_INVITADO (el código que compartirás; uno largo y aleatorio). Vuelve a desplegar.
4. En la app, Ajustes > Dispositivos > "IA para invitados" te muestra el código para copiarlo (solo lo ves tú).

Quien no tiene código ve los botones de IA, pero la app le pide un código de acceso. Para cortar el acceso al instante, desactiva la key del invitado en la consola. Para cambiar el código, cambia DEVPREP_IA_INVITADO en Vercel.

## Si algo falla

- "La IA todavía no está configurada": falta alguna de las dos variables o no hiciste Redeploy.
- "La contraseña de IA no es correcta": no coincide con `DEVPREP_IA_CLAVE`; vuelve a escribirla.
- "La API key de Vercel no es válida" o "no tiene saldo": revisa la key o el crédito en la consola.
- Solo funciona en la web (dev-prep.angel-isasi.com), no en la app local de la laptop.
