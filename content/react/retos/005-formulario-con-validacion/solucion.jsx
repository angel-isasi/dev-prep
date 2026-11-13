import { useState } from "react";

// Devuelve un objeto con un mensaje por cada campo inválido.
// Si todo está bien, devuelve {}.
function validar(datos) {
  const errores = {};
  if (!/^\S+@\S+\.\S+$/.test(datos.email)) errores.email = "Ingresa un correo válido";
  if (datos.clave.length < 8) errores.clave = "Mínimo 8 caracteres";
  return errores;
}

export function Registro({ onSubmit }) {
  const [datos, setDatos] = useState({ email: "", clave: "" });
  const [errores, setErrores] = useState({});

  // Un solo manejador para todos los campos: usa el atributo `name`.
  function cambiar(evento) {
    const { name, value } = evento.target;
    setDatos((anteriores) => ({ ...anteriores, [name]: value }));
  }

  function enviar(evento) {
    evento.preventDefault();
    const encontrados = validar(datos);
    setErrores(encontrados);
    if (Object.keys(encontrados).length === 0) onSubmit(datos);
  }

  return (
    <form onSubmit={enviar} noValidate>
      <label htmlFor="email">Correo</label>
      <input
        id="email"
        name="email"
        type="email"
        value={datos.email}
        onChange={cambiar}
        aria-invalid={Boolean(errores.email)}
        aria-describedby="error-email"
      />
      {errores.email && (
        <p id="error-email" role="alert">
          {errores.email}
        </p>
      )}

      <label htmlFor="clave">Contraseña</label>
      <input
        id="clave"
        name="clave"
        type="password"
        value={datos.clave}
        onChange={cambiar}
        aria-invalid={Boolean(errores.clave)}
        aria-describedby="error-clave"
      />
      {errores.clave && (
        <p id="error-clave" role="alert">
          {errores.clave}
        </p>
      )}

      <button>Crear cuenta</button>
    </form>
  );
}
