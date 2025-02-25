import React, { useState, useEffect } from 'react';
import { ChromePicker } from 'react-color';
import { Copy, Check } from 'lucide-react';

interface ColorCombination {
  name: string;
  colors: string[];
}

// Add color conversion utilities
const hexToHSL = (hex: string) => {
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
};

const HSLToHex = (h: number, s: number, l: number) => {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

const ColorWheel: React.FC = () => {
  const [selectedColor, setSelectedColor] = useState('#845EC2');
  const [colorCombinations, setColorCombinations] = useState<ColorCombination[]>([]);
  const [isCopied, setIsCopied] = useState<{ [key: string]: boolean }>({});
  const [showColorCode, setShowColorCode] = useState<{ [key: string]: boolean }>({});

  const handleCopyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    setIsCopied({ ...isCopied, [color]: true });
    setTimeout(() => {
      setIsCopied({ ...isCopied, [color]: false });
    }, 1500);
  };

  const generateColorCombinations = (color: string) => {
    const hsl = hexToHSL(color);
    
    const combinations = [
      {
        name: 'Complementary',
        colors: [
          color,
          HSLToHex((hsl.h + 180) % 360, hsl.s, hsl.l)
        ]
      },
      {
        name: 'Triadic',
        colors: [
          color,
          HSLToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
          HSLToHex((hsl.h + 240) % 360, hsl.s, hsl.l)
        ]
      },
      {
        name: 'Split Complementary',
        colors: [
          color,
          HSLToHex((hsl.h + 150) % 360, hsl.s, hsl.l),
          HSLToHex((hsl.h + 210) % 360, hsl.s, hsl.l)
        ]
      },
      {
        name: 'Analogous',
        colors: [
          HSLToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l),
          color,
          HSLToHex((hsl.h + 30) % 360, hsl.s, hsl.l)
        ]
      },
      {
        name: 'Monochromatic',
        colors: [
          HSLToHex(hsl.h, hsl.s, Math.max(0, hsl.l - 30)),
          color,
          HSLToHex(hsl.h, hsl.s, Math.min(100, hsl.l + 30))
        ]
      },
      {
        name: 'Square',
        colors: [
          color,
          HSLToHex((hsl.h + 90) % 360, hsl.s, hsl.l),
          HSLToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
          HSLToHex((hsl.h + 270) % 360, hsl.s, hsl.l)
        ]
      }
    ];

    setColorCombinations(combinations);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Color Wheel</h3>
      <div className="flex flex-col gap-6">
        <div className="flex gap-4">
          <ChromePicker
            color={selectedColor}
            onChange={(color) => setSelectedColor(color.hex)}
            className="!shadow-none"
          />
          <div className="flex-1 p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Selected Color</h4>
            <div
              className="w-full h-24 rounded-lg shadow-md mb-2"
              style={{ backgroundColor: selectedColor }}
            />
            <button
              onClick={() => handleCopyColor(selectedColor)}
              className="w-full py-2 px-4 bg-gray-100 rounded flex items-center justify-center gap-2 hover:bg-gray-200"
            >
              {isCopied[selectedColor] ? (
                <Check className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
              <span>{selectedColor}</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {colorCombinations.map((combo, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-2">
              <h4 className="font-medium">{combo.name}</h4>
              <div className="flex gap-2">
                {combo.colors.map((color, i) => (
                  <button
                    key={i}
                    onClick={() => handleCopyColor(color)}
                    onMouseEnter={() => setShowColorCode({ ...showColorCode, [color]: true })}
                    onMouseLeave={() => setShowColorCode({ ...showColorCode, [color]: false })}
                    className="group relative flex-1"
                  >
                    <div
                      className="h-16 rounded-lg shadow-md transition-transform group-hover:scale-105"
                      style={{ backgroundColor: color }}
                    />
                    {showColorCode[color] && (
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs bg-white shadow-lg rounded px-2 py-1">
                        {color}
                      </div>
                    )}
                    <span className="absolute top-1 right-1">
                      {isCopied[color] ? (
                        <Check className="w-4 h-4 text-white drop-shadow" />
                      ) : (
                        <Copy className="w-4 h-4 text-white drop-shadow opacity-0 group-hover:opacity-100" />
                      )}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorWheel;