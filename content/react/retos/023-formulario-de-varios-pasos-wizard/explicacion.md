## Idea clave

Los datos de **todos** los pasos viven en el componente que **no se desmonta** (`Wizard`). Cada paso solo muestra y edita una parte de ese objeto. El paso actual es un simple número: cambiarlo decide qué se pinta, pero no toca los datos.

## Paso a paso

1. **Dos estados.** `paso` (0, 1 o 2) y `datos` (`{ nombre, escuela }`).
2. **Una función `cambiar(campo, valor)`** que copia el objeto y reemplaza un campo: `{ ...anteriores, [campo]: valor }`. Nunca se muta el objeto.
3. **Renderizado condicional por paso.** `paso === 0` muestra el input de Nombre, `paso === 1` el de Escuela y `paso === 2` el resumen.
4. **Inputs controlados.** Cada input lee su valor de `datos`. Por eso, al volver a montarse, aparece con lo que ya se había escrito.
5. **Botones.** "Atrás" solo si `paso > 0`. El otro botón cambia de texto y de acción en el último paso: avanza o llama a `onFinalizar(datos)`.

```jsx
import { useState } from "react";

const TOTAL_PASOS = 3;

export function Wizard({ onFinalizar }) {
  const [paso, setPaso] = useState(0);
  // Los datos de TODOS los pasos viven aquí, no dentro de cada paso.
  const [datos, setDatos] = useState({ nombre: "", escuela: "" });

  function cambiar(campo, valor) {
    setDatos((anteriores) => ({ ...anteriores, [campo]: valor }));
  }

  const esUltimo = paso === TOTAL_PASOS - 1;

  function avanzar() {
    if (esUltimo) onFinalizar(datos);
    else setPaso((p) => p + 1);
  }

  return (
    <div>
      <p>
        Paso {paso + 1} de {TOTAL_PASOS}
      </p>

      {paso === 0 && (
        <label>
          Nombre
          <input value={datos.nombre} onChange={(e) => cambiar("nombre", e.target.value)} />
        </label>
      )}

      {paso === 1 && (
        <label>
          Escuela
          <input value={datos.escuela} onChange={(e) => cambiar("escuela", e.target.value)} />
        </label>
      )}

      {paso === 2 && (
        <p>
          Confirma: {datos.nombre}, {datos.escuela}
        </p>
      )}

      {paso > 0 && (
        <button type="button" onClick={() => setPaso((p) => p - 1)}>
          Atrás
        </button>
      )}
      <button type="button" onClick={avanzar}>
        {esUltimo ? "Enviar" : "Siguiente"}
      </button>
    </div>
  );
}
```

El `<label>` envuelve al input: eso los asocia sin necesidad de `id` y `htmlFor`, y es lo que permite que `getByLabelText("Nombre")` lo encuentre.

## Por qué funciona

| Acción | `paso` | `datos` | Se pinta |
|---|---|---|---|
| (inicio) | 0 | `{ nombre: "", escuela: "" }` | Paso 1, input Nombre vacío |
| Escribe "Angel" | 0 | `{ nombre: "Angel", escuela: "" }` | input Nombre con "Angel" |
| Siguiente | 1 | igual | Paso 2, input Escuela (el de Nombre se desmonta) |
| Escribe "Sistemas" | 1 | `{ nombre: "Angel", escuela: "Sistemas" }` | input Escuela con "Sistemas" |
| Atrás | 0 | igual | input Nombre se vuelve a montar y lee "Angel" |
| Siguiente, Siguiente | 2 | igual | "Confirma: Angel, Sistemas", botón Enviar |
| Enviar | 2 | igual | se llama `onFinalizar(datos)` |

Cuando un input se desmonta, **todo su estado interno se pierde**. Como el valor no vive en el input sino en `Wizard`, al volver a montarse lo recupera desde `datos`.

## Errores comunes

- **Un componente por paso con su propio `useState`.** Al pasar al siguiente paso, ese componente se desmonta y su estado desaparece. Lo reconoces porque al volver "Atrás" el input aparece vacío.
- **Mutar el objeto**: `datos.nombre = e.target.value; setDatos(datos)`. Es la misma referencia, React no detecta el cambio y el input no se actualiza. Siempre copia con `{ ...datos, nombre: ... }`.
- **Inputs no controlados** (sin `value`). Al volver a montarse aparecen vacíos aunque el dato esté guardado.
- **Llamar a `onFinalizar` en el paso 2**, antes de mostrar el resumen. Falla el test que revisa que no se llame antes de "Enviar".
- **Botones con `type` por defecto dentro de un `<form>`**: un `<button>` sin `type` dentro de un form envía el formulario. Por eso aquí usamos `type="button"`.

## Otra forma de resolverlo

Guardar los pasos en un **arreglo de configuración** y renderizar un input genérico:

```jsx
const PASOS = [
  { campo: "nombre", etiqueta: "Nombre" },
  { campo: "escuela", etiqueta: "Escuela" },
];

// dentro del componente
const actual = PASOS[paso];
{actual ? (
  <label>
    {actual.etiqueta}
    <input value={datos[actual.campo]} onChange={(e) => cambiar(actual.campo, e.target.value)} />
  </label>
) : (
  <p>Confirma: {datos.nombre}, {datos.escuela}</p>
)}
```

**¿Cuándo conviene?** Cuando hay muchos pasos parecidos (por ejemplo, una encuesta de 10 preguntas). Agregar un paso es agregar un objeto al arreglo. Con pocos pasos y distintos entre sí, escribirlos uno por uno es más claro.

En proyectos reales también se usa `useReducer` o una librería como React Hook Form cuando hay validación por paso.

## Cómo explicarlo en la entrevista

> "La decisión importante es dónde vive el estado. Los datos de todos los pasos los guardo en el componente padre, que nunca se desmonta, y cada paso solo muestra una parte con inputs controlados. Así, aunque al cambiar de paso el input se desmonte, al volver lee su valor desde el padre y no se pierde nada. El paso actual es solo un índice que decide qué renderizar, y en el último el botón cambia a Enviar y llama a `onFinalizar` con todo el objeto."

## Conceptos

- **Estado en el padre** (levantar el estado): el dato vive donde no se pierde.
- **Desmontar** un componente borra su estado interno.
- **Inputs controlados**: `value` + `onChange`.
- **Actualizar objetos sin mutar**: `{ ...anterior, campo: valor }`.
- **Propiedades calculadas** `[campo]: valor` para un solo handler de varios campos.
- **Renderizado condicional** con `&&` y el ternario.
- **`<label>` que envuelve al input** para asociarlos de forma accesible.
