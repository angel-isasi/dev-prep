// Pantalla de registro: muestra el formulario o, tras registrarse, el mensaje de éxito.
import { RegisterForm } from "./components/RegisterForm.jsx";

export default function App() {
  // TODO: guarda el correo registrado. Si existe, reemplaza el formulario por:
  //       <h2>¡Cuenta creada!</h2>
  //       <p>Te enviamos un correo de confirmación a {email}.</p>
  return (
    <main className="register">
      <h1>Crea tu cuenta en Wayra Pagos</h1>
      <RegisterForm onSuccess={() => {}} />
    </main>
  );
}
