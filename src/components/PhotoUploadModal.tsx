import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Upload, 
  Link as LinkIcon, 
  Camera, 
  Check, 
  Image as ImageIcon,
  RotateCw,
  Trash2
} from 'lucide-react';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  name: string;
  currentPhotoUrl: string;
  onSave: (newPhotoUrl: string) => Promise<void>;
  themeColor?: 'blue' | 'orange';
}

export const compressImageFile = (
  file: File, 
  maxWidth = 360, 
  maxHeight = 360, 
  quality = 0.82
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('ইমেজ ফাইল লোড করতে সমস্যা হয়েছে'));
    };
    reader.onerror = () => reject(new Error('ফাইল পড়তে সমস্যা হয়েছে'));
  });
};

export default function PhotoUploadModal({
  isOpen,
  onClose,
  title,
  name,
  currentPhotoUrl,
  onSave,
  themeColor = 'blue'
}: PhotoUploadModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [previewUrl, setPreviewUrl] = useState<string>(currentPhotoUrl);
  const [urlInput, setUrlInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever modal opens
  React.useEffect(() => {
    if (isOpen) {
      setPreviewUrl(currentPhotoUrl);
      setUrlInput(currentPhotoUrl?.startsWith('data:') ? '' : currentPhotoUrl);
      setErrorMessage(null);
    }
  }, [isOpen, currentPhotoUrl]);

  if (!isOpen) return null;

  const isBlue = themeColor === 'blue';
  const primaryBg = isBlue ? 'bg-[#3B55A4]' : 'bg-[#FF6B00]';
  const primaryHover = isBlue ? 'hover:bg-[#2D4280]' : 'hover:bg-[#E66000]';
  const primaryText = isBlue ? 'text-[#3B55A4]' : 'text-[#FF6B00]';
  const primaryLightBg = isBlue ? 'bg-blue-50 text-[#3B55A4]' : 'bg-orange-50 text-[#FF6B00]';
  const ringColor = isBlue ? 'focus:ring-[#3B55A4]' : 'focus:ring-[#FF6B00]';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('অনুগ্রহ করে শুধুমাত্র ইমেজ (JPG, PNG) ফাইল নির্বাচন করুন।');
      return;
    }

    try {
      setIsProcessing(true);
      setErrorMessage(null);
      const compressedDataUrl = await compressImageFile(file, 360, 360, 0.85);
      setPreviewUrl(compressedDataUrl);
    } catch (err) {
      console.error(err);
      setErrorMessage('ছবি প্রসেস করতে ব্যর্থ হয়েছে। অন্য ছবি চেষ্টা করুন।');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) {
      setErrorMessage('ইমেজ লিংক লিখুন বা পেস্ট করুন।');
      return;
    }
    setPreviewUrl(urlInput.trim());
    setErrorMessage(null);
  };

  const handleResetToDefault = () => {
    const defaultUrl = `https://picsum.photos/seed/${encodeURIComponent(name || 'user')}/300/300`;
    setPreviewUrl(defaultUrl);
    setUrlInput(defaultUrl);
    setErrorMessage(null);
  };

  const handleSave = async () => {
    if (!previewUrl) {
      setErrorMessage('কোনো ছবি নির্বাচন করা হয়নি।');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);
      await onSave(previewUrl);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage('ছবি সংরক্ষণ করতে সমস্যা হয়েছে: ' + (err.message || 'Error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      
      {/* Modal Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 overflow-hidden z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">{name}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Preview Area */}
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative group">
            <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-gray-100 shadow-md bg-gray-50 flex items-center justify-center">
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt={name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    setErrorMessage('ইমেজ লিংকটি লোড করা যাচ্ছে না।');
                  }}
                />
              ) : (
                <ImageIcon size={36} className="text-gray-300" />
              )}
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-2 bg-white rounded-full shadow-lg border border-gray-100 text-gray-700 hover:text-blue-600 hover:scale-110 transition-all"
              title="ডিভাইস থেকে ছবি বেছে নিন"
            >
              <Camera size={16} />
            </button>
          </div>
          <p className="text-xs text-gray-400 font-medium mt-3">ছবির প্রিভিউ (Preview)</p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-gray-100 p-1 rounded-2xl mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'upload' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Upload size={14} />
            ডিভাইস থেকে আপলোড
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'url' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <LinkIcon size={14} />
            ইমেজ লিংক (URL)
          </button>
        </div>

        {/* Upload Mode */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden" 
            />
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 hover:border-gray-400 rounded-2xl p-6 text-center cursor-pointer transition-all bg-gray-50/50 hover:bg-gray-50"
            >
              <div className="w-12 h-12 mx-auto rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 mb-2">
                <Upload size={20} className={primaryText} />
              </div>
              <p className="text-sm font-bold text-gray-700">এখানে ক্লিক করে ছবি নির্বাচন করুন</p>
              <p className="text-xs text-gray-400 mt-1">মোবাইল ক্যামেরা বা গ্যালারি থেকে যেকোনো ছবি আপলোড করুন</p>
            </div>

            {isProcessing && (
              <div className="flex items-center justify-center gap-2 text-xs text-blue-600 font-medium">
                <RotateCw size={14} className="animate-spin" />
                ছবি প্রসেস ও অপটিমাইজ করা হচ্ছে...
              </div>
            )}
          </div>
        )}

        {/* URL Mode */}
        {activeTab === 'url' && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-gray-600 block">ছবির সরাসরি ওয়েব লিংক (Direct Image URL)</label>
            <div className="flex gap-2">
              <input 
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className={`flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 outline-none ${ringColor}`}
              />
              <button 
                type="button"
                onClick={handleApplyUrl}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs ${primaryLightBg} hover:opacity-90 transition-all`}
              >
                প্রিভিউ দেখুন
              </button>
            </div>
            <p className="text-[11px] text-gray-400">ইন্টারনেট বা যেকোনো হোস্টিং লিংক পেস্ট করে 'প্রিভিউ দেখুন' চাপুন।</p>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="mt-3 p-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-medium border border-red-100">
            {errorMessage}
          </div>
        )}

        {/* Actions Footer */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 font-semibold px-2 py-2 rounded-lg transition-all"
            title="ডিফল্ট ছবি ফিরিয়ে আনুন"
          >
            <RotateCw size={13} />
            রিসেট
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all disabled:opacity-50"
            >
              বাতিল
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isProcessing}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all active:scale-95 disabled:opacity-50 ${primaryBg} ${primaryHover}`}
            >
              {isSaving ? (
                <>
                  <RotateCw size={14} className="animate-spin" />
                  সংরক্ষণ হচ্ছে...
                </>
              ) : (
                <>
                  <Check size={14} />
                  ছবি পরিবর্তন করুন
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
