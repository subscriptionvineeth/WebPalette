import React, { useState } from 'react';
import { Video, Download, AlertCircle } from 'lucide-react';

interface VideoFormat {
  id: string;
  label: string;
  quality: string;
  format: string;
}

const VIDEO_FORMATS: VideoFormat[] = [
  { id: 'mp4-1080', label: 'MP4 - 1080p', quality: '1080p', format: 'mp4' },
  { id: 'mp4-720', label: 'MP4 - 720p', quality: '720p', format: 'mp4' },
  { id: 'mp4-480', label: 'MP4 - 480p', quality: '480p', format: 'mp4' },
  { id: 'mp4-360', label: 'MP4 - 360p', quality: '360p', format: 'mp4' },
  { id: 'webm-1080', label: 'WebM - 1080p', quality: '1080p', format: 'webm' },
  { id: 'webm-720', label: 'WebM - 720p', quality: '720p', format: 'webm' },
  { id: 'mp3-high', label: 'MP3 - 320kbps', quality: '320kbps', format: 'mp3' },
  { id: 'mp3-medium', label: 'MP3 - 192kbps', quality: '192kbps', format: 'mp3' },
];

const VideoDownloader: React.FC = () => {
  const [url, setUrl] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('mp4-720');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [videoInfo, setVideoInfo] = useState<{
    title?: string;
    duration?: string;
    thumbnail?: string;
  } | null>(null);

  const isValidUrl = (urlString: string) => {
    try {
      const url = new URL(urlString);
      return url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be');
    } catch {
      return false;
    }
  };

  const fetchVideoInfo = async () => {
    if (!isValidUrl(url)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Mock video info fetch
      await new Promise(resolve => setTimeout(resolve, 1000));
      setVideoInfo({
        title: 'Sample Video Title',
        duration: '10:30',
        thumbnail: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=400'
      });
    } catch (err) {
      setError('Failed to fetch video information');
    }
    setLoading(false);
  };

  const downloadVideo = async () => {
    setLoading(true);
    setProgress(0);
    setError(null);

    try {
      // Mock download progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setProgress(i);
      }
      setError('Video downloading is not implemented in this demo version.');
    } catch (err) {
      setError('Failed to download video. Please try again.');
    }

    setLoading(false);
    setProgress(0);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="video-url" className="block text-sm font-medium text-gray-700 mb-1">
            YouTube Video URL
          </label>
          <div className="flex gap-2">
            <input
              id="video-url"
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
                setVideoInfo(null);
              }}
              placeholder="https://youtube.com/watch?v=..."
              className="flex-1 p-3 border rounded-lg"
            />
            <button
              onClick={fetchVideoInfo}
              disabled={loading || !url}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 whitespace-nowrap"
            >
              Check Video
            </button>
          </div>
          {error && (
            <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {videoInfo && (
          <div className="p-4 bg-gray-50 rounded-lg space-y-4">
            <div className="flex gap-4">
              {videoInfo.thumbnail && (
                <img
                  src={videoInfo.thumbnail}
                  alt="Video thumbnail"
                  className="w-40 h-24 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <h3 className="font-medium">{videoInfo.title}</h3>
                <p className="text-sm text-gray-600">Duration: {videoInfo.duration}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format & Quality
                </label>
                <select
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full p-3 border rounded-lg"
                >
                  {VIDEO_FORMATS.map(format => (
                    <option key={format.id} value={format.id}>
                      {format.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={downloadVideo}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                <Download className="w-5 h-5" />
                {loading ? 'Processing...' : 'Download'}
              </button>

              {progress > 0 && progress < 100 && (
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-center text-gray-600">
                    {progress}% complete
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoDownloader;