'use client';

import { useState, useCallback, useRef } from 'react';
import type { ChatMessage, DebateStage, DebateTranscripts, JudgmentResult } from '@/lib/types';
import { judgeDebate } from '@/lib/judge';

const INITIAL_TRANSCRIPTS: DebateTranscripts = {
  affirmativeArgument: '',
  negativeArgument: '',
  crossExamination: [],
  rebuttal: [],
  closingStatement: '',
};

export function useDebateFlow() {
  const [stage, setStage] = useState<DebateStage>('topic');
  const [topic, setTopic] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [transcripts, setTranscripts] = useState<DebateTranscripts>(INITIAL_TRANSCRIPTS);
  const [judgment, setJudgment] = useState<JudgmentResult | null>(null);
  const [isJudging, setIsJudging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const transcriptsRef = useRef(INITIAL_TRANSCRIPTS);

  const submitTopic = useCallback((t: string, key: string) => {
    setTopic(t);
    setApiKey(key);
    setStage('affirmative-argument');
  }, []);

  const updateTranscripts = useCallback(<K extends keyof DebateTranscripts>(key: K, value: DebateTranscripts[K], nextStage: DebateStage) => {
    const updated = { ...transcriptsRef.current, [key]: value };
    transcriptsRef.current = updated;
    setTranscripts(updated);
    setStage(nextStage);
  }, []);

  const submitAffirmativeArgument = useCallback((transcript: string) => {
    updateTranscripts('affirmativeArgument', transcript, 'negative-argument');
  }, [updateTranscripts]);

  const submitNegativeArgument = useCallback((transcript: string) => {
    updateTranscripts('negativeArgument', transcript, 'cross-examination');
  }, [updateTranscripts]);

  const submitCrossExamination = useCallback((messages: ChatMessage[]) => {
    updateTranscripts('crossExamination', messages, 'rebuttal');
  }, [updateTranscripts]);

  const submitRebuttal = useCallback((messages: ChatMessage[]) => {
    updateTranscripts('rebuttal', messages, 'closing-statement');
  }, [updateTranscripts]);

  const submitClosingStatement = useCallback(async (transcript: string) => {
    const updated = { ...transcriptsRef.current, closingStatement: transcript };
    transcriptsRef.current = updated;
    setTranscripts(updated);
    setStage('judging');
    setIsJudging(true);
    setError(null);

    try {
      const result = await judgeDebate(apiKey, topic, updated);
      setJudgment(result);
      setStage('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : '判定中にエラーが発生しました');
      setStage('closing-statement');
    } finally {
      setIsJudging(false);
    }
  }, [topic, apiKey]);

  const reset = useCallback(() => {
    setStage('topic');
    setTopic('');
    setApiKey('');
    setTranscripts(INITIAL_TRANSCRIPTS);
    transcriptsRef.current = INITIAL_TRANSCRIPTS;
    setJudgment(null);
    setError(null);
    setIsJudging(false);
  }, []);

  return {
    stage,
    topic,
    apiKey,
    transcripts,
    judgment,
    isJudging,
    error,
    submitTopic,
    submitAffirmativeArgument,
    submitNegativeArgument,
    submitCrossExamination,
    submitRebuttal,
    submitClosingStatement,
    reset,
  };
}
