## Idea clave

Para formatear dinero usa **`Intl.NumberFormat`**, que ya sabe el símbolo, el separador de miles y los decimales de cada país. Y como el formateador **no depende de props ni de estado**, se crea **una sola vez fuera del componente**.

## Paso a paso

1. **Crea el formateador fuera del componente**: `new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN" })`.
   - `"es-PE"`: español de Perú (decide comas, puntos y posición del símbolo).
   - `style: "currency"`: formato de moneda (agrega símbolo y 2 decimales).
   - `currency: "PEN"`: el código internacional del sol peruano.
2. **Úsalo dentro del componente**: `formatoSoles.format(monto)` devuelve un texto como `"S/ 1,234.50"`.
3. **Píntalo en un `<span>`**, que es una etiqueta "en línea": sirve para meter el precio dentro de un texto sin cortar la línea.

```jsx
// Se crea una sola vez, fuera del componente: no cambia entre renders.
const formatoSoles = new Intl.NumberFormat("es-PE", {
  style: "currency",
  currency: "PEN",
});

export function Precio({ monto }) {
  return <span>{formatoSoles.format(monto)}</span>;
}
```

## Por qué funciona

| Prop `monto` | `formatoSoles.format(monto)` | Se pinta |
|---|---|---|
| `1234.5` | `"S/ 1,234.50"` | `<span>S/ 1,234.50</span>` |
| `28` | `"S/ 28.00"` | `<span>S/ 28.00</span>` |
| `1000000` | `"S/ 1,000,000.00"` | `<span>S/ 1,000,000.00</span>` |

**¿Por qué fuera del componente?** Todo lo que escribes dentro de la función del componente se ejecuta **en cada render**. Si crearas el formateador adentro, se construiría uno nuevo cada vez que el precio se vuelve a pintar, y crearlo es más costoso que usarlo. Fuera del componente, el módulo lo crea una sola vez al cargarse y todos los renders (y todas las copias de `<Precio>`) comparten el mismo.

Detalle: según el sistema, entre `S/` y el número puede ir un espacio normal o un espacio "duro" (que no deja cortar la línea). Por eso los tests usan `\s` en la expresión regular.

## Errores comunes

- **Formatear a mano** con `"S/ " + monto`. Da `S/ 1234.5`: sin separador de miles ni el cero final. Lo reconoces porque fallan casi todos los tests.
- **Usar solo `toFixed(2)`**: da `S/ 1234.50`, con decimales pero sin la coma de miles.
- **Crear el formateador dentro del componente.** Funciona, pero se reconstruye en cada render. En una lista de 200 productos son 200 formateadores por render.
- **Escribir mal el código de moneda** (`"SOL"`, `"S/"`). `Intl` lanza un error de "Invalid currency code". El código ISO del sol es `PEN`.
- **Pasar el monto como texto** (`monto="28"`). `format` lo convierte, pero es mejor pasar números con llaves: `monto={28}`.

## Otra forma de resolverlo

Con el método de los números `toLocaleString`, que usa `Intl` por dentro:

```jsx
export function Precio({ monto }) {
  return (
    <span>
      {monto.toLocaleString("es-PE", { style: "currency", currency: "PEN" })}
    </span>
  );
}
```

**¿Cuándo conviene?** Para un uso puntual es cómodo y se lee bien. Pero cada llamada puede crear internamente un formateador nuevo, así que en listas grandes o componentes que se renderizan mucho es mejor el `Intl.NumberFormat` creado una vez. Si el idioma o la moneda llegaran por props, podrías crear el formateador dentro del componente con `useMemo` para recrearlo solo cuando cambien.

## Cómo explicarlo en la entrevista

> "Uso `Intl.NumberFormat` con `es-PE` y la moneda `PEN`, que ya resuelve el símbolo, los separadores de miles y los decimales; no reinvento el formato a mano. El formateador lo creo fuera del componente porque no depende de props ni de estado: así se construye una sola vez y no en cada render. Si la moneda viniera por props, lo memorizaría con `useMemo`."

## Conceptos

- **`Intl.NumberFormat`**: API de JavaScript para formatear números según idioma y país.
- **`style: "currency"` + `currency: "PEN"`**: formato de moneda con el código ISO del sol peruano.
- **Código fuera del componente**: lo que no depende de props ni estado se define una vez a nivel de módulo.
- **Cada render ejecuta toda la función**: por eso conviene sacar los cálculos fijos.
- **`toLocaleString`**: atajo de `Intl` en los números, cómodo para usos puntuales.
- **`<span>`**: contenedor en línea para un trozo de texto.
