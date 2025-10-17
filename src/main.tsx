import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();
import "antd/dist/reset.css";
import { ToastContainer } from "react-toastify";
import "./index.css";
import { AuthProvider } from "./utils/AuthContext.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={googleClientId}>
        <AuthProvider>
          <App />
        </AuthProvider>
        <ToastContainer />
      </GoogleOAuthProvider>
      <ToastContainer />
    </QueryClientProvider>
  </StrictMode>
);
