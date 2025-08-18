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
    console.log('[AdminPlayerViewProvider] Setting player view:', { childId: child.id, childName: child.name });
    setSelectedChild(child);
    setSelectedParent(parent);
  };

  const clearPlayerView = () => {
    console.log('[AdminPlayerViewProvider] Clearing player view');
    setSelectedChild(null);
    setSelectedParent(null);
  };

  const getEffectiveChildId = () => {
    const childId = selectedChild?.id || null;
    console.log('[AdminPlayerViewProvider] getEffectiveChildId returning:', childId);
    return childId;
  };

  const isViewingAsPlayer = selectedChild !== null;
  console.log('[AdminPlayerViewProvider] isViewingAsPlayer:', isViewingAsPlayer, 'selectedChild:', selectedChild?.name);

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