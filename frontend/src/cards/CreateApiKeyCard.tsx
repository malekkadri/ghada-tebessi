import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { ApiKeyService, limitService } from '../services/api';
import { toast } from 'react-toastify';
import { FaCopy, FaRedoAlt } from 'react-icons/fa';

interface CreateApiKeyCardProps {
  onCreateSuccess: () => void;
}

interface ApiKeyResponse {
  data: {
    key: string;
    [key: string]: any;
  };
}

const CreateApiKeyCard: React.FC<CreateApiKeyCardProps> = ({ onCreateSuccess }) => {
  const [name, setName] = useState<string>('');
  const [generatedKey, setGeneratedKey] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [currentApiKeys, setCurrentApiKeys] = useState<number>(0);
  const [maxApiKeys, setMaxApiKeys] = useState<number>(1);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsCreating(true);
      const response = await ApiKeyService.createApiKey({ name }) as ApiKeyResponse;
      setGeneratedKey(response.data.key);
      onCreateSuccess();
      toast.success('API key generated successfully');
    } catch (error) {
      toast.error('Failed to generate API key');
      console.error('API key generation error:', error);
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
  const fetchLimits = async () => {
    const limits = await limitService.checkApiKeyLimits();
    console.log(limits);
    setCurrentApiKeys(limits.current);
    setMaxApiKeys(limits.max);
  };
  fetchLimits();
}, [generatedKey]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedKey);
    toast.success('API key copied to clipboard');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl shadow-purple-500/10 dark:shadow-gray-900/50 backdrop-blur-lg border border-gray-200 dark:border-gray-800 hover:border-purple-500/30 transition-all">
      <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2">
        <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
          🔑
        </div>
        Generate New API Key
      </h4>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label className="text-left block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Key Name
            </label>
            <div className="inputForm-vcard bg-gray-100 dark:bg-gray-800 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z"/>
                </svg>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                placeholder="e.g. My Mobile App"
                className="input-vcard pl-10 pr-3 w-full"
                required
              />
            </div>
          </div>

          {generatedKey && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your API Key
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={generatedKey}
                  readOnly
                  className="w-full pr-10 px-3 py-2 bg-gray-100 dark:bg-gray-700 font-mono border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:text-white"
                  onClick={handleCopy}
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <FaCopy className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Make sure to copy your API key now. You won't be able to see it again.
              </p>
            </div>
          )}

          <div className="flex flex-col mobile:flex-row justify-end gap-2 mt-6">
            {generatedKey ? (
              <button
                type="button"
                onClick={() => {
                  setGeneratedKey('');
                  setName('');
                }}
                className="flex items-center justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                <FaRedoAlt className="mr-2 h-4 w-4" />
                Generate Another
              </button>
            ) : (
              <button
                type="submit"
                disabled={isCreating || (maxApiKeys !== -1 && currentApiKeys >= maxApiKeys)}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r bg-blue-50 hover:bg-blue-500 text-white font-semibold shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {maxApiKeys !== -1 && currentApiKeys >= maxApiKeys ? (
                  'Limite d\'API Keys atteinte'
                ) : isCreating ? (
                  'Generating...'
                ) : (
                  'Generate Key'
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateApiKeyCard;