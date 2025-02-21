import { useState, useRef } from 'react';
import ColorThief from 'colorthief';
import { Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface Color {
  rgb: [number, number, number];
  hex: string;
}

const ColorExtractor = () => {
  const [colors, setColors] = useState<Color[]>([]);
  const [dominantColor, setDominantColor] = useState<Color | null>(null);
  const [error, setError] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const rgbToHex = (r: number, g: number, b: number) => 
    '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');

  const extractColors = () => {
    if (!imageRef.current) return;

    try {
      const colorThief = new ColorThief();
      const dominant = colorThief.getColor(imageRef.current);
      const palette = colorThief.getPalette(imageRef.current, 8);

      setDominantColor({
        rgb: dominant,
        hex: rgbToHex(...dominant)
      });

      setColors(palette.map(rgb => ({
        rgb,
        hex: rgbToHex(...rgb)
      })));

      setError(null);
    } catch (err) {
      setError('Failed to extract colors. Please try a different image.');
    }
  };

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (!imageRef.current || !e.target?.result) return;
      imageRef.current.src = e.target.result as string;
      imageRef.current.onload = extractColors;
    };
    reader.readAsDataURL(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    multiple: false
  });

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

      <img ref={imageRef} className="hidden" crossOrigin="anonymous" alt="" />

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {dominantColor && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Dominant Color</h3>
            <div className="flex items-center gap-2">
              <div 
                className="w-12 h-12 rounded-lg shadow-sm" 
                style={{ backgroundColor: dominantColor.hex }}
              />
              <div>
                <p className="font-mono">{dominantColor.hex}</p>
                <p className="text-sm text-gray-500">
                  rgb({dominantColor.rgb.join(', ')})
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Color Palette</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {colors.map((color, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div 
                    className="w-12 h-12 rounded-lg shadow-sm" 
                    style={{ backgroundColor: color.hex }}
                  />
                  <div>
                    <p className="font-mono">{color.hex}</p>
                    <p className="text-sm text-gray-500">
                      rgb({color.rgb.join(', ')})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorExtractor;