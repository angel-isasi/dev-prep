## Idea clave

Un **componente controlado** no guarda su propio valor: lo recibe por props (`activo`) y avisa cuando quiere cambiarlo (`onCambio`). El padre es el **dueño del estado**, y por eso puede usarlo para otras cosas, como mostrar el costo de envío.

## Paso a paso

1. **`Interruptor` sin estado.** Solo lee sus props y pinta un `<button>`.
2. **Accesibilidad**: `role="switch"` le dice al lector de pantalla que es un interruptor de encendido/apagado, y `aria-checked={activo}` dice si está prendido. React convierte el booleano en el atributo `"true"` o `"false"`.
3. **Texto**: `{etiqueta}: {activo ? "sí" : "no"}`.
4. **Clic**: `onClick={() => onCambio(!activo)}`. No cambia nada: le **propone** al padre el valor contrario.
5. **`Opciones` guarda el estado** con `useState(false)` y conecta el interruptor: `activo={delivery}` y `onCambio={setDelivery}`. Como `onCambio` recibe el nuevo valor, se le puede pasar el setter directamente.
6. **Reacciona al estado**: `{delivery && <p>Costo de envío: S/ 5</p>}`.

```jsx
import { useState } from "react";

// Componente controlado: no tiene estado, solo muestra y avisa.
export function Interruptor({ activo, onCambio, etiqueta }) {
  return (
    <button role="switch" aria-checked={activo} onClick={() => onCambio(!activo)}>
      {etiqueta}: {activo ? "sí" : "no"}
    </button>
  );
}

// El padre es dueño del estado, así que puede reaccionar a él.
export function Opciones() {
  const [delivery, setDelivery] = useState(false);

  return (
    <div>
      <Interruptor etiqueta="Delivery" activo={delivery} onCambio={setDelivery} />
      {delivery && <p>Costo de envío: S/ 5</p>}
    </div>
  );
}
```

## Por qué funciona

El flujo es siempre el mismo: **los datos bajan por props, los eventos suben por callbacks**.

| Acción | Interruptor llama | Estado `delivery` en Opciones | Lo que se pinta |
|---|---|---|---|
| Primer render | | `false` | Delivery: no |
| Clic | `onCambio(true)` = `setDelivery(true)` | `true` | Delivery: sí, Costo de envío: S/ 5 |
| Clic | `onCambio(false)` = `setDelivery(false)` | `false` | Delivery: no |

Al llamar `setDelivery`, React vuelve a renderizar `Opciones`, que le pasa el nuevo `activo` al `Interruptor`. El interruptor nunca "sabe" que cambió: simplemente se dibuja otra vez con props nuevas.

Por eso el test que renderiza `Interruptor` con `activo={false}` y un `onCambio` espía ve que, tras el clic, sigue diciendo "no": nadie actualizó la prop. Eso demuestra que es controlado.

## Errores comunes

- **Darle estado propio al interruptor** (`useState(activo)` adentro). Ahora hay dos fuentes de verdad: el interruptor cambia, pero el padre no se entera y el costo de envío no aparece. Lo reconoces porque falla "no cambia solo" o el texto y el costo no coinciden.
- **Llamar `onCambio()` sin argumento**, esperando que el padre lo invierta. Funciona con algunos padres y no con otros; el contrato claro es mandar el nuevo valor.
- **`onClick={onCambio(!activo)}`** sin la flecha. Se llama durante el render y provoca un bucle de renders.
- **Olvidar `role="switch"` o `aria-checked`.** Visualmente funciona, pero para un lector de pantalla es un botón cualquiera y los tests no lo encuentran con `getByRole("switch")`.
- **Usar `&&` con un número** en otros casos parecidos: `{cantidad && <p>...</p>}` pinta un "0" en pantalla cuando `cantidad` es 0. Con un booleano como `delivery` es seguro; con números, compara: `{cantidad > 0 && ...}`.

## Otra forma de resolverlo

Un interruptor que funcione **controlado o no controlado** según si le pasan `activo`, como hacen los inputs nativos (`value` vs `defaultValue`):

```jsx
import { useState } from "react";

export function Interruptor({ activo, inicial = false, onCambio, etiqueta }) {
  const [interno, setInterno] = useState(inicial);
  const esControlado = activo !== undefined;
  const valor = esControlado ? activo : interno;

  function cambiar() {
    if (!esControlado) setInterno(!valor);
    onCambio?.(!valor);
  }

  return (
    <button role="switch" aria-checked={valor} onClick={cambiar}>
      {etiqueta}: {valor ? "sí" : "no"}
    </button>
  );
}
```

**¿Cuándo conviene?** En librerías de componentes que otros usarán de formas distintas. En una aplicación normal, elegir uno (aquí, controlado) es más simple y evita confusiones.

## Cómo explicarlo en la entrevista

> "Un componente controlado no tiene estado propio: recibe el valor por props y avisa los cambios con un callback. Aquí el `Interruptor` recibe `activo` y llama a `onCambio(!activo)` al hacer clic; el padre guarda el estado y decide. La ventaja es que el padre conoce el valor y puede reaccionar, como mostrar el costo de envío. Es el principio de 'los datos bajan y los eventos suben'. Además uso `role='switch'` y `aria-checked` para que sea accesible."

## Conceptos

- **Componente controlado**: su valor viene de props; los cambios se avisan con callbacks.
- **Componente no controlado**: guarda su propio estado interno.
- **Levantar el estado**: mover el estado al padre que lo necesita.
- **Los datos bajan, los eventos suben**: flujo de datos en una sola dirección.
- **Callback por props** (`onCambio`): forma en que el hijo habla con el padre.
- **`role="switch"` y `aria-checked`**: accesibilidad para interruptores.
- **Renderizado condicional** con `&&`.
