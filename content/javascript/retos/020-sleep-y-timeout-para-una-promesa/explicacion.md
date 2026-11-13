## Idea clave

`conTimeout` pone a **competir** la promesa real contra una alarma que se rechaza al acabarse el tiempo, usando `Promise.race`: gana la primera que termine. Al final, `finally` apaga la alarma para no dejar temporizadores colgando.

## Paso a paso

1. **`sleep(ms)`**: `new Promise((resolver) => setTimeout(resolver, ms))`. El `setTimeout` llama a `resolver` a los `ms` milisegundos.
2. **En `conTimeout`, declara `let id`** fuera de la promesa de la alarma, para poder limpiarla después.
3. **Crea la alarma**: una promesa que solo sabe rechazarse. Dentro, `id = setTimeout(() => rechazar(new Error("Tiempo agotado")), ms)`.
4. **Haz la carrera**: `Promise.race([promesa, limite])` se cumple o se rechaza igual que la primera de las dos que termine.
5. **Limpia con `.finally(() => clearTimeout(id))`**. `finally` corre en ambos casos y deja pasar el valor o el error tal cual.

```js
export function sleep(ms) {
  return new Promise((resolver) => setTimeout(resolver, ms));
}

export function conTimeout(promesa, ms) {
  let id;
  const limite = new Promise((_, rechazar) => {
    id = setTimeout(() => rechazar(new Error("Tiempo agotado")), ms);
  });

  return Promise.race([promesa, limite]).finally(() => clearTimeout(id));
}
```

## Por qué funciona

Tres escenarios, con un límite de 100 ms:

| Escenario | Qué termina primero | `race` | `finally` |
|---|---|---|---|
| la promesa tarda 5 ms y se cumple con `"a tiempo"` | la promesa, a los 5 ms | se cumple con `"a tiempo"` | apaga la alarma (que iba a sonar a los 100) |
| la promesa tarda 500 ms | la alarma, a los 100 ms | se rechaza con "Tiempo agotado" | `clearTimeout` de una alarma que ya sonó: no hace nada |
| la promesa falla a los 10 ms con "caído" | la promesa, a los 10 ms | se rechaza con "caído" | apaga la alarma |

En el primer caso, sin el `clearTimeout`, la alarma seguiría programada: a los 100 ms rechazaría una promesa que ya nadie escucha. No rompe nada visible, pero en Node mantiene el proceso vivo hasta que suena y, con miles de peticiones, acumula temporizadores inútiles.

Un detalle: `race` **no cancela** la promesa perdedora. Si la petición tarda 500 ms, sigue corriendo; solo que su resultado se ignora. Para cancelar de verdad un `fetch` se usa `AbortController`.

## Errores comunes

- **Rechazar con un texto: `rechazar("Tiempo agotado")`.** No es un `Error`, así que no tiene `message` ni rastro de dónde ocurrió. Lo reconoces porque el test dice que `error` no es instancia de `Error`.
- **Declarar `id` dentro de la promesa con `const`.** No puedes leerlo desde el `finally`: salta "id is not defined".
- **Limpiar con `.then(() => clearTimeout(id))`.** Solo limpia si la promesa se cumple; si se rechaza, la alarma queda viva. Además, `.then` sin devolver nada reemplaza el valor por `undefined`.
- **En `sleep`, escribir `setTimeout(resolver(), ms)`.** Llamas a `resolver` en el momento y la promesa se cumple al instante. Lo reconoces porque el test de los 99 ms ve `listo = true`.
- **Usar `Promise.all` en vez de `race`.** Esperarías a las dos, y la alarma siempre termina rechazando.

## Otra forma de resolverlo

Construyendo la promesa a mano, sin `race`:

```js
export function conTimeout(promesa, ms) {
  return new Promise((resolver, rechazar) => {
    const id = setTimeout(() => rechazar(new Error("Tiempo agotado")), ms);
    promesa.then(
      (valor) => {
        clearTimeout(id);
        resolver(valor);
      },
      (error) => {
        clearTimeout(id);
        rechazar(error);
      },
    );
  });
}
```

Funciona porque una promesa solo cambia de estado una vez: la primera llamada a `resolver` o `rechazar` gana. Es más largo, pero muestra que entiendes qué hace `race` por dentro. La versión con `race` y `finally` es la que conviene en el día a día.

## Cómo explicarlo en la entrevista

> "`sleep` es una promesa que envuelve un `setTimeout`. Para el tiempo límite, pongo a competir la promesa real contra una que se rechaza al pasar el tiempo, usando `Promise.race`: la que termine primero decide. Si la real llega a tiempo, gana con su valor o su error; si no, gana el rechazo con 'Tiempo agotado'. Al final uso `finally` para limpiar el temporizador en cualquier caso. Ojo: `race` no cancela la promesa lenta; para cancelar un `fetch` de verdad usaría `AbortController`."

## Conceptos

- **`Promise.race`**: se queda con el resultado de la primera promesa que termine, sea éxito o error.
- **`.finally(fn)`**: corre `fn` al terminar, se cumpla o se rechace, sin cambiar el resultado.
- **`clearTimeout(id)`**: cancela un temporizador pendiente; si ya sonó, no hace nada.
- **`new Error(mensaje)`**: crea un error con `message` y el rastro de llamadas (`stack`).
- **Promesa de espera (`sleep`)**: `new Promise((r) => setTimeout(r, ms))`.
- **`AbortController`**: la forma estándar de cancelar un `fetch`.
