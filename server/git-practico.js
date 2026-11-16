// Git práctico: situaciones reales con un repositorio de verdad en tu laptop.
//
// Cada escenario (content/git/escenarios.json) dice cómo PREPARAR el repositorio (archivos, commits,
// ramas, un "remoto" y los cambios de un "compañero") y cómo VERIFICAR que lo resolviste
// (rama actual, commits, archivos, conflictos, remoto sincronizado...). Tú lo resuelves en la terminal.
//
// Carpetas (fuera del repositorio de dev-prep): Documentos/dev-prep-git/<id>/
//   <id>/          tu repositorio de trabajo
//   <id>-origen/   el "remoto" (un repositorio bare, como GitHub)
//   <id>-companero/ el clon de tu compañero imaginario
import { execFile } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const ejecutar = promisify(execFile);

export const carpetaGit = () => path.join(os.homedir(), "Documents", "dev-prep-git");

/** Lo que haga el "sistema" (preparar) queda firmado así, para no usar tu nombre. */
const AUTOR = {
  GIT_AUTHOR_NAME: "dev-prep",
  GIT_AUTHOR_EMAIL: "practica@dev-prep.local",
  GIT_COMMITTER_NAME: "dev-prep",
  GIT_COMMITTER_EMAIL: "practica@dev-prep.local",
};
const COMPANERO = {
  GIT_AUTHOR_NAME: "Lucía (compañera)",
  GIT_AUTHOR_EMAIL: "lucia@equipo.local",
  GIT_COMMITTER_NAME: "Lucía (compañera)",
  GIT_COMMITTER_EMAIL: "lucia@equipo.local",
};

/** Corre git en una carpeta y devuelve su salida sin espacios al final. */
export async function git(cwd, args, env = {}) {
  const { stdout } = await ejecutar("git", args, {
    cwd,
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0", GIT_EDITOR: "true", ...env },
    windowsHide: true,
    maxBuffer: 4 * 1024 * 1024,
  });
  return stdout.trimEnd();
}

const intentar = (promesa) =>
  promesa.then(
    (v) => v,
    () => null,
  );

/** Lee los escenarios (sin las instrucciones internas de preparar y verificar si se piden "públicos"). */
export async function cargarEscenarios(contenidoDir) {
  const ruta = path.join(contenidoDir, "git", "escenarios.json");
  const { escenarios } = JSON.parse(await readFile(ruta, "utf8"));
  return escenarios;
}

/** Evita que una ruta de un escenario salga de su carpeta. */
function dentro(carpeta, relativa) {
  const destino = path.resolve(carpeta, relativa);
  if (!destino.startsWith(path.resolve(carpeta) + path.sep)) throw new Error(`Ruta fuera del repositorio: ${relativa}`);
  return destino;
}

/** Ejecuta una lista de operaciones de preparación en un repositorio. */
async function aplicar(carpeta, ops, rutas, env) {
  for (const op of ops) {
    if (op.op === "archivo") {
      const destino = dentro(carpeta, op.ruta);
      await mkdir(path.dirname(destino), { recursive: true });
      await writeFile(destino, op.contenido);
    } else if (op.op === "borrar") {
      await rm(dentro(carpeta, op.ruta), { force: true });
    } else if (op.op === "add") {
      await git(carpeta, ["add", ...(op.rutas ?? ["-A"])], env);
    } else if (op.op === "commit") {
      await git(carpeta, ["add", "-A"], env);
      await git(carpeta, ["commit", "-q", "--allow-empty", "-m", op.mensaje], env);
    } else if (op.op === "rama") {
      await git(carpeta, ["switch", "-q", "-c", op.nombre], env);
    } else if (op.op === "cambiar") {
      await git(carpeta, ["switch", "-q", op.rama], env);
    } else if (op.op === "remoto") {
      // Un repositorio "bare" hace de GitHub: tu repo lo tiene como origin
      await git(path.dirname(rutas.origen), ["init", "-q", "--bare", "-b", "main", rutas.origen]);
      await git(carpeta, ["remote", "add", "origin", rutas.origen], env);
      await git(carpeta, ["push", "-q", "-u", "origin", "--all"], env);
    } else if (op.op === "companero") {
      // Tu compañera clona, hace sus cambios y los sube: tú todavía no los tienes
      if (!existsSync(rutas.companero)) await git(path.dirname(rutas.companero), ["clone", "-q", rutas.origen, rutas.companero]);
      await aplicar(rutas.companero, op.pasos, rutas, COMPANERO);
      await git(rutas.companero, ["push", "-q", "origin", "HEAD"], COMPANERO);
    } else if (op.op === "git") {
      // Para casos especiales (por ejemplo, dejar un merge a medias). Solo git, nunca otra cosa.
      await intentar(git(carpeta, op.args, env));
    } else {
      throw new Error(`Operación desconocida: ${op.op}`);
    }
  }
}

