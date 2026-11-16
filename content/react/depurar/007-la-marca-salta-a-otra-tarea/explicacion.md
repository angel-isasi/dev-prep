## Idea clave

React usa la `key` para saber **qué componente es cuál** entre un render y otro, y el estado de cada componente (aquí, `hecho`) queda asociado a su key. Con `key={i}` (la posición), al borrar un elemento del medio todos los de abajo cambian de key: React cree que se borró el último y reutiliza los primeros con su estado viejo, ahora con otro texto. Con `key={p.id}`, la key viaja con su dato y el estado también.

## Paso a paso

1. **Lee el síntoma.** El estado (la marca) se queda en un **lugar** de la lista mientras los textos se mueven. Cuando un estado "salta" de un elemento a otro al borrar, reordenar o insertar, revisa la `key`.
2. **Reprodúcelo.** Marca la segunda tarea y borra la primera: la marca aparece en la que ahora está segunda.
3. **Haz la cuenta de keys.**
   - Antes: key 0 "Comprar pan", key 1 "Pagar la luz" (`hecho: true`), key 2 "Llamar a mamá".
   - Después de borrar: key 0 "Pagar la luz", key 1 "Llamar a mamá".
   - React conserva los componentes con key 0 y 1 (con su estado) y desmonta el de key 2. El `hecho: true` de la key 1 ahora acompaña a "Llamar a mamá".
4. **Usa una key estable.**

```jsx
{lista.map((p) => (
  <Pendiente key={p.id} texto={p.texto} onBorrar={() => borrar(p.id)} />
))}
```

## Por qué funciona

| Tarea | Key antes de borrar | Key después (con índice) | Key después (con id) |
|---|---|---|---|
| Comprar pan | 0 | borrada | borrada (key 1) |
| Pagar la luz (marcada) | 1 | **0** (estado de "Comprar pan") | 2 (su propio estado) |
| Llamar a mamá | 2 | **1** (estado de "Pagar la luz") | 3 (su propio estado) |

Con el id, React ve que desapareció la key 1 y desmonta **ese** componente. Los otros dos conservan su componente y su estado.

Usar el índice como key solo es seguro si la lista nunca se reordena, nunca se filtra y no se insertan elementos en el medio, y además sus elementos no tienen estado propio.

## Errores comunes

- **Usar `key={Math.random()}`.** Cambia en cada render: React desmonta y vuelve a crear todo, y todas las casillas se desmarcan siempre.
- **Usar `key={p.texto}`.** Funciona hasta que hay dos tareas con el mismo texto; ahí React avisa de keys repetidas y vuelve a mezclar estados.
- **Subir `hecho` al padre "para que no se mezcle".** Es un cambio de diseño válido, pero no corrige la key: cualquier otro estado local (un input, una animación) volverá a mezclarse.

## Otra forma de resolverlo

Guardar `hecho` dentro de cada dato de la lista, en el padre, y pasar `hecho` y `onCambiar` como props. Así `Pendiente` no tiene estado propio:

```jsx
const alternar = (id) =>
  setLista((actual) => actual.map((p) => (p.id === id ? { ...p, hecho: !p.hecho } : p)));
```

Es útil si necesitas, por ejemplo, contar cuántas están hechas. Aun así, la key debe ser `p.id`.

## Cómo explicarlo en la entrevista

> "La marca se quedaba en una posición mientras las tareas se movían, lo que es típico de usar el índice como `key`. React asocia el estado de cada componente a su key; al borrar la primera tarea, todas cambiaron de índice y React reutilizó los componentes equivocados. Lo cambié por `key={p.id}`, que identifica a cada tarea sin importar su posición. Solo usaría el índice en listas fijas sin estado."

## Conceptos

- **`key`**: identificador que React usa para emparejar los elementos de una lista entre renders.
- **Reconciliación**: el proceso en el que React compara el árbol nuevo con el anterior para decidir qué conservar, crear o borrar.
- **Estado local**: el estado de cada componente queda unido a su posición y su key en el árbol.
- **Key estable**: un valor que identifica al dato (un id) y no cambia al reordenar o borrar.
- **Índice como key**: aceptable solo en listas que nunca cambian de orden ni de tamaño en el medio.
