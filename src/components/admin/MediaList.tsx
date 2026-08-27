"use client";
import React, { useState } from "react";
import { MediaItem } from "../../types";
import { Edit2, Trash2, Search, Plus } from "lucide-react";
import { deleteMediaItem } from "../../firebase";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

interface MediaListProps {
  media: MediaItem[];
  typeFilter?: "MOVIE" | "TV";
  onEdit: (item: MediaItem) => void;
  onAddNew: () => void;
  hasMore?: boolean;
  loadMore?: () => void;
}

export default function MediaList({
  media,
  typeFilter,
  onEdit,
  onAddNew,
  hasMore,
  loadMore,
}: MediaListProps) {
  const { i18n } = useTranslation();
  const [search, setSearch] = useState("");
  const [localTypeFilter, setLocalTypeFilter] = useState<"ALL" | "MOVIE" | "TV">(typeFilter || "ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Published" | "Draft">("ALL");

  const formatDate = (timestamp?: any) => {
    if (!timestamp) return "-";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return new Intl.DateTimeFormat(i18n.language, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);
    } catch (e) {
      return "-";
    }
  };

  React.useEffect(() => {
    setLocalTypeFilter(typeFilter || "ALL");
  }, [typeFilter]);

  const filteredMedia = media.filter((m) => {
    if (localTypeFilter !== "ALL" && m.type !== localTypeFilter) return false;
    const itemStatus = m.status || "Published";
    if (statusFilter !== "ALL" && itemStatus !== statusFilter) return false;
    if (search && !m.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  const handleDelete = async (id: string, title: string) => {
    if ((typeof window !== 'undefined' ? window.confirm : () => true)(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteMediaItem(id);
        toast.success(`"${title}" deleted successfully`);
      } catch (error: any) {
        toast.error(`Failed to delete: ${error.message}`);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {typeFilter === "MOVIE"
              ? "Movies"
              : typeFilter === "TV"
                ? "TV Shows"
                : "All Media"}
          </h2>
          <p className="text-gray-400 text-sm">Manage your content database.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
          <select
            value={localTypeFilter}
            onChange={(e) => setLocalTypeFilter(e.target.value as "ALL" | "MOVIE" | "TV")}
            className="bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
          >
            <option value="ALL" className="bg-[#000000]">All Media</option>
            <option value="MOVIE" className="bg-[#000000]">Movies</option>
            <option value="TV" className="bg-[#000000]">TV Shows</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "ALL" | "Published" | "Draft")}
            className="bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
          >
            <option value="ALL" className="bg-[#000000]">All Status</option>
            <option value="Published" className="bg-[#000000]">Published</option>
            <option value="Draft" className="bg-[#000000]">Draft</option>
          </select>
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64 bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
          <button
            onClick={onAddNew}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-full font-bold text-sm transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add New</span>
          </button>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-white/5">
              <tr>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/10">
                  Title
                </th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/10">
                  Genre
                </th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/10">
                  Year
                </th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/10">
                  Status
                </th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/10">
                  Added
                </th>
                <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-white/10 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMedia.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                >
                  <td className="p-4 flex items-center gap-4">
                    <div className="w-12 h-16 rounded overflow-hidden bg-gray-800 shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-base">
                        {item.title}
                      </span>
                      <div className="flex gap-2 items-center mt-1">
                        <span className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-bold text-gray-300">
                          {item.type}
                        </span>
                        {item.featured && (
                          <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-500 rounded text-[10px] font-bold">
                            Featured
                          </span>
                        )}
                        {item.hasSinhalaSub && (
                          <span className="px-1.5 py-0.5 bg-brand-500/20 text-brand-400 rounded text-[10px] font-bold">
                            Sinhala Sub
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-400 font-medium">
                    {item.genre || "—"}
                  </td>
                  <td className="p-4 text-sm text-gray-400 font-medium">
                    {item.year || "—"}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${item.status === "Draft" ? "bg-gray-500/20 text-gray-400" : "bg-brand-500/20 text-brand-400"}`}
                    >
                      {item.status || "Published"}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-400">
                    {formatDate(item.createdAt)}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-2 bg-brand-500/20 hover:bg-brand-500/40 rounded-full transition-colors text-brand-500"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredMedia.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-12 text-center text-gray-500 font-medium"
                  >
                    No items found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {hasMore && (
          <div className="p-4 border-t border-[#1a1a1a] flex justify-center">
            <button 
              onClick={loadMore}
              className="px-4 py-2 bg-[#243600] text-gray-200 hover:text-white rounded-md text-sm font-medium transition duration-200 hover:bg-[#385600]"
            >
              Load More from Database
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
