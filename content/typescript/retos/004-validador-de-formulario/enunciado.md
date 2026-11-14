Escribe un **validador de formularios genérico**: sirve para cualquier formulario (registro, login, checkout) porque recibe los datos y un objeto de **reglas por campo**. La gracia está en los tipos: una regla para un campo `number` debe recibir un `number`, y no puedes poner reglas a un campo que no existe.

## Tipos

```ts
// Una regla recibe el valor de un campo y devuelve el mensaje de error, o null si está bien.
type Regla<V> = (valor: V) => string | null;   // ya viene en el archivo de inicio

type Reglas<T> = ...   // tú lo escribes
type Errores<T> = ...  // tú lo escribes
```

- `Reglas<T>`: un objeto donde cada clave es un campo de `T` (todas opcionales) y su valor es un arreglo de `Regla` **para el tipo de ese campo**. Pista de nombre: es un **tipo mapeado**.
- `Errores<T>`: `Partial<Record<keyof T, string>>`, como mucho un mensaje por campo.

## Reglas

- `validar<T>(datos: T, reglas: Reglas<T>): Errores<T>`:
  - Para cada campo que tenga reglas, aplica sus reglas **en orden** al valor del campo.
  - Guarda **solo el primer** mensaje de error de cada campo (las siguientes reglas de ese campo ya no se revisan).
  - Los campos sin errores no aparecen en el resultado. Si todo está bien, devuelve `{}`.
  - Los campos sin reglas no se revisan.
- `requerido(mensaje?)`: regla de texto que falla si el texto está vacío o tiene solo espacios. Mensaje por defecto: `"Este campo es obligatorio"`.
- `minLargo(n)`: regla de texto que falla si tiene menos de `n` caracteres, con el mensaje `"Debe tener al menos N caracteres"`.

## Ejemplos

```ts
type Registro = { usuario: string; password: string; edad: number };

const mayorDeEdad = (edad: number) => (edad >= 18 ? null : "Debes ser mayor de edad");

const reglas: Reglas<Registro> = {
  usuario: [requerido(), minLargo(3)],
  password: [requerido("Escribe una contraseña"), minLargo(8)],
  edad: [mayorDeEdad],
};

validar({ usuario: "angel", password: "12345678", edad: 20 }, reglas);
// {}

validar({ usuario: "al", password: "", edad: 16 }, reglas);
// {
//   usuario: "Debe tener al menos 3 caracteres",
//   password: "Escribe una contraseña",      <- solo el primero, aunque también falla minLargo
//   edad: "Debes ser mayor de edad",
// }

validar(datos, { apellido: [requerido()] });  // Error de TypeScript: "apellido" no existe
validar(datos, { edad: [requerido()] });      // Error de TypeScript: requerido es para textos
```

## Por qué importa

Validar formularios es trabajo diario del frontend, y las librerías que lo hacen (React Hook Form, Zod, Formik) están construidas justo con estas piezas: genéricos, `keyof`, tipos mapeados y `Partial<Record<...>>`. Escribir una versión pequeña te hace entender sus tipos cuando VS Code te los muestra, y en una entrevista es una forma muy concreta de demostrar que sabes genéricos más allá de `Array<T>`.
