import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link2, Copy, CheckCircle, AlertCircle } from 'lucide-react';

interface ShortenedURL {
  originalUrl: string;
  shortUrl: string;
  createdAt: Date;
}

const URLShortener: React.FC = () => {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<ShortenedURL[]>([]);

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem('urlHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const saveToHistory = (original: string, shortened: string) => {
    const newEntry: ShortenedURL = {
      originalUrl: original,
      shortUrl: shortened,
      createdAt: new Date()
    };
    const updatedHistory = [newEntry, ...history].slice(0, 10); // Keep last 10 items
    setHistory(updatedHistory);
    localStorage.setItem('urlHistory', JSON.stringify(updatedHistory));
  };

  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const shortenUrl = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    if (!isValidUrl(url)) {
      setError('Please enter a valid URL');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Using a mock API response since we don't have a real URL shortening service
      await new Promise(resolve => setTimeout(resolve, 1000));
      const shortened = `https://short.url/${Math.random().toString(36).substr(2, 6)}`;
      setShortUrl(shortened);
      saveToHistory(url, shortened);
    } catch (err) {
      setError('Failed to shorten URL. Please try again.');
    }
    setLoading(false);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div>
          <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-1">
            Enter Long URL
          </label>
          <div className="flex gap-2">
            <input
              id="url-input"
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              placeholder="https://example.com/very/long/url"
              className="flex-1 p-3 border rounded-lg"
            />
            <button
              onClick={shortenUrl}
              disabled={loading || !url}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 whitespace-nowrap"
            >
              {loading ? 'Shortening...' : 'Shorten URL'}
            </button>
          </div>
          {error && (
            <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {shortUrl && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <p className="font-medium">Shortened URL:</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shortUrl}
                readOnly
                className="flex-1 p-2 border rounded bg-white"
              />
              <button
                onClick={() => copyToClipboard(shortUrl)}
                className="p-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                title="Copy to clipboard"
              >
                {copied ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Recent URLs
          </h3>
          <div className="space-y-2">
            {history.map((item, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm">
                <p className="font-medium truncate">{item.shortUrl}</p>
                <p className="text-gray-500 truncate">{item.originalUrl}</p>
                <p className="text-gray-400 text-xs mt-1">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default URLShortener;