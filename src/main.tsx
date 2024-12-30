import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ToastContainer } from "react-toastify";
import App from "./App.tsx";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";
import { WalletProvider } from "./wallet/provider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastContainer autoClose={3000} limit={3} pauseOnFocusLoss={false} />
    <WalletProvider>
      <App />
    </WalletProvider>
  </StrictMode>
);
