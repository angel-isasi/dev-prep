## Idea clave

Un **tipo mapeado** (`{ [K in keyof T]?: Regla<T[K]>[] }`) construye el tipo de las reglas **a partir** del tipo de los datos: para cada campo `K`, sus reglas reciben exactamente `T[K]`. Así el compilador conecta "campo edad" con "reglas de número". En ejecución, `validar` recorre los campos que tienen reglas y se queda con el primer mensaje de cada uno.

## Paso a paso

1. **`Reglas<T>`, el tipo mapeado.** `[K in keyof T]` recorre las claves de `T` (`"usuario" | "password" | "edad"`). El `?` las vuelve opcionales (no todos los campos necesitan reglas). `Regla<T[K]>[]` es "lista de reglas para el tipo de ese campo".
2. **`Errores<T>`.** `Record<keyof T, string>` es "un texto por cada campo"; `Partial` los vuelve opcionales, porque solo aparecen los que fallan.
3. **Recorrer las reglas.** `Object.keys(reglas)` devuelve los campos que tienen reglas, pero tipados como `string[]`. TypeScript es conservador: un objeto podría tener claves extra en tiempo de ejecución. Como tú construiste `reglas`, lo conviertes con `as (keyof T)[]` para poder escribir `datos[campo]`.
4. **Aplicar cada regla en orden.** `regla(datos[campo])`. Si devuelve un texto, es el error: lo guardas y haces `break` para no revisar las demás reglas de ese campo.
5. **Las reglas reutilizables** son funciones que **devuelven** una regla (fábricas). `minLargo(8)` devuelve `(valor) => ...` que recuerda `n = 8` gracias al closure.

```ts
export type Regla<V> = (valor: V) => string | null;
export type Reglas<T> = { [K in keyof T]?: Regla<T[K]>[] };
export type Errores<T> = Partial<Record<keyof T, string>>;

export function validar<T>(datos: T, reglas: Reglas<T>): Errores<T> {
  const errores: Errores<T> = {};
  for (const campo of Object.keys(reglas) as (keyof T)[]) {
    for (const regla of reglas[campo] ?? []) {
      const mensaje = regla(datos[campo]);
      if (mensaje !== null) {
        errores[campo] = mensaje;
        break;
      }
    }
  }
  return errores;
}

export function requerido(mensaje = "Este campo es obligatorio"): Regla<string> {
  return (valor) => (valor.trim() === "" ? mensaje : null);
}

export function minLargo(n: number): Regla<string> {
  return (valor) => (valor.length < n ? `Debe tener al menos ${n} caracteres` : null);
}
```

## Por qué funciona

Primero, lo que calcula TypeScript con `T = Registro`:

| Tipo | Se expande a |
|---|---|
| `keyof Registro` | `"usuario" \| "password" \| "edad"` |
| `Reglas<Registro>` | `{ usuario?: Regla<string>[]; password?: Regla<string>[]; edad?: Regla<number>[] }` |
| `Errores<Registro>` | `{ usuario?: string; password?: string; edad?: string }` |

Por eso `{ edad: [requerido()] }` no compila: `requerido()` es una `Regla<string>` y en `edad` se espera `Regla<number>`. Y `{ apellido: [...] }` no compila porque `apellido` no es una clave de `Registro`.

¿De dónde sale `T`? De `datos`. Al llamar `validar({ usuario: "al", ... }, reglas)`, TypeScript **infiere** `T` del primer argumento y después revisa que `reglas` encaje en `Reglas<T>`.

Recorrido en ejecución con `{ usuario: "al", password: "", edad: 16 }`:

| Campo | Regla | Resultado | ¿Qué pasa? |
|---|---|---|---|
| `usuario` | `requerido()` | `null` | sigue |
| `usuario` | `minLargo(3)` | `"Debe tener al menos 3 caracteres"` | guarda y `break` |
| `password` | `requerido("Escribe una contraseña")` | `"Escribe una contraseña"` | guarda y `break` (no corre `minLargo(8)`) |
| `edad` | `mayorDeEdad` | `"Debes ser mayor de edad"` | guarda |

## Errores comunes

- **`Reglas<T> = Record<keyof T, Regla<any>[]>`.** Todas las claves serían obligatorias (el objeto `soloUsuario` del test ya no compila) y `any` deja pasar `requerido()` en `edad`. Los `@ts-expect-error` del último test quedan sin usar.
- **`Regla<T[keyof T]>` en vez de `Regla<T[K]>`.** `T[keyof T]` es la unión de todos los tipos de campo (`string | number`): cada regla tendría que aceptar las dos cosas. El `K` del tipo mapeado es el que ata cada campo con su tipo.
- **No cortar en el primer error.** Sin `break`, la última regla que falla pisa a la primera: verías "Debe tener al menos 8 caracteres" para un password vacío, cuando el mensaje útil es "Escribe una contraseña".
- **Recorrer `Object.keys(datos)`** en vez de `Object.keys(reglas)`. Funciona, pero revisas campos sin reglas y tienes que manejar `reglas[campo]` como `undefined` igual.
- **Olvidar el `trim()` en `requerido`.** `"   "` pasaría como válido.
- **Guardar `errores[campo] = undefined`** para los campos que están bien. `toEqual({})` lo tolera, pero `"usuario" in errores` daría `true`: el código que muestra errores puede confundirse.

## Otra forma de resolverlo

**Con `reduce`**, de forma más funcional:

```ts
export function validar<T>(datos: T, reglas: Reglas<T>): Errores<T> {
  return (Object.keys(reglas) as (keyof T)[]).reduce<Errores<T>>((errores, campo) => {
    const mensaje = (reglas[campo] ?? [])
      .map((regla) => regla(datos[campo]))
      .find((m) => m !== null);
    return mensaje ? { ...errores, [campo]: mensaje } : errores;
  }, {});
}
```

Ojo: este `map` corre **todas** las reglas antes de buscar el primer error. Con reglas baratas da igual; con una regla cara (por ejemplo, una que consulta algo) conviene el bucle con `break`.

**¿Cuándo conviene?** El bucle es más fácil de leer y de depurar, y corta apenas encuentra un error: es el que mostraría en una entrevista. El `reduce` es más compacto si tu equipo prefiere estilo funcional. En proyectos reales se usa **Zod** o **Yup** con **React Hook Form**, que siguen esta misma idea de reglas por campo.

## Cómo explicarlo en la entrevista

> "Hice `validar` genérico en T, el tipo de los datos, que TypeScript infiere del primer argumento. Las reglas son un tipo mapeado sobre `keyof T`: para cada campo, una lista opcional de funciones que reciben `T[K]`, el tipo de ese campo, y devuelven el mensaje o null. Así no puedo poner una regla de texto en un campo numérico ni reglas para un campo que no existe. El resultado es `Partial<Record<keyof T, string>>`. En ejecución recorro los campos con reglas y me quedo con el primer error de cada uno. `requerido` y `minLargo` son fábricas que devuelven reglas, gracias a closures."

## Conceptos

- **Genéricos** con inferencia desde un argumento (tema de Aprender: genéricos).
- **`keyof`** y **acceso indexado** `T[K]`.
- **Tipos mapeados** `{ [K in keyof T]?: ... }`.
- **Utility types**: `Partial` y `Record` (tema de Aprender: utility types).
- **`Object.keys` devuelve `string[]`** y por qué hace falta `as (keyof T)[]`.
- **Funciones que devuelven funciones** (fábricas) y **closures**.
- **`break`** para salir de un bucle.
- **`trim()`** para ignorar espacios.
