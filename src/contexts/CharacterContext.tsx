import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Character } from '../types';
import { toast } from 'sonner';

interface CharacterContextType {
  characters: Character[];
  isLoading: boolean;
  saveCharacter: (name: string, basePrompt: string, imageUrl?: string) => Promise<void>;
  deleteCharacter: (id: string) => Promise<void>;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export function CharacterProvider({ children }: { children: React.ReactNode }) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchCharacters = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCharacters(data || []);
    } catch (err: any) {
      console.error('Error fetching characters:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCharacter = async (name: string, basePrompt: string, imageUrl?: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('characters')
        .insert([{ 
          user_id: user.id, 
          name, 
          base_prompt: basePrompt, 
          reference_image_url: imageUrl 
        }]);
      
      if (error) throw error;
      toast.success(`Personaje "${name}" guardado correctamente.`);
    } catch (err: any) {
      toast.error('Error al guardar el personaje.');
      console.error(err);
    }
  };

  const deleteCharacter = async (id: string) => {
    try {
      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Personaje eliminado.');
    } catch (err: any) {
      toast.error('Error al eliminar personaje.');
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user) {
      setCharacters([]);
      setIsLoading(false);
      return;
    }

    fetchCharacters();

    const channel = supabase
      .channel('characters-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'characters', filter: `user_id=eq.${user.id}` },
        () => fetchCharacters()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <CharacterContext.Provider value={{ characters, isLoading, saveCharacter, deleteCharacter }}>
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacters() {
  const context = useContext(CharacterContext);
  if (context === undefined) {
    throw new Error('useCharacters must be used within a CharacterProvider');
  }
  return context;
}
