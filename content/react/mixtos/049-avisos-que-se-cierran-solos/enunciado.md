Crea un sistema de avisos (los "toasts" que aparecen y desaparecen solos). Exporta dos piezas:

- `useAvisos(duracion = 3000)`: hook que devuelve `{ avisos, avisar, cerrar }`.
  - `avisos`: arreglo de `{ id, texto }`, en el orden en que se crearon.
  - `avisar(texto)`: agrega un aviso con un id nuevo (1, 2, 3...) y programa que se cierre solo después de `duracion` milisegundos.
  - `cerrar(id)`: quita ese aviso **y cancela su temporizador**.
- `Avisos()`: componente de ejemplo que usa el hook.

## Reglas

**Hook**:

- Cada aviso tiene **su propio** temporizador: si creas uno y 2 segundos después otro, el primero se cierra al segundo 3 y el segundo al segundo 5.
- Cerrar un aviso a mano cancela su temporizador (no debe quedar ninguno pendiente sin motivo).
- Al desmontar el componente que usa el hook, se cancelan **todos** los temporizadores pendientes.

**Componente `Avisos`**:

- Un botón **"Agregar pizza"** que llama a `avisar("Pizza agregada")`.
- Una lista `<ul aria-live="polite">` con un `<li>` por aviso: el texto y un botón `×` con `aria-label="Cerrar aviso {id}"`.

## Ejemplo

| Tiempo | Acción | Avisos visibles |
|---|---|---|
| 0 s | Clic en "Agregar pizza" | 1 |
| 2 s | Clic en "Agregar pizza" | 1, 2 |
| 3 s | (se cierra solo el 1) | 2 |
| 3 s | Clic en "Cerrar aviso 2" | (ninguno) |

## Por qué importa

Los avisos temporales están en casi todas las apps. El ejercicio junta varias ideas que se preguntan mucho: hooks personalizados, `useRef` para guardar cosas que **no** son estado (ids y temporizadores), `useCallback` para funciones estables y la limpieza de temporizadores para no dejar fugas ni actualizar componentes desmontados.
