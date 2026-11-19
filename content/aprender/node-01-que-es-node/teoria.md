## En una frase

Node.js es un programa que ejecuta **JavaScript fuera del navegador**: el mismo lenguaje que ya sabes, pero en vez de `document` y `window` tienes acceso a archivos, red y procesos del sistema.

## Lo esencial

### JavaScript sin navegador

Chrome trae un motor que entiende JavaScript, llamado **V8**. Node toma ese motor y lo saca del navegador, agregándole herramientas para el sistema operativo.

| En el navegador | En Node |
|---|---|
| `document`, `window`, `localStorage` | No existen (no hay página ni DOM) |
| `fetch`, `console`, `setTimeout`, `JSON` | También existen |
| No puede leer tus archivos | `fs` lee y escribe archivos |
| Lo abre el usuario con una URL | Lo ejecutas tú: `node archivo.js` |

```js
// hola.js
console.log("Hola desde Node");
console.log(typeof document); // "undefined"
```

```
> node hola.js
Hola desde Node
undefined
```

### Para qué lo usa un frontend

Aunque trabajes en la parte visual, usas Node todos los días:
- **Herramientas**: Vite, Vitest, ESLint y TypeScript son programas de Node.
- **npm**: instala librerías como React.
- **APIs**: el servidor que le da datos a tu app puede ser Node con Express (dev-prep mismo tiene uno en `server/`).

### Módulos: ESM y CommonJS

Cada archivo es un **módulo**: sus variables son privadas y compartes lo que exportas. Hay dos sistemas:

```js
// ESM (el moderno, el mismo de React y Vite)
// precios.js
export function conIgv(precio) { return precio * 1.18; }
export default function redondear(n) { return Math.round(n * 100) / 100; }

// app.js
import redondear, { conIgv } from "./precios.js"; // en Node la extensión .js es obligatoria
```

```js
// CommonJS (el antiguo, lo verás en código viejo y tutoriales)
// precios.cjs
function conIgv(precio) { return precio * 1.18; }
module.exports = { conIgv };

// app.cjs
const { conIgv } = require("./precios.cjs");
```

¿Cómo sabe Node cuál usar? Si el `package.json` dice `"type": "module"`, los `.js` son ESM. Si no, son CommonJS (salvedad: el Node actual detecta un `.js` que usa `import`/`export` y lo corre como ESM igual). También puedes forzarlo con la extensión: `.mjs` siempre es ESM y `.cjs` siempre es CommonJS.

### Módulos internos con `node:`

Node trae módulos incluidos que no necesitas instalar. Se importan con el prefijo `node:` para dejar claro que son de Node y no de npm:

```js
import { readFile } from "node:fs/promises"; // archivos
import path from "node:path";               // rutas
import os from "node:os";                   // datos del sistema
import { EventEmitter } from "node:events";  // eventos

os.platform(); // "win32" en Windows
```

### npm y package.json

**npm** es el instalador de librerías que viene con Node. El archivo `package.json` describe tu proyecto:

```json
{
  "name": "mi-api",
  "type": "module",
  "scripts": { "dev": "node --watch server.js", "test": "vitest" },
  "dependencies": { "express": "^5.1.0" },
  "devDependencies": { "vitest": "^3.0.0" }
}
```

- `npm install`: lee el `package.json` e instala todo en `node_modules/` (esa carpeta no se sube a Git).
- `npm install express`: instala y lo agrega a `dependencies` (lo necesita la app para correr).
- `npm install -D vitest`: lo agrega a `devDependencies` (solo para desarrollar).
- `npm run dev`: ejecuta el script `dev`.
- `package-lock.json` guarda las versiones exactas instaladas: sí se sube a Git.

### Variables de entorno: `process.env`

`process` es un objeto global con datos del programa en marcha. `process.env` tiene las **variables de entorno**: configuración que viene de fuera del código, como el puerto o una clave secreta.

```js
const puerto = Number(process.env.PUERTO) || 3000;
console.log(process.env.PUERTO); // undefined si no la definiste
```

```
> $env:PUERTO=4000          (PowerShell; en cmd sería: set PUERTO=4000)
> node server.js
```

Los valores de `process.env` **siempre son texto** (o `undefined`). Las claves secretas van en variables de entorno (o en un archivo `.env` que no se sube a Git), nunca escritas en el código.

## Errores típicos

**1. Usar `document` o `window` en Node**

```js
document.querySelector("h1");
// ReferenceError: document is not defined
```
En Node no hay página. Si tu código toca el DOM, tiene que correr en el navegador.

**2. Olvidar la extensión en un import ESM**

```js
import { conIgv } from "./precios";
// Error [ERR_MODULE_NOT_FOUND]: Cannot find module '.../precios'
```
Vite te deja omitirla, Node no. Escribe `"./precios.js"`.

**3. Mezclar `require` con ESM**

```js
// en un proyecto con "type": "module"
const express = require("express");
// ReferenceError: require is not defined in ES module scope
```
Usa `import express from "express";`.

**4. Tratar `process.env` como número**

```js
const puerto = process.env.PUERTO + 1; // "40001", no 4001
```
Siempre es texto. Convierte con `Number(...)` y pon un valor por defecto.

**5. Subir secretos o `node_modules` a Git**

Las contraseñas van en variables de entorno, y `node_modules/` y `.env` van en `.gitignore`. Cualquiera puede reinstalar las dependencias con `npm install`.

## Chuleta

- `node archivo.js`: ejecuta un archivo. `node --watch archivo.js`: lo reinicia al guardar.
- Node = motor V8 + acceso al sistema. Sin DOM.
- ESM: `import` / `export`, con extensión `.js`. CommonJS: `require` / `module.exports`.
- `"type": "module"` en `package.json` hace que los `.js` sean ESM.
- Módulos internos: `node:fs/promises`, `node:path`, `node:os`, `node:events`.
- `npm install` (todo), `npm install x` (dependencia), `npm install -D x` (de desarrollo), `npm run script`.
- `process.env.X` es texto o `undefined`.

## En la entrevista

**¿Qué es Node.js?**
Es un entorno para ejecutar JavaScript fuera del navegador, construido sobre el motor V8 de Chrome. Agrega acceso a archivos, red y procesos, y se usa para servidores, APIs y herramientas de desarrollo.

**¿En qué se diferencia JavaScript en Node del navegador?**
El lenguaje es el mismo, pero cambian las APIs: en Node no hay `document` ni `window`, y en cambio hay módulos como `fs` o `http` para hablar con el sistema operativo.

**¿Qué diferencia hay entre ESM y CommonJS?**
Son dos sistemas de módulos. CommonJS usa `require` y `module.exports` y es el original de Node. ESM usa `import` y `export`, es el estándar de JavaScript y el que usan los navegadores y Vite. Hoy se prefiere ESM.

**¿Qué diferencia hay entre `dependencies` y `devDependencies`?**
`dependencies` son las librerías que la app necesita para funcionar (por ejemplo Express); `devDependencies` solo se usan al desarrollar (Vitest, ESLint, Vite).

**¿Para qué sirven las variables de entorno?**
Para configurar la app sin cambiar el código (puerto, URL de la base de datos) y para mantener los secretos fuera del repositorio. En Node se leen con `process.env`.
