// Checkbox.tsx
import React from "react";

interface CheckboxProps {
  name?: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({ name, checked = false, onChange, label }) => {
  return (
    <div className="mb-3"> 
      <label className="inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="hidden"
        />
        <div className={`relative w-5 h-5 border rounded-md mr-2 transition-colors
          ${checked ? 'bg-primary border-primary' : 'bg-white border-gray-300 dark:bg-gray-700 dark:border-gray-600'}`}
        >
          {checked && (
            <svg className="absolute inset-0 m-auto w-3 h-3 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        {label && <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>}
      </label>
    </div>
  );
};

export default Checkbox;