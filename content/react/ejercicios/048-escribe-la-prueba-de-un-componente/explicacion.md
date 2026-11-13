## Idea clave

Una buena prueba de componente **imita al usuario** (escribe, hace clic, lee lo que aparece) y comprueba el resultado con `expect`. Las funciones que el componente recibe por props se reemplazan por **espías** (`vi.fn()`) para saber si se llamaron y con qué. Y la prueba solo vale si **falla cuando el código está mal**.

## Paso a paso

1. **Prepara** (arrange): crea el espía `onSuscribir = vi.fn()` y un usuario simulado con `userEvent.setup()`. Renderiza el `Boletin` que te pasan con el espía como prop.
2. **Encuentra los elementos como los encuentra una persona**: el input por su etiqueta (`getByLabelText("Correo")`) y el botón por su rol y nombre (`getByRole("button", { name: "Suscribirme" })`). Si un día cambian las clases CSS o la estructura, la prueba sigue funcionando.
3. **Actúa** (act) con el caso inválido: `await usuario.type(campo, "angel")` y `await usuario.click(boton)`. `userEvent` dispara los mismos eventos que un usuario real (teclas, foco, clic, submit del form).
4. **Comprueba** (assert): el alert tiene el texto exacto y el espía **no** se llamó.
5. **Repite con el caso válido**: escribe `@unica.edu.pe` (se agrega a lo que ya había: queda `angel@unica.edu.pe`), envía y comprueba que el espía se llamó **una vez** con el correo completo y que el alert **desapareció** (`queryByRole` devuelve `null` si no lo encuentra, en lugar de lanzar error).

```jsx
import { expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

export async function probarBoletin(Boletin) {
  // 1. Preparar: una función espía en lugar de la real y un "usuario" simulado.
  const onSuscribir = vi.fn();
  const usuario = userEvent.setup();
  render(<Boletin onSuscribir={onSuscribir} />);

  // Buscamos los elementos como los encuentra una persona: por su etiqueta y su rol.
  const campo = screen.getByLabelText("Correo");
  const boton = screen.getByRole("button", { name: "Suscribirme" });

  // 2. Caso inválido: escribe sin "@" y envía.
  await usuario.type(campo, "angel");
  await usuario.click(boton);
  expect(screen.getByRole("alert").textContent).toBe("Ingresa un correo válido");
  expect(onSuscribir).not.toHaveBeenCalled();

  // 3. Caso válido: completa el correo y vuelve a enviar.
  await usuario.type(campo, "@unica.edu.pe");
  await usuario.click(boton);
  expect(onSuscribir).toHaveBeenCalledTimes(1);
  expect(onSuscribir).toHaveBeenCalledWith("angel@unica.edu.pe");
  expect(screen.queryByRole("alert")).toBeNull();
}
```

En un proyecto normal, este mismo código iría dentro de un `test("...", async () => { ... })` en un archivo `Boletin.test.jsx`. Aquí está dentro de una función para que la app pueda correr **tu prueba** contra varias versiones del componente.

## Por qué funciona

Cada `expect` es una trampa para un tipo de error. Así cae cada versión rota:

| Versión del Boletin | Qué pasa en tu prueba | `expect` que falla |
|---|---|---|
| Correcta | Todo se cumple | ninguno: la prueba pasa |
| No muestra el error | `getByRole("alert")` no encuentra nada | `getByRole` lanza "Unable to find role alert" |
| Envía aunque sea inválido | El espía se llamó con `"angel"` | `not.toHaveBeenCalled()` |
| No envía un correo válido | El espía nunca se llamó | `toHaveBeenCalledTimes(1)` |
| Deja el error pegado | El alert sigue en pantalla | `queryByRole("alert")` no es `null` |

Fíjate que el último caso **solo** lo atrapa la última línea. Si no comprobaras que el error desaparece, esa versión rota pasaría tu prueba sin que nadie se entere.

## Errores comunes

- **Olvidar `await` en `usuario.type` o `usuario.click`.** Las acciones de `userEvent` son asíncronas; sin `await`, los `expect` se ejecutan antes de que el usuario termine y la prueba falla (o peor, pasa por casualidad).
- **Renderizar otro componente en vez del que recibes.** Si escribes tu propio formulario dentro de la prueba, siempre pasará y no prueba nada.
- **Usar `getByRole` para comprobar que algo NO está.** `getBy...` lanza error si no encuentra; para "no existe" se usa `queryBy...` + `toBeNull()`.
- **Probar solo el camino feliz.** Si solo pruebas el correo válido, las versiones "no muestra el error" y "envía siempre" pasan tu prueba. Lo reconoces porque fallan los tests de "tu prueba detecta...".
- **Buscar por clases o por `container.querySelector`.** Funciona, pero acopla la prueba a detalles internos. Testing Library recomienda roles, etiquetas y textos.

## Otra forma de resolverlo

Con **`fireEvent`** en lugar de `userEvent`. Es síncrono y más simple, pero menos realista: `fireEvent.change` cambia el valor de golpe y no simula cada tecla ni el foco.

```jsx
import { expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

export async function probarBoletin(Boletin) {
  const onSuscribir = vi.fn();
  render(<Boletin onSuscribir={onSuscribir} />);
  const campo = screen.getByLabelText("Correo");
  const boton = screen.getByRole("button", { name: "Suscribirme" });

  fireEvent.change(campo, { target: { value: "angel" } });
  fireEvent.click(boton);
  expect(screen.getByRole("alert").textContent).toBe("Ingresa un correo válido");
  expect(onSuscribir).not.toHaveBeenCalled();

  fireEvent.change(campo, { target: { value: "angel@unica.edu.pe" } });
  fireEvent.click(boton);
  expect(onSuscribir).toHaveBeenCalledWith("angel@unica.edu.pe");
  expect(screen.queryByRole("alert")).toBeNull();
}
```

**¿Cuándo conviene?** `fireEvent` sirve para pruebas rápidas o eventos que `userEvent` no cubre. Para formularios, Testing Library recomienda `userEvent` porque se parece más a lo que hace una persona (por ejemplo, no puede escribir en un input deshabilitado).

## Cómo explicarlo en la entrevista

> "Pruebo el componente como lo usaría una persona: encuentro el campo por su etiqueta y el botón por su rol, escribo con `userEvent` y hago clic. La prop `onSuscribir` la reemplazo por un espía `vi.fn()` para comprobar si se llamó y con qué datos. Cubro los dos caminos: con un correo inválido debe aparecer el alert y no debe enviarse; con uno válido debe enviarse el correo completo y el error debe desaparecer. Siempre me pregunto si mi prueba fallaría si el código estuviera mal; por eso compruebo también lo que NO debe pasar."

## Conceptos

- **Arrange, act, assert**: preparar, actuar y comprobar; la estructura de casi toda prueba.
- **`render` y `screen`**: dibujan el componente en un DOM falso (jsdom) y permiten buscar en él.
- **Consultas por rol y etiqueta**: `getByRole`, `getByLabelText`; las preferidas porque son accesibles.
- **`getBy` vs `queryBy`**: `getBy` lanza error si no encuentra; `queryBy` devuelve `null`.
- **`userEvent`**: simula interacciones reales del usuario; sus métodos son asíncronos.
- **`vi.fn()`**: función espía; `toHaveBeenCalled`, `toHaveBeenCalledTimes`, `toHaveBeenCalledWith`.
- **Probar comportamiento, no implementación**: la prueba no sabe que existe `useState`.
- **Una prueba que nunca falla no sirve**: hay que cubrir también los casos de error.
