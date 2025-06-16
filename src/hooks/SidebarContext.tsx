import React, { createContext, useState } from 'react';

const SidebarContext = createContext<{
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
} | null>(null);

const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};
export { SidebarProvider, SidebarContext };