/**
 * Crea el repositorio del escenario desde cero (si ya existía, lo borra: es "reiniciar").
 * @returns {Promise<string>} la carpeta del repositorio
 */
export async function prepararEscenario(escenario, raiz = carpetaGit()) {
  const rutas = rutasDe(escenario.id, raiz);
  await Promise.all([rutas.repo, rutas.origen, rutas.companero].map((r) => rm(r, { recursive: true, force: true })));
  await mkdir(rutas.repo, { recursive: true });
  await git(rutas.repo, ["init", "-q", "-b", "main"]);
  // Que tu primer commit no falle si nunca configuraste git en esta laptop
  const nombre = await intentar(git(rutas.repo, ["config", "user.name"]));
  if (!nombre) {
    await git(rutas.repo, ["config", "user.name", "Tu nombre"]);
    await git(rutas.repo, ["config", "user.email", "tu@correo.local"]);
  }
  await git(rutas.repo, ["config", "core.autocrlf", "false"]);
  await aplicar(rutas.repo, escenario.preparar ?? [], rutas, AUTOR);
  return rutas.repo;
}

export function rutasDe(id, raiz = carpetaGit()) {
  if (!/^git-\d{2}$/.test(id)) throw new Error("Escenario inválido");
  return { repo: path.join(raiz, id), origen: path.join(raiz, `${id}-origen`), companero: path.join(raiz, `${id}-companero`) };
}

const hash = (cwd, ref) => intentar(git(cwd, ["rev-parse", "--verify", "-q", ref]));

