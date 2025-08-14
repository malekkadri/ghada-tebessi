import React, { useEffect } from "react";
import BackgroundUploader from "../uploads/BackgroundUploader";

interface BackgroundSettingsProps {
  selectedOption: string;
  setSelectedOption: (option: string) => void;
  solidColor: string;
  setSolidColor: (color: string) => void;
  gradientStart: string;
  setGradientStart: (color: string) => void;
  gradientEnd: string;
  setGradientEnd: (color: string) => void;
  imagePreview: string | null;
  handleFileUploadBackground: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedGradient: string | null;
  handleGradientPresetSelect: (preset: string) => void;
  setVCard: (vcard: any) => void;
}

const BackgroundSettings: React.FC<BackgroundSettingsProps> = ({
  selectedOption,
  setSelectedOption,
  solidColor,
  setSolidColor,
  gradientStart,
  setGradientStart,
  gradientEnd,
  setGradientEnd,
  imagePreview,
  handleFileUploadBackground,
  selectedGradient,
  handleGradientPresetSelect,
  setVCard,
}) => {
  const gradientPresets = [
    {
      value: 'linear-gradient(45deg, #ff9a9e, #fad0c4)',
      name: 'Pink Sunrise'
    },
    {
      value: 'linear-gradient(45deg, #a18cd1, #fbc2eb)',
      name: 'Purple Mist'
    },
    {
      value: 'linear-gradient(45deg, #fbc2eb, #a6c1ee)',
      name: 'Cotton Candy'
    },
    {
      value: 'linear-gradient(45deg, #84fab0, #8fd3f4)',
      name: 'Aqua Fresh'
    },
    {
      value: 'linear-gradient(45deg, #a6c0fe, #f68084)',
      name: 'Sunset Glow'
    },
    {
      value: 'linear-gradient(45deg, #d4fc79, #96e6a1)',
      name: 'Green Meadow'
    }
  ];

  const handlePresetClick = (presetValue: string) => {
    if (selectedGradient === presetValue) {
      handleGradientPresetSelect('');
      setVCard((prevVCard: any) => ({
        ...prevVCard,
        background_type: '',
        background_value: '',
      }));
    } else {
      handleGradientPresetSelect(presetValue);
    }
  };

  useEffect(() => {
    if (selectedOption === 'gradient') {
      setVCard((prevVCard: any) => ({
        ...prevVCard,
        background_type: 'gradient',
        background_value: `linear-gradient(45deg, ${gradientStart}, ${gradientEnd})`,
      }));
    }
  }, [gradientStart, gradientEnd, selectedOption, setVCard]);

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Background Type</label>
        <div className="inputForm-vcard bg-gray-100 dark:bg-gray-700">
          <select
            className="input-vcard pl-3 pr-8 bg-transparent dark:bg-gray-800 dark:text-white"
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
          >
            <option value="gradient-preset" className="dark:bg-gray-800 dark:text-white">
              Gradient Preset
            </option>
            <option value="color" className="dark:bg-gray-800 dark:text-white">
              Solid Color
            </option>
            <option value="gradient" className="dark:bg-gray-800 dark:text-white">
              Custom Gradient
            </option>
            <option value="custom-image" className="dark:bg-gray-800 dark:text-white">
              Custom Image
            </option>
          </select>
        </div>
      </div>

      {selectedOption === 'gradient-preset' && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Choose a Gradient Preset</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {gradientPresets.map((preset) => (
              <button
                key={preset.value}
                type="button"
                className={`relative h-24 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedGradient === preset.value
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
                style={{ background: preset.value }}
                onClick={() => handlePresetClick(preset.value)}
                title={preset.name}
              >
                {selectedGradient === preset.value && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}
                <span className="sr-only">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedOption === 'color' && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Choose a Color</h3>
          <div className="flex items-center gap-4">
            <input
              type="color"
              value={solidColor}
              onChange={(e) => {
                setSolidColor(e.target.value);
                setVCard((prevVCard: any) => ({
                  ...prevVCard,
                  background_type: 'color',
                  background_value: e.target.value,
                }));
              }}
              className="w-16 h-16 rounded-lg cursor-pointer border border-gray-300 dark:border-gray-600"
            />
            <div className="flex-1">
              <div className="inputForm-vcard bg-gray-100 dark:bg-gray-700">
                <input
                  type="text"
                  className="input-vcard"
                  value={solidColor}
                  onChange={(e) => {
                    setSolidColor(e.target.value);
                    setVCard((prevVCard: any) => ({
                      ...prevVCard,
                      background_type: 'color',
                      background_value: e.target.value,
                    }));
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedOption === 'gradient' && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Custom Gradient</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Start Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={gradientStart}
                  onChange={(e) => setGradientStart(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
                />
                <div className="flex-1">
                  <div className="inputForm-vcard bg-gray-100 dark:bg-gray-700">
                    <input
                      type="text"
                      className="input-vcard text-xs"
                      value={gradientStart}
                      onChange={(e) => setGradientStart(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">End Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={gradientEnd}
                  onChange={(e) => setGradientEnd(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
                />
                <div className="flex-1">
                  <div className="inputForm-vcard bg-gray-100 dark:bg-gray-700">
                    <input
                      type="text"
                      className="input-vcard text-xs"
                      value={gradientEnd}
                      onChange={(e) => setGradientEnd(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="w-full h-24 rounded-lg border border-gray-300 dark:border-gray-600"
            style={{ background: `linear-gradient(45deg, ${gradientStart}, ${gradientEnd})` }}
          ></div>
        </div>
      )}

      {selectedOption === 'custom-image' && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Custom Background Image</h3>
          <BackgroundUploader
            imagePreview={imagePreview}
            handleFileUploadBackground={handleFileUploadBackground}
          />
        </div>
      )}
    </div>
  );
};

export default BackgroundSettings;