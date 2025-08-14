import React, { useRef } from "react";

interface LogoUploaderProps {
  logoPreview: string | null;
  handleLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const LogoUploader: React.FC<LogoUploaderProps> = ({
  logoPreview,
  handleLogoUpload,
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoClick = () => {
    if (logoInputRef.current) {
      logoInputRef.current.click(); 
    }
  };

  return (
    <div className="flex flex-col items-center mb-6 md:mb-0">
      <div
        className="relative group cursor-pointer"
        onClick={handleLogoClick}
      >
        <div className="rounded-full w-40 h-40 border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden group-hover:border-primary transition-colors">
          {logoPreview ? (
            <img 
              src={logoPreview} 
              alt="Logo" 
              className="w-full h-full object-contain dark:filter dark:brightness-90" 
            />
          ) : (
            <div className="text-gray-400 dark:text-gray-500 flex flex-col items-center text-sm group-hover:text-primary transition-colors">
              <span>Add</span>
              <span>logo</span>
            </div>
          )}
          <input
            type="file"
            ref={logoInputRef}
            onChange={handleLogoUpload}
            accept=".jpg,.jpeg,.png,.svg,.gif"
            className="hidden"
          />
        </div>
        <div className="absolute top-2 right-2 p-1.5 bg-gray-200 dark:bg-gray-700 rounded-full shadow-md group-hover:bg-primary transition-colors">
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-white transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </div>
        <span className="absolute top-0 left-0 font-medium text-sm px-3 py-1 bg-gray-200 dark:bg-gray-700 dark:text-white rounded-lg shadow-md">
          Logo
        </span>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 text-center max-w-xs">
        Your vcard logo, .jpg, .jpeg, .png, .svg, .gif allowed.
      </p>
    </div>
  );
};

export default LogoUploader;