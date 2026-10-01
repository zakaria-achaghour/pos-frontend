import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { i18nReady } from "./i18n";
import "swiper/swiper-bundle.css";
import "simplebar-react/dist/simplebar.min.css";
import App from "./App.tsx";
import { AppWrapper } from "./components/common/PageMeta.tsx";
import { ReduxProvider } from "./store/ReduxProvider.tsx";
import { ToastProvider } from "./components/kit";

// Render once the active language is loaded, so users never see raw translation keys
void i18nReady.then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ReduxProvider>
        <AppWrapper>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AppWrapper>
      </ReduxProvider>
    </StrictMode>
  );
});
