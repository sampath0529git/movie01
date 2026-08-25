"use client";
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Search } from 'lucide-react';
import { MediaCollection, MediaItem } from '../../types';
import { saveCollection, updateCollection, useMediaData, uploadImageFile } from '../../firebase';
import toast from 'react-hot-toast';

interface CollectionFormProps {
  initialData: MediaCollection | null;
  type?: "REGULAR" | "CAST";
  onClose: () => void;
}

export default function CollectionForm({ initialData, type = "REGULAR", onClose }: CollectionFormProps) {
  const [formData, setFormData] = useState<Partial<MediaCollection>>({
    title: '',
    description: '',
    imageUrl: '',
    mediaIds: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: mediaItems, loading: mediaLoading } = useMediaData();

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        imageUrl: initialData.imageUrl || '',
        mediaIds: initialData.mediaIds || [],
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingImage(true);
      const toastId = toast.loading("Compressing and converting to WebP...");
      try {
        const url = await uploadImageFile(file);
        setFormData(prev => ({ ...prev, imageUrl: url }));
        toast.success("Image auto-compressed and uploaded in WebP format!", { id: toastId });
      } catch (err: any) {
        toast.error("Failed to upload image.", { id: toastId });
      } finally {
        setUploadingImage(false);
        e.target.value = "";
      }
    }
  };

  const handleToggleMedia = (mediaId: string) => {
    setFormData(prev => {
      const currentIds = prev.mediaIds || [];
      if (currentIds.includes(mediaId)) {
        return { ...prev, mediaIds: currentIds.filter(id => id !== mediaId) };
      } else {
        return { ...prev, mediaIds: [...currentIds, mediaId] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Collection title is required');
      return;
    }

    setIsSaving(true);
    try {
      const collectionData = {
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl || '',
        mediaIds: formData.mediaIds || [],
        type: type,
      };

      if (initialData) {
        await updateCollection(initialData.id, collectionData);
        toast.success(type === "CAST" ? 'Cast Profile updated successfully' : 'Collection updated successfully');
      } else {
        await saveCollection(collectionData);
        toast.success(type === "CAST" ? 'Cast Profile created successfully' : 'Collection created successfully');
      }
      onClose();
    } catch (error) {
      toast.error('Failed to save collection');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredMedia = mediaItems.filter(item => 
    item.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isCast = type === "CAST";
  const itemLabel = isCast ? "Profile" : "Collection";
  const titleLabel = isCast ? "Cast Member Name *" : "Collection Title *";
  const placeholderText = isCast ? "e.g. Tom Cruise" : "e.g. Action Blockbusters";
  const headerText = initialData ? `Edit ${itemLabel}` : `New ${itemLabel}`;

  const inputClass = "w-full bg-[#0a0a0a] border border-[#385600] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-500 font-medium transition-colors";
  const labelClass = "block text-sm font-bold text-gray-400 mb-2 uppercase";

  return (
    <div className="bg-[#0f1400] rounded-3xl border border-[#253900] overflow-hidden max-w-4xl mx-auto flex flex-col h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="p-6 md:px-8 border-b border-[#253900] bg-[#141d00] flex items-center justify-between sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center transition-colors text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter">
            {headerText}
          </h2>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className={labelClass}>{titleLabel}</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder={placeholderText}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Description / Bio</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`${inputClass} min-h-[120px] resize-y`}
                  placeholder={`A brief description or bio...`}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className={labelClass}>Cover Image</label>
                <div className="flex flex-col gap-4">
                  <div className={`w-full ${isCast ? 'aspect-[3/4] max-w-sm mx-auto' : 'aspect-[21/9]'} bg-[#0a0a0a] rounded-xl border-2 border-dashed border-[#385600] flex flex-col items-center justify-center overflow-hidden relative group`}>
                    {formData.imageUrl ? (
                      <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-12 h-12 text-[#385600] mb-2" />
                    )}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <label className={`bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-lg cursor-pointer font-bold transition-colors ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                        {uploadingImage ? <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> : null}
                        Upload Image
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} disabled={uploadingImage} />
                      </label>
                    </div>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Or paste image URL here..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#253900] pt-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <label className={labelClass}>Media Items</label>
                <p className="text-gray-400 text-sm">Select movies or TV shows ({formData.mediaIds?.length || 0} selected)</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search to add..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64 bg-[#0a0a0a] border border-[#253900] text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>
            </div>

            {mediaLoading ? (
              <div className="text-gray-500 text-center py-8">Loading media...</div>
            ) : (
              <div className="bg-[#0a0a0a] border border-[#253900] rounded-xl max-h-[400px] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-2">
                  {filteredMedia.map(item => {
                    const isSelected = formData.mediaIds?.includes(item.id);
                    return (
                      <div 
                        key={item.id}
                        onClick={() => handleToggleMedia(item.id)}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors border ${
                          isSelected ? 'bg-brand-600/10 border-brand-500/30' : 'bg-[#111111] border-transparent hover:bg-[#1a1a1a]'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded overflow-hidden flex items-center justify-center border ${
                          isSelected ? 'bg-brand-600 border-brand-500 text-white' : 'border-gray-600 bg-[#0a0a0a]'
                        }`}>
                          {isSelected && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <div className="w-10 h-14 bg-black rounded shrink-0 overflow-hidden">
                          <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-white font-bold text-sm truncate">{item.title}</span>
                          <span className="text-gray-500 text-xs">{item.year} • {item.type}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
