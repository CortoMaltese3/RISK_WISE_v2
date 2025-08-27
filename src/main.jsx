import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// init i18n before rendering React
import "./i18nConfig";

// Leaflet styles (if you use react-leaflet)
import "leaflet/dist/leaflet.css";

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
