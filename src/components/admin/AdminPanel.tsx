import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  Users, 
  Image as ImageIcon, 
  Activity, 
  TrendingUp, 
  Database, 
  Search, 
  Filter,
  X,
  RefreshCw,
  AlertTriangle,
  Star,
  Flag,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { GeneratedImage } from '../../types';

interface AdminStats {
  totalUsers: number;
  totalImages: number;
  activeSessions: number;
  storageUsed: string;
}

export function AdminPanel({ onClose }: { onClose: () => void }) {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalImages: 0,
    activeSessions: 0,
    storageUsed: '0 MB'
  });
  const [users, setUsers] = useState<any[]>([]);
  const [recentImages, setRecentImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'library'>('overview');

  useEffect(() => {
    fetchAdminData();
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setUsers(data);
  };

  const toggleAdmin = async (userId: string, current: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_super_admin: !current })
      .eq('id', userId);
    
    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, is_super_admin: !current } : u));
    }
  };

  const adjustLimit = async (userId: string, currentLimit: number, adjustment: number) => {
    const newLimit = Math.max(0, currentLimit + adjustment);
    const { error } = await supabase
      .from('profiles')
      .update({ max_daily_limit: newLimit })
      .eq('id', userId);
    
    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, max_daily_limit: newLimit } : u));
    }
  };

  const resetUsage = async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ daily_usage_count: 0 })
      .eq('id', userId);
    
    if (!error) {
      setUsers(users.map(u => u.id === userId ? { ...u, daily_usage_count: 0 } : u));
    }
  };

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: imageCount, data: images } = await supabase
        .from('images')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(24);

      setStats({
        totalUsers: userCount || 0,
        totalImages: imageCount || 0,
        activeSessions: Math.floor(Math.random() * 5) + 1,
        storageUsed: `${((imageCount || 0) * 0.5).toFixed(1)} MB`
      });

      if (images) {
        setRecentImages(images.map((img: any) => ({
          ...img,
          isFeatured: img.is_featured,
          isFlagged: img.is_flagged
        })));
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteImage = async (id: string, url: string) => {
    const { error } = await supabase.from('images').delete().eq('id', id);
    if (!error) {
      setRecentImages(prev => prev.filter(img => img.id !== id));
      // Delete from storage
      const bucketName = 'images';
      const parts = url.split(`${bucketName}/`);
      if (parts.length > 1) {
        const fullPath = parts[1];
        await supabase.storage.from(bucketName).remove([fullPath]);
      }
    }
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    const { error } = await supabase.from('images').update({ is_featured: !current }).eq('id', id);
    if (!error) {
      setRecentImages(prev => prev.map(img => img.id === id ? { ...img, is_featured: !current } : img));
    }
  };

  const toggleFlagged = async (id: string, current: boolean) => {
    const { error } = await supabase.from('images').update({ is_flagged: !current }).eq('id', id);
    if (!error) {
      setRecentImages(prev => prev.map(img => img.id === id ? { ...img, is_flagged: !current } : img));
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-[#050505] overflow-y-auto text-white"
    >
      <div className="atmosphere-bg opacity-30" />
      <div className="noise-overlay opacity-20 pointer-events-none" />

      {/* Header */}
      <div className="sticky top-0 z-50 glass-2 border-b border-white/5 px-10 py-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 bg-white rounded-3xl flex items-center justify-center shadow-xl shadow-white/5">
            <ShieldCheck className="text-black" size={28} />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-serif font-light tracking-tight text-white italic leading-none">Terminal de Control</h1>
            <p className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-bold">Aura Studio v3.0 Superadmin</p>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center hover:bg-white hover:text-black transition-all border-white/10"
        >
          <X size={20} />
        </button>
      </div>

      <div className="max-w-7xl mx-auto p-10 space-y-12 relative z-10">
        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-white/5 pb-6">
          {[
            { id: 'overview', label: 'Resumen Global', icon: Activity },
            { id: 'users', label: 'Ciudadanos Aura', icon: Users },
            { id: 'library', label: 'Archivos Maestros', icon: ImageIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all border ${
                activeTab === tab.id 
                  ? 'bg-white text-black border-white shadow-2xl shadow-white/10 scale-105' 
                  : 'text-white/30 border-white/5 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-12">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Usuarios Totales', value: stats.totalUsers, icon: Users, color: 'bg-white/5 text-white' },
                { label: 'Obras Generadas', value: stats.totalImages, icon: ImageIcon, color: 'bg-white/5 text-white' },
                { label: 'Flujo en Vivo', value: stats.activeSessions, icon: Activity, color: 'bg-white/5 text-white' },
                { label: 'Almacén de Datos', value: stats.storageUsed, icon: Database, color: 'bg-white/5 text-white' }
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-8 rounded-[40px] border-white/5 group hover:border-white/20 transition-all"
                >
                  <div className="flex items-start justify-between mb-8">
                    <div className={`p-4 rounded-2xl ${stat.color} transition-colors group-hover:bg-white group-hover:text-black`}>
                      <stat.icon size={28} strokeWidth={1.5} />
                    </div>
                    <div className="flex items-center gap-1.5 text-white/40 text-[10px] font-bold tracking-widest">
                      <TrendingUp size={14} />
                      <span>+12%</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.3em] mb-2">{stat.label}</p>
                  <h3 className="text-4xl font-serif font-light text-white italic tracking-tight">{stat.value}</h3>
                </motion.div>
              ))}
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Recent Activity */}
              <div className="lg:col-span-2 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-4 bg-white rounded-full" />
                    <h2 className="text-xl font-serif font-light italic leading-none">Corriente de Actividad</h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative group">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors" size={14} />
                      <input 
                        type="text"
                        placeholder="Buscar por Email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white/5 border border-white/5 rounded-full px-11 py-2 text-[10px] font-bold uppercase tracking-widest focus:bg-white/10 focus:border-white/20 transition-all w-64 outline-none text-white placeholder:text-white/20"
                      />
                    </div>
                    <button 
                      onClick={fetchAdminData}
                      className="p-3 glass-card rounded-full hover:bg-white hover:text-black transition-all border-white/5"
                    >
                      <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                  </div>
                </div>

                <div className="glass-2 border border-white/5 rounded-[40px] overflow-hidden">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/[0.02]">
                          <th className="px-8 py-5 text-[9px] uppercase tracking-[0.3em] text-white/30 font-bold">Registro Visual</th>
                          <th className="px-8 py-5 text-[9px] uppercase tracking-[0.3em] text-white/30 font-bold">Identidad Unívoca</th>
                          <th className="px-8 py-5 text-[9px] uppercase tracking-[0.3em] text-white/30 font-bold">Temporalidad</th>
                          <th className="px-8 py-5 text-[9px] uppercase tracking-[0.3em] text-white/30 font-bold">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {recentImages.length > 0 ? (
                          recentImages.map((img) => (
                            <tr key={img.id} className="hover:bg-white/[0.03] transition-colors group">
                              <td className="px-8 py-6">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 shadow-lg group-hover:scale-110 transition-transform duration-500">
                                  <img 
                                    src={img.url} 
                                    alt="" 
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              </td>
                              <td className="px-8 py-6 text-[10px] font-mono text-white/40 tracking-wider">
                                {img.id.substring(0, 16)}...
                              </td>
                              <td className="px-8 py-6 text-[10px] text-white/60 font-bold tracking-widest uppercase">
                                {new Date(img.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-8 py-6">
                                <button className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/30 hover:text-white transition-colors flex items-center gap-2">
                                  Detalles <ChevronRight size={10} />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="px-8 py-20 text-center text-white/20 uppercase tracking-[0.4em] text-[10px] font-bold">
                              No se detectaron flujos constantes.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* System Stats Sidebar */}
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-4 bg-white rounded-full" />
                  <h2 className="text-xl font-serif font-light italic leading-none">Estado Aura</h2>
                </div>
                <div className="glass-2 border border-white/5 rounded-[40px] p-8 space-y-6">
                  <div className="flex items-center gap-5 p-5 bg-white/5 rounded-3xl border border-white/5">
                    <div className="w-10 h-10 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center animate-pulse">
                      <Activity className="text-green-400" size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white tracking-tight">Estudio Online</p>
                      <p className="text-[9px] text-green-400 uppercase tracking-widest font-bold">Latencia: 18ms</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 p-5 bg-white/5 rounded-3xl border border-white/5">
                    <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                      <TrendingUp className="text-orange-400" size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white tracking-tight">Pico de Inspiración</p>
                      <p className="text-[9px] text-orange-400 uppercase tracking-widest font-bold">Alta Demanda API</p>
                    </div>
                  </div>

                  <div className="p-6 bg-white/[0.02] rounded-[32px] border border-white/5 space-y-4">
                    <div className="flex justify-between text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">
                      <span>Memoria Colectiva</span>
                      <span className="text-white/60">75%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                    </div>
                    <div className="flex justify-between text-[8px] font-bold text-white/20 tracking-tighter uppercase">
                      <span>750 GB USADOS</span>
                      <span>1 TB TOTAL</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex items-center gap-3 text-white/20">
                    <AlertTriangle size={14} />
                    <span className="text-[9px] font-bold uppercase tracking-[0.3em]">Integridad del Núcleo Óptima</span>
                  </div>
                </div>

                {/* Admin Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                  <button className="bg-white text-black p-6 rounded-[32px] flex flex-col items-center justify-center gap-3 hover:bg-neutral-200 transition-all group scale-95 hover:scale-100 shadow-xl shadow-white/5">
                    <Users size={20} strokeWidth={2.5} />
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Censo</span>
                  </button>
                  <button className="glass-card hover:bg-white/10 p-6 rounded-[32px] flex flex-col items-center justify-center gap-3 transition-all border-white/10 scale-95 hover:scale-100">
                    <Filter size={20} strokeWidth={1.5} className="text-white/40" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">Bitácora</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-4 bg-white rounded-full" />
              <h2 className="text-xl font-serif font-light italic leading-none">Gestión de Ciudadanos Aura</h2>
            </div>
            <div className="glass-2 border border-white/5 rounded-[48px] overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="px-10 py-6 text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">Identidad Digital</th>
                      <th className="px-10 py-6 text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">Rol en el Estudio</th>
                      <th className="px-10 py-6 text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">Cuota de Generación</th>
                      <th className="px-10 py-6 text-[10px] uppercase tracking-[0.3em] text-white/30 font-bold">Comandos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-white/[0.03] transition-colors group">
                        <td className="px-10 py-8">
                          <p className="text-sm font-light text-white group-hover:italic">{user.email}</p>
                          <p className="text-[10px] text-white/20 font-mono italic mt-1 tracking-tighter">UID: {user.id}</p>
                        </td>
                        <td className="px-10 py-8">
                          <span className={`text-[8px] px-4 py-1.5 rounded-full font-bold uppercase tracking-[0.2em] transition-all ${
                            user.is_super_admin 
                              ? 'bg-white text-black shadow-lg shadow-white/5' 
                              : 'bg-white/5 text-white/30 border border-white/5 group-hover:border-white/20'
                          }`}>
                            {user.is_super_admin ? 'Superadmin' : 'Iniciante'}
                          </span>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-4">
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-white leading-none">{user.daily_usage_count} <span className="text-white/20">/ {user.max_daily_limit}</span></p>
                              <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-white transition-all duration-1000" 
                                  style={{ width: `${Math.min(100, (user.daily_usage_count / user.max_daily_limit) * 100)}%` }}
                                />
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => adjustLimit(user.id, user.max_daily_limit, -5)}
                                className="w-7 h-7 flex items-center justify-center glass-card rounded-lg hover:bg-white hover:text-black transition-all text-xs font-bold border-white/5"
                              >
                                -
                              </button>
                              <button 
                                onClick={() => adjustLimit(user.id, user.max_daily_limit, 5)}
                                className="w-7 h-7 flex items-center justify-center glass-card rounded-lg hover:bg-white hover:text-black transition-all text-xs font-bold border-white/5"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => toggleAdmin(user.id, user.is_super_admin)}
                              className={`text-[9px] font-bold uppercase tracking-[0.2em] border px-5 py-2 rounded-2xl transition-all shadow-sm ${
                                user.is_super_admin 
                                  ? 'bg-white text-black border-white hover:bg-neutral-200' 
                                  : 'border-white/10 text-white/30 hover:border-white hover:text-white'
                              }`}
                            >
                              {user.is_super_admin ? 'Degradar' : 'Promover'}
                            </button>
                            <button 
                              onClick={() => resetUsage(user.id)}
                              className="text-[9px] font-bold uppercase tracking-[0.2em] border border-orange-500/30 text-orange-400 px-5 py-2 rounded-2xl hover:bg-orange-500 hover:text-white transition-all shadow-lg shadow-orange-500/5"
                            >
                              Reset
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'library' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-4 bg-white rounded-full" />
              <h2 className="text-xl font-serif font-light italic leading-none">Archivos Maestros de Aura</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {recentImages.map((img) => (
                <div key={img.id} className="group relative aspect-square rounded-[32px] overflow-hidden border border-white/5 glass-card shadow-2xl transition-all hover:border-white/20">
                  <img src={img.url} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-[1.5s]" referrerPolicy="no-referrer" />
                  
                  {/* Status Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    {img.isFeatured && (
                      <div className="bg-white text-black p-2 rounded-xl shadow-2xl scale-90">
                        <Star size={10} className="fill-black" />
                      </div>
                    )}
                    {img.isFlagged && (
                      <div className="bg-red-500 text-white p-2 rounded-xl shadow-2xl scale-90">
                        <Flag size={10} className="fill-white" />
                      </div>
                    )}
                  </div>

                  <div className="absolute inset-0 bg-[#050505]/90 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-md flex flex-col justify-end p-6 gap-4">
                    <p className="text-[9px] text-white/50 line-clamp-3 italic mb-2 leading-relaxed">"{img.prompt}"</p>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => toggleFeatured(img.id, img.isFeatured || false)}
                        className={`flex-1 py-3 rounded-2xl text-[8px] font-bold uppercase tracking-[0.2em] transition-all ${
                          img.isFeatured ? 'bg-white text-black' : 'bg-white/10 text-white/40 hover:bg-white hover:text-black'
                        }`}
                      >
                        {img.isFeatured ? 'Inspiración' : 'Destacar'}
                      </button>
                      <button 
                        onClick={() => toggleFlagged(img.id, img.isFlagged || false)}
                        className={`flex-1 py-3 rounded-2xl text-[8px] font-bold uppercase tracking-[0.2em] transition-all ${
                          img.isFlagged ? 'bg-red-500 text-white' : 'bg-white/10 text-white/40 hover:bg-orange-500 hover:text-white'
                        }`}
                      >
                        {img.isFlagged ? 'Reportado' : 'Alerta'}
                      </button>
                    </div>

                    <button 
                      onClick={() => deleteImage(img.id, img.url)}
                      className="w-full py-3 bg-red-500/10 text-red-500 border border-red-500/20 text-[8px] font-bold uppercase tracking-[0.2em] rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                    >
                      ELIMINAR PERMANENTE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
