import React, { useState, useEffect } from "react";
import BlockCard from "../../cards/BlockCard";
import BlockModal from "../../modals/BlockModal";
import { BlockType } from "./types";
import { useParams } from "react-router-dom";
import { Breadcrumb } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FiPlus, FiChevronRight, FiSearch } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { blockService } from "../../services/api";
import debounce from 'lodash.debounce';
import { Block } from "../../services/vcard";

const AddBlocksPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedBlock, setSelectedBlock] = useState<BlockType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const blockTypes: BlockType[] = [
    "Link", "Email", "Address", "Phone", 
    "Facebook", "Twitter", "Instagram", "Youtube", 
    "Whatsapp", "Tiktok", "Telegram", "Spotify", 
    "Pinterest", "Linkedin", "Snapchat", "Twitch", 
    "Discord", "Messenger", "Reddit", "GitHub"  
  ];

  useEffect(() => {
    const loadBlocks = async () => {
      try {
        if (id) {
          setIsLoading(true);
          const response = await blockService.getByVcardId(id);
          const apiBlocks = response.data;
          
          const formattedBlocks: Block[] = apiBlocks.map((block: any) => ({
            id: block.id,
            name: block.name,
            typeBlock: block.type_block,
            description: block.description
          }));
          
          setBlocks(formattedBlocks);
        }
      } catch (error) {
        console.error('Error loading blocks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBlocks();
  }, [id]);

  const debouncedSearch = debounce((term: string) => {
    setSearchTerm(term);
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const filteredBlocks = blockTypes.filter(blockType => 
    blockType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const breadcrumbLinks = [
    { name: "vCard", path: "/admin/vcard" },
    { name: "Edit vCard", path: `/admin/vcard/edit-vcard/${id}` },
    { name: "Blocks", path: `/admin/vcard/edit-vcard/${id}/blocks` },
    { name: "Add Blocks", path: `/admin/vcard/edit-vcard/${id}/blocks/add-blocks` },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Breadcrumb className="mb-6">
        {breadcrumbLinks.map((link, index) => (
          <Breadcrumb.Item 
            key={index} 
            linkAs={Link} 
            linkProps={{ to: link.path }}
            active={index === breadcrumbLinks.length - 1}
            className={`text-sm font-medium ${index === breadcrumbLinks.length - 1 ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}
          >
            {index < breadcrumbLinks.length - 1 ? (
              <div className="flex items-center">
                {link.name}
                <FiChevronRight className="mx-2 text-gray-400" size={14} />
              </div>
            ) : (
              link.name
            )}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Add New Block</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Select the type of block you want to add to your vCard
          </p>
        </div>
        
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search blocks..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            onChange={handleSearchChange}
            defaultValue={searchTerm}
          />
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
      >
        {isLoading ? (
          [...Array(5)].map((_, index) => (
            <motion.div 
              key={index}
              variants={item}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse h-32"
            />
          ))
        ) : filteredBlocks.length > 0 ? (
          filteredBlocks.map((blockType) => (
            <motion.div key={blockType} variants={item}>
              <BlockCard
                blockType={blockType}
                onClick={() => setSelectedBlock(blockType)}
                isAdded={blocks.some(b => b.type_block === blockType)}
              />
            </motion.div>
          ))
        ) : (
          <motion.div 
            className="col-span-full py-12 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-gray-400 dark:text-gray-500">
              <FiPlus className="mx-auto h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No blocks found</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {selectedBlock && id !== undefined && (
          <BlockModal
            blockType={selectedBlock}
            onClose={() => setSelectedBlock(null)}
            vcardId={id}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddBlocksPage;