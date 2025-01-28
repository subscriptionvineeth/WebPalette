import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import { Upload, AlertCircle } from 'lucide-react';

interface ImageStats {
  original: number;
  compressed: number;
  width: number;
  height: number;
}

const ImageCompressor: React.FC = () => {
  const [inputImage, setInputImage] = useState<File | null>(null);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<ImageStats | null>(null);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      setInputImage(file);
      setOutputImage(null);
      setStats(null);
      setError(null);
    } else {
      setError('Please upload a valid image file');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: false
  });

  const compressImage = async () => {
    if (!inputImage) return;

    setLoading(true);
    setError(null);
    
    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: `image/${format}`,
        initialQuality: quality / 100,
      };

      const compressedFile = await imageCompression(inputImage, options);
      const compressedUrl = await imageCompression.getDataUrlFromFile(compressedFile);
      
      // Get image dimensions
      const img = new Image();
      img.src = compressedUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      setOutputImage(compressedUrl);
      setStats({
        original: inputImage.size / 1024 / 1024,
        compressed: compressedFile.size / 1024 / 1024,
        width: img.width,
        height: img.height
      });
    } catch (error) {
      setError('Failed to compress image. Please try again.');
      console.error('Error compressing image:', error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
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

      {error && (
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {inputImage && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quality: {quality}%
              </label>
              <input
                type="range"
                min="1"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Output Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as 'jpeg' | 'png' | 'webp')}
                className="w-full p-3 border rounded-lg"
              >
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </select>
            </div>
          </div>

          <button
            onClick={compressImage}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Compressing...' : 'Compress Image'}
          </button>
        </div>
      )}

      {stats && (
        <div className="grid gap-4 md:grid-cols-2 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-2">
            <p className="font-medium">Image Statistics:</p>
            <div className="text-sm space-y-1">
              <p>Original size: {stats.original.toFixed(2)} MB</p>
              <p>Compressed size: {stats.compressed.toFixed(2)} MB</p>
              <p>Reduction: {((1 - stats.compressed / stats.original) * 100).toFixed(1)}%</p>
              <p>Dimensions: {stats.width}x{stats.height}px</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="font-medium">Output Settings:</p>
            <div className="text-sm space-y-1">
              <p>Format: {format.toUpperCase()}</p>
              <p>Quality: {quality}%</p>
              <p>Max dimension: 1920px</p>
            </div>
          </div>
        </div>
      )}

      {outputImage && (
        <div className="space-y-4">
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={outputImage}
              alt="Compressed"
              className="w-full h-full object-contain"
            />
          </div>
          <a
            href={outputImage}
            download={`compressed-image.${format}`}
            className="block w-full px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
          >
            Download Compressed Image
          </a>
        </div>
      )}
    </div>
  );
};

export default ImageCompressor;