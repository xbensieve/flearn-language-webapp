// src/utils/toastConfig.tsx
import { toast } from 'react-toastify';

export const notifySuccess = (message: string) => {
  toast.success(message, {
    className: 'bg-green-500 text-white rounded-lg shadow-lg font-medium',
    progressClassName: 'bg-white',
    position: 'top-right',
    autoClose: 3000,
  });
};

export const notifyError = (message: string) => {
  toast.error(message, {
    className: 'bg-red-500 text-white rounded-lg shadow-lg font-medium',
    progressClassName: 'bg-white',
    position: 'top-right',
    autoClose: 3000,
  });
};
