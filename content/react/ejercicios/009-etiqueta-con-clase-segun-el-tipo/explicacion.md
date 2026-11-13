## Idea clave

Cuando un valor depende de otro según una relación fija, un **objeto como tabla de búsqueda** reemplaza una cadena de `if`. Lees con `CLASES[tipo]` y cubres el caso "no encontrado" con `??`. En JSX la clase CSS se pone con **`className`**.

## Paso a paso

1. **Define la tabla fuera del componente**: un objeto `CLASES` donde cada clave es un tipo y cada valor su clase. Va fuera porque no cambia nunca.
2. **Busca la clase con corchetes**: `CLASES[tipo]`. Con `tipo = "picante"` es lo mismo que `CLASES.picante`, pero los corchetes permiten usar una variable como clave.
3. **Pon un valor de respaldo** con `??`: si el tipo no está en la tabla, `CLASES[tipo]` es `undefined` y `?? "etiqueta"` devuelve `"etiqueta"`.
4. **Asígnala con `className`**. En JSX se usa `className` porque `class` es palabra reservada de JavaScript. En el DOM final aparece como `class="..."`.
5. **Muestra el tipo** como texto del `<span>`.

```jsx
// Tabla de búsqueda: tipo -> clase CSS.
const CLASES = {
  nuevo: "etiqueta verde",
  agotado: "etiqueta gris",
  picante: "etiqueta roja",
};

export function Etiqueta({ tipo }) {
  return <span className={CLASES[tipo] ?? "etiqueta"}>{tipo}</span>;
}
```

## Por qué funciona

| Prop `tipo` | `CLASES[tipo]` | Tras `?? "etiqueta"` | Se pinta |
|---|---|---|---|
| `"picante"` | `"etiqueta roja"` | `"etiqueta roja"` | `<span class="etiqueta roja">picante</span>` |
| `"nuevo"` | `"etiqueta verde"` | `"etiqueta verde"` | `<span class="etiqueta verde">nuevo</span>` |
| `"vegano"` | `undefined` | `"etiqueta"` | `<span class="etiqueta">vegano</span>` |

`??` (operador *nullish coalescing*) devuelve el lado derecho solo si el izquierdo es `null` o `undefined`. Agregar un tipo nuevo es una línea más en el objeto, sin tocar la lógica del componente.

## Errores comunes

- **Usar `class` en vez de `className`.** React muestra en la consola la advertencia "Invalid DOM property `class`. Did you mean `className`?". Aunque a veces la clase igual se aplique, en JSX lo correcto es `className`.
- **Olvidar el caso desconocido.** Sin `??`, un tipo que no está en la tabla da `className={undefined}` y el span queda sin clase. Lo reconoces porque falla el test de "vegano".
- **Usar `CLASES.tipo`** (con punto). Eso busca una clave literal llamada `"tipo"`, no el valor de la variable. Siempre da `undefined`.
- **Repetir "etiqueta" con espacios mal puestos** (`"etiqueta  roja"` o `"etiquetaroja"`). Los tests comparan el `className` exacto.
- **Una cadena larga de `if`/`else if` o un `switch` dentro del JSX.** Funciona, pero es más largo, más fácil de equivocarse y obliga a tocar la lógica para cada tipo nuevo.

## Otra forma de resolverlo

Guardar en la tabla solo el color y armar la clase con un template literal:

```jsx
const COLORES = { nuevo: "verde", agotado: "gris", picante: "roja" };

export function Etiqueta({ tipo }) {
  const color = COLORES[tipo];
  const clase = color ? `etiqueta ${color}` : "etiqueta";
  return <span className={clase}>{tipo}</span>;
}
```

**¿Cuándo conviene?** Cuando todas las variantes comparten una clase base y solo cambia un modificador, como aquí: evitas repetir `"etiqueta"` en cada valor. En proyectos reales se suele usar una pequeña librería como `clsx` para combinar clases condicionales, pero la idea es la misma.

## Cómo explicarlo en la entrevista

> "En vez de encadenar `if` por cada tipo, uso un objeto como tabla de búsqueda: la clave es el tipo y el valor la clase. Así agregar un tipo nuevo es solo una línea. Leo con corchetes porque la clave es una variable, y uso `??` para dar una clase por defecto si el tipo no existe. La tabla va fuera del componente porque no cambia entre renders, y en JSX uso `className` porque `class` es palabra reservada."

## Conceptos

- **`className`**: atributo JSX para la clase CSS (en el DOM se ve como `class`).
- **Objeto como tabla de búsqueda**: reemplaza `if`/`switch` cuando la relación es fija.
- **Notación de corchetes**: `objeto[variable]` lee la clave guardada en la variable.
- **`??` (nullish coalescing)**: valor de respaldo solo si el original es `null` o `undefined`.
- **Template literals**: `` `etiqueta ${color}` `` para armar textos con variables.
