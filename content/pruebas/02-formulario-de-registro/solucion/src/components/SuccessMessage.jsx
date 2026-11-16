// Confirmación después de registrarse.
import { useEffect, useRef } from "react";

/** @param {{ email: string }} props */
export function SuccessMessage({ email }) {
  const headingRef = useRef(null);

  // El formulario desaparece: movemos el foco al título para que el lector de pantalla lo anuncie
  // y quien navega con teclado no quede "perdido".
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <section className="success">
      <h2 ref={headingRef} tabIndex={-1}>
        ¡Cuenta creada!
      </h2>
      <p>Te enviamos un correo de confirmación a {email}.</p>
    </section>
  );
}
