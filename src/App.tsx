import { RouterProvider } from "react-router-dom";
import { router } from "./config/routes";
import { Toaster } from "sonner";
import NotificationProvider from "./components/NotificationProvider";

function App() {
  return (
    <NotificationProvider>
      <Toaster richColors position="top-right" />
      <RouterProvider router={router} />
    </NotificationProvider>
  );
}

export default App;
