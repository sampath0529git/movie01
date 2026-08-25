"use client";
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Layers, Users } from 'lucide-react';
import { MediaCollection } from '../../types';
import { useCollectionsData, deleteCollection } from '../../firebase';
import toast from 'react-hot-toast';

interface CollectionListProps {
  type?: "REGULAR" | "CAST";
  onEdit: (collection: MediaCollection) => void;
  onAddNew: () => void;
}

export default function CollectionList({ type = "REGULAR", onEdit, onAddNew }: CollectionListProps) {
  const { data: allCollections, loading } = useCollectionsData();
  const [searchTerm, setSearchTerm] = useState('');

  if (loading) {
    return <div className="text-white p-8">Loading...</div>;
  }

  const collections = allCollections.filter(c => (c.type || "REGULAR") === type);

  const filteredCollections = collections.filter(collection => 
    collection.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isCast = type === "CAST";
  const title = isCast ? "Cast Profiles" : "Collections";
  const itemLabel = isCast ? "Profile" : "Collection";
  const Icon = isCast ? Users : Layers;

  const handleDelete = async (collection: MediaCollection) => {
    if ((typeof window !== 'undefined' ? window.confirm : () => true)(`Are you sure you want to delete this ${itemLabel.toLowerCase()}: ${collection.title}?`)) {
      try {
        await deleteCollection(collection.id);
        toast.success(`${itemLabel} deleted successfully`);
      } catch (error) {
        toast.error(`Failed to delete ${itemLabel.toLowerCase()}`);
        console.error(error);
      }
    }
  };

  return (
    <div className="bg-[#0f1400] rounded-2xl border border-[#253900] overflow-hidden">
      <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#253900]">
        <div className="flex items-center gap-3">
          <Icon className="w-6 h-6 text-brand-500" />
          <h2 className="text-xl font-bold text-white uppercase tracking-tighter">{title}</h2>
          <span className="bg-brand-600/20 text-brand-400 text-xs px-2 py-1 rounded-md font-bold">
            {filteredCollections.length} Items
          </span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder={`Search ${title.toLowerCase()}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 bg-[#0a0a0a] border border-[#253900] text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-brand-500 font-medium"
            />
          </div>
          
          <button
            onClick={onAddNew}
            className="flex flex-row items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg font-bold transition-colors whitespace-nowrap shadow-[0_0_15px_rgba(220,38,38,0.3)]"
          >
            <Plus className="w-5 h-5" />
            Add {itemLabel}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#253900] bg-[#141d00]">
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Info</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Items Count</th>
              <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a2700]">
            {filteredCollections.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-gray-500 font-medium">
                  No collections found.
                </td>
              </tr>
            ) : (
              filteredCollections.map(collection => (
                <tr key={collection.id} className="hover:bg-[#1a2700]/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex flex-row gap-3 items-center">
                      <div className="w-16 h-10 bg-[#0a0a0a] rounded overflow-hidden shadow-md flex-shrink-0">
                        {collection.imageUrl ? (
                          <img src={collection.imageUrl} alt={collection.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Layers className="w-4 h-4 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-bold">{collection.title}</span>
                        <span className="text-xs text-gray-500">{collection.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-300 font-bold">{collection.mediaIds?.length || 0}</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(collection)}
                        className="p-2 text-brand-400 hover:text-white hover:bg-brand-600/20 rounded-md transition-colors"
                        title="Edit collection"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(collection)}
                        className="p-2 text-red-400 hover:text-white hover:bg-red-600/20 rounded-md transition-colors"
                        title="Delete collection"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
