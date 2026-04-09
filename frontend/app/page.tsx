"use client";

import { useState, useCallback, useMemo } from "react";

interface GenerateRequestPayload {
  prompt: string;
  mode: "short" | "long";
}

interface GenerateResponse {
  status: "completed" | "processing" | "error";
  video?: string;
  error?: string;
}

type VideoMode = "short" | "long";

interface ErrorState {
  message: string;
  code?: string;
}

export default function Page(): JSX.Element {
  const [prompt, setPrompt] = useState<string>("");
  const [mode, setMode] = useState<VideoMode>("short");
  const [loading, setLoading] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<ErrorState | null>(null);
  const [charCount, setCharCount] = useState<number>(0);

  const MAX_CHARS = 500;

  const apiEndpoint = useMemo(() => {
    return process.env.NEXT_PUBLIC_API_URL || "https://ubiquitous-disco-96w4jwv4v4v2755g-8000.app.github.dev";
  }, []);

  const handleGenerate = useCallback(async (): Promise<void> => {
    try {
      if (!prompt.trim()) {
        setError({ message: "Please enter a prompt", code: "EMPTY_PROMPT" });
        return;
      }

      if (prompt.trim().length > MAX_CHARS) {
        setError({
          message: `Prompt must be under ${MAX_CHARS} characters`,
          code: "PROMPT_TOO_LONG",
        });
        return;
      }

      setError(null);
      setVideoUrl(null);
      setLoading(true);

      const payload: GenerateRequestPayload = {
        prompt: prompt.trim(),
        mode,
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const response = await fetch(`${apiEndpoint}/generate`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData: GenerateResponse = await response.json().catch(() => ({
          status: "error" as const,
          error: `HTTP ${response.status}`,
        }));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data: GenerateResponse = await response.json();

      if (data.status === "completed" && data.video) {
        const fullVideoUrl = data.video.startsWith("http")
          ? data.video
          : `${apiEndpoint}${data.video}`;
        setVideoUrl(fullVideoUrl);
      } else if (data.status === "error") {
        throw new Error(data.error || "Video generation failed");
      } else {
        throw new Error("Invalid response format from API");
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError({
          message: "Request timed out. Please try again.",
          code: "TIMEOUT_ERROR",
        });
      } else if (err instanceof TypeError) {
        setError({
          message: "Network error - please check your connection",
          code: "NETWORK_ERROR",
        });
      } else if (err instanceof SyntaxError) {
        setError({
          message: "Invalid server response",
          code: "PARSE_ERROR",
        });
      } else {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError({ message: errorMessage, code: "GENERATION_ERROR" });
      }
      console.error("[MeoGli] Error generating video:", err);
    } finally {
      setLoading(false);
    }
  }, [prompt, mode, apiEndpoint]);

  const handleModeChange = useCallback((newMode: VideoMode): void => {
    setMode(newMode);
  }, []);

  const handlePromptChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
      const value = e.target.value;
      setPrompt(value);
      setCharCount(value.length);
      if (
        error?.code === "EMPTY_PROMPT" ||
        error?.code === "PROMPT_TOO_LONG"
      ) {
        setError(null);
      }
    },
    [error]
  );

  const handleReset = useCallback((): void => {
    setPrompt("");
    setVideoUrl(null);
    setError(null);
    setCharCount(0);
    setMode("short");
  }, []);

  const handleDownload = useCallback((): void => {
    if (videoUrl) {
      window.open(videoUrl, "_blank");
    }
  }, [videoUrl]);

  const modeButtonClass = useCallback(
    (isActive: boolean): string =>
      `flex-1 py-2.5 rounded-md font-medium transition-colors ${
        isActive
          ? "bg-[#2563eb] text-white border border-transparent"
          : "bg-transparent text-gray-400 border border-white/10 hover:text-white hover:border-white/20"
      }`,
    []
  );

  const isGenerateDisabled = loading || !prompt.trim() || charCount > MAX_CHARS;

  return (
    <div className="min-h-screen bg-[#0b0f14] flex items-center justify-center p-4 font-sans text-white">
      <div className="w-full max-w-[500px]">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-6 sm:p-8 flex flex-col gap-6 shadow-xl">

          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-wide">MeoGli</h1>
            {(videoUrl || prompt) && (
              <button
                onClick={handleReset}
                className="text-xs text-gray-400 hover:text-white border border-white/10 rounded-md px-3 py-1 transition-colors"
              >
                Reset
              </button>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div
              className="bg-red-500/10 border border-red-500/50 rounded-md p-3 text-sm text-red-200"
              role="alert"
              aria-live="polite"
            >
              {error.message}
            </div>
          )}

          {/* Prompt Input */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label
                htmlFor="prompt"
                className="text-sm text-gray-400 font-medium"
              >
                Video Prompt
              </label>
              <span
                className={`text-xs ${
                  charCount > MAX_CHARS ? "text-red-400" : "text-gray-500"
                }`}
              >
                {charCount}/{MAX_CHARS}
              </span>
            </div>
            <textarea
              id="prompt"
              value={prompt}
              onChange={handlePromptChange}
              placeholder="Enter your video idea..."
              suppressHydrationWarning
              disabled={loading}
              maxLength={MAX_CHARS + 50}
              className="w-full min-h-[100px] bg-black/20 border border-white/10 rounded-md p-4 text-white placeholder:text-gray-400 focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed resize-none"
              aria-label="Video prompt input"
            />
          </div>

          {/* Mode Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400 font-medium">Format</label>
            <div className="flex gap-4">
              <button
                onClick={() => handleModeChange("short")}
                className={modeButtonClass(mode === "short")}
                aria-pressed={mode === "short"}
                disabled={loading}
              >
                Short (9:16)
              </button>
              <button
                onClick={() => handleModeChange("long")}
                className={modeButtonClass(mode === "long")}
                aria-pressed={mode === "long"}
                disabled={loading}
              >
                Long (16:9)
              </button>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerateDisabled}
            className="w-full bg-[#2563eb] text-white font-medium py-3 rounded-md hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
            aria-busy={loading}
            aria-label={loading ? "Generating video" : "Generate video"}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent" />
                Generating...
              </span>
            ) : (
              "Generate Video"
            )}
          </button>

          {/* Video Output */}
          {videoUrl && (
            <div
              className="mt-2 flex flex-col gap-2"
              role="status"
              aria-live="polite"
            >
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400 font-medium">
                  Output:
                </span>
                <button
                  onClick={handleDownload}
                  className="text-xs text-blue-400 hover:text-blue-300 border border-blue-400/30 rounded-md px-3 py-1 transition-colors"
                >
                  Download Video
                </button>
              </div>
              <video
                controls
                className="w-full rounded-md border border-white/10 bg-black/40 shadow-lg"
                src={videoUrl}
                aria-label="Generated video output"
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
