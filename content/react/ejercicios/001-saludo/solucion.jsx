// Si no llega `nombre`, toma el valor por defecto "invitado".
export function Saludo({ nombre = "invitado" }) {
  return <h1>Hola, {nombre}</h1>;
}
