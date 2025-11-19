import React, { createContext, useContext, useState } from "react";

const FlashContext = createContext();

export const FlashProvider = ({ children }) => {
  const [flash, setFlash] = useState(null);

  const setFlashMessage = (message, category = "info") => {
    setFlash({ message, category });

    // Hide message after 3 seconds
    setTimeout(() => {
      setFlash(null);
    }, 3000);
  };

  return (
    <FlashContext.Provider value={{ flash, setFlashMessage }}>
      {children}
    </FlashContext.Provider>
  );
};

export const useFlash = () => useContext(FlashContext);
