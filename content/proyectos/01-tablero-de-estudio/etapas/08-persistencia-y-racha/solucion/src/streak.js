// Racha de estudio: días seguidos completando al menos una tarea.
// Funciones puras; las fechas son textos "AAAA-MM-DD" (fáciles de comparar y guardar).

const pad = (n) => String(n).padStart(2, "0");

/** La fecha LOCAL como "AAAA-MM-DD" (toISOString usaría UTC y en Perú daría el día siguiente de noche). */
export function toDateKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Suma (o resta) días a una fecha "AAAA-MM-DD". En UTC, para no depender del horario. */
export function addDays(dateKey, days) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

/** Racha después de completar una tarea hoy. */
export function registerActivity(streak, today) {
  if (!streak?.lastDate) return { count: 1, lastDate: today };
  if (streak.lastDate === today) return streak;
  if (streak.lastDate === addDays(today, -1)) return { count: streak.count + 1, lastDate: today };
  return { count: 1, lastDate: today };
}

/** Días de racha que se muestran: sigue viva si la última actividad fue hoy o ayer. */
export function currentStreak(streak, today) {
  if (!streak?.lastDate) return 0;
  const alive = streak.lastDate === today || streak.lastDate === addDays(today, -1);
  return alive ? streak.count : 0;
}
