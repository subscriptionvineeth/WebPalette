export interface ImageStats {
  original: number;
  compressed: number;
  width: number;
  height: number;
}

export interface ResizeOptions {
  type: 'dimensions' | 'percentage';
  width: number;
  height: number;
  percentage: number;
  maintainAspectRatio: boolean;
}