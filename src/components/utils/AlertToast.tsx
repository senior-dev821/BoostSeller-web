// components/ui/alert/Alert.tsx
import React from "react";

type Props = {
  visible: boolean;
  title: string;
  message: string;
  variant: "error" | "success" | "warning" | "info";
  onClose: () => void;
};

const Alert: React.FC<Props> = ({ visible, title, message, variant, onClose }) => {
  if (!visible) return null;

  const colorMap = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  };

  return (
    <div className={`fixed bottom-6 left-6 z-[9999] w-80 rounded-md px-4 py-3 text-white shadow-lg transition-opacity duration-300 ${colorMap[variant]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-sm">{message}</p>
        </div>
        <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
          ×
        </button>
      </div>
    </div>
  );
};

export default Alert;
