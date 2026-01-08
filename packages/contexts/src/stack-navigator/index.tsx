"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

/**
 * Stack item type for modals/drawers
 */
interface StackItem {
  id: string;
  component: ReactNode;
  props?: Record<string, unknown>;
}

/**
 * Stack navigator context value
 */
interface StackNavigatorContextValue {
  stack: StackItem[];
  push: (item: Omit<StackItem, "id"> & { id?: string }) => string;
  pop: () => void;
  popTo: (id: string) => void;
  popAll: () => void;
  replace: (item: Omit<StackItem, "id"> & { id?: string }) => string;
  isOpen: boolean;
  currentItem: StackItem | null;
}

const StackNavigatorContext = createContext<
  StackNavigatorContextValue | undefined
>(undefined);

let stackIdCounter = 0;

/**
 * Stack navigator provider for managing modal/drawer stacks
 */
export function StackNavigatorProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<StackItem[]>([]);

  const generateId = () => {
    stackIdCounter += 1;
    return `stack-${stackIdCounter}`;
  };

  const push = useCallback(
    (item: Omit<StackItem, "id"> & { id?: string }): string => {
      const id = item.id ?? generateId();
      setStack((prev) => [...prev, { ...item, id }]);
      return id;
    },
    []
  );

  const pop = useCallback(() => {
    setStack((prev) => prev.slice(0, -1));
  }, []);

  const popTo = useCallback((id: string) => {
    setStack((prev) => {
      const index = prev.findIndex((item) => item.id === id);
      if (index === -1) return prev;
      return prev.slice(0, index + 1);
    });
  }, []);

  const popAll = useCallback(() => {
    setStack([]);
  }, []);

  const replace = useCallback(
    (item: Omit<StackItem, "id"> & { id?: string }): string => {
      const id = item.id ?? generateId();
      setStack((prev) => [...prev.slice(0, -1), { ...item, id }]);
      return id;
    },
    []
  );

  const value: StackNavigatorContextValue = {
    stack,
    push,
    pop,
    popTo,
    popAll,
    replace,
    isOpen: stack.length > 0,
    currentItem: stack[stack.length - 1] ?? null,
  };

  return (
    <StackNavigatorContext.Provider value={value}>
      {children}
    </StackNavigatorContext.Provider>
  );
}

/**
 * Hook to access stack navigator context
 */
export function useStackNavigator() {
  const context = useContext(StackNavigatorContext);
  if (context === undefined) {
    throw new Error(
      "useStackNavigator must be used within a StackNavigatorProvider"
    );
  }
  return context;
}
