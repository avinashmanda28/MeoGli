'use client';

interface ProgressState {
  progress: number;
  current_step: string;
  steps: Array<{ name: string; status: string }>;
}

interface ProgressSectionProps {
  progress: ProgressState;
}

export default function ProgressSection({ progress }: ProgressSectionProps) {
  return (
    <div className="glass rounded-2xl p-8 border border-blue-500/20">
      <h2 className="text-xl font-semibold text-blue-300 mb-6">Pipeline Progress</h2>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300 font-medium">{progress.current_step}</span>
          <span className="text-blue-400 font-semibold">{progress.progress}%</span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden border border-slate-600/30">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-400 h-full transition-all duration-500 rounded-full"
            style={{ width: `${progress.progress}%` }}
          />
        </div>
      </div>

      {/* Steps Status */}
      <div className="space-y-2">
        {progress.steps.map((step, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
              step.status === 'active'
                ? 'bg-blue-500/20 border-l-2 border-blue-400'
                : step.status === 'done'
                ? 'text-gray-400'
                : 'text-gray-500'
            }`}
          >
            <span className="text-lg">
              {step.status === 'done'
                ? '✓'
                : step.status === 'active'
                ? '◉'
                : '○'}
            </span>
            <span className={step.status === 'active' ? 'font-semibold' : ''}>
              {step.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
