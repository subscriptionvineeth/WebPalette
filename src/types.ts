import { LucideIcon } from 'lucide-react';

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface QRCodeData {
  text: string;
  size: number;
}

export interface ImageCompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
}

export interface URLData {
  originalUrl: string;
  shortUrl: string | null;
}

export interface VideoData {
  url: string;
  format: string;
}