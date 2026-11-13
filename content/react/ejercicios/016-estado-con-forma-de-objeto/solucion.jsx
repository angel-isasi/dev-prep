import { useState } from "react";

export function ArmarPizza() {
  const [pizza, setPizza] = useState({ tipo: "margarita", tamano: "M" });

  // Un solo manejador: `name` dice qué campo cambió.
  function cambiar(evento) {
    const { name, value } = evento.target;
    setPizza((anterior) => ({ ...anterior, [name]: value }));
  }

  return (
    <form>
      <select aria-label="Tipo" name="tipo" value={pizza.tipo} onChange={cambiar}>
        <option value="margarita">Margarita</option>
        <option value="pepperoni">Pepperoni</option>
      </select>

      <select aria-label="Tamaño" name="tamano" value={pizza.tamano} onChange={cambiar}>
        <option value="M">Mediana</option>
        <option value="L">Familiar</option>
      </select>

      <p>
        {pizza.tipo} {pizza.tamano}
      </p>
    </form>
  );
}
