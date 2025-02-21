
import React, { useState, useRef } from 'react';
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react';
import { AlertCircle, Upload, Download } from 'lucide-react';
import QrScanner from 'qr-scanner';

const QRCodeTool: React.FC = () => {
  const [text, setText] = useState('');
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [error, setError] = useState<string | null>(null);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setError(null);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await QrScanner.scanImage(file);
      setScannedResult(result);
      setError(null);
    } catch (err) {
      setError('Could not scan QR code from image');
    }
  };

  // Update downloadQR function
  const downloadQR = (format: 'png' | 'svg') => {
    if (!text) {
      setError('Please enter some text or URL to generate a QR code');
      return;
    }

    if (format === 'png') {
      const canvas = document.querySelector('canvas');
      const link = document.createElement('a');
      link.download = 'qrcode.png';
      link.href = canvas?.toDataURL() || '';
      link.click();
    } else {
      const svg = document.querySelector('.qr-code-svg');
      const svgData = new XMLSerializer().serializeToString(svg as Node);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = 'qrcode.svg';
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Add drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    try {
      const result = await QrScanner.scanImage(file);
      setScannedResult(result);
      setError(null);
    } catch (err) {
      setError('Could not scan QR code from image');
    }
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
        </div>

        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center gap-4 p-4 bg-gray-50 rounded-lg">
            {text ? (
              <>
                <QRCodeCanvas
                  value={text}
                  size={size}
                  level="H"
                  fgColor={fgColor}
                  bgColor={bgColor}
                  includeMargin
                  className="bg-white p-4 rounded-lg shadow-lg"
                />
                <QRCodeSVG
                  value={text}
                  size={size}
                  level="H"
                  fgColor={fgColor}
                  bgColor={bgColor}
                  includeMargin
                  className="hidden qr-code-svg"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadQR('png')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download PNG
                  </button>
                  <button
                    onClick={() => downloadQR('svg')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download SVG
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500">
                <p>Enter text or URL to generate QR code</p>
              </div>
            )}
          </div>

          {/* Update scanner section */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium mb-4">QR Code Scanner</h3>
            <div className="space-y-4">
              <div
                className={`flex items-center justify-center w-full ${
                  isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
                }`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="text-sm text-gray-500">
                      {isDragging 
                        ? 'Drop QR code image here'
                        : 'Drag & drop QR code or click to upload'
                      }
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
              {scannedResult && (
                <div className="p-4 bg-white rounded-lg border">
                  <p className="font-medium mb-2">Scanned Result:</p>
                  {scannedResult.startsWith('http://') || scannedResult.startsWith('https://') ? (
                    <a 
                      href={scannedResult}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 break-all"
                    >
                      {scannedResult}
                    </a>
                  ) : (
                    <p className="text-gray-600 break-all">{scannedResult}</p>
                  )}
                  <button
                    onClick={() => navigator.clipboard.writeText(scannedResult)}
                    className="mt-2 text-blue-600 hover:text-blue-700"
                  >
                    Copy to clipboard
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeTool;