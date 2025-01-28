import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { AlertCircle } from 'lucide-react';

const QRCodeTool: React.FC = () => {
  const [text, setText] = useState('');
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [error, setError] = useState<string | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextElement>) => {
    setText(e.target.value);
    setError(null);
  };

  const downloadQR = () => {
    if (!text) {
      setError('Please enter some text or URL to generate a QR code');
      return;
    }

    const canvas = document.querySelector('canvas');
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = canvas?.toDataURL() || '';
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label htmlFor="qr-text" className="block text-sm font-medium text-gray-700 mb-1">
              Text or URL
            </label>
            <textarea
              id="qr-text"
              value={text}
              onChange={handleTextChange}
              placeholder="Enter text or URL to generate QR code"
              className="w-full p-3 border rounded-lg min-h-[100px] resize-none"
            />
            {error && (
              <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Size: {size}px
            </label>
            <input
              type="range"
              min="128"
              max="512"
              step="8"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                QR Color
              </label>
              <input
                type="color"
                value={fgColor}
                onChange={(e) => setFgColor(e.target.value)}
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Background
              </label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-full h-10 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Error Correction Level
            </label>
            <select
              value={errorLevel}
              onChange={(e) => setErrorLevel(e.target.value as 'L' | 'M' | 'Q' | 'H')}
              className="w-full p-3 border rounded-lg"
            >
              <option value="L">Low (7%)</option>
              <option value="M">Medium (15%)</option>
              <option value="Q">Quartile (25%)</option>
              <option value="H">High (30%)</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 p-4 bg-gray-50 rounded-lg">
          {text ? (
            <>
              <QRCodeCanvas
                value={text}
                size={size}
                level={errorLevel}
                fgColor={fgColor}
                bgColor={bgColor}
                includeMargin
                className="bg-white p-4 rounded-lg shadow-lg"
              />
              <button
                onClick={downloadQR}
                className="w-full max-w-xs px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Download QR Code
              </button>
            </>
          ) : (
            <div className="text-center text-gray-500">
              <p>Enter text or URL to generate QR code</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodeTool;