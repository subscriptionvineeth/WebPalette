import React from 'react';
import * as LucideIcons from 'lucide-react';

interface ToolCardProps {
  tool: {
    id: string;
    name: string;
    description: string;
    icon: keyof typeof LucideIcons;
  };
  isActive: boolean;
  onClick: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, isActive, onClick }) => {
  const Icon = LucideIcons[tool.icon];

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-lg text-left transition-all ${
        isActive
          ? 'bg-blue-500 text-white shadow-lg'
          : 'bg-white hover:bg-gray-50 text-gray-700 shadow'
      }`}
    >
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-5 h-5" />}
        <div>
          <h3 className="font-medium">{tool.name}</h3>
          <p className={`text-sm ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
            {tool.description}
          </p>
        </div>
      </div>
    </button>
  );
};

export default ToolCard;