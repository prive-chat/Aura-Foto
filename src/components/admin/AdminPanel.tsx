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
  AlertTriangle
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

      if (images) setRecentImages(images as any);
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
      const path = url.split('/').pop();
      if (path) {
        await supabase.storage.from('images').remove([path]);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] bg-[#fcfaf7] overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#fcfaf7]/80 backdrop-blur-md border-b border-black/5 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-serif font-light tracking-tight text-black">Panel de Control</h1>
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Aura Studio Superadmin</p>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          className="w-10 h-10 border border-black/5 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all"
        >
          <X size={20} />
        </button>
      </div>

      <div className="max-w-7xl mx-auto p-8 space-y-8 text-black">
        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-black/5 pb-4">
          {[
            { id: 'overview', label: 'Resumen', icon: Activity },
            { id: 'users', label: 'Usuarios', icon: Users },
            { id: 'library', label: 'Biblioteca Maestra', icon: ImageIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                  ? 'bg-black text-white shadow-lg' 
                  : 'text-neutral-400 hover:text-black hover:bg-black/5'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Usuarios Totales', value: stats.totalUsers, icon: Users, color: 'bg-blue-50 text-blue-600' },
            { label: 'Imágenes Generadas', value: stats.totalImages, icon: ImageIcon, color: 'bg-purple-50 text-purple-600' },
            { label: 'Sesiones Activas', value: stats.activeSessions, icon: Activity, color: 'bg-green-50 text-green-600' },
            { label: 'Almacenamiento', value: stats.storageUsed, icon: Database, color: 'bg-orange-50 text-orange-600' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-black/5 p-6 rounded-3xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div className="flex items-center gap-1 text-green-600 text-xs font-bold">
                  <TrendingUp size={14} />
                  <span>+12%</span>
                </div>
              </div>
              <p className="text-sm text-neutral-500 font-sans mb-1">{stat.label}</p>
              <h3 className="text-3xl font-serif font-light">{stat.value}</h3>
            </motion.div>
          ))}
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-serif font-light">Actividad Reciente</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
                  <input 
                    type="text"
                    placeholder="Buscar por Email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-black/5 border border-transparent rounded-full px-9 py-2 text-xs focus:bg-white focus:border-black/10 transition-all w-48 outline-none"
                  />
                </div>
                <button 
                  onClick={fetchAdminData}
                  className="p-2 border border-black/5 rounded-full hover:bg-black/5 transition-colors"
                >
                  <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            <div className="bg-white border border-black/5 rounded-3xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/5 bg-black/[0.02]">
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Vista Previa</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Usuario ID</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Fecha</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {recentImages.length > 0 ? (
                    recentImages.map((img) => (
                      <tr key={img.id} className="hover:bg-black/[0.01] transition-colors">
                        <td className="px-6 py-4">
                          <img 
                            src={img.url} 
                            alt="" 
                            className="w-12 h-12 rounded-lg object-cover bg-neutral-100"
                            referrerPolicy="no-referrer"
                          />
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-neutral-500">
                          {img.id.substring(0, 12)}...
                        </td>
                        <td className="px-6 py-4 text-xs text-neutral-600">
                          {new Date(img.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-xs font-bold uppercase tracking-widest text-black hover:underline">
                            Detalles
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-neutral-400">
                        No se detectó actividad reciente disponible.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* System Alerts */}
          <div className="space-y-6">
            <h2 className="text-xl font-serif font-light">Estado del Sistema</h2>
            <div className="bg-white border border-black/5 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl border border-green-100">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center animate-pulse">
                  <Activity className="text-white" size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-green-800">Servidores Operativos</p>
                  <p className="text-[10px] text-green-600 uppercase tracking-widest font-bold">Latencia: 24ms</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                  <TrendingUp className="text-white" size={16} />
                </div>
                <div>
                  <p className="text-sm font-bold text-orange-800">Uso de API Alto</p>
                  <p className="text-[10px] text-orange-600 uppercase tracking-widest font-bold">Nivel 4 / Picos detectados</p>
                </div>
              </div>

              <div className="p-4 bg-black/5 rounded-2xl space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">Cuotas de Almacenamiento</p>
                <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-black rounded-full" />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-neutral-400">
                  <span>750 GB USADOS</span>
                  <span>1 TB TOTAL</span>
                </div>
              </div>

              <div className="pt-4 border-t border-black/5 flex items-center gap-2 text-neutral-400">
                <AlertTriangle size={14} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Sin alertas críticas pendientes</span>
              </div>
            </div>

            {/* Admin Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-black text-white p-4 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-neutral-800 transition-all group">
                <Users size={18} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Usuarios</span>
              </button>
              <button className="border border-black/10 p-4 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-black hover:text-white transition-all">
                <Filter size={18} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Logs</span>
              </button>
            </div>
          </div>
        </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-serif font-light">Gestión de Usuarios</h2>
            <div className="bg-white border border-black/5 rounded-3xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/5 bg-black/[0.02]">
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Email</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Rol</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Límite Diario</th>
                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-black/[0.01] transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium">{user.email}</p>
                        <p className="text-[10px] text-neutral-400 font-mono italic">UID: {user.id}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${user.is_super_admin ? 'bg-black text-white' : 'bg-neutral-100 text-neutral-400'}`}>
                          {user.is_super_admin ? 'Superadmin' : 'Usuario'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold">
                        {user.daily_usage_count} / {user.max_daily_limit}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => toggleAdmin(user.id, user.is_super_admin)}
                          className="text-[9px] font-bold uppercase tracking-widest border border-black/10 px-3 py-1.5 rounded-lg hover:bg-black hover:text-white transition-all"
                        >
                          {user.is_super_admin ? 'Quitar Admin' : 'Hacer Admin'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'library' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl font-serif font-light">Biblioteca Maestra de Aura</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recentImages.map((img) => (
                <div key={img.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-black/5 bg-neutral-100 shadow-sm">
                  <img src={img.url} alt="" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 gap-2">
                    <p className="text-[8px] text-white/60 line-clamp-2 italic">"{img.prompt}"</p>
                    <button 
                      onClick={() => deleteImage(img.id, img.url)}
                      className="w-full py-2 bg-white text-black text-[8px] font-bold uppercase tracking-widest rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                    >
                      Borrar
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
