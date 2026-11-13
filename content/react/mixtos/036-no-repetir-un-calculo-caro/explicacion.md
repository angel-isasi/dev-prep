## Idea clave

Cada render ejecuta **todo** el cuerpo del componente. `useMemo` guarda el resultado de un cálculo y solo lo repite cuando cambia alguna de sus dependencias, comparadas **por referencia**. Los clics cambian `clics`, no `pedidos`, así que se reutiliza el resultado guardado.

## Paso a paso

1. **El estado de los clics.** `const [clics, setClics] = useState(0)`. Cada clic cambia este estado y provoca un render nuevo de `Reporte`.
2. **Envolver el cálculo.** `useMemo(() => estadisticas(pedidos), [pedidos])` recibe dos cosas: una función que hace el cálculo y la lista de dependencias.
3. **Primer render.** React ejecuta la función, guarda el resultado y guarda también `[pedidos]`.
4. **Renders siguientes.** React compara cada dependencia nueva con la guardada usando `Object.is`. Si todas son iguales, devuelve el resultado guardado sin llamar a la función. Si alguna cambió, recalcula y guarda de nuevo.
5. **Pintar.** El JSX usa `datos.total` y `datos.mayor`, venga el objeto de un cálculo nuevo o del guardado.

```jsx
import { useMemo, useState } from "react";

export let calculos = 0;

export function estadisticas(pedidos) {
  calculos++;
  return {
    total: pedidos.reduce((suma, pedido) => suma + pedido.monto, 0),
    mayor: Math.max(...pedidos.map((pedido) => pedido.monto)),
  };
}

export function Reporte({ pedidos }) {
  const [clics, setClics] = useState(0);
  const datos = useMemo(() => estadisticas(pedidos), [pedidos]);

  return (
    <div>
      <p>
        Total {datos.total}, mayor {datos.mayor}
      </p>
      <button onClick={() => setClics(clics + 1)}>Clics: {clics}</button>
    </div>
  );
}
```

`calculos` es un `let` exportado: cuando otro archivo lo importa, siempre ve su valor **actual** (los imports de módulos ES son enlaces vivos, no copias). Así los tests pueden medir.

## Por qué funciona

Con `PEDIDOS = [{ monto: 30 }, { monto: 55 }]`:

| Render | Motivo | ¿`pedidos` cambió? (`Object.is`) | ¿Corre `estadisticas`? | `calculos` |
|---|---|---|---|---|
| 1 | montaje | (no hay anterior) | sí | 1 |
| 2 | clic, `clics` = 1 | no, mismo arreglo | no | 1 |
| 3 | clic, `clics` = 2 | no | no | 1 |
| 4 | el padre pasa `[{ monto: 10 }, { monto: 70 }]` | **sí**, otro arreglo | sí | 2 |

Dentro de `estadisticas`:

- `reduce` empieza con `suma = 0`: 0 + 30 = 30, 30 + 55 = 85.
- `pedidos.map(...)` da `[30, 55]`; con `...` se pasa como `Math.max(30, 55)`, que es 55.

Importante: `Object.is` compara referencias, no contenido. Un arreglo nuevo con los **mismos** números (`[{ monto: 30 }, { monto: 55 }]` escrito otra vez) cuenta como distinto y recalcula.

## Errores comunes

- **Llamar `estadisticas(pedidos)` directo en el cuerpo.** Se ejecuta en cada render. Lo reconoces porque `calculos` sube con cada clic.
- **Dependencias vacías `[]`.** Nunca recalcula: si el padre manda otros pedidos, la pantalla sigue mostrando los totales viejos. Falla el test "si llega otro arreglo".
- **Olvidar la flecha:** `useMemo(estadisticas(pedidos), [pedidos])`. Así ejecutas la función en cada render y le pasas el **resultado** a `useMemo`, que espera una función.
- **Crear el arreglo dentro del padre en cada render** (`<Reporte pedidos={[{ monto: 30 }]} />` en el JSX del padre). Es un arreglo nuevo cada vez y `useMemo` recalcula siempre. Para que la memoización sirva, la referencia tiene que ser estable (estado, constante fuera del componente u otro `useMemo`).
- **Usar `useMemo` para todo.** Tiene su costo (guardar y comparar). Para una suma de 5 números no vale la pena.

## Otra forma de resolverlo

Si el cálculo solo depende de props que casi nunca cambian, otra opción es sacar el estado que provoca renders a un componente hijo. Así el padre no se vuelve a renderizar con cada clic y no hace falta `useMemo`:

```jsx
function ContadorDeClics() {
  const [clics, setClics] = useState(0);
  return <button onClick={() => setClics(clics + 1)}>Clics: {clics}</button>;
}

export function Reporte({ pedidos }) {
  const datos = estadisticas(pedidos);
  return (
    <div>
      <p>
        Total {datos.total}, mayor {datos.mayor}
      </p>
      <ContadorDeClics />
    </div>
  );
}
```

Los clics solo vuelven a renderizar `ContadorDeClics`. **¿Cuándo conviene?** Cuando el estado que cambia mucho no tiene nada que ver con el cálculo: "bajar el estado" al hijo que lo usa es más simple que memorizar. Ojo: en esta versión, si el padre de `Reporte` se vuelve a renderizar, sí se recalcula; `useMemo` es la herramienta cuando no puedes reorganizar los componentes.

## Cómo explicarlo en la entrevista

> "Cada vez que cambia un estado, React ejecuta todo el componente, así que un cálculo pesado en el cuerpo se repetiría en cada clic. Lo envuelvo en `useMemo` con `pedidos` como dependencia: React guarda el resultado y solo lo recalcula si `pedidos` es otra referencia. Hay que cuidar que el padre no cree el arreglo en cada render, porque la comparación es por referencia. Y no lo pongo por defecto: solo cuando el cálculo es caro de verdad o cuando necesito una referencia estable para otro hook o un `memo`."

## Conceptos

- **Render**: ejecutar la función del componente para obtener el JSX; ocurre en cada cambio de estado o props.
- **`useMemo(fn, deps)`**: memoriza el resultado de `fn` mientras las dependencias no cambien.
- **`Object.is`**: comparación que usa React; para objetos y arreglos mira la referencia.
- **Referencia vs. contenido**: dos arreglos con los mismos datos son distintos para React.
- **`reduce`**: recorre el arreglo acumulando un resultado (aquí, la suma).
- **Spread en `Math.max(...arr)`**: pasa cada elemento como argumento.
- **Enlace vivo de un `export let`**: quien importa ve el valor actual.
- **Bajar el estado (colocación)**: poner el estado en el componente más pequeño que lo necesita.
