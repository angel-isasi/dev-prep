# dev-prep

App local y 100% offline para practicar JavaScript y React rumbo a un puesto frontend junior.

Programas en VS Code, guardas con `Ctrl + S` y la app muestra al instante qué tests pasan y cuáles no, con lo que se esperaba y lo que devolvió tu código. Tu progreso se guarda en tu laptop.

## Qué tiene

- **Inicio**: tu objetivo, la racha, la meta del día (con la deuda de los días que fallaste), tu porcentaje de preparación y la cuenta regresiva a tu fecha meta, con aviso de si vas atrasado.
- **Aprender**: 10 temas de JavaScript, cada uno con teoría de una pantalla, ejercicios guiados y un quiz.
- **Practicar**: ejercicios de JavaScript, algoritmos y React, con filtros por tema, nivel y estado.
  - **Tests en vivo**: guardas en VS Code y la app muestra al instante qué pasa y qué falla, con lo esperado y lo recibido, más tu `console.log`.
  - **Errores explicados** en español y **aviso de bucle infinito**.
  - **Pistas progresivas** (3 por ejercicio) y **solución con explicación completa**, bloqueada hasta que la pidas (con penalidad si no lo resolviste).
  - **Explícalo con tus palabras** y compáralo con la respuesta modelo.
  - **Repaso espaciado**: lo que resolviste vuelve en 1, 3, 7, 14 y 30 días.
  - **Modo entrevista**: cronómetro de 20 minutos.
- **Entrevistas**: 100 preguntas en tarjetas (español e inglés) con lo que el entrevistador quiere escuchar, simulacro de 30 minutos, tu pitch de 1 minuto y tus historias STAR.
- **Progreso**: calendario de actividad, avance por tema y resumen semanal.
- **Referencia**: un mini MDN offline con buscador (arrays, strings, objetos, promesas, DOM, React...).
- Modo oscuro y modo claro.

## Requisitos

