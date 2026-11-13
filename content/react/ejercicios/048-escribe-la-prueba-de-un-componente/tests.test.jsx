// @vitest-environment jsdom
import { test, expect } from "vitest";
import { useState } from "react";
import { probarBoletin } from "./solucion.jsx";

// Tu función `probarBoletin` se corre contra el Boletin correcto (debe pasar)
// y contra versiones con errores (debe fallar, o sea, lanzar un error).
// Una prueba que no detecta errores no sirve de nada.

// ===== El componente correcto (el del enunciado) =====
function Boletin({ onSuscribir }) {
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");
  function enviar(e) {
    e.preventDefault();
    if (!correo.includes("@")) return setError("Ingresa un correo válido");
    setError("");
    onSuscribir(correo);
  }
  return (
    <form onSubmit={enviar}>
      <label>Correo <input value={correo} onChange={(e) => setCorreo(e.target.value)} /></label>
      {error && <p role="alert">{error}</p>}
      <button>Suscribirme</button>
    </form>
  );
}

// ===== Versiones con errores =====

// Nunca muestra el mensaje de error.
function BoletinSinMensaje({ onSuscribir }) {
  const [correo, setCorreo] = useState("");
  function enviar(e) {
    e.preventDefault();
    if (!correo.includes("@")) return;
    onSuscribir(correo);
  }
  return (
    <form onSubmit={enviar}>
      <label>Correo <input value={correo} onChange={(e) => setCorreo(e.target.value)} /></label>
      <button>Suscribirme</button>
    </form>
  );
}

// Muestra el error, pero igual envía el correo inválido.
function BoletinEnviaSiempre({ onSuscribir }) {
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");
  function enviar(e) {
    e.preventDefault();
    setError(correo.includes("@") ? "" : "Ingresa un correo válido");
    onSuscribir(correo);
  }
  return (
    <form onSubmit={enviar}>
      <label>Correo <input value={correo} onChange={(e) => setCorreo(e.target.value)} /></label>
      {error && <p role="alert">{error}</p>}
      <button>Suscribirme</button>
    </form>
  );
}

// Valida bien, pero con un correo válido nunca llama a onSuscribir.
function BoletinNoEnvia() {
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");
  function enviar(e) {
    e.preventDefault();
    setError(correo.includes("@") ? "" : "Ingresa un correo válido");
  }
  return (
    <form onSubmit={enviar}>
      <label>Correo <input value={correo} onChange={(e) => setCorreo(e.target.value)} /></label>
      {error && <p role="alert">{error}</p>}
      <button>Suscribirme</button>
    </form>
  );
}

// Envía bien, pero el mensaje de error se queda pegado después de corregir.
function BoletinErrorPegado({ onSuscribir }) {
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");
  function enviar(e) {
    e.preventDefault();
    if (!correo.includes("@")) return setError("Ingresa un correo válido");
    onSuscribir(correo);
  }
  return (
    <form onSubmit={enviar}>
      <label>Correo <input value={correo} onChange={(e) => setCorreo(e.target.value)} /></label>
      {error && <p role="alert">{error}</p>}
      <button>Suscribirme</button>
    </form>
  );
}

test("tu prueba pasa con el Boletin correcto", async () => {
  await probarBoletin(Boletin);
});

test("tu prueba detecta un Boletin que no muestra el mensaje de error", async () => {
  await expect(probarBoletin(BoletinSinMensaje)).rejects.toThrow();
});

test("tu prueba detecta un Boletin que envía aunque el correo sea inválido", async () => {
  await expect(probarBoletin(BoletinEnviaSiempre)).rejects.toThrow();
});

test("tu prueba detecta un Boletin que no envía un correo válido", async () => {
  await expect(probarBoletin(BoletinNoEnvia)).rejects.toThrow();
});

test("tu prueba detecta un Boletin que deja el error visible después de corregir", async () => {
  await expect(probarBoletin(BoletinErrorPegado)).rejects.toThrow();
});
