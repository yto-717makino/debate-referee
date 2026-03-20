'use client';

import { useState, useEffect, useCallback } from 'react';

export type AudioSourceType = 'mic' | 'browser';

export interface AudioDevice {
  deviceId: string;
  label: string;
  type: AudioSourceType;
}

const BROWSER_AUDIO_DEVICE: AudioDevice = {
  deviceId: '__browser_audio__',
  label: '🖥️ ブラウザ音声（画面共有）',
  type: 'browser',
};

export function useAudioDevices() {
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [permissionGranted, setPermissionGranted] = useState(false);

  const requestPermissionAndEnumerate = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionGranted(true);

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs: AudioDevice[] = allDevices
        .filter(d => d.kind === 'audioinput')
        .map((d, i) => ({
          deviceId: d.deviceId,
          label: d.label || `マイク ${i + 1}`,
          type: 'mic' as AudioSourceType,
        }));

      // Add browser audio option
      const allOptions = [...audioInputs, BROWSER_AUDIO_DEVICE];

      setDevices(allOptions);
      if (allOptions.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(allOptions[0].deviceId);
      }
    } catch {
      console.error('マイクの権限が拒否されました');
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    requestPermissionAndEnumerate();

    const handleDeviceChange = () => {
      requestPermissionAndEnumerate();
    };
    navigator.mediaDevices?.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices?.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [requestPermissionAndEnumerate]);

  const selectDevice = useCallback((deviceId: string) => {
    setSelectedDeviceId(deviceId);
  }, []);

  const selectedDevice = devices.find(d => d.deviceId === selectedDeviceId);
  const isBrowserAudio = selectedDevice?.type === 'browser';

  return {
    devices,
    selectedDeviceId,
    selectDevice,
    permissionGranted,
    isBrowserAudio,
    requestPermissionAndEnumerate,
  };
}
