import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ApiKeyService } from '../../services/api';
import CreateApiKeyCard from '../../cards/CreateApiKeyCard';
import ApiKeyListCard from '../../cards/ApiKeyListCard';
import { ApiKey } from '../../services/ApiKey';

const ApiKeyManager = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchApiKeys = async () => {
    try {
      setIsLoading(true);
      const response = await ApiKeyService.listApiKeys();
      const keys = response?.data?.data || response?.data || [];
      setApiKeys(Array.isArray(keys) ? keys as ApiKey[] : []);
      console.log(response);
      console.log(keys);
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
      toast.error('Failed to fetch API keys');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const handleCreateSuccess = () => {
    fetchApiKeys();
  };

  const handleRevoke = async (id: number) => {
    try {
      await ApiKeyService.revokeApiKey(id);
      toast.success('API key revoked successfully');
      fetchApiKeys();
    } catch (error) {
      console.error('Failed to revoke API key:', error);
      toast.error('Failed to revoke API key');
    }
  };


  return (
    <div className="lg:px-8 xl:px-28 w-full max-w-[90rem] mx-auto h-full overflow-y-auto py-8">
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          API Keys Manager
        </h3>
        <div className="flex justify-center items-center gap-1 mt-1">
          <span className="text-primary text-xs sm:text-sm">
            Secure gateway to your digital ecosystem
          </span>
        </div>
      </div>

      <div className="space-y-8 mt-8">
        <CreateApiKeyCard onCreateSuccess={handleCreateSuccess} />

        <div className="mt-8">
          <ApiKeyListCard
            apiKeys={apiKeys}
            isLoading={isLoading}
            onDelete={handleRevoke}
          />
        </div>
      </div>
    </div>
  );
};

export default ApiKeyManager;