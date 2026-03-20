import type { ChatMessage, DebateTranscripts, SideNames } from './types';

export const JUDGE_SYSTEM_PROMPT = `あなたは公平で経験豊富なディベートの審判です。
提示されたディベートの全ステップ（立論、反対尋問、反駁、最終弁論）を総合的に分析し、勝敗を判定してください。

以下の5つの基準でそれぞれ1〜10点で採点してください：
1. 論理性 - 主張の論理的な一貫性と妥当性
2. 根拠・具体例 - 主張を裏付ける証拠や具体例の質と量
3. 説得力 - 聞き手を納得させる力
4. 反論対応力 - 反対尋問・反駁での相手への対応力
5. 構成・表現力 - 立論から最終弁論までの構成の明確さと表現の適切さ

判定は厳密かつ公平に行い、必ず以下のJSON形式で回答してください。日本語で回答してください。

{
  "winner": "affirmative" | "negative" | "draw",
  "summary": "判定結果の要約（1〜2文）",
  "criteria": [
    {
      "criterion": "基準名",
      "affirmativeScore": 1-10,
      "negativeScore": 1-10,
      "comment": "この基準に関する講評"
    }
  ],
  "affirmativeSummary": "肯定側の全体的な評価",
  "negativeSummary": "否定側の全体的な評価",
  "overallReasoning": "総合的な判定理由の詳細説明"
}`;

function formatChatMessages(messages: ChatMessage[], sideNames: SideNames): string {
  if (messages.length === 0) return '（発言なし）';
  return messages
    .map(m => `[${m.side === 'affirmative' ? sideNames.affirmative : sideNames.negative}] ${m.text}`)
    .join('\n');
}

export function buildJudgeUserPrompt(topic: string, transcripts: DebateTranscripts, sideNames: SideNames): string {
  return `【論題】
${topic}

※ このディベートでは「${sideNames.affirmative}」(affirmative) と「${sideNames.negative}」(negative) が対戦しています。

【ステップ1: ${sideNames.affirmative}の立論】
${transcripts.affirmativeArgument}

【ステップ2: ${sideNames.negative}の立論】
${transcripts.negativeArgument}

【ステップ3: 反対尋問】
${formatChatMessages(transcripts.crossExamination, sideNames)}

【ステップ4: 反駁】
${formatChatMessages(transcripts.rebuttal, sideNames)}

【ステップ5: 最終弁論】
${transcripts.closingStatement || '（発言なし）'}

上記のディベートの全ステップを総合的に評価し、審判してください。`;
}
