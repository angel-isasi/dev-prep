// Formulario de registro tipado
//
// Formulario con Nombre, Email y Contraseña. Al enviarlo se valida: si hay
// errores se muestran debajo de cada campo; si no, se llama a onRegistrar
// con los datos. Tipa el estado, los eventos y la validación.
//
//   <FormularioRegistro onRegistrar={(datos) => console.log(datos.email)} />
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useState, type ChangeEvent, type SubmitEvent } from "react";

export type Formulario = {
  // Tu código aquí: nombre, email y password
};

// Cambia el `any`: como mucho un texto de error por cada campo de Formulario.
export type ErroresFormulario = any;

export function validarFormulario(datos: Formulario): ErroresFormulario {
  // Tu código aquí
  return {};
}

// Cambia el `any` del parámetro de onRegistrar.
export function FormularioRegistro({ onRegistrar }: { onRegistrar: (datos: any) => void }) {
  // Tu código aquí
  return null;
}
