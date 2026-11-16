# dev-prep

A personal "LeetCode" I built to prepare for my first frontend developer job. It works offline on my laptop and on my phone, and I use it every day.

I write code in VS Code; every time I save with `Ctrl + S`, the tests re-run and the app shows each case live, with the expected and the received value. On the phone I study with short lessons, and the progress of both devices is merged automatically whenever there is internet.

**Stack:** React 19, Vite, Express 5, Vitest, installable PWA with a service worker, AWS Lambda and DynamoDB (CloudFormation), Vercel.

**In numbers:** 390 exercises with tests (JavaScript, algorithms, React, TypeScript, Node and SQL), 35 theory topics, 152 interview questions, English lessons in 3 levels and 334 tests for the app itself.

**Live web version:** [dev-prep.angel-isasi.com](https://dev-prep.angel-isasi.com) (each visitor's progress stays only in their own browser).

> The app content and interface are in Spanish: I am from Peru and built it for my own study.

![Live tests: you save in VS Code and the app shows which cases pass, with the expected and the received value](docs/capturas/tests-en-vivo.png?v=2)

| Home | Lessons | English |
|---|---|---|
| ![Home with goal, streak, daily target, readiness, countdown and today's plan](docs/capturas/inicio.png?v=2) | ![Lesson path by units](docs/capturas/lecciones.png?v=2) | ![English with daily routine, immersion log and placement test](docs/capturas/ingles.png?v=2) |

| Getting a job | Phone |
|---|---|
| ![Real job offers ranked by how well they fit, with the reasons](docs/capturas/trabajo.png?v=2) | ![Phone version with today's plan and the current unit](docs/capturas/movil.png?v=2) |

## Features

- **Home:** my written goal, streak, daily target (with "debt" from missed days), interview readiness percentage and a countdown to my target date that tells me if I am behind.
- **Learn:** 35 topics (JavaScript, React, TypeScript, Node and SQL), each with one screen of theory, guided exercises and a quiz.
- **Practice:** 390 exercises with filters by topic, level and status.
  - **Live tests:** save in VS Code and see what passes and what fails, plus your `console.log` output.
  - **Errors explained** in plain language and **infinite loop detection** (the run is stopped after 20 seconds).
  - **TypeScript exercises** also type-check your code with `tsc` in strict mode.
  - **Three progressive hints** and a **locked official solution** with a full explanation (viewing it counts as not solved).
  - **"Explain it in your own words"**, compared with a model answer.
  - **Spaced repetition:** solved exercises come back after 1, 3, 7, 14 and 30 days.
  - **Interview mode** with a 20-minute timer.
- **Lessons:** Duolingo-style path by units with 9 item types generated from the content.
- **Interviews:** 152 flashcards (Spanish and English) with "what the interviewer wants to hear", a staged mock interview (HR, technical with follow-up questions, project presentation and closing), my 1-minute pitch and STAR stories.
- **English:** 3 levels (A1 to B2) with audio, sentence building, dictation, dialogues, grammar, shadowing, a placement test and an immersion log.
- **Practice like at work:** write your own tests and catch hidden bugs (mutation testing), React challenges against an API that is slow or fails on purpose, Git practice with real repositories (conflicts, undo, pull) checked automatically, and a weekly challenge with a personal record.
- **Getting a job:** real offers from public job board APIs (Get on Board, Remotive, RemoteOK, Arbeitnow) ranked by fit without AI, application tracker, "am I ready for this offer?", CV to PDF, portfolio export to a ready-to-publish Vite project, take-home tests with a rubric and guided projects.
- **Motivation:** levels and badges, weekly plan based on weak topics, "how much I improved" against 1 and 3 months ago, and earned game time (unlocked only after the daily goal; the laptop detects the game by itself).
- **Notifications:** push to the phone at my usual study time if I did not study, last call for the streak and new junior offers in Peru or remote for Latin America (max 2 a day).
- **Reference:** an offline mini MDN with search.
- Dark and light mode.

## How it works

```
VS Code ──save──► workspace/<id>/solucion.js
                        │ (Vitest watches the folder)
                        ▼
Browser ◄──SSE──── Express ◄── reporter ◄── Vitest
   │                  │
   └── fetch /api ───►├─► content/  (exercises)
                      ├─► data/     (progress)
                      └─► code      (opens VS Code)
```

- **Local engine** (`server/`): Express 5 on `127.0.0.1:4321`. Reads the exercises from `content/`, saves progress as JSON with atomic writes, opens VS Code and runs Vitest in watch mode through its Node API. A custom reporter sends the results to the browser with **Server-Sent Events**.
- **Web and phone version:** the same React code built in a `movil` mode, where Vite swaps the data layer for one that reads exported JSON and stores progress in the browser. It is a PWA: it works offline and installs from Chrome. On my laptop it connects to the local engine and gets VS Code and live tests too.
- **Sync** (`server/combinar.js`): each device saves locally first and uploads its own document to an AWS Lambda. When it downloads the others, it merges them record by record: the latest record wins and daily counters are summed, so syncing twice never breaks anything.
- **Push notifications** (`server/webpush.js`): Web Push implemented with only `node:crypto` (VAPID ES256 signature and aes128gcm encryption, RFC 8291), sent by the Lambda every 30 minutes when needed.
- **Infrastructure** (`aws/`): one CloudFormation template with a Lambda Function URL, a DynamoDB table and an EventBridge schedule, all inside the AWS free tier.

### Security

- The local server only listens on `127.0.0.1` and checks the `Origin` and `Host` headers, so other websites cannot use it (including DNS rebinding attacks). It also sends anti-framing headers.
- The browser never sends file paths, only an exercise id; disk paths always come from the index.
- The cloud requires a 256-bit token that only travels inside the pairing QR code (after the `#`, so it never reaches a server) and is compared in constant time. The pairing link only accepts an AWS Lambda URL.
- The published site has a strict Content Security Policy whose inline script hash is verified at build time.
- Secrets live in `data/sync.json`, which is never committed.

## Requirements

- Windows 10 or 11
- [Node.js](https://nodejs.org) 22 or newer (LTS)
- [VS Code](https://code.visualstudio.com), installed with **"Add to PATH"** checked (for the "Open in VS Code" button)

Only the first install needs internet. After that everything works offline.

## Install

```
git clone https://github.com/Angel-Isasi/dev-prep.git
cd dev-prep
npm install
```

## Daily use

- **Desktop shortcut (recommended):** run `npm run acceso-directo` once. Double-click **dev-prep** on the desktop and the app opens in the browser in a few seconds, with no console window.
- **Web version only:** run `npm run arranque:activar` once. The engine starts hidden with Windows (about 100 MB of memory), and dev-prep.angel-isasi.com on this laptop gets VS Code and live tests. `npm run arranque:quitar` undoes it.
- **With a console (to see errors):** double-click `iniciar.bat`.

### Practicing an exercise

1. Go to **Practicar** and pick an exercise.
2. Click **Empezar en VS Code**: your copy is created in `workspace/<id>/solucion.js` and VS Code opens it.
3. Write code and save. The **Tests en vivo** panel updates by itself.
4. When all tests pass, the exercise is marked as solved.

**Reiniciar** goes back to the starting file and keeps your version in `workspace/.respaldos/`.

## Where things are stored

| Location | Contents |
|---|---|
| `workspace/` | Your code for each exercise |
| `data/progreso.json` | Your progress (with a daily copy in `data/respaldos/`) |
| `data/mis-respuestas.json` | Your pitch and STAR stories |
| `data/sync.json` | The URL and secret token for the AWS sync |
| `Documents/dev-prep-git/` | Git practice repositories (safe to delete, they are recreated) |
| `Documents/portafolio/` | Projects exported for GitHub |
| Browser (web version) | Progress on that device, in its local storage |

`workspace/` and `data/` are never committed.

## Commands

| Command | Purpose |
|---|---|
| `npm start` | Starts the app without opening the browser |
| `npm run dev` | Development mode with hot reload (`http://localhost:5173`) |
| `npm run build` | Builds the local interface into `client/dist` |
| `npm run build:movil` | Builds the web and phone version into `client/dist-movil` and verifies its CSP |
| `npm test` | Tests for the app itself |
| `npm run validar` | Checks every exercise: complete files, the solution passes and the starting file fails |
| `npm run validar:aprender`, `validar:ingles`, `validar:predice`, `validar:proyectos` | Check the theory, English, "what does it print?" and project content |
| `npm run aws:crear` | Creates or updates the AWS sync (Lambda, URL and table) |
| `npm run aws:estado` | Shows whether the sync responds |
| `npm run aws:rotar` | Rotates the secret token (then pair the phone again) |
| `npm run aws:borrar` | Deletes everything in AWS, data included |

## Project structure

| Folder | Contents |
|---|---|
| `client/` | React interface (local, web and phone) |
| `server/` | Express server, test runner, progress rules and pure modules shared with the web |
| `content/` | Exercises, theory, interview questions, English and projects |
| `scripts/` | Content validators, lesson generators, web exporter and AWS scripts |
| `aws/` | CloudFormation template and Lambda code |
| `docs/` | Project plan and content guides |

### Exercise format

Each exercise is a folder in `content/`, so new ones can be added without touching the app code:

```
content/javascript/ejercicios/009-frecuencia-de-palabras/
  meta.json        id, title, type (function or component), topic, level and tags
  enunciado.md     description, rules and examples
  inicio.js        the starting file
  tests.test.js    Vitest tests (they import ./solucion.js)
  pistas.json      3 hints, from gentle to almost the answer
  solucion.js      official solution
  explicacion.md   key idea, step by step, why it works, common mistakes,
                   another approach, how to explain it in an interview, concepts
```

React components use `.jsx`, and TypeScript exercises use `.ts` or `.tsx`. After adding or changing an exercise, run `npm run validar`.

## Troubleshooting

- **"No se encontró Node.js":** install Node.js LTS and open `iniciar.bat` again.
- **"No se encontró el comando code":** reinstall VS Code with "Add to PATH" checked and restart the PC.
- **"El puerto 4321 está ocupado":** dev-prep is already running; use that window or close it.
- **React tests are slow the first time:** normal, the React test environment can take a few seconds to warm up.
