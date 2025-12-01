import { toast } from "react-toastify";
import type { ToastOptions } from "react-toastify";
import CustomIcon from "@/components/CustomizeIcon/CustomIcon";

const baseOptions: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: false,
  icon: ({ type }) => <CustomIcon type={type} />,
  className:
    "rounded-lg shadow-md border font-sans text-sm px-4 py-3 bg-white text-gray-900",
};

export const notifySuccess = (message: string) => {
  toast.success(message, {
    ...baseOptions,
    className: `${baseOptions.className} border-gray-200`,
    progressClassName: "bg-gray-300",
  });
};

export const notifyError = (message: string) => {
  toast.error(message, {
    ...baseOptions,
    className: `${baseOptions.className} border-gray-300`,
    progressClassName: "bg-gray-400",
  });
};
