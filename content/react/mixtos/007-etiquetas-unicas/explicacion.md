## Idea clave

Tres pasos encadenados: **`flatMap`** junta los arreglos internos en uno, **`Set`** quita los repetidos y **`localeCompare`** ordena como se ordena en español.

## Paso a paso

1. **Aplana.** `pizzas.flatMap((pizza) => pizza.etiquetas)` hace un `map` (cada pizza da su arreglo de etiquetas) y luego aplana un nivel: en lugar de un arreglo de arreglos, obtienes uno solo.
2. **Quita repetidos.** `new Set(todas)` crea un conjunto: si agregas un valor que ya está, lo ignora. Con `[...set]` lo conviertes de nuevo en arreglo para poder ordenarlo y recorrerlo con `map`.
3. **Ordena en español.** `a.localeCompare(b, "es")` compara textos según las reglas del idioma. Aquí sí puedes usar `sort` (que muta) porque el arreglo lo acabas de crear tú con el spread; no es la prop.
4. **Pinta** cada etiqueta como `<li>`. Como son únicas, sirven de `key`.

```jsx
export function Etiquetas({ pizzas }) {
  const todas = pizzas.flatMap((pizza) => pizza.etiquetas);
  const unicas = [...new Set(todas)].sort((a, b) => a.localeCompare(b, "es"));

  return (
    <ul>
      {unicas.map((etiqueta) => (
        <li key={etiqueta}>{etiqueta}</li>
      ))}
    </ul>
  );
}
```

## Por qué funciona

Con el ejemplo:

| Paso | Resultado |
|---|---|
| `flatMap` | `["picante", "carne", "veggie", "picante"]` |
| `new Set(...)` | `Set { "picante", "carne", "veggie" }` (el segundo "picante" se ignora) |
| `[...set]` | `["picante", "carne", "veggie"]` |
| `sort` con `localeCompare` | `["carne", "picante", "veggie"]` |

¿Por qué no `sort()` sin comparador? Porque compara por código Unicode: la `á` tiene un código mayor que la `z`, así que `["zapallo", "ácida", "dulce"].sort()` da `["dulce", "zapallo", "ácida"]`. Con `localeCompare(b, "es")` sale `["ácida", "dulce", "zapallo"]`, que es lo que espera una persona.

Si una pizza tiene `etiquetas: []`, `flatMap` simplemente no agrega nada por ella.

## Errores comunes

- **Usar `map` en vez de `flatMap`.** Obtienes `[["picante", "carne"], ["veggie", "picante"]]`: el `Set` compara arreglos (por referencia) y no quita nada; en pantalla ves "picante,carne".
- **`sort()` sin comparador.** Las palabras con tilde o mayúscula inicial quedan al final.
- **Quitar repetidos con `filter` + `indexOf`.** Funciona, pero es más lento (recorre el arreglo por cada elemento) y menos claro que `Set`.
- **Olvidar convertir el `Set` a arreglo.** `new Set(...).map` no existe: `Set` no tiene `map` ni `sort`.

## Otra forma de resolverlo

Con `reduce` y un `Set` acumulador, en una sola pasada:

```jsx
const unicas = [
  ...pizzas.reduce((conjunto, pizza) => {
    pizza.etiquetas.forEach((e) => conjunto.add(e));
    return conjunto;
  }, new Set()),
].sort((a, b) => a.localeCompare(b, "es"));
```

**¿Cuándo conviene?** Casi nunca: hace lo mismo con más código. La versión con `flatMap` se lee como la descripción del problema ("todas las etiquetas, sin repetir, ordenadas"). Si ordenas muchos textos, puedes crear un `new Intl.Collator("es")` una vez y usar `collator.compare` como comparador: es más rápido que `localeCompare` en cada comparación.

## Cómo explicarlo en la entrevista

> "Con `flatMap` junto las etiquetas de todas las pizzas en un solo arreglo. Paso ese arreglo a un `Set`, que no admite repetidos, y con el spread lo vuelvo arreglo. Ordeno con `localeCompare` y el idioma español, porque `sort` sin comparador ordena por código Unicode y manda las palabras con tilde al final. Uso `sort` sin miedo porque el arreglo es una copia nueva, no la prop."

## Conceptos

- **`flatMap`**: `map` seguido de aplanar un nivel.
- **`Set`**: colección de valores únicos.
- **Spread `[...set]`**: convierte cualquier iterable en arreglo.
- **`localeCompare`**: compara textos según las reglas de un idioma.
- **`Intl.Collator`**: comparador reutilizable para ordenar muchos textos.
- **Mutar copias propias**: `sort` está bien sobre un arreglo que acabas de crear.
