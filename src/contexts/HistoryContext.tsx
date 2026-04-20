import React, { createContext, useContext, useEffect, useState } from 'react';
import { GeneratedImage } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface HistoryContextType {
  history: GeneratedImage[];
  setHistory: React.Dispatch<React.SetStateAction<GeneratedImage[]>>;
  addImages: (newImages: GeneratedImage[]) => void;
  deleteImage: (id: string, url: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  loadMore: () => Promise<void>;
  isLoading: boolean;
  hasMore: boolean;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'aura_history_v1';

export function HistoryProvider({ children }: { children: React.ReactNode }) {
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const { user } = useAuth();

  const PAGE_SIZE = 24;

  const fetchHistory = async (pageToLoad: number) => {
    if (!user) {
      console.log("No user in fetchHistory, bypassing Supabase fetch");
      return;
    }
    
    setIsLoading(true);
    try {
      const from = pageToLoad * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      console.log(`Fetching images for user: ${user.id}, range: ${from}-${to}`);
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) {
        console.error("Supabase fetch error:", error);
        setIsLoading(false); // Immediate error update
        return;
      }

      if (data) {
        console.log(`Fetched ${data.length} images`);
        const mapped = data.map(img => ({
          id: img.id,
          url: img.url,
          prompt: img.prompt,
          timestamp: new Date(img.created_at).getTime(),
          userId: img.user_id,
          isFeatured: img.is_featured,
          isFlagged: img.is_flagged
        }));

        setHistory(prev => {
          if (pageToLoad === 0) return mapped;
          // De-duplicate on pagination load
          const existingIds = new Set(prev.map(img => img.id));
          const filtered = mapped.filter(img => !existingIds.has(img.id));
          return [...prev, ...filtered];
        });
        
        setHasMore(data.length === PAGE_SIZE);
      }
    } catch (err) {
      console.error("Error loading history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Evitar reset total si el ID de usuario no ha cambiado realmente
    if (user?.id === currentUserId && user) return;

    if (!user) {
      setCurrentUserId(null);
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localData) {
        try {
          setHistory(JSON.parse(localData));
        } catch (e) {
          console.error("Error parsing local history", e);
        }
      }
      setIsLoading(false);
      setHasMore(false);
      return;
    }

    setCurrentUserId(user.id);
    setHistory([]); // Solo limpiamos al cambiar de usuario o login inicial
    setPage(0);
    fetchHistory(0);

    // Real-time synchronization
    const channel = supabase
      .channel(`user-images-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'images',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newImg = payload.new;
          setHistory((prev) => {
            // Avoid duplicates
            if (prev.some((img) => img.id === newImg.id)) return prev;
            
            const mapped = {
              id: newImg.id,
              url: newImg.url,
              prompt: newImg.prompt,
              timestamp: new Date(newImg.created_at).getTime(),
              userId: newImg.user_id,
              isFeatured: newImg.is_featured,
              isFlagged: newImg.is_flagged
            };
            return [mapped, ...prev];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'images',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setHistory((prev) => prev.filter((img) => img.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadMore = async () => {
    if (!hasMore || isLoading || !user) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchHistory(nextPage);
  };

  // Sync with local storage when not logged in
  useEffect(() => {
    if (!user && history.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
    }
  }, [history, user]);

  const addImages = (newImages: GeneratedImage[]) => {
    setHistory(prev => {
      const existingIds = new Set(prev.map(img => img.id));
      const uniqueNew = newImages.filter(img => !existingIds.has(img.id));
      return [...uniqueNew, ...prev];
    });
  };

  const deleteImage = async (id: string, url: string) => {
    // Optimistic update
    setHistory(prev => prev.filter(img => img.id !== id));

    try {
      // 1. Delete from DB
      const { error: dbError } = await supabase.from('images').delete().eq('id', id);
      if (dbError) throw dbError;

      // 2. Delete from storage if it's a supabase URL
      if (url.includes('supabase.co')) {
        const bucketName = 'images';
        const parts = url.split(`${bucketName}/`);
        if (parts.length > 1) {
          const fullPath = parts[1];
          const { error: stError } = await supabase.storage.from(bucketName).remove([fullPath]);
          if (stError) console.warn("Storage delete failed (non-critical):", stError);
        }
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const clearHistory = async () => {
    if (user) {
      await supabase.from('images').delete().eq('user_id', user.id);
    }
    setHistory([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  return (
    <HistoryContext.Provider value={{ 
      history, 
      setHistory, 
      addImages, 
      deleteImage,
      clearHistory, 
      loadMore, 
      isLoading, 
      hasMore 
    }}>
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
