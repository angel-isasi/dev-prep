Escribe la función `capitalizar(frase)` que reciba un texto y devuelva un texto nuevo donde **cada palabra empieza con mayúscula y el resto va en minúsculas**.

## Reglas

- Las palabras están separadas por espacios.
- La primera letra de cada palabra va en mayúscula; **todas las demás en minúscula**, aunque vengan mezcladas (`"uNIVERSIDAD"` pasa a `"Universidad"`).
- **Respeta los espacios tal como vienen**: si hay dos espacios seguidos, el resultado también los tiene.
- Un texto vacío devuelve `""`.

## Ejemplos

```js
capitalizar("uNIVERSIDAD nacional de ica");   // "Universidad Nacional De Ica"
capitalizar("lIMA");                          // "Lima"
capitalizar("hola  mundo");                   // "Hola  Mundo"  (dos espacios)
capitalizar("");                              // ""
```

## Por qué importa

Formatear nombres que el usuario escribió como sea (todo en mayúsculas, todo en minúsculas) es una tarea real en formularios y listados. Y el ejercicio entrena una forma de pensar muy útil: **separar, transformar cada parte y volver a unir**.
