// SlidingNumber (Animate UI): cada dígito gira como un cuentakilómetros hasta el valor nuevo.
//   <SlidingNumber number={42} />
// Adaptado: sin el hook de "solo al verse en pantalla" (siempre está visible aquí),
// decimales opcionales y sin animación con "reducir movimiento".
import { Fragment, useEffect, useMemo, useRef } from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "motion/react";
import useMeasure from "react-use-measure";

const RESORTE = { stiffness: 200, damping: 20, mass: 0.4 };

// Una columna de dígitos del 0 al 9 que se desliza hasta el dígito de esta posición
function Rodillo({ valorAnterior, valor, posicion }) {
  const inicio = Math.floor(valorAnterior / posicion) % 10;
  const destino = Math.floor(valor / posicion) % 10;
  const animado = useSpring(inicio, RESORTE);
  const [medida, { height }] = useMeasure();

  useEffect(() => {
    animado.set(destino);
  }, [destino, animado]);

  return (
    <span
      ref={medida}
      style={{
        position: "relative",
        display: "inline-block",
        width: "1ch",
        overflowX: "visible",
        overflowY: "clip",
        lineHeight: 1,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      <span style={{ visibility: "hidden" }}>0</span>
      {Array.from({ length: 10 }, (_, i) => (
        <Digito key={i} valor={animado} numero={i} alto={height} />
      ))}
    </span>
  );
}

function Digito({ valor, numero, alto }) {
  const y = useTransform(valor, (actual) => {
    if (!alto) return 0;
    const desfase = (10 + numero - (actual % 10)) % 10;
    let mover = desfase * alto;
    if (desfase > 5) mover -= 10 * alto;
    return mover;
  });

  if (!alto) return <span style={{ visibility: "hidden", position: "absolute" }}>{numero}</span>;

  return (
    <motion.span style={{ y, position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {numero}
    </motion.span>
  );
}

export function SlidingNumber({ number, decimalPlaces = 0, className }) {
  const reducido = useReducedMotion();
  const anterior = useRef(0);
  const texto = Math.abs(number).toFixed(decimalPlaces);
  const [entero, decimal = ""] = texto.split(".");

  // Los rodillos animan desde el valor anterior; la primera vez, desde 0.
  const [enteroAnterior, decimalAnterior = ""] = anterior.current.toFixed(decimalPlaces).split(".");
  useEffect(() => {
    anterior.current = Math.abs(number);
  }, [number]);

  const posiciones = useMemo(() => Array.from({ length: entero.length }, (_, i) => 10 ** (entero.length - i - 1)), [entero.length]);
  const posicionesDec = useMemo(() => Array.from({ length: decimal.length }, (_, i) => 10 ** (decimal.length - i - 1)), [decimal.length]);

  if (reducido) return <span className={className}>{number < 0 ? `-${texto}` : texto}</span>;

  return (
    <span className={className} style={{ display: "inline-flex", alignItems: "center" }}>
      <span className="sr-only">{texto}</span>
      <span aria-hidden style={{ display: "inline-flex", alignItems: "center" }}>
        {number < 0 && <span>-</span>}
        {posiciones.map((p) => (
          <Fragment key={`e-${p}`}>
            <Rodillo valorAnterior={Number(enteroAnterior)} valor={Number(entero)} posicion={p} />
          </Fragment>
        ))}
        {decimal && (
          <>
            <span>.</span>
            {posicionesDec.map((p) => (
              <Rodillo key={`d-${p}`} valorAnterior={Number(decimalAnterior || 0)} valor={Number(decimal)} posicion={p} />
            ))}
          </>
        )}
      </span>
    </span>
  );
}
