"use client";
import React, { useState, useEffect } from 'react';
import SectionHeader from '../components/SectionHeader';
import { useMediaData, auth } from '../firebase';
import { MediaItem } from '../types';
import { LayoutDashboard, Film, Tv, Users, LogOut, ShieldAlert, Settings, Layers } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

import DashboardOverview from '../components/admin/DashboardOverview';
import MediaList from '../components/admin/MediaList';
import MediaForm from '../components/admin/MediaForm';
import ReportList from '../components/admin/ReportList';
import AdminSettings from '../components/admin/AdminSettings';
import CollectionList from '../components/admin/CollectionList';
import CollectionForm from '../components/admin/CollectionForm';

type AdminTab = 'dashboard' | 'movies' | 'tv' | 'collections' | 'cast' | 'reports' | 'settings';

export default function AdminView() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [editingCollection, setEditingCollection] = useState<any | null>(null);
  const [editingCast, setEditingCast] = useState<any | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingCollection, setIsAddingCollection] = useState(false);
  const [isAddingCast, setIsAddingCast] = useState(false);
  const [addingType, setAddingType] = useState<'MOVIE' | 'TV'>('MOVIE');
  
  const { data: media, loading, loadMore, hasMore } = useMediaData();

  if (loading) {
    return <div className="flex-grow flex items-center justify-center p-8 text-white font-bold text-xl">Loading Dashboard...</div>;
  }

  // Determine what main content to render based on state
  const renderContent = () => {
    if (editingItem || isAdding) {
      return (
        <MediaForm 
          initialData={editingItem} 
          defaultType={addingType}
          onClose={() => {
            setEditingItem(null);
            setIsAdding(false);
          }} 
        />
      );
    }
    
    if (editingCast || isAddingCast) {
      return (
        <CollectionForm 
          type="CAST"
          initialData={editingCast} 
          onClose={() => {
            setEditingCast(null);
            setIsAddingCast(false);
          }} 
        />
      );
    }

    if (editingCollection || isAddingCollection) {
      return (
        <CollectionForm 
          type="REGULAR"
          initialData={editingCollection} 
          onClose={() => {
            setEditingCollection(null);
            setIsAddingCollection(false);
          }} 
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview media={media} />;
      case 'movies':
        return <MediaList 
                 media={media} 
                 typeFilter="MOVIE" 
                 onEdit={(item) => setEditingItem(item)} 
                 onAddNew={() => { setAddingType('MOVIE'); setIsAdding(true); }} 
                 loadMore={loadMore}
                 hasMore={hasMore}
               />;
      case 'tv':
        return <MediaList 
                 media={media} 
                 typeFilter="TV" 
                 onEdit={(item) => setEditingItem(item)} 
                 onAddNew={() => { setAddingType('TV'); setIsAdding(true); }} 
                 loadMore={loadMore}
                 hasMore={hasMore}
               />;
      case 'collections':
        return <CollectionList 
                 type="REGULAR"
                 onEdit={(item) => setEditingCollection(item)} 
                 onAddNew={() => { setIsAddingCollection(true); }} 
               />;
      case 'cast':
        return <CollectionList 
                 type="CAST"
                 onEdit={(item) => setEditingCast(item)} 
                 onAddNew={() => { setIsAddingCast(true); }} 
               />;
      case 'reports':
        return <ReportList />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <DashboardOverview media={media} />;
    }
  };

  const menuItems = [
    { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'movies' as AdminTab, label: 'Movies', icon: <Film className="w-5 h-5" /> },
    { id: 'tv' as AdminTab, label: 'TV Shows', icon: <Tv className="w-5 h-5" /> },
    { id: 'collections' as AdminTab, label: 'Collections', icon: <Layers className="w-5 h-5" /> },
    { id: 'cast' as AdminTab, label: 'Cast Profiles', icon: <Users className="w-5 h-5" /> },
    { id: 'reports' as AdminTab, label: 'Reports', icon: <ShieldAlert className="w-5 h-5" /> },
    { id: 'settings' as AdminTab, label: 'Settings', icon: <Settings className="w-5 h-5" /> }
  ];

  return (
    <div className="flex-grow flex flex-col md:flex-row w-full bg-[#0a0a0a] min-h-[calc(100vh-80px)]">
      <Toaster position="top-right" toastOptions={{
        style: { background: '#385600', color: '#fff', border: '1px solid #444' }
      }} />
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0 bg-[#000000] border-r border-[#253900] p-4 flex flex-col pt-8">
        <div className="px-4 mb-8">
          <h2 className="text-brand-600 font-black text-2xl tracking-tighter uppercase">Admin Panel</h2>
        </div>
        
        <nav className="flex flex-col gap-2 flex-grow">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => { 
                setActiveTab(item.id); 
                setEditingItem(null); 
                setIsAdding(false);
                setEditingCollection(null);
                setIsAddingCollection(false);
                setEditingCast(null);
                setIsAddingCast(false);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === item.id && !editingItem && !isAdding && !editingCollection && !isAddingCollection && !editingCast && !isAddingCast ? 'bg-brand-600/10 text-brand-500' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow p-6 md:p-10 overflow-y-auto w-full max-w-[1600px] mx-auto">
        {renderContent()}
      </main>
    </div>
  );
}
