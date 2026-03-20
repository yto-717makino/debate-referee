'use client';

import type { DebateStage, SideNames } from '@/lib/types';
import SpeechRecorder from './SpeechRecorder';

interface ArgumentCardProps {
  stageType: DebateStage;
  sideNames: SideNames;
  onFinish: (transcript: string) => void;
  deviceId?: string;
  isBrowserAudio?: boolean;
  apiKey?: string;
}

function getStageConfig(sideNames: SideNames): Record<string, {
  label: string;
  description: string;
  accent: string;
  border: string;
  bg: string;
  textColor: string;
  icon: string;
}> {
  return {
    'affirmative-argument': {
      label: `${sideNames.affirmative}の立論`,
      description: `${sideNames.affirmative}がマイクに向かって立論を述べてください`,
      accent: 'bg-blue-600',
      border: 'border-blue-200',
      bg: 'bg-blue-50',
      textColor: 'text-blue-700',
      icon: '📢',
    },
    'negative-argument': {
      label: `${sideNames.negative}の立論`,
      description: `${sideNames.negative}がマイクに向かって立論を述べてください`,
      accent: 'bg-rose-600',
      border: 'border-rose-200',
      bg: 'bg-rose-50',
      textColor: 'text-rose-700',
      icon: '📢',
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
}

export default function ArgumentCard({ stageType, sideNames, onFinish, deviceId, isBrowserAudio, apiKey }: ArgumentCardProps) {
  const config = getStageConfig(sideNames)[stageType];
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
