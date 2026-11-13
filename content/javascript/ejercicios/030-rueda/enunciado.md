Escribe la función `rueda(...valores)` que reciba cualquier cantidad de valores y devuelva una función. Cada vez que llamas a esa función, devuelve el **siguiente** valor de la lista; cuando llega al final, **vuelve a empezar** desde el primero.

## Reglas

- La primera llamada devuelve el primer valor.
- Después del último valor, vuelve al primero, y así para siempre.
- Si solo hay un valor, siempre devuelve ese.
- Cada rueda lleva su propia posición.

## Ejemplos

```js
const turno = rueda("X", "O");
turno();   // "X"
turno();   // "O"
turno();   // "X"
turno();   // "O"

const semaforo = rueda("verde", "amarillo", "rojo");
semaforo();   // "verde"
semaforo();   // "amarillo"
semaforo();   // "rojo"
semaforo();   // "verde"
```

## Por qué importa

Recorrer algo "en círculo" es muy común en el frontend: un carrusel de imágenes que vuelve al inicio, turnos de un juego, un botón que cambia entre tema claro, oscuro y automático. Combina un contador privado con el operador `%` (módulo), un truco que vas a usar muchísimo.
