import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@jdsalasc/pixel-ui/styles.css";
import "./styles/app.css";
import "./styles/app.scss";
import App from "./App.js";

createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
