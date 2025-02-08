// HybridAI/lib/ai-config.ts

export interface AIModelConfig {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const AI_MODELS: AIModelConfig[] = [
  {
    id: "openai",
    name: "OpenAI",
    icon: "/missing_texture.png",
    description: "GPT-4 Turbo with advanced capabilities",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    icon: "/missing_texture.png",
    description: "Specialized in code and technical tasks",
  },
  {
    id: "claude",
    name: "Claude 3.5",
    icon: "/missing_texture.png",
    description: "Advanced reasoning and analysis",
  },
  {
    id: "gemini",
    name: "Gemini",
    icon: "/missing_texture.png",
    description: "Google's most capable AI model",
  },
];
