import { GoogleGenAI } from "@google/genai";
import { GenerationResult, VideoGenerationParams } from "../types";

// Helper to wait
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const generateVideo = async (params: VideoGenerationParams): Promise<GenerationResult> => {
  // Always create a new instance to ensure the latest API key is used
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  let operation;

  const config = {
    numberOfVideos: 1,
    resolution: '720p',
    aspectRatio: params.aspectRatio,
  };

  try {
    if (params.imageBase64 && params.imageMimeType) {
      // Image + Text generation
      operation = await ai.models.generateVideos({
        model: 'veo-3.1-generate-preview',
        prompt: params.prompt,
        image: {
          imageBytes: params.imageBase64,
          mimeType: params.imageMimeType,
        },
        config: config,
      });
    } else {
      // Text only generation
      operation = await ai.models.generateVideos({
        model: 'veo-3.1-generate-preview',
        prompt: params.prompt,
        config: config,
      });
    }

    // Polling loop
    while (!operation.done) {
      await wait(5000); // Check every 5 seconds
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (!videoUri) {
      throw new Error("No video URI returned from operation");
    }

    return { videoUri };
  } catch (error: any) {
    console.error("Video generation failed:", error);
    throw error;
  }
};

export const fetchVideoBlob = async (uri: string): Promise<string> => {
  // We need to fetch the video content using the API key
  const response = await fetch(`${uri}&key=${process.env.API_KEY}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch video content: ${response.statusText}`);
  }
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};