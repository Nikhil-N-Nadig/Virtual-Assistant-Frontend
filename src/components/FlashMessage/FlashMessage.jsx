import React from "react";
import { useFlash } from "../../context/FlashContext";

const FlashMessage = () => {
  const { flash } = useFlash();

  if (!flash) return null;

  const categoryStyles = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    warning: "bg-orange-500 text-white",
    info: "bg-blue-500 text-white",
  };

  return (
    <div className="fixed top-[10%] left-1/2 -translate-x-1/2 w-[90%] max-w-[600px] z-[1000]">
      <div
        className={`mx-auto my-2 py-3 px-5 rounded-md text-center text-[1.1rem] shadow-md opacity-100 animate-slide-down transition-opacity duration-500 ${
          categoryStyles[flash.category] || "bg-blue-500"
        }`}
      >
        {flash.message}
      </div>
    </div>
  );
};

export default FlashMessage;
