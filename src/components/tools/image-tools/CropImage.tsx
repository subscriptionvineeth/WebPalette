import React from 'react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface CropImageProps {
  crop: Crop;
  onCropChange: (crop: Crop) => void;
  onCropComplete: (crop: Crop) => void;
  selectedFormats: ('webp' | 'png' | 'jpeg')[];
  onFormatsChange: (formats: ('webp' | 'png' | 'jpeg')[]) => void;
  onDownload: () => void;
  imageRef: React.RefObject<HTMLImageElement>;
  inputImage: string;
}

const CropImage: React.FC<CropImageProps> = ({
  crop,
  onCropChange,
  onCropComplete,
  selectedFormats,
  onFormatsChange,
  onDownload,
  imageRef,
  inputImage
}) => {
  return (
    <div className="space-y-4">
      <div className="relative">
        <ReactCrop
          crop={crop}
          onChange={onCropChange}
          className="w-full rounded-lg"
        >
          <img
            ref={imageRef}
            src={inputImage}
            alt="Preview"
            className="w-full rounded-lg"
          />
        </ReactCrop>
      </div>

      <div className="space-y-2">
        <h4 className="font-medium text-sm text-gray-700">Export Format:</h4>
        <div className="flex gap-3">
          {['webp', 'png', 'jpeg'].map((fmt) => (
            <label key={fmt} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedFormats.includes(fmt as any)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onFormatsChange([...selectedFormats, fmt as any]);
                  } else {
                    onFormatsChange(selectedFormats.filter(f => f !== fmt));
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600 uppercase">{fmt}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={() => {
          onCropComplete(crop);
          onDownload();
        }}
        disabled={selectedFormats.length === 0}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Crop & Download
      </button>
    </div>
  );
};

export default CropImage;