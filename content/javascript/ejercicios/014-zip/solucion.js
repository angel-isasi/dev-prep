export function zip(a, b) {
  const largo = Math.min(a.length, b.length);
  return a.slice(0, largo).map((x, i) => [x, b[i]]);
}
