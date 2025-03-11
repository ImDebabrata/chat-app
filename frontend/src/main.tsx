import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router";
import ReactQueryWrapper from "./app/ReactQueryWrapper.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ReactQueryWrapper>
        <App />
      </ReactQueryWrapper>
    </BrowserRouter>
  </StrictMode>
);
