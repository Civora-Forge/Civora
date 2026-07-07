import React, { useRef } from 'react';
import { Camera, Image as ImageIcon, X } from 'lucide-react';

interface PhotoUploaderProps {
  photoUrl: string | null;
  onPhotoSelected: (blob: Blob, url: string) => void;
  onRemove: () => void;
}

export const PhotoUploader = ({ photoUrl, onPhotoSelected, onRemove }: PhotoUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Basic client-side resizing would go here in a full app
      const url = URL.createObjectURL(file);
      onPhotoSelected(file, url);
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {!photoUrl ? (
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.removeAttribute('capture');
                fileInputRef.current.setAttribute('capture', 'environment');
                fileInputRef.current.click();
              }
            }}
            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Camera size={32} className="mb-2 text-teal-600" />
            <span className="font-medium text-sm">Take Photo</span>
          </button>
          
          <button
            type="button"
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.removeAttribute('capture');
                fileInputRef.current.click();
              }
            }}
            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <ImageIcon size={32} className="mb-2 text-teal-600" />
            <span className="font-medium text-sm">Choose Photo</span>
          </button>
        </div>
      ) : (
        <div className="relative w-full aspect-video bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
          <img src={photoUrl} alt="Selected" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-700 shadow-sm hover:bg-white"
          >
            <X size={20} />
          </button>
          <div className="absolute bottom-2 right-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-white/80 backdrop-blur-sm text-sm font-medium rounded-lg text-gray-700 shadow-sm hover:bg-white"
            >
              Replace
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
