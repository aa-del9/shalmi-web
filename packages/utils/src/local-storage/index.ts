/**
 * Type-safe localStorage wrapper
 */

/**
 * Check if localStorage is available
 */
export const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = "__test__";
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get item from localStorage with type safety
 */
export const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined" || !isLocalStorageAvailable()) {
    return defaultValue;
  }

  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
};

/**
 * Set item in localStorage with type safety
 */
export const setStorageItem = <T>(key: string, value: T): void => {
  if (typeof window === "undefined" || !isLocalStorageAvailable()) {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
};

/**
 * Remove item from localStorage
 */
export const removeStorageItem = (key: string): void => {
  if (typeof window === "undefined" || !isLocalStorageAvailable()) {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error("Failed to remove from localStorage:", error);
  }
};

/**
 * Create a typed storage accessor for a specific key
 */
export const createStorageAccessor = <T>(key: string, defaultValue: T) => {
  return {
    get: () => getStorageItem(key, defaultValue),
    set: (value: T) => setStorageItem(key, value),
    remove: () => removeStorageItem(key),
  };
};
