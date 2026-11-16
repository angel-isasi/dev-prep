// Formulario de registro de Wayra Pagos.
import { registerUser } from "../api.js";
import { TextField } from "./TextField.jsx";

/** @param {{ onSuccess: (email: string) => void }} props */
export function RegisterForm({ onSuccess }) {
  // TODO: estado de los valores { email, password, confirm, acceptedTerms }.
  // TODO: estado de los campos "tocados" (los que ya perdieron el foco al menos una vez).
  // TODO: los errores se CALCULAN con validate() de ../lib/validation.js (estado derivado),
  //       y solo se muestran en los campos tocados.
  // TODO: estado del envío: si se está enviando y el mensaje de error del servidor.
  // TODO: al enviar: evita el envío por defecto, llama a registerUser({ email (sin espacios), password }),
  //       muestra "Enviando..." mientras espera y, si sale bien, llama a onSuccess(email).
  void registerUser;
  void onSuccess;

  return (
    <form noValidate>
      <TextField label="Correo electrónico" />
      <TextField label="Contraseña" />
      <TextField label="Confirmar contraseña" />
      {/* TODO: checkbox "Acepto los términos y condiciones" */}
      {/* TODO: error del servidor con role="alert" */}
      <button type="submit">Crear cuenta</button>
    </form>
  );
}
