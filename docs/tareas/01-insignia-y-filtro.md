# Tarea 1: Insignia y filtro de ejercicios

Dos piezas pequeñas de la app que vas a programar tú. Ya tienen sus tests escritos: tu trabajo es que pasen.

```
npm test
```

Al empezar vas a ver 17 tests en rojo. Cuando termines, todos deben estar en verde. Mientras programas puedes dejar los tests corriendo solos al guardar:

```
npx vitest --config vitest.config.js client/src
```

---

## Parte A: `filtrarEjercicios` (JavaScript puro)

**Archivo:** `client/src/lib/filtrarEjercicios.js`
**Tests:** `client/src/lib/filtrarEjercicios.test.js`

La pantalla Practicar tiene un buscador y tres selectores (tema, nivel, estado). Tu función recibe la lista completa y los filtros, y devuelve solo los ejercicios que cumplen **todos** los filtros.

```js
filtrarEjercicios(lista, { texto: "two", tema: "", nivel: "2", estado: "" });
// -> solo los ejercicios de nivel 2 cuyo título o tags contengan "two"
```

### Reglas

- Un filtro vacío (`""`) significa "todos": no filtra nada.
- `tema` y `estado`: el ejercicio debe tener exactamente ese valor.
- `nivel` llega como **texto** (`"2"`), porque viene de un `<select>`, pero en el ejercicio es un **número** (`2`). Ojo con `===`.
- `texto`: no importan las mayúsculas, se ignoran los espacios a los costados y busca en el `titulo` **y** en los `tags`.
- No debes modificar la lista original.

### Pistas (léelas solo si te trabas)

1. Todo se resuelve con un solo `filter`. Dentro, una condición por filtro, unidas con `&&`.
2. Para que un filtro vacío "deje pasar todo": `!tema || ej.tema === tema`. Si `tema` es `""`, `!tema` es `true` y la condición se cumple sin mirar nada más.
3. Para el texto: prepara la búsqueda una sola vez fuera del `filter` (`texto.trim().toLowerCase()`) y dentro usa `includes` en el título y `some` en los tags.

### Lo que te preguntaría en una entrevista

- ¿Por qué `filter` y no un `for` con `push`? ¿Qué devuelve `filter` si nada coincide?
- ¿Qué pasa si comparas `"2" === 2`? ¿Y `"2" == 2`? ¿Por qué conviene convertir con `Number()` en vez de usar `==`?
- ¿Tu función modifica la lista original? ¿Cómo lo sabes?

---

## Parte B: componente `Insignia` (React)

**Archivo:** `client/src/components/Insignia.jsx`
**Tests:** `client/src/components/Insignia.test.jsx`
**Estilos:** `client/src/components/Insignia.module.css` (ya están listos, no necesitas tocarlos)

Una etiqueta pequeña de color. Se usa de dos formas:

```jsx
<Insignia estado="resuelto" />   // "Resuelto" en verde
<Insignia nivel={2} />           // "Intermedio" en amarillo
```

### Qué debe mostrar

| Prop | Valor | Texto | `data-variante` |
|---|---|---|---|
| `estado` | `"resuelto"` | Resuelto | `exito` |
| `estado` | `"en-progreso"` | En progreso | `aviso` |
| `estado` | `"repasar"` | Para repasar | `error` |
| `estado` | `"pendiente"` | Pendiente | `neutro` |
| `nivel` | `1` | Básico | `exito` |
| `nivel` | `2` | Intermedio | `aviso` |
| `nivel` | `3` | Difícil | `error` |
| `estado` | cualquier otro | el valor tal cual | `neutro` |

Siempre un `<span>` con `className={estilos.insignia}` y el atributo `data-variante`. El CSS ya pinta cada variante con su color.

### Pistas

1. En vez de muchos `if`, usa un objeto como "tabla de búsqueda": `const ESTADOS = { resuelto: { texto: "Resuelto", variante: "exito" }, ... }`. Igual para los niveles.
2. Decide qué tabla usar según la prop que llegó: si `estado` no es `undefined`, usas la de estados; si no, la de niveles.
3. Para el valor desconocido: `ESTADOS[estado] ?? { texto: estado, variante: "neutro" }`.

### Lo que te preguntaría en una entrevista

- ¿Por qué un objeto de búsqueda y no un `switch`? ¿Cuándo preferirías el `switch`?
- ¿Qué son las props? ¿Puede un componente cambiar sus propias props?
- ¿Para qué sirven los atributos `data-*`? ¿Por qué el test busca por texto (`getByText`) y no por clase CSS?

---

## Cuando termines

1. `npm test` en verde.
2. Abre la app: las insignias de Practicar y del ejercicio deben verse con color y los filtros deben funcionar.
3. Haz commit con un mensaje claro, por ejemplo: `Implementa Insignia y filtrarEjercicios`.
4. Pídeme la revisión: la haré como un senior, con comentarios sobre legibilidad, nombres y casos borde.
