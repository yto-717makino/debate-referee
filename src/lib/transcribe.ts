export async function transcribeAudio(
  apiKey: string,
  audioBlob: Blob,
  options?: { prompt?: string },
): Promise<string> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'whisper-1');
  formData.append('language', 'ja');
  formData.append('temperature', '0');
  if (options?.prompt) {
    formData.append('prompt', options.prompt);
  }

  const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = data?.error?.message || `文字起こしエラー (HTTP ${res.status})`;
    throw new Error(msg);
  }

  const data = await res.json();
  return data.text || '';
}
