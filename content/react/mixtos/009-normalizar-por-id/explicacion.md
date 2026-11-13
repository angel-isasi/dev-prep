## Idea clave

Convierte el catálogo en un objeto **indexado por id** (`{ p1: {...}, p2: {...} }`) una sola vez, y luego cada búsqueda es instantánea: `catalogo[id]`. Para ids que no existen, `?.` y `??` dan el texto por defecto sin romper nada.

## Paso a paso

1. **Pares `[id, objeto]`.** `lista.map((item) => [item.id, item])` transforma cada pizza en un par.
2. **Pares a objeto.** `Object.fromEntries` es lo contrario de `Object.entries`: recibe pares y arma un objeto.
3. **Memoriza el índice.** `useMemo(() => porId(pizzas), [pizzas])` guarda el resultado y solo lo recalcula si `pizzas` cambia (si llega otro arreglo).
4. **Busca por id.** `catalogo[id]` devuelve la pizza o `undefined`.
5. **Caso no encontrado.** `catalogo[id]?.nombre`: si `catalogo[id]` es `undefined`, el `?.` corta y devuelve `undefined` en vez de lanzar error. Luego `?? "Pizza no disponible"` pone el texto.

```jsx
import { useMemo } from "react";

export function porId(lista) {
  return Object.fromEntries(lista.map((item) => [item.id, item]));
}

export function DetallePedido({ pedido, pizzas }) {
  const catalogo = useMemo(() => porId(pizzas), [pizzas]);

  return (
    <ul>
      {pedido.map((id) => (
        <li key={id}>{catalogo[id]?.nombre ?? "Pizza no disponible"}</li>
      ))}
    </ul>
  );
}
```

## Por qué funciona

Con `pizzas = [{ id: "p1", ... }, { id: "p2", ... }]` y `pedido = ["p2", "p9"]`:

| Paso | Valor |
|---|---|
| `map` a pares | `[["p1", {Margarita}], ["p2", {Pepperoni}]]` |
| `Object.fromEntries` | `{ p1: {Margarita}, p2: {Pepperoni} }` |
| id `"p2"` | `catalogo.p2?.nombre` = `"Pepperoni"` |
| id `"p9"` | `catalogo.p9` es `undefined`, `?.nombre` da `undefined`, `??` da `"Pizza no disponible"` |

El objeto guarda **referencias** a las mismas pizzas (no copias): `porId(PIZZAS).p2 === PIZZAS[1]`.

Costo: con `find`, cada id del pedido recorre el catálogo (con 1000 pizzas y 50 ids son hasta 50 000 comparaciones). Con el índice, recorres el catálogo una vez (1000) y cada búsqueda es directa. Y con `useMemo`, si el componente se vuelve a renderizar por otra razón (por ejemplo, cambia `pedido`), el índice no se reconstruye.

## Errores comunes

- **`catalogo[id].nombre` sin `?.`.** Con un id que no existe: `Cannot read properties of undefined (reading 'nombre')` y la pantalla entera se rompe.
- **Usar `||` en vez de `??`.** Si un nombre fuera `""`, `||` lo reemplazaría; `??` solo actúa con `null` o `undefined`.
- **`useMemo` sin dependencias o con `[]`.** El índice se calcula una sola vez y si el catálogo cambia, sigues mostrando el viejo.
- **Recrear `pizzas` en cada render del padre** (`pizzas={[...]}` literal en el JSX). `useMemo` compara por referencia y recalcularía siempre; no rompe, pero pierde el beneficio.
- **`find` dentro del `map`.** Funciona y está bien para listas chicas, pero no es lo que pide el ejercicio.

## Otra forma de resolverlo

Con `Map`, que está pensado para buscar por clave:

```jsx
const catalogo = useMemo(() => new Map(pizzas.map((p) => [p.id, p])), [pizzas]);
// ...
<li key={id}>{catalogo.get(id)?.nombre ?? "Pizza no disponible"}</li>
```

O con `reduce`, la forma clásica:

```jsx
export function porId(lista) {
  return lista.reduce((indice, item) => {
    indice[item.id] = item;
    return indice;
  }, {});
}
```

**¿Cuándo conviene?** `Map` es ideal si los ids son números u objetos, o si agregas y quitas mucho. El objeto plano es más fácil de guardar en JSON o en `localStorage`. ¿Y `useMemo`? Con 10 pizzas el ahorro es mínimo; se justifica con catálogos grandes. En entrevista, menciona que lo usas porque el índice es derivado y caro de reconstruir.

## Cómo explicarlo en la entrevista

> "En lugar de buscar con `find` por cada id, normalizo el catálogo en un objeto indexado por id con `Object.fromEntries`. Así cada búsqueda es directa. Como el índice es derivado de `pizzas`, lo envuelvo en `useMemo` con `pizzas` como dependencia, para no reconstruirlo en cada render. Para ids que no existen uso `?.` y `??`, y muestro 'Pizza no disponible' en vez de romper la pantalla."

## Conceptos

- **Normalizar datos**: guardar colecciones como objetos `{ id: item }`.
- **`Object.fromEntries`**: arma un objeto a partir de pares `[clave, valor]`.
- **`useMemo`**: memoriza un cálculo y lo repite solo si cambian sus dependencias.
- **Optional chaining `?.`**: accede a una propiedad sin romper si el objeto no existe.
- **`??`**: valor por defecto para `null` o `undefined`.
- **Referencias**: el índice apunta a los mismos objetos, no los copia.
- **`Map`**: alternativa a objetos para buscar por clave.
