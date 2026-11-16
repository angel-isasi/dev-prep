import { STATUS_LABELS } from "../utils/status.js";

export function StatusBadge({ status }) {
  return <span className={`badge badge--${status}`}>{STATUS_LABELS[status]}</span>;
}
