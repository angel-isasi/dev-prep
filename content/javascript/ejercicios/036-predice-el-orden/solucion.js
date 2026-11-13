// Fragmento 1: síncrono (A, D), microtarea (C), macrotarea (B).
export const prediccion1 = ["A", "D", "C", "B"];

// Fragmento 2: síncrono (A, E), microtareas en orden de llegada (C, luego lo que sigue al await: D), macrotarea (B).
export const prediccion2 = ["A", "E", "C", "D", "B"];

// Fragmento 3: el executor de new Promise es síncrono (B, C). Microtareas: D, G y recién después E. Macrotarea: F.
export const prediccion3 = ["A", "B", "C", "H", "D", "G", "E", "F"];

// Fragmento 4: síncrono (D). Primer timer (A) y sus microtareas (B) antes del segundo timer (C).
export const prediccion4 = ["D", "A", "B", "C"];
