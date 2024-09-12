import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./containers/App/App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
