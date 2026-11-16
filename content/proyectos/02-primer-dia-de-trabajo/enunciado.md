# Primer día de trabajo: MesaYa

Es tu primer día como desarrollador frontend en **MesaYa**, una startup peruana que hace software para restaurantes. Te asignan el **panel de pedidos** que usan los mozos y la cocina de *Sabor Norteño*, un local en Miraflores. El proyecto **ya existe**: lo escribieron otras personas del equipo, funciona a medias y tiene su propia suite de tests. Tu tablero de Jira tiene 6 tickets asignados a tu nombre.

## Por qué importa

En el trabajo casi nunca empiezas de cero. Lo normal es recibir un repositorio con decenas de archivos que no escribiste, con convenciones que no elegiste y con un `TODO` de alguien que ya no está. Lo que se espera de un junior no es que reescriba todo, sino que:

- **Lea código ajeno** y entienda lo suficiente para ubicar dónde tocar.
- **Cambie lo mínimo** para resolver el ticket, sin romper lo que ya funcionaba.
- **Reutilice** lo que el proyecto ya tiene en vez de duplicarlo.
- **Explique su cambio** en un pull request para que otro lo revise.

Los cursos te enseñan a construir desde cero. Este proyecto te entrena para lo que de verdad vas a hacer el lunes.

## Los tickets

| Ticket | Tipo | Qué practicas |
|---|---|---|
| TICKET-101 | Bug | Ir del síntoma en pantalla a la función de `utils/` que lo causa |
| TICKET-102 | Mejora de UI | Usar un dato que ya llega de la API y agregar un estado vacío |
| TICKET-103 | Bug de React | Seguir props por varios archivos hasta un estado mutado |
| TICKET-104 | Feature | Descubrir y reutilizar un componente y un hook que ya existen |
| TICKET-105 | Bug | Agregar carga, error y reintento siguiendo un patrón del proyecto |
| TICKET-106 | Refactor | Extraer lógica repetida a un hook sin cambiar el comportamiento |

## Antes del primer ticket (30 minutos)

1. Lee el `README.md` del equipo: estructura, flujo de un pedido y convenciones.
2. Corre la app (`npx vite`) y úsala como un mozo: avanza pedidos, busca en la carta, marca un plato agotado.
3. Mira `tests/`: los tests del equipo ya pasan. Tu trabajo es que **sigan pasando** después de cada ticket.

## Cómo trabajar un ticket

1. **Lee el ticket completo**, incluidos los criterios de aceptación. Son tu definición de "terminado".
2. **Reprodúcelo**: si es un bug, sigue los pasos y míralo fallar con tus propios ojos. Si no lo puedes reproducir, no lo puedes arreglar con seguridad.
3. **Busca en el código** en vez de leerlo todo. En VS Code:
   - `Ctrl` + `Shift` + `F`: busca un texto en todo el proyecto (un mensaje que ves en pantalla, el nombre de una prop).
   - `Ctrl` + clic (o `F12`) sobre una función: te lleva a donde está definida.
   - `Shift` + `F12`: muestra todos los lugares donde se usa.
   - `Ctrl` + `P`: abre un archivo por su nombre.
4. **Cambia lo mínimo**: arregla lo que pide el ticket y nada más. Si ves otra cosa que mejorar, anótala para otro ticket (así lo hacen en los equipos: PRs pequeños son más fáciles de revisar).
5. **Corre los tests**: los del ticket y los de siempre. Si rompes un test del equipo, no lo cambies para que pase: entiende qué protegía.
6. **Explica tu cambio como en un pull request**. Escríbelo aunque sea en un comentario o en tu cuaderno:
   - **Qué pasaba**: el problema en una línea.
   - **Por qué pasaba**: la causa real, no el síntoma.
   - **Qué cambié**: archivos y decisión.
   - **Cómo probarlo**: pasos y tests.

## Cómo contarlo en una entrevista

La pregunta "¿cómo te enfrentas a un código que no conoces?" sale mucho en entrevistas junior. Con este proyecto puedes responder con un caso concreto, por ejemplo:

> "Practiqué con un proyecto ajeno de un panel de pedidos. Tenía un bug: al avanzar un pedido, la pantalla no cambiaba hasta que tocabas otra cosa. Busqué el texto del botón, seguí la prop `onAdvance` hasta `App` y vi que se mutaba el objeto del estado y se llamaba a `setOrders` con el mismo array, así que React no volvía a pintar. Lo cambié por un `map` que crea un array y un objeto nuevos, como ya lo hacía otra parte del proyecto, y agregué un test que comprueba que no se muta."

Fíjate en la estructura: **contexto, cómo lo investigaste, la causa, el arreglo y cómo lo verificaste**. Es el método STAR aplicado a un bug, y vale más que decir "sé React".
