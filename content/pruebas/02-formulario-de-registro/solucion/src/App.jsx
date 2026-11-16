// Pantalla de registro: muestra el formulario o, tras registrarse, el mensaje de éxito.
import { useState } from "react";
import { RegisterForm } from "./components/RegisterForm.jsx";
import { SuccessMessage } from "./components/SuccessMessage.jsx";

export default function App() {
  const [registeredEmail, setRegisteredEmail] = useState(null);

  return (
    <main className="register">
      <h1>Crea tu cuenta en Wayra Pagos</h1>
      {registeredEmail ? (
        <SuccessMessage email={registeredEmail} />
      ) : (
        <RegisterForm onSuccess={setRegisteredEmail} />
      )}
    </main>
  );
}
