import React from "react";
import { createRoot } from "react-dom/client";
import TarotSecretReader from "./TarotSecretReader.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TarotSecretReader />
  </React.StrictMode>
);
