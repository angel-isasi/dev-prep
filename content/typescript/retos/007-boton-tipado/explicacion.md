## Idea clave

Las props de un componente son un **objeto**, y se tipan igual que cualquier objeto: con un `type` (o `interface`). Cuando una prop solo puede tomar unos pocos valores, en vez de `string` se usa una **unión de literales** (`"primario" | "secundario" | "peligro"`). Así TypeScript rechaza los errores de tipeo antes de ejecutar y VS Code te autocompleta las opciones.

## Paso a paso

1. **El tipo de la variante.** Un literal es un tipo que admite **un solo valor**: el tipo `"primario"` solo acepta el texto `"primario"`. Al unirlos con `|` obtienes un tipo que acepta exactamente esos tres.
2. **El tipo de las props.** Cuatro propiedades. Las opcionales llevan `?`: quien use el botón puede omitirlas, y dentro del componente su tipo incluye `undefined`.
3. **`children: ReactNode`.** `ReactNode` es el tipo de "cualquier cosa que React puede pintar": texto, números, elementos JSX, arreglos de elementos, `null`. Como no lleva `?`, es obligatorio.
4. **`onClick?: () => void`.** Una función que no recibe nada y no devuelve nada útil. Es opcional: un botón puede no hacer nada (por ejemplo, mientras está deshabilitado).
5. **Desestructurar con valores por defecto.** `{ variante = "primario", deshabilitado = false }`. Además de dar el valor por defecto, TypeScript entiende que dentro de la función `variante` ya no puede ser `undefined`: su tipo es `Variante`.
6. **El JSX.** `type="button"`, la clase con un template literal y `disabled={deshabilitado}`.

```tsx
import type { ReactNode } from "react";

export type Variante = "primario" | "secundario" | "peligro";

export type BotonProps = {
  variante?: Variante;
  children: ReactNode;
  onClick?: () => void;
  deshabilitado?: boolean;
};

export function Boton({ variante = "primario", children, onClick, deshabilitado = false }: BotonProps) {
  return (
    <button type="button" className={`boton boton--${variante}`} onClick={onClick} disabled={deshabilitado}>
      {children}
    </button>
  );
}
```

`import type` le dice a TypeScript que solo importas un tipo: desaparece al compilar y no carga nada en tiempo de ejecución.

## Por qué funciona

Cómo revisa TypeScript tres usos distintos:

| Uso | Lo que ve TypeScript | Resultado |
|---|---|---|
| `<Boton>Guardar</Boton>` | `children: "Guardar"` (es un `ReactNode`), el resto se omite (son opcionales) | Compila. En el render, `variante` vale `"primario"` por defecto: clase `"boton boton--primario"` |
| `<Boton variante="peligro" deshabilitado>Eliminar</Boton>` | `"peligro"` es uno de los 3 literales; `deshabilitado` sin valor equivale a `true` | Compila. Clase `"boton boton--peligro"` y `disabled` |
| `<Boton variante="rojo">Hola</Boton>` | `"rojo"` no se puede asignar a `Variante` | **Error de tipos**: el test con `@ts-expect-error` lo confirma |
| `<Boton />` | falta `children`, que no tiene `?` | **Error de tipos** |

Sobre el clic deshabilitado: un `<button disabled>` no dispara eventos de clic en el navegador, así que no necesitas un `if (!deshabilitado)` dentro del manejador.

En los tests, `@ts-expect-error` funciona al revés de lo normal: si la línea de abajo **no** da error, el que falla es tsc ("Directiva @ts-expect-error no usada"). Así se prueba que tus tipos rechazan lo que deben rechazar. Dentro de JSX se escribe como comentario entre llaves: `{/* @ts-expect-error ... */}`.

## Errores comunes

- **`variante?: string`.** Compila todo, incluido `"rojo"`, y el test de tipos falla con "Directiva @ts-expect-error no usada". El error se vería recién en pantalla: un botón sin estilos.
- **`children: string`.** Funciona con `<Boton>Guardar</Boton>`, pero rechaza `<Boton><Icono /> Guardar</Boton>`. Para contenido de React usa `ReactNode`.
- **`children?: ReactNode`** (opcional). Entonces `<Boton />` compila y el botón queda vacío. Un botón sin texto tampoco es accesible.
- **`onClick: Function`** o `any`. `Function` acepta cualquier función y no dice nada de sus parámetros. Escribe la firma: `() => void`.
- **Olvidar `type="button"`.** Por defecto un `<button>` dentro de un `<form>` es de tipo `submit` y envía el formulario. Es un bug real muy común.
- **Poner el valor por defecto en el tipo.** Los tipos no tienen valores: `variante?: Variante = "primario"` no existe. El valor por defecto va en la desestructuración.

## Otra forma de resolverlo

**Extender las props nativas del `<button>`.** En un sistema de diseño real se quiere que `Boton` acepte también `aria-label`, `id`, `title`, etc., sin declararlas una por una:

```tsx
import type { ComponentProps } from "react";

type BotonProps = ComponentProps<"button"> & {
  variante?: "primario" | "secundario" | "peligro";
};

export function Boton({ variante = "primario", className, ...resto }: BotonProps) {
  return <button type="button" {...resto} className={`boton boton--${variante} ${className ?? ""}`} />;
}
```

`ComponentProps<"button">` trae todas las props de un `<button>` de HTML (`onClick` con su evento, `disabled`, `children`...). El `...resto` las pasa tal cual.

**¿Cuándo conviene?** La versión del ejercicio es más clara y controla exactamente qué se puede pasar: ideal para aprender y para componentes simples. La de `ComponentProps` es lo que verás en librerías de componentes, porque no obliga a agregar cada atributo de HTML a mano.

**`type` o `interface`:** para props las dos sirven. `interface` se puede extender con `extends` y fusionar; `type` permite uniones (`Variante`). Muchos equipos usan `type` para todo por consistencia.

## Cómo explicarlo en la entrevista

> "Tipo las props con un `type`. La variante no es un `string` cualquiera sino una unión de literales con las tres opciones válidas, así el editor me las autocompleta y si alguien escribe 'rojo' le marca el error antes de ejecutar. `children` es `ReactNode` porque puede ser texto o elementos, y lo dejo obligatorio. Las opcionales llevan signo de interrogación y les doy un valor por defecto al desestructurar, con lo que dentro del componente ya no son `undefined`. Además pongo `type='button'` para que no envíe un formulario por accidente."

## Conceptos

- **Tipos literales y uniones**: `"a" | "b"` acepta solo esos valores (tema de Aprender: uniones y narrowing).
- **Props tipadas** con `type` o `interface` (tema de Aprender: React con TypeScript).
- **Propiedades opcionales** `?` y su relación con `undefined`.
- **Valores por defecto al desestructurar**: también quitan el `undefined` del tipo.
- **`ReactNode`**: todo lo que React puede renderizar.
- **Tipos de funciones**: `() => void`.
- **`import type`**: importa solo tipos, no código.
- **`@ts-expect-error`**: comprueba que una línea **sí** da error de tipos.
- **`ComponentProps<"button">`**: las props nativas de un elemento HTML.
