// Límite de errores
//
// Un componente de CLASE que atrapa los errores de render de sus hijos.
// Si todo va bien, muestra los hijos. Si un hijo lanza, muestra
// <p role="alert">Algo salió mal. Recarga la página.</p>
//
//   <LimiteDeError>
//     <Carta />
//   </LimiteDeError>
//
// Guarda el archivo (Ctrl + S) y mira el resultado de los tests en la app.

import { Component } from "react";

export class LimiteDeError extends Component {
  // Tu código aquí

  render() {
    return this.props.children;
  }
}
