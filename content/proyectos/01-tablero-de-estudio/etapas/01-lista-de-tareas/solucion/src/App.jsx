import { initialTasks } from "./data.js";
import { TaskList } from "./components/TaskList.jsx";

export default function App() {
  return (
    <main className="app">
      <header className="app__header">
        <div>
          <h1>Tablero de estudio</h1>
          <p className="app__subtitle">Lo que vas a aprender, en un solo lugar.</p>
        </div>
      </header>

      <section className="panel">
        <TaskList tasks={initialTasks} />
      </section>
    </main>
  );
}
