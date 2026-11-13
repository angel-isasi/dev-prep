// Hook useAlternar
//
// Maneja un booleano que se prende y se apaga. Devuelve [valor, alternar],
// igual que useState. `alternar` debe mantener la misma referencia.
//
//   const [abierto, alternar] = useAlternar();      // empieza en false
//   const [visible, alternarVisible] = useAlternar(true);
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { useCallback, useState } from "react";

export function useAlternar(inicial = false) {
  // Tu código aquí
}
