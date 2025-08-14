import React from 'react';

interface PipelineStageProps {
  stages: string[];
  current?: string;
  onStageClick?: (stage: string) => void;
}

const PipelineStage: React.FC<PipelineStageProps> = ({ stages, current, onStageClick }) => {
  return (
    <div className="flex space-x-2 mb-4">
      {stages.map(stage => (
        <button
          key={stage}
          onClick={() => onStageClick?.(stage)}
          className={`px-3 py-1 rounded-full text-sm border transition-colors duration-150 ${
            current === stage
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
          }`}
        >
          {stage}
        </button>
      ))}
    </div>
  );
};

export default PipelineStage;
