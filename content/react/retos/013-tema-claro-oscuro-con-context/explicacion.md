## Idea clave

**Context** permite que un componente "de arriba" comparta un valor con **cualquier** descendiente, sin pasarlo por props en cada nivel (*prop drilling*). El estado vive en el Provider; los consumidores lo leen con un **hook personalizado** (`useTema`) que además valida que haya un Provider.

## Paso a paso

1. **Crea el contexto** fuera de los componentes: `const TemaContext = createContext(null)`. El `null` es el valor que recibirá quien lo lea sin tener un Provider encima.
2. **El Provider guarda el estado.** `TemaProvider` usa `useState("claro")` y una función `alternar` con la forma funcional (`setTema((t) => ...)`), porque el valor nuevo depende del anterior.
3. **Comparte el valor.** `<TemaContext.Provider value={valor}>{children}</TemaContext.Provider>`. Todo lo que esté dentro de `children`, a cualquier profundidad, puede leerlo.
4. **Memoriza el valor.** `useMemo(() => ({ tema, alternar }), [tema, alternar])` y `useCallback` para `alternar`. Sin esto, cada render del Provider crearía un objeto nuevo y React avisaría a todos los consumidores aunque el tema no haya cambiado.
5. **Hook personalizado `useTema`.** Lee con `useContext(TemaContext)`; si obtiene `null`, lanza un error con un mensaje claro. Es mucho mejor que un `Cannot read properties of null` misterioso.
6. **Consumidores.** `BotonTema` y `Tarjeta` llaman a `useTema()` y pintan según `tema`.

```jsx
import { createContext, useCallback, useContext, useMemo, useState } from "react";

// El valor por defecto (null) es el que recibe quien lea el contexto sin Provider.
const TemaContext = createContext(null);

export function TemaProvider({ children }) {
  const [tema, setTema] = useState("claro");

  const alternar = useCallback(() => {
    setTema((actual) => (actual === "claro" ? "oscuro" : "claro"));
  }, []);

  // Mismo objeto mientras el tema no cambie: los consumidores no se re-renderizan de más.
  const valor = useMemo(() => ({ tema, alternar }), [tema, alternar]);

  return <TemaContext.Provider value={valor}>{children}</TemaContext.Provider>;
}

export function useTema() {
  const contexto = useContext(TemaContext);
  if (!contexto) {
    throw new Error("useTema debe usarse dentro de TemaProvider");
  }
  return contexto;
}

export function BotonTema() {
  const { tema, alternar } = useTema();
  return <button onClick={alternar}>Tema: {tema}</button>;
}

export function Tarjeta() {
  const { tema } = useTema();
  return (
    <div data-testid="tarjeta" className={tema === "oscuro" ? "bg-navy" : "bg-white"}>
      Hola
    </div>
  );
}
```

En React 19 también puedes escribir `<TemaContext value={valor}>` en lugar de `<TemaContext.Provider value={valor}>`; las dos formas funcionan.

## Por qué funciona

| Acción | Estado en `TemaProvider` | Lo que lee cada consumidor | Se pinta |
|---|---|---|---|
| (al inicio) | `tema = "claro"` | `{ tema: "claro", alternar }` | "Tema: claro" · `bg-white` |
| clic en el botón | `alternar()` pone `"oscuro"` | `useMemo` crea un objeto nuevo porque cambió `tema` | "Tema: oscuro" · `bg-navy` |
| clic otra vez | `"claro"` | objeto nuevo | "Tema: claro" · `bg-white` |

Cuando el `value` del Provider cambia (otra referencia), React vuelve a renderizar **todos** los componentes que llaman a `useContext(TemaContext)`, estén donde estén. Por eso la tarjeta se entera del cambio aunque el botón y la tarjeta no se conozcan entre sí.

## Errores comunes

- **Usar un consumidor fuera del Provider.** `useContext` devuelve el valor por defecto (`null`) y al desestructurar explota con un error confuso. El hook con `throw` lo convierte en un mensaje que dice exactamente qué falta.
- **Crear el contexto dentro de un componente.** Se crearía uno nuevo en cada render y los consumidores nunca encontrarían el Provider correcto. `createContext` va siempre fuera, a nivel de módulo.
- **Pasar `value={{ tema, alternar }}` sin memorizar.** Funciona, pero en cada render del Provider todos los consumidores se re-renderizan. En apps grandes se nota.
- **Usar Context para todo.** Context no reemplaza a las props: si un dato solo baja uno o dos niveles, pásalo por props. Context es para datos "globales" que usan muchos componentes (tema, usuario, idioma).
- **Poner un estado que cambia muy seguido** (por ejemplo, la posición del mouse) en un contexto grande: re-renderiza a todos sus consumidores en cada cambio.

## Otra forma de resolverlo

Guardar el tema en el `<html>` con una clase o un atributo y dejar que el CSS haga el resto:

```jsx
export function TemaProvider({ children }) {
  const [tema, setTema] = useState("claro");

  useEffect(() => {
    document.documentElement.dataset.tema = tema; // <html data-tema="oscuro">
  }, [tema]);

  // ...mismo Provider y useTema
}
```

```css
[data-tema="oscuro"] .tarjeta { background: navy; }
```

**¿Cuándo conviene?** Cuando el tema solo cambia **colores**: el CSS lo aplica sin que los componentes tengan que leer el contexto, y puedes usar variables CSS. Igual se suele combinar con Context para que el botón sepa en qué tema está. Si además quieres recordar la preferencia, guárdala en `localStorage` (o respeta `prefers-color-scheme`).

## Cómo explicarlo en la entrevista

> "Uso Context para no pasar el tema por props a través de muchos niveles, que es el *prop drilling*. El estado vive en un Provider y lo expongo con un hook `useTema`, que lanza un error claro si alguien lo usa fuera del Provider. Memorizo el objeto del `value` con `useMemo` para que los consumidores no se re-rendericen si el tema no cambió. Aclararía que Context no es para todo: si un dato baja uno o dos niveles, lo paso por props, y si el estado global creciera mucho evaluaría algo como Zustand."

## Conceptos

- **Prop drilling**: pasar una prop por varios componentes intermedios que no la usan.
- **`createContext(valorPorDefecto)`**: crea el contexto; se define fuera de los componentes.
- **Provider**: componente que entrega el `value` a todos sus descendientes.
- **`useContext(Contexto)`**: lee el valor del Provider más cercano hacia arriba.
- **Hook personalizado**: función que empieza con `use` y usa otros hooks; aquí encapsula y valida el contexto.
- **`useMemo` / `useCallback`**: mantienen la misma referencia entre renders si sus dependencias no cambian.
- **`children`**: lo que se pone entre las etiquetas de un componente.
