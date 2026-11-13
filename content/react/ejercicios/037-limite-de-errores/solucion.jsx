import { Component } from "react";

export class LimiteDeError extends Component {
  // Estado inicial: todavía no hubo error.
  state = { fallo: false };

  // React lo llama cuando un hijo lanza un error al renderizar.
  // Lo que devuelve se mezcla con el estado, y luego se vuelve a renderizar.
  static getDerivedStateFromError() {
    return { fallo: true };
  }

  // Opcional: buen lugar para registrar el error (consola, servicio de monitoreo).
  componentDidCatch(error, info) {
    console.error("Error atrapado por LimiteDeError:", error, info.componentStack);
  }

  render() {
    if (this.state.fallo) {
      return <p role="alert">Algo salió mal. Recarga la página.</p>;
    }
    return this.props.children;
  }
}
