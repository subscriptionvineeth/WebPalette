import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { ResizePanel } from './ResizePanel';
import { TransformPanel } from './TransformPanel';
import { ExportPanel } from './ExportPanel';
import { ImageStats, ResizeOptions } from './types';
import { Upload } from 'lucide-react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const ImageCompressor: React.FC = () => {
  const [inputImage, setInputImage] = useState<File | null>(null);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'resize' | 'crop' | 'transform'>('resize');
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('webp');
  // Add quality state if not already present
  const [quality, setQuality] = useState(80);
  const [rotation, setRotation] = useState(0);
  const [flip, setFlip] = useState({ horizontal: false, vertical: false });
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 0, height: 0, x: 0, y: 0 });
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

  const handleRotate = (direction: 'cw' | 'ccw') => {
    setRotation(prev => {
      const newRotation = direction === 'cw' ? prev + 90 : prev - 90;
      return newRotation % 360;
    });
  };

  const handleFlip = (direction: 'horizontal' | 'vertical') => {
    setFlip(prev => ({
      ...prev,
      [direction]: !prev[direction]
    }));
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setInputImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        if (imageRef.current && reader.result) {
          imageRef.current.src = reader.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: false
  });
  // Fix percentage resize
  const handleResize = () => {
    if (!imageRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
  
    let newWidth, newHeight;
    if (resizeOptions.type === 'percentage') {
      newWidth = Math.floor(imageRef.current.naturalWidth * (resizeOptions.percentage / 100));
      newHeight = Math.floor(imageRef.current.naturalHeight * (resizeOptions.percentage / 100));
    } else {
      newWidth = resizeOptions.width;
      newHeight = resizeOptions.height;
    }
  
    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx.drawImage(imageRef.current, 0, 0, newWidth, newHeight);
    
    const dataUrl = canvas.toDataURL(`image/${format}`, quality / 100);
    setOutputImage(dataUrl);
  };
  
  // Update ExportPanel section
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
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`px-4 py-2 rounded-lg ${
                    activeTab === tab ? 'bg-white shadow-sm' : 'hover:bg-white/50'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
  // Inside the return statement, update the ExportPanel usage
  {activeTab === 'resize' && (
    <ResizePanel
      resizeOptions={resizeOptions}
      setResizeOptions={setResizeOptions}
    />
  )}
  {activeTab === 'transform' && (
    <TransformPanel
      handleRotate={handleRotate}
      handleFlip={handleFlip}
    />
  )}
  <ExportPanel 
    format={format} 
    setFormat={setFormat}
    quality={quality}
    setQuality={setQuality}
    onUpdate={handleResize}  // Add this prop
  />
          </div>

          <div className="relative">
            <img
              ref={imageRef}
              src={inputImage ? URL.createObjectURL(inputImage) : ''}
              alt="Preview"
              className="w-full rounded-lg"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCompressor;