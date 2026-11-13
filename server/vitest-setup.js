// Se carga antes de cada archivo de tests de los ejercicios.
// En los tests de React (entorno jsdom) desmonta lo renderizado después de cada
// test; sin esto, el DOM de un test contamina al siguiente.
import { afterEach } from "vitest";

if (typeof document !== "undefined") {
  const { cleanup } = await import("@testing-library/react");
  afterEach(cleanup);
}
