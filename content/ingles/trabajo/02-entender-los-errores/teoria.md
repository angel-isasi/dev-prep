# Entender los mensajes de error

## En una frase

Los mensajes de error son inglés corto y repetitivo: si entiendes unas 30 palabras, sabes qué falló y dónde buscar, y además puedes contárselo a tu equipo sin traducir palabra por palabra.

## Cómo se forma

Casi todos los errores tienen la misma forma: **tipo de error + qué pasó + dónde**.

| Mensaje | Qué significa | Qué revisar |
|---|---|---|
| Cannot read properties of undefined (reading 'name') | Pediste `.name` a algo que es undefined | El objeto antes del punto: ¿llegaron los datos? |
| x is not a function | Llamaste con `()` algo que no es función | El nombre, el import y el tipo de x |
| x is not defined | La variable no existe en ese scope | Typos, imports, dónde la declaraste |
| Unexpected token | El código o el JSON está mal escrito | Llaves, comas, o un HTML que llegó en vez de JSON |
| Module not found | No encuentra el archivo o paquete | La ruta del import o falta `npm install` |
| Maximum call stack size exceeded | Recursión infinita | El caso base de tu función |
| Too many re-renders | Cambias el estado mientras se renderiza | Un `setState` fuera de un evento o efecto |
| blocked by CORS policy | El servidor no permite tu origen | Los headers del servidor, no tu frontend |
| 404 Not Found / 500 Internal Server Error | La ruta no existe / el servidor falló | La URL / los logs del servidor |

Para explicarlo a alguien usa: **I'm getting** + el error + **when I** + la acción.
- I'm getting a 404 when I call the endpoint. → Me sale un 404 cuando llamo al endpoint.
- It says that map is not a function. → Dice que map no es una función.

## Errores típicos

- "The error says me that..." ✗ → "The error **says** that..." o "It **tells me** that..." ✓. **Say** no lleva persona después.
- "I have an error" ✓ se entiende, pero suena mejor "**I'm getting** an error" ✓ cuando el error aparece cada vez.
- "The page doesn't found" ✗ → "The page **wasn't found**" o "I get a 404" ✓.
- "Cannot read property of undefined" no significa "no se puede leer la propiedad indefinida": **undefined es el objeto**, no la propiedad.
- **Failed to fetch** no es "falló la búsqueda": significa que la petición ni siquiera llegó (red, CORS o servidor caído).

## Pronunciación

- **undefined** → andifáind y **unexpected** → anekspéktid: la "un" suena "an".
- **exceeded** → iksídid: la fuerza va en la segunda sílaba.
- **deprecated** → déprekeitid: no digas "depreciado"; la fuerza va al inicio.
- **CORS** → kórs, se lee como palabra, igual que **course**.
