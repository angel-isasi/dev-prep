## En una frase

Una **tabla hash** guarda pares clave y valor y encuentra cualquier clave en **O(1)**; en JavaScript la usas con `Map` o con un objeto, y es la forma más común de convertir una solución O(n²) en O(n).

## Lo esencial

### Map en 6 métodos

```js
const edades = new Map();
edades.set("Ana", 20);      // guarda (o reemplaza)
edades.get("Ana");          // 20
edades.get("Luis");         // undefined: no existe
edades.has("Ana");          // true
edades.delete("Ana");       // lo quita
edades.size;                // cuántas claves hay (propiedad, sin paréntesis)

for (const [nombre, edad] of edades) console.log(nombre, edad); // en orden de inserción
```

`get`, `set`, `has` y `delete` son O(1) en promedio: no recorren nada, calculan dónde está la clave.

### Patrón 1: contar frecuencias

```js
function frecuencias(texto) {
  const cuenta = new Map();
  for (const letra of texto) {
    cuenta.set(letra, (cuenta.get(letra) ?? 0) + 1);
  }
  return cuenta;
}
frecuencias("banana"); // Map { "b" => 1, "a" => 3, "n" => 2 }
```

`(cuenta.get(letra) ?? 0) + 1` es la línea que vas a escribir cientos de veces: "lo que había, o 0, más uno". Sirve para anagramas, el más repetido, el primero que no se repite, y si un texto alcanza para formar otro.

### Patrón 2: ¿ya vi lo que me falta?

En vez de comparar cada par, recorre una vez y pregúntale al `Map` por lo que necesitas.

```js
// ¿Hay dos precios cuya diferencia sea exactamente k? Devuelve los índices.
function parConDiferencia(precios, k) {
  const vistos = new Map(); // precio -> índice donde lo vi
  for (let i = 0; i < precios.length; i++) {
    const p = precios[i];
    if (vistos.has(p - k)) return [vistos.get(p - k), i];
    if (vistos.has(p + k)) return [vistos.get(p + k), i];
    vistos.set(p, i);
  }
  return null;
}
parConDiferencia([10, 4, 7, 15], 3); // [1, 2]: 7 - 4 = 3
```

Primero preguntas y **después** guardas: así no emparejas un elemento consigo mismo.

### Patrón 3: agrupar por una clave

```js
function agruparPorInicial(nombres) {
  const grupos = new Map();
  for (const nombre of nombres) {
    const clave = nombre[0];
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave).push(nombre);
  }
  return [...grupos.values()];
}
agruparPorInicial(["Ana", "Luis", "Aldo"]); // [["Ana", "Aldo"], ["Luis"]]
```

La clave puede ser cualquier cosa calculada: la inicial, el largo, o las letras ordenadas de una palabra.

### Map u objeto

```js
const conteo = {};
conteo[letra] = (conteo[letra] ?? 0) + 1; // también funciona
```

| | `Map` | Objeto `{}` |
|---|---|---|
| Tipo de clave | cualquiera (números, objetos) | se convierte a string |
| Cantidad | `map.size` | `Object.keys(obj).length` |
| Recorrer | `for...of` directo | `Object.entries(obj)` |
| Claves heredadas | ninguna | ojo con `"constructor"`, `"toString"` |

Para algoritmos prefiere `Map`: es más claro y no tiene sorpresas. Un objeto está bien para claves fijas y conocidas.

## Errores típicos

**1. Olvidar el valor inicial.** `cuenta.set(x, cuenta.get(x) + 1)` da `NaN` la primera vez, porque `undefined + 1` es `NaN`. Usa `?? 0`.

**2. Usar `map[clave]` con un Map.** Eso crea una propiedad normal y `get` no la ve. Con `Map` siempre `get` y `set`.

**3. Revisar `if (map.get(x))` cuando el valor puede ser 0.** El índice 0 o una cuenta 0 son falsos. Usa `map.has(x)`.

**4. Claves que el objeto convierte.** En un objeto, `obj[1]` y `obj["1"]` son la misma clave, y `obj[{}]` guarda en `"[object Object]"`.

```js
const o = {};
o[1] = "a";
Object.keys(o); // ["1"]: el número pasó a string
```

**5. Guardar antes de preguntar.** En "busca el complemento", si guardas el elemento actual antes de buscar, un número puede emparejarse consigo mismo.

## Chuleta

| Necesitas | Escribe |
|---|---|
| Contar | `m.set(x, (m.get(x) ?? 0) + 1)` |
| ¿Existe? | `m.has(x)` |
| Agrupar | `if (!m.has(k)) m.set(k, []); m.get(k).push(x)` |
| Recorrer | `for (const [clave, valor] of m)` |
| Pasar a array | `[...m.entries()]`, `[...m.values()]` |

- Señal en el enunciado: "contar", "frecuencia", "ya apareció", "par que sume", "agrupar".
- Precio: O(n) de memoria a cambio de búsquedas O(1).

## En la entrevista

**¿Qué es una tabla hash?**
Una estructura que guarda pares clave y valor. Usa una función hash para calcular en qué lugar va cada clave, así que buscar, insertar y borrar cuestan O(1) en promedio.

**¿Cuándo usarías Map en lugar de un objeto?**
Cuando las claves son dinámicas o no son strings, cuando necesito saber el tamaño con `size` o recorrer en orden de inserción. Un objeto convierte todas las claves a string y trae propiedades heredadas.

**¿Cómo mejorarías una solución con dos bucles anidados que busca pares?**
Recorro una sola vez guardando en un `Map` lo que ya vi, y en cada elemento pregunto si su complemento ya está. Paso de O(n²) a O(n) de tiempo, usando O(n) de memoria.

**¿Qué es una colisión?**
Cuando dos claves distintas caen en el mismo lugar de la tabla. El motor de JavaScript las resuelve por dentro; por eso se dice O(1) en promedio y no siempre.
