export interface GeneratedVideo {
  id: string;
  prompt: string;
  videoUrl?: string;
  thumbnailUrl?: string; // Optional: preview image before video is ready or generated
  status: 'pending' | 'generating' | 'completed' | 'failed';
  timestamp: number;
  error?: string;
  aspectRatio: '16:9' | '9:16';
}

export interface VideoGenerationParams {
  prompt: string;
  imageBase64?: string;
  imageMimeType?: string;
  aspectRatio: '16:9' | '9:16';
}

export interface GenerationResult {
  videoUri: string;
}
