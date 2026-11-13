export function Contacto({ onEnviar }) {
  function enviar(evento) {
    evento.preventDefault(); // que el navegador no recargue la página

    const formulario = evento.currentTarget; // el <form>
    // FormData lee todos los campos con `name`; fromEntries lo vuelve objeto.
    const datos = Object.fromEntries(new FormData(formulario));

    onEnviar(datos);
    formulario.reset(); // deja los campos vacíos
  }

  return (
    <form onSubmit={enviar}>
      <label>
        Nombre <input name="nombre" required />
      </label>
      <label>
        Mensaje <textarea name="mensaje" />
      </label>
      <button>Enviar</button>
    </form>
  );
}
