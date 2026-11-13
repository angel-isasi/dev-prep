Usa una **función generadora** para repartir ids únicos y úsala en un componente que agrega mesas a una lista.

Exporta:

1. **`generarIds(prefijo)`**: una función generadora (`function*`) que entrega, sin fin, `"<prefijo>-1"`, `"<prefijo>-2"`, `"<prefijo>-3"`, ...
2. **`Mesas`**: un componente con un botón **"Agregar mesa"** y una lista `<ul>`. Cada clic agrega un `<li>` con el siguiente id (`mesa-1`, `mesa-2`, ...).

## Reglas

- Cada llamada a `generarIds` crea un generador **independiente** que empieza en 1.
- `Mesas` crea su generador **una sola vez** (no en cada render) y lo guarda en un `useRef`.
- El id se pide **en el manejador del clic**, no dentro de la función que le pasas a `setMesas`.
- Al inicio la lista está vacía (ningún `<li>`).
- Usa el id como `key` de cada `<li>`.

## Ejemplo

```js
const ids = generarIds("mesa");
ids.next().value; // "mesa-1"
ids.next().value; // "mesa-2"
```

| Acción | Lista |
|---|---|
| (inicio) | (vacía) |
| 1 clic en "Agregar mesa" | mesa-1 |
| 2 clics más | mesa-1, mesa-2, mesa-3 |

## Por qué importa

Toda lista dinámica necesita `key` únicas y estables. Los generadores son un tema de JavaScript que muchos juniors no dominan y que a veces sale en entrevistas ("¿qué hace `yield`?"). Además, este ejercicio te obliga a pensar **dónde** se permiten efectos secundarios en React: en los manejadores sí, en las funciones de actualización del estado no.
