// Formulario de registro de Wayra Pagos.
import { useState } from "react";
import { registerUser } from "../api.js";
import { PASSWORD_HINT, validate } from "../lib/validation.js";
import { TextField } from "./TextField.jsx";

const INITIAL_VALUES = { email: "", password: "", confirm: "", acceptedTerms: false };

/** @param {{ onSuccess: (email: string) => void }} props */
export function RegisterForm({ onSuccess }) {
  const [values, setValues] = useState(INITIAL_VALUES);
  // Campos que ya perdieron el foco: solo ellos muestran errores (no regañamos antes de tiempo).
  const [touched, setTouched] = useState({ email: false, password: false, confirm: false });
  const [status, setStatus] = useState("idle"); // "idle" | "submitting"
  const [serverError, setServerError] = useState("");

  // Estado derivado: los errores se calculan en cada render a partir de los valores.
  const errors = validate(values);
  const isValid = !errors.email && !errors.password && !errors.confirm && values.acceptedTerms;
  const isSubmitting = status === "submitting";

  const visibleError = (field) => (touched[field] ? errors[field] : "");

  function handleChange(event) {
    const { name, type, value, checked } = event.target;
    setValues((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  function handleBlur(event) {
    const { name } = event.target;
    setTouched((current) => ({ ...current, [name]: true }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    // El botón ya está deshabilitado, pero Enter en un campo también envía el formulario.
    if (!isValid || isSubmitting) return;

    const email = values.email.trim();
    setStatus("submitting");
    setServerError("");
    try {
      await registerUser({ email, password: values.password });
      onSuccess(email);
    } catch (error) {
      setServerError(error.message);
      setStatus("idle");
    }
  }

  return (
    <form className="register-form" noValidate onSubmit={handleSubmit}>
      {/* fieldset disabled bloquea todos los campos y el botón mientras se envía */}
      <fieldset disabled={isSubmitting}>
        <TextField
          label="Correo electrónico"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          error={visibleError("email")}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        <TextField
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          hint={PASSWORD_HINT}
          error={visibleError("password")}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        <TextField
          label="Confirmar contraseña"
          name="confirm"
          type="password"
          autoComplete="new-password"
          value={values.confirm}
          error={visibleError("confirm")}
          onChange={handleChange}
          onBlur={handleBlur}
        />

        <label className="checkbox">
          <input type="checkbox" name="acceptedTerms" checked={values.acceptedTerms} onChange={handleChange} />
          Acepto los términos y condiciones
        </label>

        {serverError && (
          <p className="register-form__server-error" role="alert">
            {serverError}
          </p>
        )}

        <button type="submit" disabled={!isValid || isSubmitting}>
          {isSubmitting ? "Enviando..." : "Crear cuenta"}
        </button>
      </fieldset>
    </form>
  );
}
