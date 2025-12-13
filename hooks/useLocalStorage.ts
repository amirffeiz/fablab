import React, { useState, useEffect } from 'react';

function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Fonction pour initialiser l'état
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Erreur lors de la lecture de la clé localStorage "${key}":`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Fonction pour mettre à jour l'état et le localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permet d'accepter une valeur ou une fonction (comme useState)
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Erreur lors de l'écriture de la clé localStorage "${key}":`, error);
    }
  };

  // Écouter les changements dans d'autres onglets (optionnel mais utile)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}

export default useLocalStorage;