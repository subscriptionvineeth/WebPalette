import React, { useState } from 'react';
import { Upload } from 'lucide-react';

interface FontPair {
  heading: string;
  body: string;
  name: string;
}

interface IdentifiedFont {
  name: string;
  confidence: number;
  provider?: string;
  url?: string;
}

const FontPairing: React.FC = () => {
  const [selectedPair, setSelectedPair] = useState<FontPair>({
    heading: "'Playfair Display', serif",
    body: "'Source Sans Pro', sans-serif",
    name: "Classic"
  });
  
  const [fontSize, setFontSize] = useState({ heading: 32, body: 16 });
  const [sampleText, setSampleText] = useState({
    heading: "Your Heading Text",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
  });
  const [identifiedFonts, setIdentifiedFonts] = useState<IdentifiedFont[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fontPairs = [
    {
      heading: "'Playfair Display', serif",
      body: "'Source Sans Pro', sans-serif",
      name: "Classic"
    },
    {
      heading: "'Montserrat', sans-serif",
      body: "'Merriweather', serif",
      name: "Modern"
    },
    // Add more font pairs
  ];

  const identifyFonts = async (file: File) => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // First, convert the image to base64
      const base64Image = await fileToBase64(file);
      
      // Prepare the API request
      const formData = new FormData();
      formData.append('image', base64Image);
      
      const response = await fetch('https://api.whatfontis.com/v2/identify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_WHATFONTIS_API_KEY}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to identify fonts');
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const fonts: IdentifiedFont[] = data.results.map((result: any) => ({
          name: result.font_name,
          confidence: result.confidence,
          provider: result.provider,
          url: result.purchase_url
        }));
        setIdentifiedFonts(fonts);
      } else {
        setError('No fonts were identified in the image');
      }
    } catch (err) {
      console.error('Error identifying fonts:', err);
      setError(err instanceof Error ? err.message : 'Failed to identify fonts');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data:image/[type];base64, prefix
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  return (
    <div className="tool-section font-pairing-container">
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4">Font Identifier</h3>
        <label className="control-button flex items-center gap-2 cursor-pointer">
          <Upload size={16} />
          Upload Image to Identify Fonts
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) => e.target.files && identifyFonts(e.target.files[0])}
          />
        </label>
        
        {isAnalyzing && (
          <div className="mt-4">
            <div className="animate-pulse flex space-x-4">
              <div className="flex-1 space-y-4 py-1">
                <div className="h-4 bg-blue-100 rounded w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-blue-100 rounded"></div>
                  <div className="h-4 bg-blue-100 rounded w-5/6"></div>
                </div>
              </div>
            </div>
            <p className="text-blue-600 mt-2">Analyzing image...</p>
          </div>
        )}
        
        {error && (
          <div className="mt-4 text-red-600 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}
        
        {identifiedFonts.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Identified Fonts:</h4>
            <div className="space-y-3">
              {identifiedFonts.map((font, index) => (
                <div 
                  key={index}
                  className="bg-gray-50 p-3 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <h5 className="font-medium">{font.name}</h5>
                    <span className="text-sm text-gray-500">
                      {Math.round(font.confidence)}% match
                    </span>
                  </div>
                  {font.provider && (
                    <p className="text-sm text-gray-600">
                      Available on {font.provider}
                    </p>
                  )}
                  {font.url && (
                    <a
                      href={font.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Get this font
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="font-controls">
        <select 
          className="input-field"
          onChange={(e) => setSelectedPair(fontPairs[Number(e.target.value)])}
        >
          {fontPairs.map((pair, index) => (
            <option key={index} value={index}>{pair.name}</option>
          ))}
        </select>
        
        <div>
          <label>Heading Size</label>
          <input 
            type="range"
            min="16"
            max="72"
            value={fontSize.heading}
            onChange={(e) => setFontSize({ ...fontSize, heading: Number(e.target.value) })}
            className="font-size-slider"
          />
        </div>
      </div>

      <div className="font-preview">
        <h1 style={{ 
          fontFamily: selectedPair.heading,
          fontSize: `${fontSize.heading}px`
        }}>
          {sampleText.heading}
        </h1>
        <p style={{ 
          fontFamily: selectedPair.body,
          fontSize: `${fontSize.body}px`
        }}>
          {sampleText.body}
        </p>
      </div>

      <div className="color-code mt-4">
        <pre>
          {`font-family: ${selectedPair.heading}; // Heading
font-family: ${selectedPair.body}; // Body text`}
        </pre>
      </div>
    </div>
  );
};

export default FontPairing; 