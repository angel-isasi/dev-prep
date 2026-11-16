// Campo de texto reutilizable: etiqueta, input, ayuda opcional y mensaje de error accesible.
import { useId } from "react";

/**
 * @param {{
 *   label: string,
 *   name: string,
 *   type?: string,
 *   value: string,
 *   error?: string,     mensaje a mostrar ("" o undefined si no hay error)
 *   hint?: string,      ayuda siempre visible debajo del campo
 *   onChange: (event) => void,
 *   onBlur: (event) => void,
 *   autoComplete?: string,
 * }} props
 */
export function TextField({ label, name, type = "text", value, error, hint, onChange, onBlur, autoComplete }) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  // El lector de pantalla lee la ayuda y el error después de la etiqueta.
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`field${error ? " field--invalid" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        onChange={onChange}
        onBlur={onBlur}
      />
      {hint && (
        <p id={hintId} className="field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}
