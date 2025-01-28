import React, { useState, useRef } from 'react';

interface IconSize {
  name: string;
  size: number;
  format: 'png' | 'ico';
  type: 'favicon' | 'apple-touch';
}

const FaviconGenerator: React.FC = () => {
  const [preview, setPreview] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const iconSizes: IconSize[] = [
    { name: 'Favicon 16x16', size: 16, format: 'ico', type: 'favicon' },
    { name: 'Favicon 32x32', size: 32, format: 'ico', type: 'favicon' },
    { name: 'Favicon 64x64', size: 64, format: 'ico', type: 'favicon' },
    { name: 'Apple Touch 57x57', size: 57, format: 'png', type: 'apple-touch' },
    { name: 'Apple Touch 72x72', size: 72, format: 'png', type: 'apple-touch' },
    { name: 'Apple Touch 114x114', size: 114, format: 'png', type: 'apple-touch' },
    { name: 'Apple Touch 144x144', size: 144, format: 'png', type: 'apple-touch' }
  ];

  const generateFavicon = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (canvasRef.current) {
          iconSizes.forEach(size => {
            const canvas = canvasRef.current!;
            canvas.width = size.size;
            canvas.height = size.size;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, size.size, size.size);
          });
          setPreview(canvasRef.current.toDataURL());
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const downloadIcon = (size: IconSize) => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = size.size;
      canvas.height = size.size;
      
      const link = document.createElement('a');
      link.download = `${size.type}-${size.size}x${size.size}.${size.format}`;
      link.href = canvas.toDataURL(size.format === 'ico' ? 'image/x-icon' : 'image/png');
      link.click();
    }
  };

  return (
    <div className="tool-section favicon-container">
      <input 
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files && generateFavicon(e.target.files[0])}
        className="input-field mb-4"
      />
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {preview && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {iconSizes.map((size, index) => (
              <div key={index} className="favicon-size">
                <h4 className="text-sm font-medium mb-2">{size.name}</h4>
                <img 
                  src={preview} 
                  alt={`${size.size}x${size.size} preview`}
                  width={size.size}
                  height={size.size}
                  className="mx-auto mb-2"
                />
                <button 
                  className="control-button text-sm"
                  onClick={() => downloadIcon(size)}
                >
                  Download {size.format.toUpperCase()}
                </button>
              </div>
            ))}
          </div>
          
          <div className="browser-mockup mt-6">
            <img src={preview} alt="Browser tab preview" width={16} height={16} />
            <span className="ml-2">Browser Tab Preview</span>
          </div>
        </>
      )}
    </div>
  );
};

export default FaviconGenerator; 