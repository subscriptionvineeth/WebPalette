import React from 'react';

interface ResizeImageProps {
  resizeOptions: {
    width: number;
    height: number;
    maintainAspectRatio: boolean;
  };
  quality: number;
  onQualityChange: (quality: number) => void;
  onResizeOptionsChange: (options: any) => void;
  onResize: () => void;
  imageRef: React.RefObject<HTMLImageElement>;
}

const ResizeImage: React.FC<ResizeImageProps> = ({
  resizeOptions,
  quality,
  onQualityChange,
  onResizeOptionsChange,
  onResize,
  imageRef
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Resize Settings</h3>
      <div className="flex items-center gap-2 mb-2">
        <input
          type="checkbox"
          id="maintainAspectRatio"
          checked={resizeOptions.maintainAspectRatio}
          onChange={(e) => onResizeOptionsChange({
            ...resizeOptions,
            maintainAspectRatio: e.target.checked
          })}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="maintainAspectRatio" className="text-sm text-gray-600">
          Maintain aspect ratio
        </label>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Width (px)</label>
          <input
            type="number"
            value={resizeOptions.width}
            onChange={(e) => {
              const newWidth = Number(e.target.value);
              if (resizeOptions.maintainAspectRatio && imageRef.current) {
                const aspectRatio = imageRef.current.naturalWidth / imageRef.current.naturalHeight;
                onResizeOptionsChange({
                  ...resizeOptions,
                  width: newWidth,
                  height: Math.round(newWidth / aspectRatio)
                });
              } else {
                onResizeOptionsChange({
                  ...resizeOptions,
                  width: newWidth
                });
              }
            }}
            min="1"
            className="w-full p-2 border rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Height (px)</label>
          <input
            type="number"
            value={resizeOptions.height}
            onChange={(e) => {
              const newHeight = Number(e.target.value);
              if (resizeOptions.maintainAspectRatio && imageRef.current) {
                const aspectRatio = imageRef.current.naturalWidth / imageRef.current.naturalHeight;
                onResizeOptionsChange({
                  ...resizeOptions,
                  width: Math.round(newHeight * aspectRatio),
                  height: newHeight
                });
              } else {
                onResizeOptionsChange({
                  ...resizeOptions,
                  height: newHeight
                });
              }
            }}
            min="1"
            className="w-full p-2 border rounded-lg"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Compression Level
        </label>
        <div className="space-y-2">
          <input
            type="range"
            min="10"
            max="100"
            value={quality}
            onChange={(e) => onQualityChange(Number(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-500">
            <span>Smallest file</span>
            <span>{quality}%</span>
            <span>Best quality</span>
          </div>
        </div>
      </div>

      <button
        onClick={onResize}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Resize Image →
      </button>
    </div>
  );
};

export default ResizeImage;