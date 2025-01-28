import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, RefreshCw, Copy, Check, ChevronDown } from 'lucide-react';
import ColorThief from 'colorthief';

interface Color {
  hex: string;
  rgb: string;
}

const ColorTools: React.FC = () => {
  // Separate states for each column
  const [extractedColors, setExtractedColors] = useState<Color[]>([]);
  const [generatedColors, setGeneratedColors] = useState<Color[]>([]);
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [isCopied, setIsCopied] = useState<{ [key: string]: boolean }>({});
  const [inputColor, setInputColor] = useState('#845EC2');
  const [isDragging, setIsDragging] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [gradientType, setGradientType] = useState('linear');
  const [gradientAngle, setGradientAngle] = useState(90);
  const [gradientColors, setGradientColors] = useState([
    { color: '#0061FF', position: 0 },
    { color: '#60EFFF', position: 100 }
  ]);
  const [gradientCss, setGradientCss] = useState('');

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const extractColors = useCallback(async (image: HTMLImageElement) => {
    try {
      const colorThief = new ColorThief();
      const palette = colorThief.getPalette(image, 6);
      const newColors = palette.map(([r, g, b]) => ({
        hex: rgbToHex(r, g, b),
        rgb: `rgb(${r}, ${g}, ${b})`
      }));
      setExtractedColors(newColors);
    } catch (error) {
      console.error('Error extracting colors:', error);
    }
  }, []);

  const handleImageUpload = (file: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        setUploadedImage(imageDataUrl);
        
        const img = new Image();
        img.onload = () => extractColors(img);
        img.src = imageDataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === dropZoneRef.current) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  const handleCopyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    setIsCopied({ ...isCopied, [color]: true });
    setTimeout(() => {
      setIsCopied({ ...isCopied, [color]: false });
    }, 1500);
  };

  const generateColorPalette = (baseColor: string) => {
    // Convert hex to RGB
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);

    // Generate variations
    const variations = [
      { hex: baseColor, rgb: `rgb(${r}, ${g}, ${b})` },
      { hex: adjustBrightness(baseColor, 20), rgb: `rgb(${r + 20}, ${g + 20}, ${b + 20})` },
      { hex: adjustBrightness(baseColor, -20), rgb: `rgb(${r - 20}, ${g - 20}, ${b - 20})` },
      { hex: adjustSaturation(baseColor, 20), rgb: `rgb(${r}, ${g}, ${b})` },
      { hex: adjustSaturation(baseColor, -20), rgb: `rgb(${r}, ${g}, ${b})` },
      { hex: complementaryColor(baseColor), rgb: `rgb(${255-r}, ${255-g}, ${255-b})` },
    ];

    setGeneratedColors(variations);
  };

  // Helper functions for color manipulation
  const adjustBrightness = (hex: string, percent: number): string => {
    const num = parseInt(hex.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return `#${(1 << 24 | (R < 255 ? R < 0 ? 0 : R : 255) << 16 | (G < 255 ? G < 0 ? 0 : G : 255) << 8 | (B < 255 ? B < 0 ? 0 : B : 255)).toString(16).slice(1)}`;
  };

  const adjustSaturation = (hex: string, percent: number): string => {
    // Convert hex to HSL, adjust saturation, convert back to hex
    // Implementation here...
    return hex; // Placeholder
  };

  const complementaryColor = (hex: string): string => {
    const rgb = parseInt(hex.slice(1), 16);
    const complement = 0xFFFFFF ^ rgb;
    return `#${complement.toString(16).padStart(6, '0')}`;
  };

  const updateGradientCss = useCallback(() => {
    try {
      const sortedColors = [...gradientColors].sort((a, b) => a.position - b.position);
      const colorStops = sortedColors.map(gc => `${gc.color} ${gc.position}%`).join(', ');
      
      let css;
      if (gradientType === 'linear') {
        css = `linear-gradient(${gradientAngle}deg, ${colorStops})`;
      } else {
        css = `radial-gradient(circle at center, ${colorStops})`;
      }
      
      // For preview, we need the full background property
      setGradientCss(css);
    } catch (error) {
      console.error('Error updating gradient:', error);
    }
  }, [gradientColors, gradientType, gradientAngle]);

  useEffect(() => {
    updateGradientCss();
  }, [gradientColors, gradientType, gradientAngle, updateGradientCss]);

  const handleColorStopChange = (index: number, field: 'color' | 'position', value: string | number) => {
    setGradientColors(prevColors => {
      const newColors = [...prevColors];
      newColors[index] = {
        ...newColors[index],
        [field]: value
      };
      return newColors;
    });
  };

  return (
    <div className="space-y-8">
      {/* First row with two columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Extract from Image */}
        <div className="tool-section">
          <h3 className="text-lg font-semibold mb-4">Extract from Image</h3>
          <div className="space-y-4">
            <div 
              ref={dropZoneRef}
              className={`flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed rounded-lg transition-colors
                ${isDragging 
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                  : 'border-gray-300 dark:border-gray-700'
                }`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <label className="control-button cursor-pointer flex items-center gap-2">
                <Upload className="w-5 h-5" />
                <span>{isDragging ? 'Drop image here' : 'Upload Image'}</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                />
              </label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                or drag and drop an image here
              </p>
            </div>
            
            {uploadedImage && (
              <div className="w-full max-w-md mx-auto">
                <img
                  ref={imageRef}
                  src={uploadedImage}
                  alt="Uploaded"
                  className="w-full h-auto rounded-lg shadow-md"
                  crossOrigin="anonymous"
                />
              </div>
            )}

            {/* Extracted Colors Display */}
            {extractedColors.length > 0 && (
              <div className="color-palette">
                {extractedColors.map((color, index) => (
                  <div key={index} className="space-y-2">
                    <div
                      className="color-swatch"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleCopyColor(color.hex)}
                        className="copy-button flex items-center justify-center gap-1"
                      >
                        {isCopied[color.hex] ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        <span>{color.hex}</span>
                      </button>
                      <button
                        onClick={() => handleCopyColor(color.rgb)}
                        className="copy-button flex items-center justify-center gap-1"
                      >
                        {isCopied[color.rgb] ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        <span>{color.rgb}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Generate from Color */}
        <div className="tool-section">
          <h3 className="text-lg font-semibold mb-4">Generate from Color</h3>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  value={inputColor}
                  onChange={(e) => {
                    setInputColor(e.target.value);
                    generateColorPalette(e.target.value);
                  }}
                  className="w-32 px-3 py-2 border rounded-lg"
                  placeholder="#845EC2"
                />
                <div 
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border"
                  style={{ backgroundColor: inputColor }}
                />
              </div>
              <input
                type="color"
                value={inputColor}
                onChange={(e) => {
                  setInputColor(e.target.value);
                  generateColorPalette(e.target.value);
                }}
                className="w-12 h-12"
              />
              <button
                onClick={() => generateColorPalette(inputColor)}
                className="control-button flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Generate</span>
              </button>
            </div>

            {/* Generated Colors Display */}
            <div className="color-palette">
              {generatedColors.map((color, index) => (
                <div key={index} className="space-y-2">
                  <div
                    className="color-swatch"
                    style={{ backgroundColor: color.hex }}
                  />
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleCopyColor(color.hex)}
                      className="copy-button flex items-center justify-center gap-1"
                    >
                      {isCopied[color.hex] ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      <span>{color.hex}</span>
                    </button>
                    <button
                      onClick={() => handleCopyColor(color.rgb)}
                      className="copy-button flex items-center justify-center gap-1"
                    >
                      {isCopied[color.rgb] ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      <span>{color.rgb}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Full width Gradient Generator */}
      <div className="tool-section">
        <h3 className="text-lg font-semibold mb-4">CSS Gradient Generator</h3>
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-wrap gap-4">
            {/* Gradient Type */}
            <div className="flex items-center gap-4">
              <select
                value={gradientType}
                onChange={(e) => setGradientType(e.target.value)}
                className="input-field"
              >
                <option value="linear">Linear</option>
                <option value="radial">Radial</option>
              </select>

              {gradientType === 'linear' && (
                <input
                  type="number"
                  value={gradientAngle}
                  onChange={(e) => setGradientAngle(Number(e.target.value))}
                  className="input-field w-24"
                  min="0"
                  max="360"
                />
              )}
            </div>

            {/* Color Stops */}
            <div className="flex flex-wrap gap-2">
              {gradientColors.map((gc, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={gc.color}
                    onChange={(e) => handleColorStopChange(index, 'color', e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="number"
                    value={gc.position}
                    onChange={(e) => handleColorStopChange(index, 'position', Math.max(0, Math.min(100, Number(e.target.value))))}
                    className="input-field w-20"
                    min="0"
                    max="100"
                  />
                  {gradientColors.length > 2 && (
                    <button
                      onClick={() => {
                        setGradientColors(prevColors => prevColors.filter((_, i) => i !== index));
                      }}
                      className="text-red-500 hover:text-red-600"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              {gradientColors.length < 5 && (
                <button
                  onClick={() => {
                    setGradientColors(prevColors => {
                      const lastColor = prevColors[prevColors.length - 1];
                      const newPosition = Math.min(lastColor.position + 25, 100);
                      return [...prevColors, { 
                        color: lastColor.color, 
                        position: newPosition 
                      }];
                    });
                  }}
                  className="control-button"
                >
                  Add Color
                </button>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <div 
              className="w-full h-48 rounded-xl shadow-lg"
              style={{ 
                backgroundImage: gradientCss,
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat'
              }}
            />
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={`background-image: ${gradientCss};`}
                readOnly
                className="input-field flex-1 font-mono text-sm"
              />
              <button
                onClick={() => handleCopyColor(`background-image: ${gradientCss};`)}
                className="copy-button flex items-center gap-1"
              >
                {isCopied[gradientCss] ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                <span>Copy CSS</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorTools; 