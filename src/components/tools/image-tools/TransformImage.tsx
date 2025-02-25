import React from 'react';
import { RotateCw, RotateCcw, FlipHorizontal, FlipVertical } from 'lucide-react';

interface TransformImageProps {
  onTransform: (type: 'rotate' | 'flip', value: 'cw' | 'ccw' | 'horizontal' | 'vertical') => void;
}

const TransformImage: React.FC<TransformImageProps> = ({ onTransform }) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => onTransform('rotate', 'ccw')}
          className="p-2 border rounded hover:bg-gray-50"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
        <button
          onClick={() => onTransform('rotate', 'cw')}
          className="p-2 border rounded hover:bg-gray-50"
        >
          <RotateCw className="w-5 h-5" />
        </button>
        <button
          onClick={() => onTransform('flip', 'horizontal')}
          className="p-2 border rounded hover:bg-gray-50"
        >
          <FlipHorizontal className="w-5 h-5" />
        </button>
        <button
          onClick={() => onTransform('flip', 'vertical')}
          className="p-2 border rounded hover:bg-gray-50"
        >
          <FlipVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default TransformImage;