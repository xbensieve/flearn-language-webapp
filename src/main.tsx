import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient();
import 'antd/dist/reset.css';
import { ToastContainer } from 'react-toastify';
import './index.css';
import { AuthProvider } from './utils/AuthContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
      <ToastContainer />
    </QueryClientProvider>
  </StrictMode>
);
