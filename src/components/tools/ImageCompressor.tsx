import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, RotateCw, RotateCcw, FlipHorizontal, FlipVertical } from 'lucide-react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ResizeOptions {
  type: 'dimensions' | 'percentage';
  width: number;
  height: number;
  percentage: number;
  maintainAspectRatio: boolean;
}

const ImageCompressor: React.FC = () => {
  const [inputImage, setInputImage] = useState<string | null>(null);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'resize' | 'crop' | 'transform'>('resize');
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('webp');
  const [quality, setQuality] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [flip, setFlip] = useState({ horizontal: false, vertical: false });
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    x: 0,
    y: 0,
    width: 100,
    height: 100
  });
  const [isCropping, setIsCropping] = useState(false);
  const [resizeOptions, setResizeOptions] = useState<ResizeOptions>({
    type: 'dimensions',
    width: 800,
    height: 600,
    percentage: 100,
    maintainAspectRatio: true
  });

  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  // Update the handleResize function
  const handleResize = useCallback(() => {
    if (!imageRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let newWidth, newHeight;
    if (resizeOptions.type === 'percentage') {
      const scale = resizeOptions.percentage / 100;
      newWidth = Math.floor(imageRef.current.naturalWidth * scale);
      newHeight = Math.floor(imageRef.current.naturalHeight * scale);
    } else {
      newWidth = resizeOptions.width;
      newHeight = resizeOptions.height;
    }

    // Create a temporary canvas for better compression
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = newWidth;
    tempCanvas.height = newHeight;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    // Apply high-quality scaling
    tempCtx.imageSmoothingEnabled = true;
    tempCtx.imageSmoothingQuality = 'high';
    tempCtx.drawImage(imageRef.current, 0, 0, newWidth, newHeight);

    // Apply compression
    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx.drawImage(tempCanvas, 0, 0);
    
    // Use lower quality for JPEG/WEBP to achieve better compression
    const compressionQuality = format === 'png' ? 1 : Math.max(0.01, quality / 100);
    const dataUrl = canvas.toDataURL(`image/${format}`, compressionQuality);
    setOutputImage(dataUrl);
  }, [resizeOptions, format, quality]);

  // Update the handleTransform and handleCropComplete functions similarly
  const handleTransform = useCallback((type: 'rotate' | 'flip', value: 'cw' | 'ccw' | 'horizontal' | 'vertical') => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !imageRef.current) return;

    let newRotation = rotation;
    let newFlip = { ...flip };

    if (type === 'rotate') {
      newRotation = value === 'cw' ? rotation + 90 : rotation - 90;
      setRotation(newRotation % 360);
    } else {
      newFlip[value as 'horizontal' | 'vertical'] = !flip[value as 'horizontal' | 'vertical'];
      setFlip(newFlip);
    }

    canvas.width = imageRef.current.naturalWidth;
    canvas.height = imageRef.current.naturalHeight;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((newRotation * Math.PI) / 180);
    ctx.scale(newFlip.horizontal ? -1 : 1, newFlip.vertical ? -1 : 1);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    ctx.drawImage(imageRef.current, 0, 0);
    ctx.restore();

    setOutputImage(canvas.toDataURL(`image/${format}`, Math.max(0.1, quality / 100)));
  }, [rotation, flip, format, quality]);

  const handleCropComplete = useCallback((cropData: Crop) => {
    if (!cropData.width || !cropData.height) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !imageRef.current) return;

    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;

    const pixelCrop = {
      x: cropData.x * scaleX,
      y: cropData.y * scaleY,
      width: cropData.width * scaleX,
      height: cropData.height * scaleY,
    };

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      imageRef.current,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    setOutputImage(canvas.toDataURL(`image/${format}`, Math.max(0.1, quality / 100)));
  }, [format, quality]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      setError(null);
      const file = acceptedFiles[0];
      if (file) {
        if (file.size > 25 * 1024 * 1024) {
          setError('File size should be less than 25MB');
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          if (reader.result) {
            const img = new Image();
            img.onload = () => {
              setImageDimensions({ width: img.width, height: img.height });
              setResizeOptions(prev => ({
                ...prev,
                width: img.width,
                height: img.height
              }));
            };
            img.src = reader.result as string;
            setInputImage(reader.result as string);
          }
        };
        reader.onerror = () => {
          setError('Error reading file');
        };
        reader.readAsDataURL(file);
      }
    }
  });

  return (
    <div className="space-y-6">
      {!inputImage ? (
        <div {...getRootProps()} className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        `}>
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          {isDragActive ? (
            <p className="text-blue-500">Drop the image here</p>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-600">Drag & drop an image here, or click to select</p>
              <p className="text-sm text-gray-500">Supports PNG, JPG, JPEG, WebP</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="flex gap-2 p-2 bg-gray-100 rounded-lg">
              {['resize', 'crop', 'transform'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab as typeof activeTab);
                    setOutputImage(null);
                  }}
                  className={`px-4 py-2 rounded-lg ${
                    activeTab === tab ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {activeTab === 'resize' && (
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
                <button
                  onClick={handleResize}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Resize Image →
                </button>
              </div>
            )}

            {activeTab === 'transform' && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTransform('rotate', 'ccw')}
                    className="p-2 border rounded hover:bg-gray-50"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleTransform('rotate', 'cw')}
                    className="p-2 border rounded hover:bg-gray-50"
                  >
                    <RotateCw className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleTransform('flip', 'horizontal')}
                    className="p-2 border rounded hover:bg-gray-50"
                  >
                    <FlipHorizontal className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleTransform('flip', 'vertical')}
                    className="p-2 border rounded hover:bg-gray-50"
                  >
                    <FlipVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

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
            </div>

            {activeTab === 'crop' && (
              <button
                onClick={() => handleCropComplete(crop)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Apply Crop →
              </button>
            )}
          </div>

          <div className="relative">
            {activeTab === 'crop' ? (
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                className="w-full rounded-lg"
              >
                <img
                  ref={imageRef}
                  src={inputImage}
                  alt="Preview"
                  className="w-full rounded-lg"
                />
              </ReactCrop>
            ) : (
              <img
                ref={imageRef}
                src={outputImage || inputImage}
                alt="Preview"
                className="w-full rounded-lg"
              />
            )}
            <canvas ref={canvasRef} className="hidden" />
            
            {outputImage && (
              <div className="mt-4">
                <a
                  href={outputImage}
                  download={`edited-image.${format}`}
                  className="block w-full text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Download Image
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCompressor;