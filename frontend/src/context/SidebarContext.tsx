'use client';

import { createContext, useContext, useState } from 'react';

interface SidebarContextProps {
  collapsed: boolean;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextProps>({
  collapsed: false,
  toggle: () => {},
});

export const SidebarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const toggle = () => setCollapsed((prev) => !prev);

  return (
    <SidebarContext.Provider value={{ collapsed, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => useContext(SidebarContext);
