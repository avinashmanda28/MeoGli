"use client";

import { useState, useEffect } from "react";
import { API_URL } from "@/lib/api";
import PromptInput from "@/components/PromptInput";
import ProgressSection from "@/components/ProgressSection";
import VideoPreview from "@/components/VideoPreview";
import IdeaFlow from "@/components/IdeaFlow";

interface ProgressState {
  progress: number;
  current_step: string;
  steps: Array<{ name: string; status: string }>;
}

const DEFAULT_PROGRESS: ProgressState = {
  progress: 0,
  current_step: "Ready",
  steps: [],
};

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [progressData, setProgressData] = useState<ProgressState>(DEFAULT_PROGRESS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [showIdeaFlow, setShowIdeaFlow] = useState(false);
  const [error, setError] = useState("");

  // Poll progress while generating
  useEffect(() => {
    if (!isGenerating) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/progress`);
        if (!res.ok) return;
        const data: ProgressState = await res.json();
        setProgressData(data);

        if (data.progress === 100) {
          clearInterval(interval);
        }
      } catch (err) {
        console.error("[MeoGli] Progress poll error:", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }

    console.log("[MeoGli] API_URL:", API_URL);
    setError("");
    setIsGenerating(true);
    setVideoUrl("");
    setProgressData(DEFAULT_PROGRESS);

    try {
      console.log("[MeoGli] POST", `${API_URL}/generate`);
      const res = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, mode: "short" }),
      });

      console.log("[MeoGli] Response status:", res.status);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { detail?: string }).detail || `Server error: ${res.status}`);
      }

      const data = await res.json();
      console.log("[MeoGli] Response:", data);

      if (data.video) {
        setVideoUrl(`${API_URL}${data.video}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("[MeoGli] Generate failed:", message);
      setError(`Generation failed: ${message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleIdeaFlowComplete = (finalIdea: string) => {
    setPrompt(finalIdea);
    setShowIdeaFlow(false);
  };

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-white mb-3">MeoGli</h1>
          <p className="text-gray-400 text-lg">AI-powered video generation</p>
        </div>

        {/* Prompt Input */}
        <PromptInput
          prompt={prompt}
          onPromptChange={setPrompt}
          onGenerate={handleGenerate}
          onOpenIdeaFlow={() => setShowIdeaFlow(true)}
          isGenerating={isGenerating}
        />

        {/* Error */}
        {error && (
          <div className="glass rounded-xl p-4 border border-red-500/30 text-red-400">
            {error}
          </div>
        )}

        {/* Progress */}
        {isGenerating && progressData.steps.length > 0 && (
          <ProgressSection progress={progressData} />
        )}

        {/* Video */}
        {videoUrl && <VideoPreview videoUrl={videoUrl} />}

      </div>

      {/* IdeaFlow Modal */}
      {showIdeaFlow && (
        <IdeaFlow
          onComplete={handleIdeaFlowComplete}
          onClose={() => setShowIdeaFlow(false)}
        />
      )}
    </main>
  );
}
