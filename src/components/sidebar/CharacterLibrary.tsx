import React, { useState } from 'react';
import { useCharacters } from '../../contexts/CharacterContext';
import { User, Plus, Trash2, Search, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'motion/react';
import { Character } from '../../types';

interface CharacterLibraryProps {
  onSelect: (char: Character) => void;
  currentPrompt: string;
}

export function CharacterLibrary({ onSelect, currentPrompt }: CharacterLibraryProps) {
  const { characters, saveCharacter, deleteCharacter, isLoading } = useCharacters();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const filteredCharacters = characters.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async () => {
    if (!newName.trim() || !currentPrompt.trim()) return;
    await saveCharacter(newName, currentPrompt);
    setNewName('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase tracking-widest text-white/30 font-bold flex items-center gap-2">
          <User size={14} /> Biblioteca de Identidades
        </label>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsAdding(!isAdding)}
          className={`h-7 w-7 rounded-lg transition-all ${isAdding ? 'bg-white text-black' : 'bg-white/5 text-white/40'}`}
        >
          <Plus size={14} />
        </Button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 space-y-3"
          >
            <p className="text-[10px] text-white/40 leading-tight">
              Se guardarán los rasgos físicos actuales del prompt como la base de este personaje.
            </p>
            <Input 
              placeholder="Nombre del personaje..." 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="bg-white/5 border-white/5 text-xs text-white"
            />
            <div className="flex gap-2">
              <Button 
                className="flex-1 h-8 text-[10px] uppercase tracking-wider bg-white text-black hover:bg-neutral-200"
                onClick={handleCreate}
                disabled={!newName.trim() || !currentPrompt.trim()}
              >
                Guardar Identidad
              </Button>
              <Button 
                variant="ghost"
                className="h-8 text-[10px] uppercase tracking-wider text-white/40"
                onClick={() => setIsAdding(false)}
              >
                Cancelar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={14} />
        <Input 
          placeholder="Buscar personaje..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9 bg-white/5 border-white/5 text-xs h-10 rounded-xl text-white placeholder:text-white/20 focus:bg-white/10 transition-all font-medium"
        />
      </div>

      <div className="grid grid-cols-1 gap-2 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredCharacters.length === 0 && !isLoading && (
          <div className="py-8 text-center space-y-2 opacity-20">
            <Smile className="mx-auto text-white" size={24} />
            <p className="text-[10px] uppercase tracking-wider text-white">No hay identidades guardadas</p>
          </div>
        )}

        {filteredCharacters.map((char) => (
          <motion.div 
            key={char.id}
            layout
            className="group flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/20 transition-all cursor-pointer"
            onClick={() => onSelect(char)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold font-serif overflow-hidden ring-1 ring-white/10">
                {char.reference_image_url ? (
                  <img src={char.reference_image_url} alt={char.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  char.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold text-white/90">{char.name}</h4>
                <p className="text-[9px] text-white/30 truncate max-w-[180px] font-medium">
                  {char.base_prompt}
                </p>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                deleteCharacter(char.id);
              }}
              className="opacity-0 group-hover:opacity-100 h-8 w-8 text-white/20 hover:text-red-500 hover:bg-red-500/10 transition-all"
            >
              <Trash2 size={14} />
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
