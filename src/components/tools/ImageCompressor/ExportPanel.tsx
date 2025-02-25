import React from 'react';

interface ExportPanelProps {
  format: string;
  setFormat: (format: 'jpeg' | 'png' | 'webp') => void;
  quality: number;
  setQuality: (quality: number) => void;
  onUpdate: () => void;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ 
  format, 
  setFormat, 
  quality, 
  setQuality,
  onUpdate 
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Export Settings</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Save Image As
        </label>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as 'jpeg' | 'png' | 'webp')}
          className="w-full p-2 border rounded-lg"
        >
          <option value="webp">WEBP</option>
          <option value="png">PNG</option>
          <option value="jpeg">JPEG</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Compression Quality
        </label>
        <input
          type="range"
          min="1"
          max="100"
          value={quality}
          onChange={(e) => setQuality(Number(e.target.value))}
          className="w-full"
        />
        <div className="text-sm text-gray-500 text-right">
          {quality}% ({quality < 30 ? 'High Compression' : quality < 70 ? 'Medium Compression' : 'Low Compression'})
        </div>
      </div>
      <button
        onClick={onUpdate}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Update Image
      </button>
    </div>
  );
};