/** Revisa una condición. Devuelve true o false (nunca lanza: si algo no existe, es false). */
async function revisar(c, { repo, origen }) {
  const archivo = async (ruta) => intentar(readFile(dentro(repo, ruta), "utf8"));
  switch (c.tipo) {
    case "limpio":
      return (await git(repo, ["status", "--porcelain"])) === "";
    case "rama-actual":
      return (await intentar(git(repo, ["branch", "--show-current"]))) === c.rama;
    case "rama-existe":
      return (await hash(repo, `refs/heads/${c.rama}`)) != null;
    case "rama-no-existe":
      return (await hash(repo, `refs/heads/${c.rama}`)) == null;
    case "commits": {
      const n = Number(await intentar(git(repo, ["rev-list", "--count", c.rama ?? "HEAD"])));
      return c.exactos != null ? n === c.exactos : n >= (c.min ?? 1);
    }
    case "ultimo-mensaje":
      return new RegExp(c.patron, "i").test((await intentar(git(repo, ["log", "-1", "--format=%s", c.rama ?? "HEAD"]))) ?? "");
    case "algun-mensaje":
      return new RegExp(c.patron, "i").test((await intentar(git(repo, ["log", "--format=%s", c.rama ?? "HEAD"]))) ?? "");
    case "archivo-contiene":
      return (await archivo(c.ruta))?.includes(c.busca) ?? false;
    case "archivo-no-contiene": {
      const t = await archivo(c.ruta);
      return t != null && !t.includes(c.busca);
    }
    case "commit-sin": {
      // La versión del archivo guardada en el último commit NO tiene ese texto
      const enCommit = await intentar(git(repo, ["show", `HEAD:${c.ruta}`]));
      return enCommit != null && !enCommit.includes(c.busca);
    }
    case "upstream":
      return (await intentar(git(repo, ["rev-parse", "--abbrev-ref", `${c.rama}@{upstream}`]))) === `origin/${c.rama}`;
    case "archivo-igual":
      return (await archivo(c.ruta)) === c.contenido;
    case "sin-marcadores": {
      const salida = await intentar(git(repo, ["grep", "-n", "-E", "^(<<<<<<<|>>>>>>>|=======$)"]));
      return !salida;
    }
    case "en-commit":
      return (await intentar(git(repo, ["ls-files", "--error-unmatch", c.ruta]))) != null;
    case "no-rastreado":
      return !(await intentar(git(repo, ["ls-files", c.ruta])));
    case "ignorado":
      return (await intentar(git(repo, ["check-ignore", "-q", c.ruta]))) != null;
    case "merge": {
      const padres = (await intentar(git(repo, ["rev-list", "--parents", "-n", "1", c.rama ?? "HEAD"])))?.split(" ") ?? [];
      return padres.length >= 3;
    }
    case "sincronizado": {
      const [local, remoto] = await Promise.all([hash(repo, `refs/heads/${c.rama}`), hash(origen, `refs/heads/${c.rama}`)]);
      return local != null && local === remoto;
    }
    case "remoto-tiene-rama":
      return (await hash(origen, `refs/heads/${c.rama}`)) != null;
    case "contiene-a": {
      // La rama c.rama incluye el commit de la punta de c.otra (por ejemplo, ya hiciste pull o merge)
      const otra = c.remoto ? await hash(origen, `refs/heads/${c.otra}`) : await hash(repo, `refs/heads/${c.otra}`);
      if (!otra) return false;
      return (await intentar(git(repo, ["merge-base", "--is-ancestor", otra, c.rama ?? "HEAD"]))) != null;
    }
    case "stash-vacio":
      return (await intentar(git(repo, ["stash", "list"]))) === "";
    case "sin-merge-pendiente":
      return !existsSync(path.join(repo, ".git", "MERGE_HEAD"));
    default:
      return false;
  }
}

/**
 * Verifica el escenario: cada condición con su texto y si se cumple.
 * @returns {Promise<{ listo: boolean, condiciones: { texto: string, ok: boolean }[], existe: boolean }>}
 */
export async function verificarEscenario(escenario, raiz = carpetaGit()) {
  const rutas = rutasDe(escenario.id, raiz);
  if (!existsSync(path.join(rutas.repo, ".git"))) return { existe: false, listo: false, condiciones: [] };
  const condiciones = [];
  for (const c of escenario.verificar ?? []) {
    condiciones.push({ texto: c.texto, ok: await revisar(c, rutas).catch(() => false) });
  }
  return { existe: true, listo: condiciones.length > 0 && condiciones.every((c) => c.ok), condiciones };
}

/** Aplica la solución oficial del escenario (la usan los tests para comprobar que se puede resolver). */
export async function aplicarSolucion(escenario, raiz = carpetaGit()) {
  const rutas = rutasDe(escenario.id, raiz);
  await aplicar(rutas.repo, escenario.solucion ?? [], rutas, AUTOR);
}

/** Lo que ve la pantalla: sin las instrucciones internas de preparar, verificar y la solución (solo sus textos). */
export const escenarioPublico = ({ preparar: _p, solucion: _s, verificar, ...e }) => ({
  ...e,
  condiciones: (verificar ?? []).map((c) => c.texto),
});
