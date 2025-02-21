import React from 'react';

interface ExportPanelProps {
  format: 'jpeg' | 'png' | 'webp';
  setFormat: (format: 'jpeg' | 'png' | 'webp') => void;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({ format, setFormat }) => {
  return (
    <div className="space-y-4">
      {/* ... export panel JSX ... */}
    </div>
  );
};