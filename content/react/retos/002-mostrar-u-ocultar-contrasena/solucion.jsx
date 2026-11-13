import { useState } from "react";

export function CampoClave() {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor="clave">Contraseña</label>
      <input id="clave" type={visible ? "text" : "password"} />
      <button
        type="button"
        aria-pressed={visible}
        onClick={() => setVisible((anterior) => !anterior)}
      >
        {visible ? "Ocultar" : "Mostrar"}
      </button>
    </div>
  );
}
