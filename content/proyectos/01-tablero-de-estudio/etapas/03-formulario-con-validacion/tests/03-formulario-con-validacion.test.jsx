// @vitest-environment jsdom
import { expect, test, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App.jsx";
import { TaskForm } from "../src/components/TaskForm.jsx";

function armarFormulario() {
  const onAdd = vi.fn();
  const user = userEvent.setup();
  render(<TaskForm onAdd={onAdd} />);
  return { onAdd, user, campo: screen.getByLabelText("Tarea") };
}

const agregar = () => screen.getByRole("button", { name: "Agregar" });

test("con el título vacío muestra un error y no llama a onAdd", async () => {
  const { onAdd, user } = armarFormulario();
  await user.click(agregar());
  expect((await screen.findByRole("alert")).textContent).toBe("Escribe un título para la tarea");
  expect(onAdd).not.toHaveBeenCalled();
});

test("un título con solo espacios cuenta como vacío", async () => {
  const { onAdd, user, campo } = armarFormulario();
  await user.type(campo, "    ");
  await user.click(agregar());
  expect((await screen.findByRole("alert")).textContent).toBe("Escribe un título para la tarea");
  expect(onAdd).not.toHaveBeenCalled();
});

test("con menos de 3 caracteres muestra el error de longitud", async () => {
  const { onAdd, user, campo } = armarFormulario();
  await user.type(campo, "JS");
  await user.click(agregar());
  expect((await screen.findByRole("alert")).textContent).toBe("El título debe tener al menos 3 caracteres");
  expect(onAdd).not.toHaveBeenCalled();
});

test("con más de 80 caracteres muestra el error de longitud máxima", async () => {
  const { onAdd, user, campo } = armarFormulario();
  await user.type(campo, "a".repeat(81));
  await user.click(agregar());
  expect((await screen.findByRole("alert")).textContent).toBe("El título no puede pasar de 80 caracteres");
  expect(onAdd).not.toHaveBeenCalled();
});

test("con un título válido llama a onAdd con el título limpio y el tema elegido (también con Enter)", async () => {
  const { onAdd, user, campo } = armarFormulario();
  await user.selectOptions(screen.getByLabelText("Tema"), "React");
  await user.type(campo, "  Repasar useEffect  {Enter}");
  expect(onAdd).toHaveBeenCalledTimes(1);
  expect(onAdd).toHaveBeenCalledWith({ title: "Repasar useEffect", topic: "React" });
});

test("después de agregar vacía el campo y quita el error anterior", async () => {
  const { user, campo } = armarFormulario();
  await user.click(agregar());
  expect(await screen.findByRole("alert")).toBeTruthy();

  await user.type(campo, "Leer sobre promesas");
  await user.click(agregar());
  await waitFor(() => expect(campo.value).toBe(""));
  expect(screen.queryByRole("alert")).toBeNull();
});

test("en App, la tarea nueva aparece en la lista como pendiente", async () => {
  const user = userEvent.setup();
  render(<App />);
  await screen.findAllByRole("listitem"); // espera a que la lista esté lista
  await user.type(screen.getByLabelText("Tarea"), "Estudiar async y await");
  await user.click(agregar());
  const casilla = await screen.findByRole("checkbox", { name: "Estudiar async y await" });
  expect(casilla.checked).toBe(false);
});
