import React, { createContext, useContext, useEffect, useState } from 'react';
import { GeneratedImage } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface HistoryContextType {
  history: GeneratedImage[];
  setHistory: React.Dispatch<React.SetStateAction<GeneratedImage[]>>;
  addImages: (newImages: GeneratedImage[]) => void;
  clearHistory: () => Promise<void>;
  isLoading: boolean;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'aura_history_v1';

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function loadHistory() {
      setIsLoading(true);
      if (user) {
        const { data, error } = await supabase
          .from('images')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (data && !error) {
          setHistory(data.map(img => ({
            id: img.id,
            url: img.url,
            prompt: img.prompt,
            timestamp: new Date(img.created_at).getTime(),
            userId: img.user_id
          })));
        }
      } else {
        const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localData) {
          try {
            setHistory(JSON.parse(localData));
          } catch (e) {
            console.error("Error parsing local history", e);
          }
        }
      }
      setIsLoading(false);
    }
    loadHistory();
  }, [user]);

  // Sync with local storage when not logged in
  useEffect(() => {
    if (!user && history.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
    }
  }, [history, user]);

  const addImages = (newImages: GeneratedImage[]) => {
    setHistory(prev => [...newImages, ...prev]);
  };

  const clearHistory = async () => {
    if (user) {
      await supabase.from('images').delete().eq('user_id', user.id);
    }
    setHistory([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <HistoryContext.Provider value={{ history, setHistory, addImages, clearHistory, isLoading }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
}
