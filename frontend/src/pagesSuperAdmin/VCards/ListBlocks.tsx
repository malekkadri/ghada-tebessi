import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { blockService, vcardService } from '../../services/api';
import LoadingSpinner from '../../Loading/LoadingSpinner';
import BlocksTable from '../../atoms/Tables/BlocksTable';
import { VCard, Block } from '../../services/vcard';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCube, FaToggleOn, FaToggleOff, FaArrowLeft } from 'react-icons/fa';

interface BlockStats {
  total: number;
  active: number;
  inactive: number;
}

const colorMap = {
  orange: {
    bg: 'bg-orange-100',
    text: 'text-orange-500',
    darkBg: 'dark:bg-orange-500',
    darkText: 'dark:text-orange-100'
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-500',
    darkBg: 'dark:bg-green-500',
    darkText: 'dark:text-green-100'
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-500',
    darkBg: 'dark:bg-red-500',
    darkText: 'dark:text-red-100'
  },
};

const BlockStatCard: React.FC<{ 
  icon: React.ReactNode;
  title: string;
  value: number;
  color: keyof typeof colorMap;
}> = ({ icon, title, value, color }) => {
  const [prevValue, setPrevValue] = useState(value);
  const [displayValue, setDisplayValue] = useState(value);
  const colors = colorMap[color];

  useEffect(() => {
    if (value !== prevValue) {
      setDisplayValue(value);
      setPrevValue(value);
    }
  }, [value, prevValue]);

  return (
    <div className="flex items-center p-4 bg-white rounded-lg shadow-xs dark:bg-gray-800 h-full">
      <div className={`p-3 mr-4 rounded-full ${colors.bg} ${colors.text} ${colors.darkBg} ${colors.darkText}`}>
        {icon}
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </p>
        <AnimatePresence mode="wait">
          <motion.p
            key={displayValue}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="text-lg font-semibold text-gray-700 dark:text-gray-200"
          >
            {displayValue}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};

const StatsCardsBlocks: React.FC<{ stats: BlockStats }> = ({ stats }) => (
  <div className="grid gap-6 mb-8 md:grid-cols-3 mobile-stats-reduce">
    <BlockStatCard 
      icon={<FaCube className="w-5 h-5" />}
      title="Total Blocks"
      value={stats.total}
      color="orange"
    />
    <BlockStatCard 
      icon={<FaToggleOn className="w-5 h-5" />}
      title="Active Blocks"
      value={stats.active}
      color="green"
    />
    <BlockStatCard 
      icon={<FaToggleOff className="w-5 h-5" />}
      title="Inactive Blocks"
      value={stats.inactive}
      color="red"
    />
  </div>
);

const ListBlocks: React.FC = () => {
  const { vcardId } = useParams<{ vcardId: string }>();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [vcard, setVcard] = useState<VCard | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); 
  const [stats, setStats] = useState<BlockStats>({
    total: 0,
    active: 0,
    inactive: 0
  });

  useEffect(() => {
    if (blocks.length > 0) {
      const total = blocks.length;
      const active = blocks.filter(block => block.status).length;
      const inactive = blocks.filter(block => !block.status).length;
      
      setStats({ total, active, inactive });
    } else {
      setStats({ total: 0, active: 0, inactive: 0 });
    }
  }, [blocks]);

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        setLoading(true);
        if (vcardId) {
          const [blocksResponse, vcardResponse] = await Promise.all([
            blockService.getByVcardId(vcardId),
            vcardService.getById(vcardId)
          ]);

          setVcard(vcardResponse);
          setBlocks(blocksResponse.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load VCard data');
        setBlocks([]);
        setVcard(null);
      } finally {
        setLoading(false);
      }
    };

    if (vcardId) {
      fetchBlocks();
    } else {
      setLoading(false);
      toast.error('VCard ID is required');
    }
  }, [vcardId]);

  const handleToggleStatus = async (blockId: string) => {
    try {
      const currentBlock = blocks.find(b => b.id === blockId);
      if (!currentBlock) return;

      setBlocks(prevBlocks =>
        prevBlocks.map(block =>
          block.id === blockId ? { ...block, status: !block.status } : block
        )
      );
      const response = await blockService.toggleStatus(blockId);
      
      setBlocks(prevBlocks =>
        prevBlocks.map(block =>
          block.id === blockId ? { ...block, status: response.newStatus } : block
        )
      );

      toast.success(`Block ${response.newStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Failed to toggle block status', error);
      toast.error('Failed to update block status');
      
      setBlocks(prevBlocks =>
        prevBlocks.map(block =>
          block.id === blockId ? { ...block, status: !block.status } : block
        )
      );
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!vcardId) {
    return (
      <div className="p-4 sm:p-6 lg:px-8 xl:px-28 w-full max-w-[90rem] mx-auto">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            Invalid VCard ID
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please provide a valid VCard ID to view blocks.
          </p>
        </div>
      </div>
    );
  }

  if (!vcard) {
    return (
      <div className="p-4 sm:p-6 lg:px-8 xl:px-28 w-full max-w-[90rem] mx-auto">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            VCard Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            The requested VCard could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:p-2 xl:p-2 sm:p-6 sm:py-2 lg:px-8 xl:px-14 lg:py-4 xl:py-4 w-full max-w-[90rem] mx-auto">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <button 
        onClick={() => navigate(-1)}
        className="flex items-center mb-2 mt-3 text-primary hover:text-primary-dark"
      >
        <FaArrowLeft className="mr-2" /> Back to VCards
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4">
        <div className="w-full md:w-auto">
          <h1 className="text-xl sm:text-2xl pt-4 font-bold text-gray-800 dark:text-white">Blocks Management</h1>
          <p className="text-primary mt-1 sm:mt-2 text-xs sm:text-sm">
            Manage blocks for VCard: {vcard.name}
          </p>
        </div>
      </div>

      <div className="mobile-stats-reduce">
        <StatsCardsBlocks stats={stats} />
      </div>

      {blocks.length > 0 ? (
        <BlocksTable
          blocks={blocks}
          onToggleStatus={handleToggleStatus}
        />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            No Blocks Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This VCard doesn't have any blocks yet.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Blocks can be added through the VCard editor.
          </p>
        </div>
      )}

    </div>
  );
};

export default ListBlocks;