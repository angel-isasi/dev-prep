import { useState } from "react";

// Copia el cliente y la dirección (el camino hasta el dato);
// todo lo demás se comparte con el original.
export function cambiarDistrito(cliente, distrito) {
  return {
    ...cliente,
    direccion: { ...cliente.direccion, distrito },
  };
}

export function PerfilCliente({ clienteInicial }) {
  const [cliente, setCliente] = useState(clienteInicial);

  return (
    <div>
      <p>
        {cliente.nombre} vive en {cliente.direccion.distrito}
      </p>
      <input
        aria-label="Distrito"
        value={cliente.direccion.distrito}
        onChange={(evento) => {
          const distrito = evento.target.value;
          setCliente((actual) => cambiarDistrito(actual, distrito));
        }}
      />
    </div>
  );
}
