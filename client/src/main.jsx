import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { MotionConfig } from "motion/react";
import "@fontsource-variable/inter";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/jetbrains-mono";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/tailwind.css";
import { App } from "./App.jsx";
import { ProveedorAyuda } from "./components/Ayuda.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* reducedMotion="user": si el sistema pide menos movimiento, las animaciones de toda la app se apagan */}
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <ProveedorAyuda delayDuration={300}>
          <App />
        </ProveedorAyuda>
      </BrowserRouter>
    </MotionConfig>
  </StrictMode>,
);
