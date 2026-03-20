import { NextRequest, NextResponse } from 'next/server';
import openai from '@/lib/openai';
import { JUDGE_SYSTEM_PROMPT, buildJudgeUserPrompt } from '@/lib/prompts';
import type { JudgeRequest, JudgmentResult } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: JudgeRequest = await request.json();
    const { topic, affirmativeArgument, negativeArgument } = body;

    if (!topic || !affirmativeArgument || !negativeArgument) {
      return NextResponse.json(
        { error: '論題と両者の主張が必要です' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: JUDGE_SYSTEM_PROMPT },
        { role: 'user', content: buildJudgeUserPrompt(topic, affirmativeArgument, negativeArgument) },
      ],
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: 'AIからの応答が空でした' },
        { status: 500 }
      );
    }

    const result: JudgmentResult = JSON.parse(content);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Judge API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `判定中にエラーが発生しました: ${message}` },
      { status: 500 }
    );
  }
}
