import React, { useState } from 'react';
import { 
  QrCode, 
  ImageIcon, 
  Link2, 
  Palette, 
  Type, 
  Image, 
  Smartphone,
  Sun,
  Moon
} from 'lucide-react';
import QRCodeTool from './components/tools/QRCodeTool';
import ImageCompressor from './components/tools/ImageCompressor';
import URLShortener from './components/tools/URLShortener';
import ColorTools from './components/ColorTools';
import FontPairing from './components/FontPairing';
import FaviconGenerator from './components/FaviconGenerator';
import ResponsiveTester from './components/ResponsiveTester';
import logo from './assets/logo.png';

const tools = [
  {
    id: 'qr',
    name: 'QR Code',
    shortName: 'QR',
    description: 'Create custom QR codes instantly',
    icon: QrCode
  },
  {
    id: 'image',
    name: 'Image Tools',
    shortName: 'Image',
    description: 'Optimize images without quality loss',
    icon: ImageIcon
  },
  {
    id: 'url',
    name: 'URL Shortener',
    shortName: 'URL',
    description: 'Create memorable short links',
    icon: Link2
  },
  {
    id: 'colors',
    name: 'Color Tools',
    shortName: 'Colors',
    description: 'Generate beautiful color palettes',
    icon: Palette
  },
  {
    id: 'favicon',
    name: 'Favicon Gen',
    shortName: 'Favicon',
    description: 'Create professional favicons',
    icon: Image
  },
  {
    id: 'responsive',
    name: 'Responsive',
    shortName: 'Test',
    description: 'Test across device sizes',
    icon: Smartphone
  }
];

function App() {
  const [activeTool, setActiveTool] = useState('qr');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleToolChange = (toolId: string) => {
    setActiveTool(toolId);
    setIsMenuOpen(false);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const renderTool = () => {
    switch (activeTool) {
      case 'qr':
        return <QRCodeTool />;
      case 'image':
        return <ImageCompressor />;
      case 'url':
        return <URLShortener />;
      case 'colors':
        return <ColorTools />;
      case 'fonts':
        return <FontPairing />;
      case 'favicon':
        return <FaviconGenerator />;
      case 'responsive':
        return <ResponsiveTester />;
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 
      ${isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white' 
        : 'bg-gradient-to-br from-slate-50 via-white to-indigo-50'
      }`}
    >
      <nav className={`${isDarkMode 
          ? 'bg-gray-800/80 border-gray-700' 
          : 'bg-white/80 border-gray-100'
        } backdrop-blur-sm border-b fixed w-full top-0 z-50 transition-colors duration-200`}>
        <div className="max-w-[1440px] mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <div className="logo flex items-center">
                <img 
                  src={logo} 
                  alt="Logo" 
                  className="w-[200px] h-[44px] object-contain"
                />
              </div>
            </div>

            <div className="hidden xl:flex flex-1 justify-center">
              <div className="flex items-center gap-1 px-4">
                {tools.map((tool, index) => {
                  const Icon = tool.icon;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleToolChange(tool.id)}
                      className={`nav-item group px-4 py-2 rounded-lg text-sm font-medium 
                        transition-all duration-200 animate-fade-in [animation-delay:${index * 100}ms]
                        ${activeTool === tool.id 
                          ? isDarkMode
                            ? 'bg-gray-700 text-indigo-400' 
                            : 'bg-indigo-50 text-primary-600 shadow-sm'
                          : isDarkMode
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-600 hover:bg-gray-50'
                        }
                        flex items-center gap-2`}
                    >
                      <Icon className={`w-4 h-4 flex-shrink-0 transition-colors
                        ${activeTool === tool.id 
                          ? isDarkMode ? 'text-indigo-400' : 'text-primary-600'
                          : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                        }`} 
                      />
                      <span>{tool.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="xl:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className={`p-2 rounded-lg transition-colors duration-200
                    ${isDarkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                >
                  <span className="sr-only">Open menu</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                  </svg>
                </button>
              </div>

              <button 
                onClick={toggleTheme}
                className={`p-2 sm:p-2.5 rounded-lg transition-colors duration-200
                  ${isDarkMode
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
              >
                {isDarkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>
          </div>

          <div className={`xl:hidden transition-all duration-300 ease-in-out
            ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="py-2 space-y-1">
              {tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      handleToolChange(tool.id);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full px-4 py-3 flex items-center gap-3 rounded-lg transition-colors duration-200
                      ${activeTool === tool.id 
                        ? isDarkMode
                          ? 'bg-gray-700 text-indigo-400' 
                          : 'bg-indigo-50 text-primary-600'
                        : isDarkMode
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0
                      ${activeTool === tool.id 
                        ? isDarkMode ? 'text-indigo-400' : 'text-primary-600'
                        : isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`} 
                    />
                    <span className="font-medium">{tool.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-[1440px] mx-auto">
          <div className={`tool-content backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl border 
            transition-all duration-300 animate-fade-in
            ${isDarkMode
              ? 'bg-gray-800/95 border-gray-700'
              : 'bg-white/95 border-gray-100/50'
            }`}
          >
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              {tools.find(t => t.id === activeTool)?.icon && (
                <div className={`p-2.5 rounded-xl
                  ${isDarkMode ? 'bg-gray-700' : 'bg-indigo-50'}`}>
                  {React.createElement(tools.find(t => t.id === activeTool)?.icon!, {
                    className: isDarkMode ? "w-6 h-6 text-indigo-400" : "w-6 h-6 text-primary-600"
                  })}
                </div>
              )}
              <h2 className={`text-2xl sm:text-3xl font-semibold font-display
                ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {tools.find(t => t.id === activeTool)?.name}
              </h2>
            </div>
            <div className="animate-fade-in">
              {renderTool()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;