'use client';

import type { AudioDevice } from '@/hooks/useAudioDevices';

interface MicSelectorProps {
  devices: AudioDevice[];
  selectedDeviceId: string;
  onSelect: (deviceId: string) => void;
  disabled?: boolean;
}

export default function MicSelector({ devices, selectedDeviceId, onSelect, disabled }: MicSelectorProps) {
  if (devices.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-zinc-500 whitespace-nowrap" htmlFor="mic-select">
        🎤 マイク:
      </label>
      <select
        id="mic-select"
        value={selectedDeviceId}
        onChange={e => onSelect(e.target.value)}
        disabled={disabled}
        className="text-sm border border-zinc-300 rounded-md px-2 py-1 bg-white text-zinc-700 disabled:opacity-50 min-w-0 flex-1"
      >
        {devices.map(d => (
          <option key={d.deviceId} value={d.deviceId}>
            {d.label}
          </option>
        ))}
      </select>
    </div>
  );
}
