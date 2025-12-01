import type { TypeOptions } from  "react-toastify";
import { CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react";

const CustomIcon = ({ type }: { type?: TypeOptions }) => {
  const iconProps = { className: "w-5 h-5", strokeWidth: 2 };

  switch (type) {
    case "success":
      return (
        <CheckCircle
          {...iconProps}
          className={`${iconProps.className} text-green-600`}
        />
      );
    case "error":
      return (
        <AlertTriangle
          {...iconProps}
          className={`${iconProps.className} text-red-600`}
        />
      );
    case "info":
      return (
        <Info
          {...iconProps}
          className={`${iconProps.className} text-blue-600`}
        />
      );
    case "warning":
      return (
        <AlertCircle
          {...iconProps}
          className={`${iconProps.className} text-yellow-500`}
        />
      );
    default:
      return null;
  }
};

export default CustomIcon;
