// @vitest-environment jsdom
import { expect, test, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App.jsx";
import { TaskItem } from "../src/components/TaskItem.jsx";
import { Summary } from "../src/components/Summary.jsx";
import { initialTasks } from "../src/data.js";

const PENDIENTE = { id: 7, title: "Repasar closures", topic: "JavaScript", done: false };
const HECHA = { id: 8, title: "Leer sobre useState", topic: "React", done: true };
const primeraPendiente = initialTasks.find((t) => !t.done);

const casillaDe = (titulo) => screen.getByRole("checkbox", { name: titulo });

function leerResumen() {
  const [hechas, , total] = screen.getByText(/de \d+ hechas$/).textContent.split(" ");
  return { hechas: Number(hechas), total: Number(total) };
}

test("la casilla de cada tarea se llama como la tarea y refleja si está hecha", () => {
  render(
    <ul>
      <TaskItem task={PENDIENTE} />
      <TaskItem task={HECHA} />
    </ul>,
  );
  expect(casillaDe("Repasar closures").checked).toBe(false);
  expect(casillaDe("Leer sobre useState").checked).toBe(true);
});

test("al hacer clic en la casilla llama a onToggle con el id de la tarea", async () => {
  const user = userEvent.setup();
  const onToggle = vi.fn();
  render(
    <ul>
      <TaskItem task={PENDIENTE} onToggle={onToggle} />
    </ul>,
  );
  await user.click(casillaDe("Repasar closures"));
  expect(onToggle).toHaveBeenCalledTimes(1);
  expect(onToggle).toHaveBeenCalledWith(7);
});

test('Summary muestra cuántas tareas están hechas, por ejemplo "1 de 2 hechas"', () => {
  render(<Summary tasks={[PENDIENTE, HECHA]} />);
  expect(screen.getByText("1 de 2 hechas")).toBeTruthy();
});

test('Summary con una lista vacía muestra "0 de 0 hechas"', () => {
  render(<Summary tasks={[]} />);
  expect(screen.getByText("0 de 0 hechas")).toBeTruthy();
});

test("en App, marcar una tarea pendiente la deja hecha y desmarcarla la devuelve a pendiente", async () => {
  const user = userEvent.setup();
  render(<App />);
  const casilla = await screen.findByRole("checkbox", { name: primeraPendiente.title });
  expect(casilla.checked).toBe(false);

  await user.click(casilla);
  await waitFor(() => expect(casillaDe(primeraPendiente.title).checked).toBe(true));

  await user.click(casillaDe(primeraPendiente.title));
  await waitFor(() => expect(casillaDe(primeraPendiente.title).checked).toBe(false));
});

test("en App, el resumen sube en 1 al marcar una tarea pendiente", async () => {
  const user = userEvent.setup();
  render(<App />);
  await screen.findByRole("checkbox", { name: primeraPendiente.title });
  const antes = leerResumen();

  await user.click(casillaDe(primeraPendiente.title));
  await waitFor(() => expect(leerResumen()).toEqual({ hechas: antes.hechas + 1, total: antes.total }));

  // La dejamos como estaba
  await user.click(casillaDe(primeraPendiente.title));
  await waitFor(() => expect(leerResumen()).toEqual(antes));
});
