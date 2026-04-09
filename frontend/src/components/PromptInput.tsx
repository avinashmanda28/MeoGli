'use client';

import { useState } from 'react';

interface PromptInputProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  onGenerate: () => void;
  onOpenIdeaFlow: () => void;
  isGenerating: boolean;
}

export default function PromptInput({
  prompt,
  onPromptChange,
  onGenerate,
  onOpenIdeaFlow,
  isGenerating,
}: PromptInputProps) {
  return (
    <div className="glass rounded-2xl p-8 border border-blue-500/20">
      <label className="block text-sm font-semibold text-blue-300 mb-3">
        Your Video Idea
      </label>

      <textarea
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        placeholder="Describe the video you want to create..."
        disabled={isGenerating}
        className="w-full bg-slate-800/50 border border-slate-600/30 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none h-24"
      />

      <div className="flex gap-3 mt-6">
        <button
          onClick={onGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating...
            </span>
          ) : (
            'Generate Video'
          )}
        </button>

        <button
          onClick={onOpenIdeaFlow}
          disabled={isGenerating}
          className="bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-gray-300 font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          💡 Need Ideas?
        </button>
      </div>
    </div>
  );
}
