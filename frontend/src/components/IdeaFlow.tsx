'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '@/lib/api';

interface IdeaFlowProps {
  onComplete: (finalIdea: string) => void;
  onClose: () => void;
}

interface QuestionResponse {
  status: string;
  field?: string;
  question?: string;
  options?: string[];
  idea?: {
    title: string;
    topic: string;
  };
}

export default function IdeaFlow({ onComplete, onClose }: IdeaFlowProps) {
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState<QuestionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadNextQuestion = async (newResponses?: Record<string, string>) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/idea`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newResponses || responses),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data: QuestionResponse = await res.json();

      if (data.status === 'question') {
        setCurrentQuestion(data);
      } else if (data.status === 'complete' && data.idea) {
        onComplete(data.idea.title);
      }
    } catch (err) {
      console.error('[IdeaFlow] Failed to load question:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNextQuestion({});
  }, []);

  const handleSelectOption = async (option: string) => {
    if (!currentQuestion?.field) return;

    const newResponses = {
      ...responses,
      [currentQuestion.field]: option,
    };

    setResponses(newResponses);
    await loadNextQuestion(newResponses);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass rounded-2xl p-8 border border-blue-500/20 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-300">IdeaFlow</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <span className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : currentQuestion ? (
          <div className="space-y-4">
            <p className="text-gray-300 text-lg font-medium">
              {currentQuestion.question}
            </p>

            {currentQuestion.options ? (
              <div className="space-y-2">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSelectOption(option)}
                    className="w-full text-left bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-gray-200 py-3 px-4 rounded-lg transition-all duration-200"
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="text"
                placeholder="Type your answer..."
                className="w-full bg-slate-800/50 border border-slate-600/30 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value) {
                    handleSelectOption(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
            )}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-4">No question available.</p>
        )}
      </div>
    </div>
  );
}
