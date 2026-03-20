'use client';

import type { DebateStage } from '@/lib/types';

interface StepIndicatorProps {
  stage: DebateStage;
}

const steps: { key: DebateStage; label: string }[] = [
  { key: 'topic', label: '論題' },
  { key: 'affirmative', label: '肯定側' },
  { key: 'negative', label: '否定側' },
  { key: 'judging', label: '判定中' },
  { key: 'result', label: '結果' },
];

export default function StepIndicator({ stage }: StepIndicatorProps) {
  const currentIndex = steps.findIndex(s => s.key === stage);

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2">
      {steps.map((step, i) => {
        const isActive = i === currentIndex;
        const isCompleted = i < currentIndex;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white scale-110'
                    : isCompleted
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-zinc-100 text-zinc-400'
                }`}
              >
                {isCompleted ? '✓' : i + 1}
              </div>
              <span
                className={`text-xs mt-1 ${
                  isActive ? 'text-blue-600 font-semibold' : 'text-zinc-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-6 sm:w-10 h-0.5 mx-1 ${
                  isCompleted ? 'bg-blue-300' : 'bg-zinc-200'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
