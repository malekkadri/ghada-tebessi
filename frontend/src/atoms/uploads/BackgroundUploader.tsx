import React, { useRef } from "react";

interface BackgroundUploaderProps {
  imagePreview: string | null;
  handleFileUploadBackground: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BackgroundUploader: React.FC<BackgroundUploaderProps> = ({
  imagePreview,
  handleFileUploadBackground,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative group">
      <div 
        className={`relative rounded-xl border-2 border-dashed ${imagePreview ? 'border-transparent' : 'border-gray-300 dark:border-gray-600 group-hover:border-primary'} transition-all duration-300 overflow-hidden h-64 w-full cursor-pointer`}
        onClick={handleClick}
      >
        {imagePreview ? (
          <>
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-3 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <svg className="w-6 h-6 text-gray-800 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <div className="absolute -right-1 -bottom-1 bg-primary rounded-full p-1">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-1">
              Upload Background Image
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
              <span className="font-medium text-primary">Click to browse</span> or drag and drop
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              JPG, PNG, SVG or GIF (MAX. 5MB)
            </p>
          </div>
        )}
      </div>

      {imagePreview && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleFileUploadBackground({ target: { files: null } } as React.ChangeEvent<HTMLInputElement>);
          }}
          className="absolute top-3 right-3 bg-gray-100 dark:bg-gray-700 rounded-full p-2 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
        >
          <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUploadBackground}
        accept=".jpg,.jpeg,.png,.svg,.gif"
        className="hidden"
      />

      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
        Recommended size: 1920×1080px for best quality
      </div>
    </div>
  );
};

export default BackgroundUploader;