import { createContext, useContext, useState, ReactNode } from 'react';

interface Child {
  id: string;
  name: string;
  age: number;
  level: number;
  points: number;
  parent_id: string;
}

interface Parent {
  name: string;
  email: string;
}

interface AdminPlayerViewContextType {
  selectedChild: Child | null;
  selectedParent: Parent | null;
  isViewingAsPlayer: boolean;
  setPlayerView: (child: Child, parent: Parent) => void;
  clearPlayerView: () => void;
  getEffectiveChildId: () => string | null;
}

const AdminPlayerViewContext = createContext<AdminPlayerViewContextType | undefined>(undefined);

export function AdminPlayerViewProvider({ children }: { children: ReactNode }) {
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null);

  const setPlayerView = (child: Child, parent: Parent) => {
    setSelectedChild(child);
    setSelectedParent(parent);
  };

  const clearPlayerView = () => {
    setSelectedChild(null);
    setSelectedParent(null);
  };

  const getEffectiveChildId = () => {
    return selectedChild?.id || null;
  };

  const isViewingAsPlayer = selectedChild !== null;

  return (
    <AdminPlayerViewContext.Provider value={{
      selectedChild,
      selectedParent,
      isViewingAsPlayer,
      setPlayerView,
      clearPlayerView,
      getEffectiveChildId,
    }}>
      {children}
    </AdminPlayerViewContext.Provider>
  );
}

export function useAdminPlayerView() {
  const context = useContext(AdminPlayerViewContext);
  if (context === undefined) {
    throw new Error('useAdminPlayerView must be used within an AdminPlayerViewProvider');
  }
  return context;
}