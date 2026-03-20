'use client';

import type { DebateStage } from '@/lib/types';
import SpeechRecorder from './SpeechRecorder';

interface ArgumentCardProps {
  stageType: DebateStage;
  onFinish: (transcript: string) => void;
  deviceId?: string;
  isBrowserAudio?: boolean;
  apiKey?: string;
}

const stageConfig: Record<string, {
  label: string;
  description: string;
  accent: string;
  border: string;
  bg: string;
  textColor: string;
  icon: string;
}> = {
  'affirmative-argument': {
    label: '肯定側の立論',
    description: '肯定側がマイクに向かって立論を述べてください',
    accent: 'bg-blue-600',
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    textColor: 'text-blue-700',
    icon: '📢',
  },
  'negative-argument': {
    label: '否定側の立論',
    description: '否定側がマイクに向かって立論を述べてください',
    accent: 'bg-rose-600',
    border: 'border-rose-200',
    bg: 'bg-rose-50',
    textColor: 'text-rose-700',
    icon: '📢',
  },
  'cross-examination': {
    label: '反対尋問',
    description: '相手の立論に対して質問・尋問を行ってください',
    accent: 'bg-amber-600',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    textColor: 'text-amber-700',
    icon: '❓',
  },
  'rebuttal': {
    label: '反駁',
    description: '相手の主張に対する反論を述べてください',
    accent: 'bg-purple-600',
    border: 'border-purple-200',
    bg: 'bg-purple-50',
    textColor: 'text-purple-700',
    icon: '⚔️',
  },
  'closing-statement': {
    label: '最終弁論',
    description: '最終的なまとめと主張を述べてください',
    accent: 'bg-emerald-600',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    icon: '🏁',
  },
};

export default function ArgumentCard({ stageType, onFinish, deviceId, isBrowserAudio, apiKey }: ArgumentCardProps) {
  const config = stageConfig[stageType];
  if (!config) return null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className={`bg-white rounded-2xl shadow-sm border ${config.border} overflow-hidden`}>
        <div className={`${config.bg} px-6 py-4`}>
          <h2 className={`text-lg font-bold ${config.textColor} flex items-center gap-2`}>
            <span>{config.icon}</span>
            {config.label}
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            {config.description}
          </p>
        </div>
        <div className="p-6">
          <SpeechRecorder
            onFinish={onFinish}
            deviceId={deviceId}
            accentColor={config.accent}
            isBrowserAudio={isBrowserAudio}
            apiKey={apiKey}
          />
        </div>
      </div>
    </div>
  );
}
