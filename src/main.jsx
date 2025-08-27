import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./i18nConfig";
import "leaflet/dist/leaflet.css";

import { CacheProvider } from "@emotion/react";
import createEmotionCache from "./emotionCache";

const cache = createEmotionCache();

ReactDOM.createRoot(document.getElementById("root")).render(
  <CacheProvider value={cache}>
    <App />
  </CacheProvider>
);
