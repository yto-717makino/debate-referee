import { JUDGE_SYSTEM_PROMPT, buildJudgeUserPrompt } from './prompts';
import type { DebateTranscripts, JudgmentResult, SideNames } from './types';

export async function judgeDebate(
  apiKey: string,
  topic: string,
  transcripts: DebateTranscripts,
  sideNames: SideNames
): Promise<JudgmentResult> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: JUDGE_SYSTEM_PROMPT },
        { role: 'user', content: buildJudgeUserPrompt(topic, transcripts, sideNames) },
      ],
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = data?.error?.message || `APIエラー (HTTP ${res.status})`;
    throw new Error(msg);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('AIからの応答が空でした');
  }

  return JSON.parse(content) as JudgmentResult;
}
