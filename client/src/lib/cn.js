// Une clases de Tailwind y resuelve las que chocan (gana la última):
//   cn("px-2 text-sm", activo && "text-primary", "px-4")  ->  "text-sm text-primary px-4"
// clsx acepta condiciones y arreglos; tailwind-merge quita las clases repetidas del mismo tipo.
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...clases) {
  return twMerge(clsx(clases));
}
