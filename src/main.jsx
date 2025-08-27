import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import "./i18nConfig";
import "./index.css";
import "leaflet/dist/leaflet.css";

import { StyledEngineProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

ReactDOM.createRoot(document.getElementById("root")).render(
  <StyledEngineProvider injectFirst>
    <CssBaseline />
    <App />
  </StyledEngineProvider>
);
