import { Fragment } from "react";

/** Un título corto con `código` (y sin los ** de negrita) en una sola línea. */
export function EnLinea({ texto }) {
  return texto.split(/(`[^`]+`)/).map((t, i) =>
    t.length > 1 && t.startsWith("`") && t.endsWith("`") ? (
      <code key={i}>{t.slice(1, -1)}</code>
    ) : (
      <Fragment key={i}>{t.replace(/\*\*/g, "")}</Fragment>
    ),
  );
}
