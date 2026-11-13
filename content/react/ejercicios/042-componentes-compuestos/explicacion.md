## Idea clave

En los **componentes compuestos**, un padre (`Opciones`) comparte su estado con sus piezas (`Opciones.Item`) a través de un **contexto privado**. Quien los usa arma el JSX libremente (orden, contenido, elementos intermedios) y cada pieza sabe por sí sola si está seleccionada y a quién avisar.

## Paso a paso

1. **Contexto privado**: `const GrupoContext = createContext(null)`, sin exportar. Solo `Opciones` y su `Item` lo usan.
2. **`Opciones` publica** `{ valor, onCambio }` en el provider y envuelve a `children` en un `<div role="radiogroup">`. No tiene estado: es controlado por quien lo usa.
3. **`Opciones.Item` lee el contexto** con `useContext`. Si recibe `null`, significa que no hay un `Opciones` arriba: lanza un error con un mensaje claro en vez de fallar con un "Cannot read properties of null" confuso.
4. **Cada item** es un `<button role="radio">` con `aria-checked={grupo.valor === valor}` y `onClick={() => grupo.onCambio(valor)}`.
5. **`Opciones.Item = function Item...`**: en JavaScript una función es un objeto, así que le puedes colgar propiedades. Esto agrupa las piezas bajo un mismo nombre (`Opciones.Item`) y deja claro que van juntas.
6. **`Masa`** guarda el estado con `useState("delgada")` y arma el grupo con dos items.

```jsx
import { createContext, useContext, useState } from "react";

// Canal privado entre Opciones y sus Item.
const GrupoContext = createContext(null);

export function Opciones({ valor, onCambio, children }) {
  return (
    <GrupoContext.Provider value={{ valor, onCambio }}>
      <div role="radiogroup">{children}</div>
    </GrupoContext.Provider>
  );
}

// Item cuelga de Opciones: se usa como <Opciones.Item>.
Opciones.Item = function Item({ valor, children }) {
  const grupo = useContext(GrupoContext);
  if (!grupo) throw new Error("Opciones.Item debe usarse dentro de <Opciones>");

  return (
    <button role="radio" aria-checked={grupo.valor === valor} onClick={() => grupo.onCambio(valor)}>
      {children}
    </button>
  );
};

export function Masa() {
  const [masa, setMasa] = useState("delgada");

  return (
    <Opciones valor={masa} onCambio={setMasa}>
      <Opciones.Item valor="delgada">Delgada</Opciones.Item>
      <Opciones.Item valor="gruesa">Gruesa</Opciones.Item>
    </Opciones>
  );
}
```

## Por qué funciona

| Acción | Estado `masa` en Masa | Contexto del grupo | Delgada | Gruesa |
|---|---|---|---|---|
| Primer render | `"delgada"` | `{ valor: "delgada", onCambio: setMasa }` | `aria-checked="true"` | `"false"` |
| Clic en Gruesa | `"gruesa"` | `{ valor: "gruesa", ... }` | `"false"` | `"true"` |

Al hacer clic en "Gruesa", el item llama a `grupo.onCambio("gruesa")`, que es el `setMasa` de `Masa`. `Masa` se vuelve a renderizar, `Opciones` publica un nuevo `value` en el contexto, y **todos** los items que lo leen se actualizan, sin importar dónde estén dentro del grupo (aunque estén dentro de un `<ul><li>`, como en uno de los tests).

Compáralo con la versión sin contexto: tendrías que escribir `<Item valor="gruesa" seleccionado={masa} onCambio={setMasa}>` en cada item, repitiendo lo mismo una y otra vez, o que `Opciones` recorra sus hijos con `React.Children.map` y `cloneElement`, que se rompe si los items están anidados.

## Errores comunes

- **Exportar el contexto o crearlo dentro de `Opciones`.** Si lo creas dentro, cada render crea un contexto distinto y los items no lo encuentran. Va en el nivel del módulo.
- **No validar que el item esté dentro del grupo.** Sin el `if (!grupo)`, el error sería "Cannot read properties of null (reading 'valor')", que no le dice al otro desarrollador qué hizo mal. Falla el test del error claro.
- **Comparar contra una variable equivocada**: `aria-checked={valor === valor}` (siempre `true`). Usa `grupo.valor` (el elegido) contra `valor` (el de este item).
- **Darle estado propio a `Opciones`.** Entonces `Masa` no se entera de qué se eligió. Que el grupo sea controlado permite al padre guardar, validar o enviar el valor.
- **Usar `React.Children.map` + `cloneElement`** para inyectar props. Funciona solo con hijos directos y es más frágil; la documentación de React lo desaconseja para casos nuevos.

## Otra forma de resolverlo

Hacer que el grupo funcione también **sin padre que lo controle** (no controlado), con un valor inicial:

```jsx
export function Opciones({ valor, inicial, onCambio, children }) {
  const [interno, setInterno] = useState(inicial);
  const esControlado = valor !== undefined;
  const actual = esControlado ? valor : interno;

  function cambiar(nuevo) {
    if (!esControlado) setInterno(nuevo);
    onCambio?.(nuevo);
  }

  return (
    <GrupoContext.Provider value={{ valor: actual, onCambio: cambiar }}>
      <div role="radiogroup">{children}</div>
    </GrupoContext.Provider>
  );
}

// Uso sin estado en el padre:
// <Opciones inicial="delgada">...</Opciones>
```

**¿Cuándo conviene?** En librerías de componentes que otras personas usarán de distintas maneras. En tu aplicación, la versión controlada es más simple y suficiente. Una mejora más de accesibilidad sería moverse entre opciones con las flechas del teclado, como hacen los radio nativos.

## Cómo explicarlo en la entrevista

> "Uso el patrón de componentes compuestos: `Opciones` comparte el valor elegido y la función para cambiarlo con un contexto privado, y cada `Opciones.Item` lo lee con `useContext` para saber si está marcado y a quién avisar. Así quien usa el componente arma el JSX como quiera, sin pasar props repetidas a cada item, y funciona aunque los items estén anidados. Si un item se usa fuera del grupo, lanzo un error claro. Es el patrón de librerías como Radix, y uso `role='radiogroup'` y `role='radio'` con `aria-checked` para accesibilidad."

## Conceptos

- **Componentes compuestos**: un padre y sus piezas que comparten estado implícitamente.
- **Contexto privado**: `createContext` sin exportar, solo para las piezas del componente.
- **`useContext`**: leer el valor del provider más cercano.
- **Propiedades en funciones**: `Opciones.Item = ...` agrupa piezas bajo un nombre.
- **Validación con error claro**: fallar pronto y con un mensaje útil.
- **Componente controlado**: el padre guarda el valor; el grupo solo muestra y avisa.
- **`role="radiogroup"`, `role="radio"`, `aria-checked`**: accesibilidad de grupos de opción única.
