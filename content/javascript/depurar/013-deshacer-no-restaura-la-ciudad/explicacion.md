## Idea clave

El spread (`{ ...usuario }`) hace una copia **superficial**: crea un objeto nuevo con las mismas propiedades, pero si una propiedad es un objeto (como `direccion`), copia **la referencia**, no el objeto. La copia y el original terminan compartiendo la misma dirección, y modificarla desde la copia también la modifica en el original. Hay que copiar cada nivel que vas a cambiar.

## Paso a paso

1. **Lee el síntoma.** El original cambia "solo", aunque el código hace una copia. Cuando hay una copia y aun así el original cambia, piensa en objetos anidados.
2. **Reprodúcelo.** Guarda `antes`, llama a `cambiarCiudad(antes, "Cusco")` y mira `antes.direccion.ciudad`: dice `"Cusco"`.
3. **Aísla.** `copia === usuario` da `false` (el primer nivel sí se copió), pero `copia.direccion === usuario.direccion` da `true`. El nivel de adentro es el mismo objeto.
4. **Copia también la dirección.**

```js
const copia = { ...usuario, direccion: { ...usuario.direccion } };
copia.direccion.ciudad = ciudad;
```

## Por qué funciona

| | `{ ...usuario }` | `{ ...usuario, direccion: { ...usuario.direccion } }` |
|---|---|---|
| ¿`copia === usuario`? | no | no |
| ¿`copia.direccion === usuario.direccion`? | **sí** (la misma) | no (una nueva) |
| ¿Cambiar la ciudad toca el original? | sí | no |

En el objeto literal, `direccion: {...}` aparece **después** del `...usuario`, así que reemplaza a la `direccion` copiada por una nueva. Esa dirección nueva tiene la misma calle y ciudad, y ahora sí se puede cambiar sin afectar a nadie.

Esta es la base de cómo se actualiza el estado anidado en React: se copia el camino hasta el dato que cambia, nivel por nivel.

## Errores comunes

- **`Object.assign({}, usuario)`**: es lo mismo que el spread, también superficial. El problema sigue igual.
- **`JSON.parse(JSON.stringify(usuario))`**: copia todo en profundidad, pero pierde fechas (`Date` se vuelve texto), funciones y `undefined`. Sirve para datos simples, no como hábito.
- **Copiar solo la dirección**: `const direccion = { ...usuario.direccion }; direccion.ciudad = ciudad; return usuario;`. Devuelves el mismo usuario de antes, sin la ciudad nueva.

## Otra forma de resolverlo

Construir el resultado completo en una sola expresión, sin modificar nada después:

```js
export function cambiarCiudad(usuario, ciudad) {
  return { ...usuario, direccion: { ...usuario.direccion, ciudad } };
}
```

Es la forma más común en código de React y Redux. Para copias profundas de verdad existe `structuredClone(usuario)`, que sí mantiene las fechas, aunque copia todo aunque solo cambies un campo.

## Cómo explicarlo en la entrevista

> "El código copiaba con spread, pero el spread es superficial: la dirección es un objeto y se copió su referencia, así que copia y original compartían la misma dirección. Lo vi comparando `copia.direccion === usuario.direccion`, que daba `true`. Lo arreglé copiando también la dirección. En React se hace igual: copias cada nivel desde la raíz hasta el dato que cambias."

## Conceptos

- **Copia superficial**: copia solo el primer nivel; los objetos de adentro se comparten.
- **Copia profunda**: copia todos los niveles (`structuredClone`).
- **Referencia**: una variable que apunta a un objeto; dos variables pueden apuntar al mismo.
- **Spread de objetos**: `{ ...obj, clave: valor }` copia `obj` y sobrescribe `clave`.
- **Inmutabilidad**: crear datos nuevos en vez de modificar los existentes; permite deshacer y comparar antes y después.
