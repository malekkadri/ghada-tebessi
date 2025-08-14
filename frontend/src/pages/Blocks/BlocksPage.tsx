import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiPlus, FiChevronRight, FiSearch, FiX } from "react-icons/fi";
import BlockCardList from "../../cards/BlockCardList";
import BlockModal from "../../modals/BlockModal";
import { blockService, limitService } from "./../../services/api";
import { BlockType } from "./types";
import { motion, AnimatePresence } from "framer-motion";
import { Breadcrumb } from "react-bootstrap";
import debounce from "lodash.debounce";
import { toast, ToastContainer } from "react-toastify";
import { Block } from "../../services/vcard";
import Pagination from "../../atoms/Pagination/Pagination";

interface DisplayBlock {
  id: string;
  name: string;
  typeBlock: BlockType;
  description?: string;
  isDisabled?: boolean;
}

const BlocksPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blocks, setBlocks] = useState<DisplayBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState<DisplayBlock | null>(null);
  const [searchResults, setSearchResults] = useState<DisplayBlock[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const blocksPerPage = 6;

  useEffect(() => {
    const loadBlocks = async () => {
      try {
        if (id) {
          setIsLoading(true);
          const response = await blockService.getByVcardIdAdmin(id);
          const apiBlocks: Block[] = response.data;

          const formattedBlocks: DisplayBlock[] = apiBlocks.map(block => ({
            id: block.id,
            name: block.name,
            typeBlock: block.type_block as BlockType,
            description: block.description,
            isDisabled: block.isDisabled
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const debouncedSearch = debounce(async (term: string) => {
    if (term.trim() === '') {
      setSearchResults([]);
      return;
    }

    try {
      const response = await blockService.searchBlocks(id || '', term);
      const apiBlocks: Block[] = response.data;

      const formattedBlocks: DisplayBlock[] = apiBlocks.map(block => ({
        id: block.id,
        name: block.name,
        typeBlock: block.type_block as BlockType,
        description: block.description
      }));

      setSearchResults(formattedBlocks);
      setShowSearchResults(true);
    } catch (error) {
      console.error('Error searching blocks:', error);
      setSearchResults([]);
    }
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const handleSearchResultClick = (block: DisplayBlock) => {
    setSearchTerm(block.name);
    setShowSearchResults(false);
    const element = document.getElementById(`block-${block.id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filteredBlocks = searchTerm
    ? blocks.filter(block =>
        block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        block.typeBlock.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : blocks;

  const indexOfLastBlock = currentPage * blocksPerPage;
  const indexOfFirstBlock = indexOfLastBlock - blocksPerPage;
  const currentBlocks = filteredBlocks.slice(indexOfFirstBlock, indexOfLastBlock);
  const totalPages = Math.ceil(filteredBlocks.length / blocksPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleEditBlock = (blockId: string) => {
    const blockToEdit = blocks.find(block => block.id === blockId);
    if (blockToEdit) {
      setEditingBlock(blockToEdit);
      setShowModal(true);
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    try {
      await blockService.delete(blockId);
      setBlocks(blocks.filter((block) => block.id !== blockId));
      setSearchResults(searchResults.filter((block) => block.id !== blockId));
    } catch (error) {
      console.error("Error deleting block:", error);
    }
  };

   const handleAddBlock = async () => {
    try {
      if (id) {
        const { current, max } = await limitService.checkBlockLimit(id);
        if (max !== -1 && current >= max) {
          toast.warning(`You've reached the maximum of ${max} blocks. Upgrade your plan to add more.`);
          return;
        }

        navigate(`/admin/vcard/edit-vcard/${id}/blocks/add-blocks`);
      }
    } catch (error) {
      console.error('Error checking block limits:', error);
      toast.error('Error checking plan limits. Please try again.');
    }
  };


  const handleSaveBlock = async () => {
    try {
      const response = await blockService.getByVcardId(id || "");
      const apiBlocks: Block[] = response.data;
      const formattedBlocks: DisplayBlock[] = apiBlocks.map(block => ({
        id: block.id,
        name: block.name,
        typeBlock: block.type_block as BlockType,
        description: block.description
      }));
      setBlocks(formattedBlocks);
      setShowModal(false);
      setEditingBlock(null);
    } catch (error) {
      console.error("Error refreshing blocks:", error);
    }
  };

  const breadcrumbLinks = [
    { name: "vCard", path: "/admin/vcard" },
    { name: "Edit vCard", path: `/admin/vcard/edit-vcard/${id}` },
    { name: "Blocks", path: `/admin/vcard/edit-vcard/${id}/blocks` },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="p-6 px-28 w-full max-w-[90rem] mx-auto div-block">
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Blocks Management</h1>
          <p className="text-primary mt-2">
            View and manage your vCard blocks
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-64" ref={searchRef}>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Search blocks..."
              className="w-full pl-10 pr-8 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={() => searchTerm && setShowSearchResults(true)}
            />
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <FiX className="h-5 w-5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300" />
              </button>
            )}

            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
                {searchResults.map((block) => (
                  <div
                    key={block.id}
                    className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
                    onClick={() => handleSearchResultClick(block)}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">{block.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{block.typeBlock}</div>
                    </div>
                    <FiChevronRight className="text-gray-400 dark:text-gray-500" />
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleAddBlock}
            className="flex items-center bg-primary hover:bg-primary-dark text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
          >
            <FiPlus className="mr-2" />
            Add Block
          </button>
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {isLoading ? (
          [...Array(5)].map((_, index) => (
            <motion.div
              key={index}
              variants={item}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse"
            >
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </motion.div>
          ))
        ) : filteredBlocks.length > 0 ? (
          <>
            <AnimatePresence>
              {currentBlocks.map((block) => (
                <motion.div
                  key={block.id}
                  id={`block-${block.id}`}
                  variants={item}
                  layout
                  transition={{ duration: 0.3 }}
                  className="block-card"
                >
                  <BlockCardList
                    id={block.id}
                    name={block.name}
                    typeBlock={block.typeBlock}
                    description={block.description}
                    vcardId={id || ""}
                    onDelete={handleDeleteBlock}
                    onEdit={handleEditBlock}
                    isDisabled={block.isDisabled}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={paginate}
                />
              </div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 p-8 text-center rounded-lg border border-dashed border-gray-300 dark:border-gray-700"
          >
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
              <FiPlus className="text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
              {searchTerm ? "No blocks found" : "No blocks yet"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {searchTerm ? "Try a different search term" : "Get started by adding a new block"}
            </p>
            <button
              onClick={handleAddBlock}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <FiPlus className="mr-2" />
              Add Block
            </button>
          </motion.div>
        )}
      </motion.div>

      {showModal && editingBlock && (
        <BlockModal
          blockType={editingBlock.typeBlock}
          onClose={() => {
            setShowModal(false);
            setEditingBlock(null);
          }}
          vcardId={id || ""}
          mode="edit"
          blockData={{
            id: editingBlock.id,
            name: editingBlock.name,
            description: editingBlock.description || ""
          }}
          onSuccess={handleSaveBlock}
        />
      )}
    </div>
  );
};

export default BlocksPage;