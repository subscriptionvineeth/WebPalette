import React, { useState, useEffect } from 'react';

interface GradientColor {
  color: string;
  stop: number;
}

const GradientGenerator = () => {
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear');
  const [angle, setAngle] = useState(90);
  const [colors, setColors] = useState<GradientColor[]>([
    { color: '#0061FF', stop: 0 },
    { color: '#6D3375', stop: 100 }
  ]);

  const [gradientCSS, setGradientCSS] = useState('');

  const updateGradient = () => {
    // Ensure colors are properly distributed
    const distributedColors = colors.map((color, index) => ({
      color: color.color,
      stop: index === 0 ? 0 : index === colors.length - 1 ? 100 : 
        Math.round((index / (colors.length - 1)) * 100)
    }));

    const colorStops = distributedColors
      .map(c => `${c.color} ${c.stop}%`)
      .join(', ');
    
    const gradient = gradientType === 'linear'
      ? `linear-gradient(${angle}deg, ${colorStops})`
      : `radial-gradient(circle at center, ${colorStops})`;
    
    setGradientCSS(gradient);
  };

  const addColor = () => {
    const newIndex = colors.length;
    const newStop = Math.round((newIndex / (newIndex + 1)) * 100);
    
    // Redistribute existing colors
    const updatedColors = colors.map((color, index) => ({
      color: color.color,
      stop: Math.round((index / (newIndex + 1)) * 100)
    }));
    
    // Add new color
    setColors([...updatedColors, { color: '#00ff04', stop: 100 }]);
  };

  const removeColor = (index: number) => {
    if (colors.length > 2) {
      setColors(colors.filter((_, i) => i !== index));
    }
  };

  const updateColor = (index: number, updates: Partial<GradientColor>) => {
    setColors(colors.map((c, i) => 
      i === index ? { ...c, ...updates } : c
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <select
          value={gradientType}
          onChange={(e) => setGradientType(e.target.value as 'linear' | 'radial')}
          className="p-2 border rounded-lg"
        >
          <option value="linear">Linear</option>
          <option value="radial">Radial</option>
        </select>
        
        {gradientType === 'linear' && (
          <input
            type="number"
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className="w-20 p-2 border rounded-lg"
            min="0"
            max="360"
          />
        )}
      </div>

      <div className="h-48 rounded-lg" style={{ backgroundImage: gradientCSS }} />

      <div className="space-y-4">
        {colors.map((color, index) => (
          <div key={index} className="flex items-center gap-4">
            <input
              type="color"
              value={color.color}
              onChange={(e) => updateColor(index, { color: e.target.value })}
              className="w-12 h-12 rounded cursor-pointer"
            />
            <input
              type="number"
              value={color.stop}
              onChange={(e) => updateColor(index, { stop: Number(e.target.value) })}
              className="w-20 p-2 border rounded-lg"
              min="0"
              max="100"
            />
            {colors.length > 2 && (
              <button
                onClick={() => removeColor(index)}
                className="text-red-500"
              >
                ×
              </button>
            )}
          </div>
        ))}
        
        <button
          onClick={addColor}
          className="text-blue-600 hover:text-blue-700"
        >
          Add Color
        </button>
      </div>

      <div className="p-4 bg-gray-50 rounded-lg">
        <pre className="text-sm">
          background-image: {gradientCSS};
        </pre>
      </div>
    </div>
  );
};

export default GradientGenerator;