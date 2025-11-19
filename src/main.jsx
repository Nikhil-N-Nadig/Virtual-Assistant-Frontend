import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store/store";
import { ThemeProvider } from "./context/ThemeContext";
import { FlashProvider } from "./context/FlashContext";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { FlashMessage } from "./components";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <FlashProvider>
            <BrowserRouter>
              <FlashMessage />
              <App />
            </BrowserRouter>
          </FlashProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);
