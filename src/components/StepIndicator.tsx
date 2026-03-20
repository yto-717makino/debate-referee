'use client';

import type { DebateStage } from '@/lib/types';

interface StepIndicatorProps {
  stage: DebateStage;
}

const steps: { key: DebateStage; label: string }[] = [
  { key: 'topic', label: '論題' },
  { key: 'affirmative-argument', label: '肯定立論' },
  { key: 'negative-argument', label: '否定立論' },
  { key: 'cross-examination', label: '反対尋問' },
  { key: 'rebuttal', label: '反駁' },
  { key: 'closing-statement', label: '最終弁論' },
  { key: 'judging', label: '判定' },
  { key: 'result', label: '結果' },
];

export default function StepIndicator({ stage }: StepIndicatorProps) {
  const currentIndex = steps.findIndex(s => s.key === stage);

  return (
    <div className="flex items-center justify-center gap-0.5 sm:gap-1 overflow-x-auto">
      {steps.map((step, i) => {
        const isActive = i === currentIndex;
        const isCompleted = i < currentIndex;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center min-w-[40px]">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all ${
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
                className={`text-[10px] sm:text-xs mt-1 whitespace-nowrap ${
                  isActive ? 'text-blue-600 font-semibold' : 'text-zinc-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-3 sm:w-6 h-0.5 mx-0.5 ${
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
