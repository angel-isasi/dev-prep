// Escribe la prueba de un componente
//
// Esta vez no programas el componente: escribes SU PRUEBA. Completa
// `probarBoletin(Boletin)`: renderiza el Boletin que recibe, simula a un
// usuario y usa `expect` para comprobar que se porta bien. Si algo está mal,
// un `expect` falla (lanza un error) y eso es justo lo que queremos.
//
// Los tests de la app corren tu prueba contra el Boletin correcto (debe pasar)
// y contra versiones con errores (tu prueba debe detectarlas).
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

export async function probarBoletin(Boletin) {
  // Tu prueba aquí
}
