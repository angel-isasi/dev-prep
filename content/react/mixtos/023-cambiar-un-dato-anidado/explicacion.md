## Idea clave

Para cambiar un dato anidado sin mutar, creas un objeto nuevo **en cada nivel del camino** hasta ese dato (cliente y dirección) con spread. Lo que no está en el camino se **comparte** con el original: por eso es barato.

## Paso a paso

1. **Copia el cliente**: `{ ...cliente }` crea un objeto nuevo con las mismas propiedades (nombre, dirección, pedidos), pero apuntando a los **mismos** valores internos.
2. **Reemplaza la dirección** por una nueva: `direccion: { ...cliente.direccion, distrito }`. Copia `calle` y lo demás, y la última propiedad escrita (`distrito`) sobrescribe la anterior.
3. **`distrito` solo** es la forma corta de `distrito: distrito`.
4. **En el componente**, el cliente vive en `useState(clienteInicial)`.
5. **`onChange`**: lees el valor del input **antes** (`const distrito = evento.target.value`) y actualizas con la forma funcional, que recibe el cliente más reciente.

```jsx
import { useState } from "react";

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
```

## Por qué funciona

Qué se copia y qué se comparte después de `cambiarDistrito(cliente, "Parcona")`:

| Parte | ¿Objeto nuevo? | ¿Por qué? |
|---|---|---|
| `nuevo` | sí | está en el camino hasta el dato |
| `nuevo.direccion` | sí | está en el camino hasta el dato |
| `nuevo.direccion.calle` | (texto) | se copió el valor |
| `nuevo.pedidos` | **no**, es el mismo arreglo | no está en el camino |

Por eso `nuevo.pedidos === cliente.pedidos` es `true`. Compartir es seguro **porque nadie muta**: si todo el código trata los datos como inmutables, dos estados pueden usar el mismo arreglo sin peligro.

En el componente: `setCliente` recibe un objeto nuevo, React compara referencias (`viejo !== nuevo`), re-renderiza y el `<p>` dice "Ana vive en Parcona". El `clienteInicial` del padre sigue intacto.

Si en cambio hicieras `cliente.direccion.distrito = "Parcona"; setCliente(cliente)`, le pasarías **el mismo objeto**: React no re-renderiza y además habrías modificado el objeto del padre.

## Errores comunes

- **Spread de un solo nivel**: `{ ...cliente, distrito }`. Crea una propiedad `distrito` suelta en el cliente y la dirección sigue con "Ica".
- **Copiar el primer nivel y mutar el segundo**: `const nuevo = { ...cliente }; nuevo.direccion.distrito = "Parcona"`. `nuevo.direccion` es **el mismo** objeto que `cliente.direccion`: modificaste el original. Con el test congelado, lanza `TypeError`.
- **Olvidar copiar la dirección**: `direccion: { distrito }`. Pierdes la calle.
- **Leer `evento.target.value` dentro de la función de `setCliente`.** Funciona en React 17+, pero es más claro (y seguro) leerlo antes y guardarlo en una constante.
- **`JSON.parse(JSON.stringify(cliente))`** para copiar todo. Copia también lo que no cambia (más lento), rompe fechas y funciones, y pierde la ventaja de compartir referencias.

## Otra forma de resolverlo

Con **`structuredClone`** (copia profunda nativa) y luego modificar la copia:

```jsx
export function cambiarDistrito(cliente, distrito) {
  const copia = structuredClone(cliente);
  copia.direccion.distrito = distrito;
  return copia;
}
```

**¿Cuándo conviene?** Cuando el cambio es complejo y el objeto pequeño: puedes mutar la copia con tranquilidad. Pero copia **todo** (incluido `pedidos`), así que `nuevo.pedidos === cliente.pedidos` sería `false` y los componentes que dependen de `pedidos` se re-renderizarían sin necesidad. Con estructuras muy anidadas, en proyectos reales se usa la librería **Immer**, que te deja "mutar" un borrador y genera la copia mínima por ti.

## Cómo explicarlo en la entrevista

> "Para actualizar un dato anidado de forma inmutable, creo un objeto nuevo en cada nivel del camino hasta ese dato: spread del cliente y, adentro, spread de la dirección con el distrito nuevo. Lo que no está en el camino, como los pedidos, se comparte por referencia, así que la copia es barata y los componentes que dependen de esa parte no cambian. En el componente actualizo con la forma funcional de `setCliente`. Si mutara el objeto, React recibiría la misma referencia y no re-renderizaría."

## Conceptos

- **Spread de objetos**: `{ ...obj }` copia las propiedades de primer nivel (copia superficial).
- **Actualización inmutable anidada**: un spread por cada nivel del camino.
- **Compartir estructura**: lo que no cambia se reutiliza por referencia.
- **Shorthand de propiedades**: `{ distrito }` equivale a `{ distrito: distrito }`.
- **Copia superficial vs profunda**: spread vs `structuredClone`.
- **Input controlado** con estado anidado.
- **Immer**: librería para escribir actualizaciones inmutables como si mutaras.