- Windows 10 u 11
- [Node.js](https://nodejs.org) 22 o superior (versión LTS)
- [VS Code](https://code.visualstudio.com), instalado con la opción **"Agregar a PATH"** marcada (para que funcione el botón "Abrir en VS Code")

Solo la primera instalación necesita internet. Después todo funciona sin conexión.

## Instalación

```
git clone https://github.com/Angel-Isasi/dev-prep.git
cd dev-prep
npm install
```

## Uso diario

**Acceso directo (recomendado).** Créalo una sola vez con:

```
npm run acceso-directo
```

Aparece **dev-prep** en tu escritorio. Con doble clic la app abre en el navegador en unos segundos, sin ventana negra. Si ya estaba abierta una versión anterior, la cierra y arranca la más reciente. Para cerrarla, usa **Cerrar dev-prep** en la barra lateral de la app.

Puedes anclarlo a Inicio o a la barra de tareas: clic derecho sobre el acceso directo.

**Solo la versión web (sin abrir nada).** Activa el arranque automático una vez:

```
npm run arranque:activar
```

Al prender la laptop, dev-prep queda corriendo oculto (unos 100 MB de memoria, casi nada de procesador) y no abre ninguna ventana. Abres https://dev-prep.angel-isasi.com y, en Ajustes, tocas **Conectar con dev-prep de esta laptop** una sola vez: la web tiene VS Code, los tests en vivo y todo lo de la app local. Para quitarlo: `npm run arranque:quitar`.

**Con ventana (para ver errores).** Doble clic en `iniciar.bat`: muestra la consola del servidor. Ciérrala o presiona `Ctrl + C` para apagar la app.

### Cómo se practica un ejercicio

1. Entra a **Practicar** y elige un ejercicio.
2. Pulsa **Empezar en VS Code**: se crea tu copia en `workspace/<id>/solucion.js` y VS Code la abre.
3. Programa y guarda (`Ctrl + S`). El panel **Tests en vivo** se actualiza solo.
4. Cuando todos los tests pasan, el ejercicio queda como **resuelto**.

Si quieres empezar de cero, **Reiniciar** vuelve al archivo inicial y guarda tu versión en `workspace/.respaldos/`.

## Dónde se guardan tus cosas

| Carpeta | Qué contiene |
|---|---|
| `workspace/` | Tu código de cada ejercicio |
| `data/progreso.json` | Tu progreso (con una copia diaria en `data/respaldos/`) |
| `data/mis-respuestas.json` | Tu pitch y tus historias STAR |
| `data/eventos.jsonl` | Historial de lo que haces, para estadísticas futuras |

Ninguna de las dos carpetas se sube a Git.

## Comandos

| Comando | Para qué sirve |
|---|---|
| `npm start` | Arranca la app (igual que `iniciar.bat`, sin abrir el navegador) |
| `npm run acceso-directo` | Crea el acceso directo **dev-prep** en el escritorio |
| `npm run arranque:activar` | dev-prep arranca oculto al iniciar Windows, para usar solo la versión web (`arranque:quitar` lo deshace) |
| `npm run dev` | Modo desarrollo: recarga la interfaz al cambiar el código (abre `http://localhost:5173`) |
| `npm run build` | Compila la interfaz en `client/dist` |
| `npm test` | Tests de la propia app |
| `npm run validar` | Revisa que cada ejercicio esté completo, que su solución pase y que el archivo inicial falle |
| `npm run validar:aprender` | Revisa los temas de Aprender y las entradas de la Referencia |

## Cómo está hecha

- **Interfaz**: React 19 + Vite, React Router, CSS Modules con variables para el tema.
- **Servidor**: Express 5. Lee los ejercicios de `content/`, guarda el progreso en JSON y abre VS Code.
- **Tests en vivo**: Vitest usado desde Node en modo watch, con un reporter propio que envía los resultados al navegador por **Server-Sent Events**.
- **Seguridad**: el servidor solo escucha en `127.0.0.1` y el navegador nunca envía rutas de archivos, solo el id del ejercicio.

```
VS Code ──guardas──► workspace/<id>/solucion.js
                           │ (Vitest vigila la carpeta)
                           ▼
Navegador ◄──SSE──── Express ◄── reporter ◄── Vitest
    │                   │
    └── fetch /api ────►├─► content/  (ejercicios)
                        ├─► data/     (progreso)
                        └─► code      (abre VS Code)
```

| Carpeta | Qué contiene |
|---|---|
| `client/` | Interfaz en React |
| `server/` | Servidor Express, corredor de tests y progreso |
| `content/` | Ejercicios: enunciado, archivo inicial, tests, pistas, solución y explicación |
| `scripts/` | Validador de contenido y modo desarrollo |
| `docs/` | Plan del proyecto y tareas |

### Formato de un ejercicio

Cada ejercicio es una carpeta en `content/`. Para agregar uno no hay que tocar el código de la app:

```
content/javascript/ejercicios/009-frecuencia-de-palabras/
  meta.json        id, título, tipo (funcion o componente), tema, nivel y tags
  enunciado.md     descripción, reglas y ejemplos
  inicio.js        el archivo con el que empiezas
  tests.test.js    tests con Vitest (importan ./solucion.js)
  pistas.json      3 pistas, de la más suave a la casi respuesta
  solucion.js      solución oficial
  explicacion.md   idea clave, paso a paso, por qué funciona, errores comunes,
                   otra forma, cómo explicarlo en una entrevista y conceptos
```

Los componentes de React usan `.jsx` en vez de `.js`. Después de agregar o cambiar un ejercicio, corre `npm run validar`.

## Problemas comunes

- **"No se encontró Node.js"**: instala Node.js LTS y vuelve a abrir `iniciar.bat`.
- **"No se encontró el comando code"**: reinstala VS Code marcando "Agregar a PATH" y reinicia la PC.
- **"El puerto 4321 está ocupado"**: ya hay una ventana de dev-prep abierta; usa esa o ciérrala.
- **Los tests de React tardan la primera vez**: es normal, el primer arranque del entorno de React puede tomar varios segundos.
