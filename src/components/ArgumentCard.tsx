'use client';

import type { Side } from '@/lib/types';
import SpeechRecorder from './SpeechRecorder';

interface ArgumentCardProps {
  side: Side;
  onFinish: (transcript: string) => void;
  deviceId?: string;
}

const sideConfig = {
  affirmative: {
    label: '肯定側',
    accent: 'bg-blue-600',
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    textColor: 'text-blue-700',
    icon: '👍',
  },
  negative: {
    label: '否定側',
    accent: 'bg-rose-600',
    border: 'border-rose-200',
    bg: 'bg-rose-50',
    textColor: 'text-rose-700',
    icon: '👎',
  },
};

export default function ArgumentCard({ side, onFinish, deviceId }: ArgumentCardProps) {
  const config = sideConfig[side];

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className={`bg-white rounded-2xl shadow-sm border ${config.border} overflow-hidden`}>
        <div className={`${config.bg} px-6 py-4`}>
          <h2 className={`text-lg font-bold ${config.textColor} flex items-center gap-2`}>
            <span>{config.icon}</span>
            {config.label}の主張
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            マイクに向かって主張を述べてください
          </p>
        </div>
        <div className="p-6">
          <SpeechRecorder
            onFinish={onFinish}
            deviceId={deviceId}
            accentColor={config.accent}
          />
        </div>
      </div>
    </div>
  );
}
