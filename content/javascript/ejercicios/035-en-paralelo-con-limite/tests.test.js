import { test, expect, vi, afterEach } from "vitest";
import { conLimite } from "./solucion.js";

afterEach(() => {
  vi.useRealTimers();
});

// Crea tareas que cuentan cuántas hay corriendo a la vez y anotan el máximo.
function crearContador() {
  const estado = { activas: 0, maximo: 0, registro: [] };
  const tarea = (valor, ms) => async () => {
    estado.activas++;
    estado.maximo = Math.max(estado.maximo, estado.activas);
    estado.registro.push(`empieza ${valor}`);
    await new Promise((resolver) => setTimeout(resolver, ms));
    estado.registro.push(`termina ${valor}`);
    estado.activas--;
    return valor;
  };
  return { estado, tarea };
}

test("devuelve los resultados en el orden original, aunque terminen en otro orden", async () => {
  const { tarea } = crearContador();
  const resultado = await conLimite([tarea("a", 40), tarea("b", 5), tarea("c", 20), tarea("d", 5)], 2);
  expect(resultado).toEqual(["a", "b", "c", "d"]);
});

test("nunca corre más tareas que el límite, pero sí aprovecha el límite", async () => {
  const { estado, tarea } = crearContador();
  await conLimite([tarea(1, 10), tarea(2, 10), tarea(3, 10), tarea(4, 10), tarea(5, 10)], 2);
  expect(estado.maximo).toBe(2);

  const otro = crearContador();
  await conLimite([otro.tarea(1, 10), otro.tarea(2, 10), otro.tarea(3, 10), otro.tarea(4, 10)], 3);
  expect(otro.estado.maximo).toBe(3);
});

test("apenas una termina, empieza la siguiente (no espera al grupo)", async () => {
  vi.useFakeTimers();
  const { estado, tarea } = crearContador();
  const promesa = conLimite([tarea("A", 100), tarea("B", 10), tarea("C", 10), tarea("D", 10)], 2);

  await vi.advanceTimersByTimeAsync(30);
  // A los 30 ms, A (100 ms) sigue corriendo, pero B, C y D ya pasaron por el otro "carril".
  expect(estado.registro).toEqual([
    "empieza A",
    "empieza B",
    "termina B",
    "empieza C",
    "termina C",
    "empieza D",
    "termina D",
  ]);

  await vi.advanceTimersByTimeAsync(70);
  expect(await promesa).toEqual(["A", "B", "C", "D"]);
});

test("si el límite es mayor que la cantidad de tareas, corren todas a la vez", async () => {
  const { estado, tarea } = crearContador();
  expect(await conLimite([tarea(1, 10), tarea(2, 10), tarea(3, 10)], 10)).toEqual([1, 2, 3]);
  expect(estado.maximo).toBe(3);
});

test("con una lista vacía devuelve []", async () => {
  expect(await conLimite([], 3)).toEqual([]);
});
