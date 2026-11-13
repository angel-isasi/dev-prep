// 1. Síncrono primero, luego microtareas, luego macrotareas.
export const prediccion1 = ["1 síncrono", "2 síncrono", "microtarea (promesa)", "macrotarea (setTimeout)"];

// 2. Una función async corre de forma síncrona hasta su primer await.
export const prediccion2 = ["A", "B", "C", "D"];

// 3. El cuerpo de new Promise se ejecuta al instante; el .then va después.
export const prediccion3 = ["A", "B", "C", "D"];

// 4. Después de cada macrotarea se vacían las microtareas antes de la siguiente.
export const prediccion4 = ["M1", "T1", "M dentro de T1", "T2"];
