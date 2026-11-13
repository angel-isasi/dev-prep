import { useState } from "react";

// Función pura: no sabe nada de React. Recibe los datos y devuelve los errores.
export function validarPedido({ nombre, telefono }) {
  const errores = {};
  if (nombre.trim().length < 3) {
    errores.nombre = "Escribe tu nombre completo";
  }
  if (!/^9\d{8}$/.test(telefono.replace(/\s/g, ""))) {
    errores.telefono = "El celular debe tener 9 dígitos y empezar con 9";
  }
  return errores;
}

export function FormularioPedido() {
  const [datos, setDatos] = useState({ nombre: "", telefono: "", tamano: "M" });
  const [errores, setErrores] = useState({});
  const [enviado, setEnviado] = useState(false);

  // Un solo manejador para todos los campos: usa el atributo name del input.
  const cambiar = (evento) =>
    setDatos((anteriores) => ({ ...anteriores, [evento.target.name]: evento.target.value }));

  function enviar(evento) {
    evento.preventDefault();
    const encontrados = validarPedido(datos);
    setErrores(encontrados);
    setEnviado(Object.keys(encontrados).length === 0);
  }

  if (enviado) {
    return (
      <p>
        Listo, {datos.nombre.trim()}. Tu pizza {datos.tamano} está en camino y te llamaremos al{" "}
        {datos.telefono}.
      </p>
    );
  }

  return (
    <form onSubmit={enviar} noValidate>
      <label htmlFor="nombre">Nombre</label>
      <input
        id="nombre"
        name="nombre"
        value={datos.nombre}
        onChange={cambiar}
        aria-invalid={Boolean(errores.nombre)}
      />
      {errores.nombre && <p role="alert">{errores.nombre}</p>}

      <label htmlFor="telefono">Celular</label>
      <input
        id="telefono"
        name="telefono"
        inputMode="numeric"
        value={datos.telefono}
        onChange={cambiar}
        aria-invalid={Boolean(errores.telefono)}
      />
      {errores.telefono && <p role="alert">{errores.telefono}</p>}

      <label htmlFor="tamano">Tamaño</label>
      <select id="tamano" name="tamano" value={datos.tamano} onChange={cambiar}>
        <option value="M">Mediana</option>
        <option value="L">Familiar</option>
      </select>

      <button type="submit">Hacer pedido</button>
    </form>
  );
}
