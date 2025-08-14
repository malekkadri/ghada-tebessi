import React from "react";

interface FontSelectorProps {
  fonts: { family: string }[];
  fontFamily: string;
  handleSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const FontSelector: React.FC<FontSelectorProps> = ({
  fonts,
  fontFamily,
  handleSelectChange,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium">Font Family</label>
      <select
        name="font_family"
        value={fontFamily}
        onChange={handleSelectChange}
        className="w-full p-2 border rounded"
      >
        {fonts.map((font) => (
          <option key={font.family} value={font.family}>
            {font.family}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FontSelector;