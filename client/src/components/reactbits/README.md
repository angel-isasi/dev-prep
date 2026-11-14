# Componentes de React Bits

Copiados de [reactbits.dev](https://www.reactbits.dev) en su versión **JavaScript + CSS** (no usan Tailwind).
Se dejaron como vienen de la librería para poder actualizarlos fácil: solo se quitó la línea `'use client'`,
que es de Next.js y aquí no hace falta. Todos respetan "reducir movimiento" del sistema.

| Archivo | Dónde se usa | Qué hace |
|---|---|---|
| `Noise` | Toda la app (Layout) | Grano de película muy suave encima de todo: quita el aspecto plano |
| `ClickSpark` | Toda la app (Layout) | Chispas lavanda en cada clic |
| `DotGrid` | Fondo de Inicio | Rejilla de puntos que el mouse empuja como gelatina; un clic manda una onda |
| `DecryptedText` | Frase del día | El texto aparece "descifrándose" letra por letra |
| `ElectricBorder` | Aviso de deuda | Borde eléctrico que chispea y se agita cerca del mouse |
| `SloshGauge` | Meta de hoy | Tanque con líquido que se mece y salpica al subir |
| `SplitFlapText` | Fecha meta | Los días restantes en un tablero de aeropuerto que gira sus fichas |

Los colores se pasan desde `useColorTema` (hooks/useColorTema.js), porque estos componentes dibujan en
`<canvas>` o WebGL y necesitan el color real, no `var(--acento)`.
