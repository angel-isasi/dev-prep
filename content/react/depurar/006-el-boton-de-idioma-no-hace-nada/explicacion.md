## Idea clave

`useContext` lee el valor del **Provider más cercano por encima** del componente en el árbol. Si no hay ninguno, devuelve el **valor por defecto** que se pasó a `createContext`. `BotonIdioma` estaba fuera de `IdiomaProvider`, así que recibía `{ idioma: "es", cambiar: () => {} }`: una función vacía que no hace nada y no da error. Todo componente que use el contexto debe estar **dentro** del Provider.

## Paso a paso

1. **Lee el síntoma.** No hay error y el botón "no hace nada". Si `cambiar` fuera `undefined`, React no se quejaría al pintar, pero sí al hacer clic. Que no pase nada indica que se está llamando a **otra** función, una que no hace nada.
2. **Busca de dónde puede venir esa función vacía.** Está en `createContext({ idioma: "es", cambiar: () => {} })`: el valor por defecto.
3. **Pregúntate cuándo se usa el valor por defecto.** Solo cuando el componente no tiene un Provider arriba. En `App`, `BotonIdioma` está al lado de `IdiomaProvider`, no adentro.
4. **Mueve el botón dentro del Provider.**

```jsx
export function App() {
  return (
    <>
      <IdiomaProvider>
        <BotonIdioma />
        <Bienvenida />
      </IdiomaProvider>
    </>
  );
}
```

## Por qué funciona

| Componente | ¿Tiene `IdiomaProvider` arriba? | Qué recibe de `useContext` |
|---|---|---|
| `BotonIdioma` (antes) | no | el valor por defecto: `cambiar` vacío |
| `BotonIdioma` (después) | sí | `{ idioma, cambiar }` del Provider |
| `Bienvenida` | sí | `{ idioma, cambiar }` del Provider |

Ahora el botón y el saludo leen **el mismo** valor. Al hacer clic, `cambiar` llama a `setIdioma`, el Provider vuelve a pintar con un `value` nuevo y React actualiza todos los componentes que usan el contexto.

El valor por defecto de `createContext` sirve para pruebas o para componentes que pueden funcionar solos. Que exista hace que este error sea silencioso.

## Errores comunes

- **Poner un segundo `IdiomaProvider` solo para el botón.** Ya no recibe el valor por defecto, pero cada Provider tiene su **propio** estado: el botón cambia su idioma y el saludo sigue en el otro.
- **Pasar `cambiar` como prop desde `App`.** `App` no tiene ese estado: vive dentro de `IdiomaProvider`.
- **Revisar `setIdioma` o la lógica del ternario.** Funcionaban; el problema era la posición en el árbol.

## Otra forma de resolverlo

Hacer que el error **no sea silencioso**: crear el contexto sin valor por defecto y avisar si alguien lo usa fuera del Provider, con un hook propio:

```jsx
const IdiomaContext = createContext(null);

function useIdioma() {
  const valor = useContext(IdiomaContext);
  if (!valor) throw new Error("useIdioma debe usarse dentro de <IdiomaProvider>");
  return valor;
}
```

Así, el error habría salido claro en la consola desde el principio. Es un patrón muy usado en proyectos reales.

## Cómo explicarlo en la entrevista

> "El botón no daba error ni hacía nada, así que sospeché que llamaba a una función vacía. Era el valor por defecto de `createContext`: `useContext` lo devuelve cuando el componente no tiene un Provider arriba, y el botón estaba fuera del Provider. Lo moví adentro. Para que no vuelva a pasar, suelo crear el contexto con `null` y un hook `useIdioma` que lanza un error si se usa fuera del Provider."

## Conceptos

- **Context**: forma de compartir datos con muchos componentes sin pasarlos por props nivel por nivel.
- **Provider**: el componente que entrega el valor del contexto a todo lo que tenga adentro.
- **`useContext`**: lee el valor del Provider más cercano hacia arriba.
- **Valor por defecto**: lo que recibe `useContext` si no hay Provider; se define en `createContext`.
- **Hook propio**: una función que empieza con `use` y agrupa lógica de hooks, como `useIdioma`.
