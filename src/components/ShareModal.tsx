import React from 'react';
import { X, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

export default function ShareModal({ isOpen, onClose, url, title }: ShareModalProps) {
  if (!isOpen) return null;

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle} ${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
  };

  const openPopup = (shareUrl: string) => {
    typeof window !== 'undefined' && window.open(shareUrl, 'share-popup', 'width=600,height=400');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url,
        });
      } catch (err) {
        console.error("Error sharing", err);
      }
    } else {
        toast.error("Native share not supported on this device.");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d1400] border border-[#1a2700] rounded-xl w-full max-w-sm p-6 relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-bold text-white mb-6">Share to</h3>
        <div className="grid grid-cols-5 gap-4 mb-6">
          <button onClick={() => openPopup(shareLinks.facebook)} className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </div>
            <span className="text-xs text-gray-400">Facebook</span>
          </button>
          <button onClick={() => openPopup(shareLinks.twitter)} className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 bg-[#1DA1F2] rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
            </div>
            <span className="text-xs text-gray-400">Twitter</span>
          </button>
          <button onClick={() => openPopup(shareLinks.whatsapp)} className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M11.979 0C5.361 0 0 5.361 0 11.979c0 2.124.552 4.192 1.601 6.012L.035 23.95l6.106-1.597A11.905 11.905 0 0011.98 23.95c6.616 0 11.978-5.361 11.978-11.972A11.983 11.983 0 0011.979 0zm.009 19.957a9.96 9.96 0 01-5.088-1.38l-.364-.216-3.784.991.996-3.687-.238-.378a9.986 9.986 0 01-1.534-5.309c0-5.522 4.496-10.016 10.018-10.016A10.006 10.006 0 0122 11.978c0 5.52-4.491 10.01-10.012 10.01l.001-.031zm5.348-7.394c-.292-.146-1.736-.856-2.006-.954-.27-.098-.466-.146-.662.146-.195.293-.761.954-.932 1.15-.171.196-.342.22-.634.073-.292-.146-1.24-.457-2.361-1.453-.872-.776-1.462-1.736-1.633-2.03-.171-.293-.018-.45.128-.596.132-.132.293-.342.439-.513.146-.17.195-.292.292-.488.098-.195.049-.366-.024-.512-.073-.146-.662-1.595-.907-2.18-.24-.572-.482-.494-.662-.503-.171-.008-.366-.01-.561-.01-.195 0-.512.073-.781.366-.268.293-1.025.998-1.025 2.435 0 1.437 1.049 2.825 1.195 3.02.146.195 2.062 3.148 4.996 4.415.698.303 1.243.483 1.666.62.702.227 1.341.195 1.84.118.56-.086 1.736-.71 1.98-1.395.244-.685.244-1.272.171-1.395-.073-.122-.268-.195-.56-.341z"/></svg>
            </div>
            <span className="text-xs text-gray-400">WhatsApp</span>
          </button>
          
          
          <button onClick={() => openPopup(shareLinks.telegram)} className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 bg-[#0088cc] rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z"/></svg>
            </div>
            <span className="text-xs text-gray-400">Telegram</span>
          </button>
          <button onClick={handleNativeShare} className="flex flex-col items-center gap-2 group">
            <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
              <Smartphone className="w-6 h-6" />
            </div>
            <span className="text-xs text-gray-400">More</span>
          </button>
          
        </div>
        <div className="flex items-center gap-2 bg-[#000000] p-2 rounded-lg border border-[#385600]">
          <input 
            type="text" 
            readOnly 
            value={url} 
            className="bg-transparent text-sm text-gray-400 flex-grow px-2 outline-none"
          />
          <button onClick={handleCopy} className="bg-brand-700 hover:bg-brand-600 text-white p-2 rounded transition-colors whitespace-nowrap text-sm font-medium">
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}
