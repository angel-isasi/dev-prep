export function StreakBadge({ days }) {
  return (
    <p className="streak" title="Días seguidos completando al menos una tarea">
      Racha: {days} {days === 1 ? "día" : "días"}
    </p>
  );
}
