import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, RotateCw, RotateCcw, FlipHorizontal, FlipVertical } from 'lucide-react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ResizeOptions {
  width: number;
  height: number;
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
  const [selectedFormats, setSelectedFormats] = useState<('webp' | 'png' | 'jpeg')[]>(['webp']);
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    x: 0,
    y: 0,
    width: 100,
    height: 100
  });
  const [isCropping, setIsCropping] = useState(false);
  const [resizeOptions, setResizeOptions] = useState<ResizeOptions>({
    width: 800,
    height: 600,
    maintainAspectRatio: true
  });

  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: false,
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
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
        reader.readAsDataURL(file);
      }
    }
  });

  const handleResize = useCallback(() => {
    if (!imageRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    let newWidth = resizeOptions.width;
    let newHeight = resizeOptions.height;
  
    // Maintain aspect ratio if enabled
    if (resizeOptions.maintainAspectRatio && imageRef.current) {
      const originalAspectRatio = imageRef.current.naturalWidth / imageRef.current.naturalHeight;
      const newAspectRatio = newWidth / newHeight;
  
      if (newAspectRatio > originalAspectRatio) {
        newWidth = Math.round(newHeight * originalAspectRatio);
      } else {
        newHeight = Math.round(newWidth / originalAspectRatio);
      }
    }
  
    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(imageRef.current, 0, 0, newWidth, newHeight);
      
    // Improved compression handling
    const compressionQuality = Math.max(0.1, quality / 100); // Ensure minimum quality of 0.1
    let dataUrl;
    
    if (format === 'png') {
      dataUrl = canvas.toDataURL('image/png');
    } else if (format === 'jpeg') {
      dataUrl = canvas.toDataURL('image/jpeg', compressionQuality);
    } else {
      // WebP with enhanced compression
      dataUrl = canvas.toDataURL('image/webp', compressionQuality);
    }
    
    setOutputImage(dataUrl);
  }, [resizeOptions, format, quality]);

  const handleTransform = useCallback((type: 'rotate' | 'flip', value: 'cw' | 'ccw' | 'horizontal' | 'vertical') => {
    if (!imageRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = imageRef.current.naturalWidth;
    canvas.height = imageRef.current.naturalHeight;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);

    if (type === 'rotate') {
      const angle = value === 'cw' ? 90 : -90;
      setRotation((prev) => (prev + angle) % 360);
      ctx.rotate((rotation * Math.PI) / 180);
    } else if (type === 'flip' && (value === 'horizontal' || value === 'vertical')) {
      setFlip(prev => ({
        ...prev,
        [value]: !prev[value]
      }));
      ctx.scale(
        flip.horizontal ? -1 : 1,
        flip.vertical ? -1 : 1
      );
    }

    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    ctx.drawImage(imageRef.current, 0, 0);
    ctx.restore();

    const compressionQuality = format === 'png' ? 1 : quality / 100;
    const dataUrl = canvas.toDataURL(`image/${format}`, compressionQuality);
    setOutputImage(dataUrl);
  }, [rotation, flip, format, quality]);

  const handleCropComplete = useCallback((cropData: Crop) => {
    if (!imageRef.current || !canvasRef.current || !cropData.width || !cropData.height) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;

    canvas.width = Math.floor(cropData.width * scaleX);
    canvas.height = Math.floor(cropData.height * scaleY);

    ctx.drawImage(
      imageRef.current,
      Math.floor(cropData.x * scaleX),
      Math.floor(cropData.y * scaleY),
      Math.floor(cropData.width * scaleX),
      Math.floor(cropData.height * scaleY),
      0,
      0,
      canvas.width,
      canvas.height
    );

    const compressionQuality = format === 'png' ? 1 : quality / 100;
    const dataUrl = canvas.toDataURL(`image/${format}`, compressionQuality);
    setOutputImage(dataUrl);
  }, [format, quality]);

  const handleDownload = useCallback(() => {
    if (!outputImage) return;
    
    selectedFormats.forEach(fmt => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const compressionQuality = fmt === 'png' ? 1 : quality / 100;
      const dataUrl = canvas.toDataURL(`image/${fmt}`, compressionQuality);
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `edited-image.${fmt}`;
      link.click();
    });
  }, [outputImage, selectedFormats, quality]);

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
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="maintainAspectRatio"
                    checked={resizeOptions.maintainAspectRatio}
                    onChange={(e) => setResizeOptions({
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
                          setResizeOptions({
                            ...resizeOptions,
                            width: newWidth,
                            height: Math.round(newWidth / aspectRatio)
                          });
                        } else {
                          setResizeOptions({
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
                          setResizeOptions({
                            ...resizeOptions,
                            width: Math.round(newHeight * aspectRatio),
                            height: newHeight
                          });
                        } else {
                          setResizeOptions({
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
                      onChange={(e) => setQuality(Number(e.target.value))}
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

            {activeTab === 'crop' && (
              <div className="space-y-4">
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
                              setSelectedFormats([...selectedFormats, fmt as any]);
                            } else {
                              setSelectedFormats(selectedFormats.filter(f => f !== fmt));
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
                    handleCropComplete(crop);
                    handleDownload();
                  }}
                  disabled={selectedFormats.length === 0}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Crop & Download
                </button>
              </div>
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
                className="w-full rounded-lg shadow-lg"
              />
            )}
            <canvas ref={canvasRef} className="hidden" />
            
            {outputImage && activeTab !== 'crop' && (
              <div className="mt-4 flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                <div className="flex-1 space-y-2">
                  <h4 className="font-medium text-sm text-gray-700">Export As:</h4>
                  <div className="flex gap-3">
                    {['webp', 'png', 'jpeg'].map((fmt) => (
                      <label key={fmt} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedFormats.includes(fmt as any)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFormats([...selectedFormats, fmt as any]);
                            } else {
                              setSelectedFormats(selectedFormats.filter(f => f !== fmt));
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
                  onClick={handleDownload}
                  disabled={selectedFormats.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Download
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCompressor;