// HybridAI/src/components/ModelSelector.tsx

"use client";

import { Check } from "lucide-react";
import Button from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store";
import { AI_MODELS } from "@/lib/ai-config";
import Image from "next/image";
import { useEffect, useState } from "react";

// Fallback image source (base64 encoded transparent pixel)
const FALLBACK_IMAGE =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

export function ModelSelector() {
  const { selectedModel, setSelectedModel } = useStore();
  const [error, setError] = useState<string | null>(null);
  const currentModel = AI_MODELS.find((model) => model.id === selectedModel);

  // Validate model configuration on mount
  useEffect(() => {
    const validateModels = () => {
      for (const model of AI_MODELS) {
        if (!model.icon || typeof model.icon !== "string") {
          console.error(`Invalid icon configuration for model: ${model.name}`);
          setError(`Configuration error: Missing icon for ${model.name}`);
        }
      }
    };
    validateModels();
  }, []);

  // Handle image loading errors
  const handleImageError = (modelName: string) => {
    console.error(`Failed to load image for model: ${modelName}`);
    setError(`Failed to load image for ${modelName}`);
    return FALLBACK_IMAGE;
  };

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">
        <p>Model selector error: {error}</p>
        <p className="text-sm mt-2">
          Please try refreshing the page or contact support if the problem
          persists.
        </p>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="rounded-full px-6 py-5 space-x-2"
          aria-label="Select AI model"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-600 to-purple-500 flex items-center justify-center">
            {currentModel?.icon ? (
              <Image
                src={currentModel.icon}
                alt={currentModel.name}
                width={16}
                height={16}
                className="w-4 h-4"
                onError={() => handleImageError(currentModel.name)}
              />
            ) : (
              <div className="w-4 h-4 bg-gray-200 rounded-full" />
            )}
          </div>
          <span>{currentModel?.name || "Select Model"}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="center"
        className="w-[280px] p-2"
        onCloseAutoFocus={() => setError(null)}
      >
        {AI_MODELS.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => {
              if (!model.icon) {
                setError(`Configuration error: Missing icon for ${model.name}`);
                return;
              }
              setSelectedModel(model.id);
            }}
            className="flex items-center justify-between px-4 py-3 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                {model.icon ? (
                  <Image
                    src={model.icon}
                    alt={model.name}
                    width={20}
                    height={20}
                    className="w-5 h-5"
                    onError={() => handleImageError(model.name)}
                  />
                ) : (
                  <div className="w-5 h-5 bg-gray-200 rounded-full" />
                )}
              </div>
              <div>
                <div className="font-medium">{model.name}</div>
                <div className="text-xs text-muted-foreground">
                  {model.description}
                </div>
              </div>
            </div>
            {selectedModel === model.id && (
              <Check className="h-4 w-4 text-blue-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
