import { useState, type ChangeEvent, type SubmitEvent } from "react";

export type Formulario = {
  nombre: string;
  email: string;
  password: string;
};

// Como mucho un mensaje por campo.
export type ErroresFormulario = Partial<Record<keyof Formulario, string>>;

type Props = {
  onRegistrar: (datos: Formulario) => void;
};

const VACIO: Formulario = { nombre: "", email: "", password: "" };

// Función pura: fácil de probar sin pintar nada.
export function validarFormulario(datos: Formulario): ErroresFormulario {
  const errores: ErroresFormulario = {};
  if (datos.nombre.trim() === "") errores.nombre = "El nombre es obligatorio";
  if (!/^\S+@\S+\.\S+$/.test(datos.email)) errores.email = "El email no es válido";
  if (datos.password.length < 8) errores.password = "La contraseña debe tener al menos 8 caracteres";
  return errores;
}

export function FormularioRegistro({ onRegistrar }: Props) {
  const [datos, setDatos] = useState<Formulario>(VACIO);
  const [errores, setErrores] = useState<ErroresFormulario>({});

  // Un solo manejador para los tres inputs: el atributo `name` dice qué campo cambia.
  function manejarCambio(e: ChangeEvent<HTMLInputElement>) {
    const campo = e.target.name as keyof Formulario;
    const valor = e.target.value;
    setDatos((anterior) => ({ ...anterior, [campo]: valor }));
  }

  function manejarEnvio(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault(); // sin esto, el navegador recarga la página
    const nuevosErrores = validarFormulario(datos);
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length === 0) onRegistrar(datos);
  }

  return (
    <form onSubmit={manejarEnvio} noValidate>
      <label htmlFor="nombre">Nombre</label>
      <input id="nombre" name="nombre" value={datos.nombre} onChange={manejarCambio} />
      {errores.nombre && <p>{errores.nombre}</p>}

      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" value={datos.email} onChange={manejarCambio} />
      {errores.email && <p>{errores.email}</p>}

      <label htmlFor="password">Contraseña</label>
      <input id="password" name="password" type="password" value={datos.password} onChange={manejarCambio} />
      {errores.password && <p>{errores.password}</p>}

      <button type="submit">Registrarme</button>
    </form>
  );
}
