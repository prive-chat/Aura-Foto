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
    if (!user) return;
    
    setIsLoading(true);
    try {
      const from = pageToLoad * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('images')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (error) {
        setIsLoading(false);
        return;
      }

      if (data) {
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
          const freshMapped = mapped;
          if (pageToLoad === 0) return freshMapped;
          
          // De-duplicate: filter out any images in freshMapped that already exist in prev
          const existingIds = new Set(prev.map(img => img.id));
          const newUnique = freshMapped.filter(img => !existingIds.has(img.id));
          return [...prev, ...newUnique];
        });
        
        setHasMore(data.length === PAGE_SIZE);
      }
    } catch (err) {
      console.error("Error loading history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const syncOrphanedImages = async (userId: string) => {
    try {
      // 1. Listar archivos físicos
      const { data: files, error: listError } = await supabase.storage
        .from('images')
        .list(userId, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

      if (listError) return;
      if (!files || files.length === 0) return;

      // 2. Obtener URLs de la DB para extraer nombres de archivo
      const { data: dbImages, error: dbError } = await supabase
        .from('images')
        .select('url')
        .eq('user_id', userId);

      if (dbError) throw dbError;

      // Extraer nombres de archivo de las URLs guardadas (ej: 12345.png)
      const existingFilenames = new Set();
      dbImages?.forEach(img => {
        const parts = img.url.split('/');
        const filename = parts[parts.length - 1];
        if (filename) existingFilenames.add(filename);
      });
      
      const missingRecords = files
        .filter(file => file.name !== '.emptyFolderPlaceholder')
        .filter(file => !existingFilenames.has(file.name));

      if (missingRecords.length === 0) return;

      // 3. Insertar registros faltantes
      const toInsert = missingRecords.map(file => {
        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(`${userId}/${file.name}`);
        
        return {
          user_id: userId,
          url: publicUrl,
          prompt: "Obra recuperada de sesión anterior",
          created_at: file.created_at
        };
      });

      const { error: insertError } = await supabase.from('images').insert(toInsert);
      
      if (insertError) return;

      // Forzar recarga de los primeros elementos
      await fetchHistory(0);
    } catch (err) {
      console.error("Falla crítica en sincronización retroactiva:", err);
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
      } else {
        setHistory([]);
      }
      setIsLoading(false);
      setHasMore(false);
      return;
    }

    setCurrentUserId(user.id);
    setHistory([]); // Clean start for new user session
    setPage(0);
    fetchHistory(0);
    syncOrphanedImages(user.id); // Llamada retroactiva al iniciar sesión

    // Real-time synchronization
    const channel = supabase
      .channel(`user-images-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, DELETE)
          schema: 'public',
          table: 'images',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newImg = payload.new;
            setHistory((prev) => {
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
          } else if (payload.eventType === 'DELETE') {
            setHistory((prev) => prev.filter((img) => img.id !== payload.old.id));
          }
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
