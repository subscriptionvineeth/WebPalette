import React, { useState } from 'react';

interface DeviceSize {
  width: number;
  height: number;
  name: string;
}

const ResponsiveTester: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLandscape, setIsLandscape] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceSize>({
    width: 375,
    height: 667,
    name: 'iPhone SE'
  });

  const devices: DeviceSize[] = [
    { width: 360, height: 640, name: 'Samsung Galaxy S5' },
    { width: 375, height: 667, name: 'iPhone SE' },
    { width: 390, height: 844, name: 'iPhone 12/13/14' },
    { width: 393, height: 851, name: 'Pixel 7' },
    { width: 412, height: 915, name: 'Samsung S20' },
    { width: 428, height: 926, name: 'iPhone 14 Pro Max' },
    { width: 360, height: 800, name: 'Samsung A51/71' },
    { width: 768, height: 1024, name: 'iPad Mini' },
    { width: 810, height: 1080, name: 'iPad Air' }
  ];

  const frameStyle = {
    width: isLandscape ? selectedDevice.height : selectedDevice.width,
    height: isLandscape ? selectedDevice.width : selectedDevice.height
  };

  return (
    <div className="tool-section responsive-tester">
      <div className="device-controls">
        <input
          type="url"
          placeholder="Enter website URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="input-field"
        />
        
        <select
          className="device-selector"
          onChange={(e) => {
            const device = devices[Number(e.target.value)];
            setSelectedDevice(device);
          }}
        >
          {devices.map((device, index) => (
            <option key={index} value={index}>
              {device.name} ({device.width}x{device.height})
            </option>
          ))}
        </select>

        <button
          className="control-button"
          onClick={() => setIsLandscape(!isLandscape)}
        >
          Rotate {isLandscape ? 'Portrait' : 'Landscape'}
        </button>
      </div>

      <div className="device-info">
        {`${frameStyle.width} x ${frameStyle.height} - ${selectedDevice.name}`}
      </div>

      {url && (
        <div className="device-frame" style={frameStyle}>
          <iframe
            src={url}
            width="100%"
            height="100%"
            title="Responsive Preview"
          />
        </div>
      )}
    </div>
  );
};

export default ResponsiveTester; 