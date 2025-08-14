import React from "react";

interface Block {
  id: string;
  name: string;
}

interface BlockListProps {
  blocks: Block[];
}

const BlockList: React.FC<BlockListProps> = ({ blocks }) => {
  return (
    <div className="space-y-4">
      {blocks.map((block) => (
        <div
          key={block.id}
          className="p-4 bg-white rounded-lg shadow-md"
        >
          <h3 className="text-lg font-semibold">{block.name}</h3>
        </div>
      ))}
    </div>
  );
};

export default BlockList;