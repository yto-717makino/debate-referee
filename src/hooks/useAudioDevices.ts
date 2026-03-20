'use client';

import { useState, useEffect, useCallback } from 'react';

export interface AudioDevice {
  deviceId: string;
  label: string;
}

export function useAudioDevices() {
  const [devices, setDevices] = useState<AudioDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [permissionGranted, setPermissionGranted] = useState(false);

  const requestPermissionAndEnumerate = useCallback(async () => {
    try {
      // Request mic permission first to get device labels
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionGranted(true);

      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = allDevices
        .filter(d => d.kind === 'audioinput')
        .map((d, i) => ({
          deviceId: d.deviceId,
          label: d.label || `マイク ${i + 1}`,
        }));

      setDevices(audioInputs);
      if (audioInputs.length > 0 && !selectedDeviceId) {
        setSelectedDeviceId(audioInputs[0].deviceId);
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

  return {
    devices,
    selectedDeviceId,
    selectDevice,
    permissionGranted,
    requestPermissionAndEnumerate,
  };
}
