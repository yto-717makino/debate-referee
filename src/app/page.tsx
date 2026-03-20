'use client';

import { useDebateFlow } from '@/hooks/useDebateFlow';
import { useAudioDevices } from '@/hooks/useAudioDevices';
import StepIndicator from '@/components/StepIndicator';
import TopicInput from '@/components/TopicInput';
import ArgumentCard from '@/components/ArgumentCard';
import MicSelector from '@/components/MicSelector';
import JudgmentResult from '@/components/JudgmentResult';

const SPEECH_STAGES = [
  'affirmative-argument',
  'negative-argument',
  'cross-examination',
  'rebuttal',
  'closing-statement',
] as const;

export default function Home() {
  const {
    stage,
    topic,
    judgment,
    error,
    submitTopic,
    submitAffirmativeArgument,
    submitNegativeArgument,
    submitCrossExamination,
    submitRebuttal,
    submitClosingStatement,
    reset,
  } = useDebateFlow();

  const { devices, selectedDeviceId, selectDevice, permissionGranted } = useAudioDevices();

  const stageHandlers: Record<string, (t: string) => void> = {
    'affirmative-argument': submitAffirmativeArgument,
    'negative-argument': submitNegativeArgument,
    'cross-examination': submitCrossExamination,
    'rebuttal': submitRebuttal,
    'closing-statement': submitClosingStatement,
  };

  const isSpeechStage = SPEECH_STAGES.includes(stage as typeof SPEECH_STAGES[number]);

  return (
    <main className="flex-1 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl font-bold text-zinc-800 text-center">
            ⚖️ ディベート・レフリー
          </h1>
          {topic && stage !== 'topic' && (
            <p className="text-sm text-zinc-500 text-center mt-1">
              論題: {topic}
            </p>
          )}
        </div>
      </header>

      {/* Step Indicator */}
      <div className="bg-white border-b border-zinc-200 px-4 py-3">
        <StepIndicator stage={stage} />
      </div>

      {/* Mic Selector */}
      {isSpeechStage && permissionGranted && (
        <div className="bg-white border-b border-zinc-200 px-4 py-2">
          <div className="max-w-2xl mx-auto">
            <MicSelector
              devices={devices}
              selectedDeviceId={selectedDeviceId}
              onSelect={selectDevice}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        {stage === 'topic' && (
          <TopicInput onSubmit={submitTopic} />
        )}

        {isSpeechStage && (
          <ArgumentCard
            stageType={stage}
            onFinish={stageHandlers[stage]}
            deviceId={selectedDeviceId}
          />
        )}

        {stage === 'judging' && (
          <div className="w-full max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200 p-12 text-center">
              <div className="animate-spin w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4" />
              <h2 className="text-lg font-bold text-zinc-800">AIが判定中...</h2>
              <p className="text-sm text-zinc-500 mt-2">
                全ステップの内容を分析しています。しばらくお待ちください。
              </p>
            </div>
          </div>
        )}

        {stage === 'result' && judgment && (
          <JudgmentResult result={judgment} onReset={reset} />
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm shadow-lg">
            {error}
          </div>
        </div>
      )}
    </main>
  );
}
