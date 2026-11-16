# Etapa 8: persistencia, preferencias y racha

Las tareas ya viven en el servidor. Lo que es solo tuyo (cómo te gusta ver el tablero y tu racha) se guarda en el navegador con `localStorage`.

## Qué hacer

1. Crea `src/hooks/useLocalStorage.js` y exporta `useLocalStorage(key, initialValue)`, que funciona como `useState` pero recuerda el valor:
   - Al empezar lee `localStorage.getItem(key)` y lo convierte con `JSON.parse`. Si no hay nada, o lo guardado no es JSON válido, usa `initialValue`.
   - Cada vez que el valor cambia, lo guarda con `JSON.stringify`.
   - Devuelve `[value, setValue]`.
2. Crea `src/streak.js` con funciones puras (las fechas son textos `"AAAA-MM-DD"`):
   - `toDateKey(date = new Date())`: la fecha **local** como `"2026-03-05"`.
   - `addDays(dateKey, days)`: suma (o resta) días. `addDays("2026-03-01", -1)` es `"2026-02-28"`.
   - `registerActivity(streak, today)`: con `streak` = `{ count, lastDate }` o `null`. Si es la primera vez, `{ count: 1, lastDate: today }`. Si ya hubo actividad hoy, no cambia. Si la última fue ayer, suma 1. Si fue antes, vuelve a 1.
   - `currentStreak(streak, today)`: los días de racha que se muestran. Si la última actividad fue hoy o ayer, `count`; si no (o no hay racha), `0`.
3. Crea `src/components/StreakBadge.jsx` con `StreakBadge({ days })`, que muestra `Racha: 1 día` o `Racha: N días` (en plural también con 0).
4. En `App`:
   - El filtro usa `useLocalStorage("tablero:filtro", "all")`. Si lo guardado no es un filtro válido, usa `"all"`.
   - La racha usa `useLocalStorage("tablero:racha", null)`. Cuando una tarea pasa a **hecha** (no al desmarcarla), actualízala con `registerActivity(racha, toDateKey())`.
   - Muestra `<StreakBadge days={currentStreak(racha, toDateKey())} />` en el encabezado.

## Conceptos que practicas

- `localStorage`, `JSON.stringify` y `JSON.parse`, y por qué hay que protegerse con `try`/`catch`.
- Inicialización perezosa de `useState(() => ...)`: leer el almacenamiento una sola vez.
- `useEffect` para sincronizar con algo externo al navegador.
- Funciones puras para la lógica con fechas (las más fáciles de probar).

## Pistas

1. Para `toDateKey`, no uses `toISOString()`: está en UTC y en Perú (UTC-5) después de las 7 p. m. te daría el día siguiente. Arma el texto con `getFullYear()`, `getMonth() + 1` y `getDate()`, con `padStart(2, "0")`.
2. Para `addDays`, crea la fecha en UTC con `new Date(Date.UTC(año, mes - 1, día + days))` y ahí sí usa `toISOString().slice(0, 10)`: así no te afectan los cambios de horario.
