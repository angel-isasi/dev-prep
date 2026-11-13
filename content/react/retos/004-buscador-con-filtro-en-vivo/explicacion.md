## Idea clave

Guarda en el estado **solo lo que escribe el usuario**. La lista filtrada es **estado derivado**: se calcula en cada render a partir del texto y de `items`, sin guardarla aparte.

## Paso a paso

1. **Input controlado.** Crea el estado `consulta` con `useState("")` y conecta el input: `value={consulta}` y `onChange={(e) => setConsulta(e.target.value)}`. Cada tecla actualiza el estado y React vuelve a renderizar.
2. **Función para normalizar.** Para comparar sin tildes ni mayúsculas, convierte los dos textos a una forma común:
   - `normalize("NFD")` separa cada letra de su tilde: `"ó"` pasa a ser `"o"` + una tilde suelta (un carácter invisible del rango `̀` a `ͯ`).
   - `replace(/[\u0300-\u036f]/g, "")` borra esas tildes sueltas.
   - `toLowerCase()` y `trim()` terminan el trabajo.
3. **Calcula los filtrados en el cuerpo del componente**, no en un `useEffect` ni en otro estado: `items.filter((item) => normalizar(item).includes(buscado))`.
4. **Renderiza según el resultado**: si hay filtrados, una `<ul>` con un `<li key={item}>` por cada uno; si no, el mensaje "Sin resultados".
5. **Accesibilidad**: `aria-label="Buscar"` le da nombre al input. Es lo que usa `getByLabelText` en los tests y lo que lee un lector de pantalla.

```jsx
import { useState } from "react";

// "Comunicación" -> "comunicacion"
function normalizar(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function Buscador({ items }) {
  const [consulta, setConsulta] = useState("");

  const buscado = normalizar(consulta);
  const filtrados = items.filter((item) => normalizar(item).includes(buscado));

  return (
    <div>
      <input
        type="search"
        aria-label="Buscar"
        value={consulta}
        onChange={(evento) => setConsulta(evento.target.value)}
      />

      {filtrados.length > 0 ? (
        <ul>
          {filtrados.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>Sin resultados para "{consulta}"</p>
      )}
    </div>
  );
}
```

`normalizar` va **fuera** del componente porque no usa props ni estado: así no se vuelve a crear en cada render y se puede probar sola.

## Por qué funciona

Recorrido escribiendo `comunicacion` con `items = ["Arqueología", "Turismo", "Comunicación"]`:

1. El usuario escribe y `onChange` llama a `setConsulta("comunicacion")`.
2. React vuelve a ejecutar `Buscador`. Ahora `consulta` vale `"comunicacion"` y `buscado` también.
3. Se normaliza cada item y se pregunta si incluye `"comunicacion"`:

| Item | `normalizar(item)` | ¿incluye `"comunicacion"`? |
|---|---|---|
| `"Arqueología"` | `"arqueologia"` | no |
| `"Turismo"` | `"turismo"` | no |
| `"Comunicación"` | `"comunicacion"` | **sí** |

4. `filtrados` es `["Comunicación"]` y se pinta un solo `<li>`. Se muestra el texto **original**, con tilde: solo normalizamos para comparar.

Con el input vacío, `buscado` es `""`, y todo texto incluye el texto vacío (`"Turismo".includes("")` es `true`): por eso al inicio se ven todos.

## Errores comunes

- **Guardar la lista filtrada en otro `useState`** y actualizarla en un `useEffect`. Funciona, pero hay un render con datos viejos, más código y dos estados que mantener sincronizados. Es justo lo que el entrevistador quiere ver si evitas.
- **Filtrar con el texto original sin normalizar.** `"Comunicación".includes("comunicacion")` es `false`. Lo reconoces porque fallan los tests de mayúsculas y tildes.
- **Normalizar solo un lado.** Si normalizas `item` pero no la `consulta` (o al revés), `"TURISMO"` no encuentra nada.
- **Input sin `value`** (no controlado) o con `value` pero sin `onChange`. Sin `onChange`, React no deja escribir y muestra una advertencia en la consola.
- **Olvidar la `key`** en los `<li>` o usar el índice como `key`. Con listas que se filtran, el índice cambia de un render a otro; usa algo único y estable, aquí el propio texto.
- **Mostrar la lista vacía en vez del mensaje.** Un `<ul>` sin hijos no le dice nada al usuario.

## Otra forma de resolverlo

Con **`useMemo`**, para no recalcular el filtro si ni `items` ni `consulta` cambiaron:

```jsx
import { useMemo, useState } from "react";

const filtrados = useMemo(() => {
  const buscado = normalizar(consulta);
  return items.filter((item) => normalizar(item).includes(buscado));
}, [items, consulta]);
```

**¿Cuándo conviene?** Con listas chicas (decenas o cientos de items) no hace falta: filtrar es rapidísimo y `useMemo` agrega complejidad. Conviene cuando la lista es grande (miles) o el cálculo es caro. En entrevista, una buena respuesta es: "no lo pongo de entrada, pero si la lista creciera y notara lentitud, lo memorizaría con `useMemo`".

Con listas grandes también se suele usar un **debounce** (esperar a que el usuario deje de escribir unos milisegundos antes de filtrar o de pedir datos al servidor).

## Cómo explicarlo en la entrevista

> "Solo guardo en el estado lo que escribe el usuario, con un input controlado. La lista filtrada la calculo en cada render a partir de ese texto y de los items, porque es estado derivado: si la guardara en otro estado tendría que mantener los dos sincronizados, y eso es fuente de bugs. Para comparar sin tildes ni mayúsculas, normalizo ambos lados con `normalize('NFD')` y quito las marcas de acento. Si nada coincide muestro un mensaje en vez de una lista vacía. Si la lista fuera muy grande, agregaría `useMemo` o un debounce."

## Conceptos

- **`useState`**: guarda un valor entre renders; al cambiarlo, el componente se vuelve a renderizar.
- **Input controlado**: el valor del input vive en el estado (`value` + `onChange`).
- **Estado derivado**: lo que se puede calcular a partir de props o estado no se guarda aparte.
- **Renderizado condicional** con el operador ternario `condición ? a : b`.
- **Listas y `key`**: cada elemento de una lista necesita una `key` única y estable.
- **`normalize("NFD")`**: separa letras y tildes para poder quitarlas.
- **`filter` + `includes`**: quedarse con los elementos que contienen un texto.
- **`useMemo`**: memoriza un cálculo hasta que cambien sus dependencias.
- **`aria-label`**: nombre accesible de un elemento; también es como lo encuentran los tests.
