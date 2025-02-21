import React from 'react';
import { ResizeOptions } from './types';

interface ResizePanelProps {
  resizeOptions: ResizeOptions;
  setResizeOptions: (options: ResizeOptions) => void;
}

export const ResizePanel: React.FC<ResizePanelProps> = ({ resizeOptions, setResizeOptions }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Resize Settings</h3>
      <div className="flex gap-2 mb-4">
        <button 
          onClick={() => setResizeOptions({ ...resizeOptions, type: 'dimensions' })}
          className={`px-4 py-2 rounded-lg ${resizeOptions.type === 'dimensions' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
        >
          By Dimensions
        </button>
        <button 
          onClick={() => setResizeOptions({ ...resizeOptions, type: 'percentage' })}
          className={`px-4 py-2 rounded-lg ${resizeOptions.type === 'percentage' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
        >
          As Percentage
        </button>
      </div>

      {resizeOptions.type === 'dimensions' ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
            <input
              type="number"
              value={resizeOptions.width}
              onChange={(e) => setResizeOptions({
                ...resizeOptions,
                width: Number(e.target.value)
              })}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
            <input
              type="number"
              value={resizeOptions.height}
              onChange={(e) => setResizeOptions({
                ...resizeOptions,
                height: Number(e.target.value)
              })}
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Scale Percentage</label>
          <input
            type="number"
            value={resizeOptions.percentage}
            onChange={(e) => setResizeOptions({
              ...resizeOptions,
              percentage: Number(e.target.value)
            })}
            min="1"
            max="200"
            className="w-full p-2 border rounded-lg"
          />
        </div>
      )}
    </div>
  );
};