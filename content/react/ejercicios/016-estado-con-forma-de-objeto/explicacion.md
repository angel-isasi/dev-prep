## Idea clave

Con `useState`, el setter **reemplaza** el estado completo; no mezcla objetos. Para cambiar un campo hay que crear un objeto **nuevo** copiando el anterior con spread y pisando solo ese campo: `{ ...anterior, [name]: value }`. Con la **propiedad calculada** `[name]`, un solo manejador sirve para todos los campos.

## Paso a paso

1. **Estado como objeto.** `useState({ tipo: "margarita", tamano: "M" })`. Agrupa datos que van juntos (la pizza que se está armando).
2. **Cada select dice qué campo es.** `name="tipo"` y `name="tamano"` coinciden con las claves del objeto. Ese `name` llega al manejador en `evento.target.name`.
3. **Un solo manejador.** En `cambiar`, sacas `name` y `value` del elemento que cambió.
4. **Copia y pisa.** `setPizza((anterior) => ({ ...anterior, [name]: value }))`:
   - `...anterior` copia todos los campos actuales al objeto nuevo.
   - `[name]: value` agrega o pisa la propiedad cuyo nombre es el **valor** de `name`. Si `name` es `"tipo"`, equivale a `tipo: value`.
   - Los paréntesis alrededor de `{ }` hacen que la flecha devuelva el objeto (sin ellos, JavaScript cree que es el cuerpo de la función).
5. **Selects controlados.** `value={pizza.tipo}` y `value={pizza.tamano}`: lo que se ve sale del estado.

```jsx
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
```

## Por qué funciona

Recorrido eligiendo Pepperoni y luego Familiar:

| Acción | `name` / `value` | Objeto nuevo | Se pinta |
|---|---|---|---|
| Primer render | (sin evento) | `{ tipo: "margarita", tamano: "M" }` | margarita M |
| Elige Pepperoni | `"tipo"` / `"pepperoni"` | `{ tipo: "pepperoni", tamano: "M" }` | pepperoni M |
| Elige Familiar | `"tamano"` / `"L"` | `{ tipo: "pepperoni", tamano: "L" }` | pepperoni L |

En cada paso, `...anterior` trae el campo que **no** cambió. Además, el objeto es **nuevo** (otra referencia en memoria): React compara el estado viejo con el nuevo con `Object.is`, ve que son distintos y vuelve a renderizar.

## Errores comunes

- **Pasar solo el campo que cambió**: `setPizza({ tipo: value })`. El estado queda `{ tipo: "pepperoni" }` y el tamaño desaparece: el párrafo muestra `pepperoni ` sin tamaño y el select de tamaño pierde su valor.
- **Mutar el objeto**: `pizza.tipo = value; setPizza(pizza)`. Es el mismo objeto, React ve que la referencia no cambió y **no vuelve a renderizar**. Lo reconoces porque la pantalla no se actualiza.
- **Escribir `{ ...anterior, name: value }`** sin corchetes. Crea una propiedad llamada literalmente `"name"` en vez de `tipo` o `tamano`.
- **Olvidar el `name` en los selects.** `evento.target.name` llega vacío (`""`) y se guarda una propiedad `""` que nadie lee.
- **Olvidar los paréntesis**: `(anterior) => { ...anterior, [name]: value }`. JavaScript interpreta las llaves como bloque de código y da error de sintaxis o devuelve `undefined`.

## Otra forma de resolverlo

Dos estados separados, uno por campo:

```jsx
import { useState } from "react";

export function ArmarPizza() {
  const [tipo, setTipo] = useState("margarita");
  const [tamano, setTamano] = useState("M");

  return (
    <form>
      <select aria-label="Tipo" name="tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
        <option value="margarita">Margarita</option>
        <option value="pepperoni">Pepperoni</option>
      </select>
      <select aria-label="Tamaño" name="tamano" value={tamano} onChange={(e) => setTamano(e.target.value)}>
        <option value="M">Mediana</option>
        <option value="L">Familiar</option>
      </select>
      <p>{tipo} {tamano}</p>
    </form>
  );
}
```

**¿Cuándo conviene?** Con dos o tres campos independientes, estados separados son más simples y no tienes que pensar en el spread. El objeto conviene cuando hay muchos campos que van juntos (un formulario de registro con diez campos) o cuando los envías todos a la vez a una API. Si la lógica de actualización se complica, el siguiente paso es `useReducer`.

## Cómo explicarlo en la entrevista

> "Guardo la pizza en un objeto de estado. Como el setter de `useState` reemplaza el valor entero, al cambiar un campo creo un objeto nuevo con spread, copiando lo anterior y pisando solo ese campo. Uso la forma funcional del setter para partir siempre del estado más reciente. Para no escribir un manejador por campo, le pongo a cada select un `name` igual a la clave y uso una propiedad calculada, `[name]: value`. Nunca muto el objeto, porque React compara referencias y no volvería a renderizar."

## Conceptos

- **Estado como objeto**: varios datos relacionados en un solo `useState`.
- **Inmutabilidad**: no se modifica el estado; se crea una copia con los cambios.
- **Spread de objetos**: `{ ...obj }` copia todas sus propiedades a un objeto nuevo.
- **Propiedad calculada**: `{ [clave]: valor }` usa el valor de una variable como nombre de propiedad.
- **`evento.target.name`**: el atributo `name` del campo que disparó el evento.
- **Setter funcional**: `setX((anterior) => ...)` parte del valor más reciente.
- **Comparación por referencia**: React vuelve a renderizar si el objeto nuevo es otro objeto, no si cambió por dentro.
