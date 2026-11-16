// Tablero de Kallpa Studio: formulario y buscador arriba, tres columnas abajo.
import { Column } from "./components/Column.jsx";
import { ConfirmDialog } from "./components/ConfirmDialog.jsx";
import { NewTaskForm } from "./components/NewTaskForm.jsx";
import { SearchBox } from "./components/SearchBox.jsx";
import { useBoard } from "./hooks/useBoard.js";
import { COLUMNS } from "./lib/board.js";

export default function App() {
  const board = useBoard();

  // TODO: estado para la búsqueda, la tarea a borrar (o null) y el texto del anuncio.
  // TODO: por cada columna, calcula sus tareas y las visibles con matchesQuery() (no las guardes en el estado).
  // TODO: handleAdd, handleMove, handleRename, askDelete, cancelDelete y confirmDelete, con sus anuncios.
  // TODO: el foco: a la tarjeta movida, al botón Borrar al cancelar y al título de la columna al borrar.
  //       Pista: muévelo en un useEffect, cuando la página ya se actualizó.
  // TODO: <p role="status" className="sr-only">{anuncio}</p>, siempre en la página.
  void board;
  void Column;
  void ConfirmDialog;
  void NewTaskForm;
  void SearchBox;
  void COLUMNS;

  return (
    <div className="app">
      <header className="app__header">
        <h1>Tablero de Kallpa Studio</h1>
      </header>
      <main>{/* TODO */}</main>
    </div>
  );
}
