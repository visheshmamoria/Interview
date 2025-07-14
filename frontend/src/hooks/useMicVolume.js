import { useEffect, useRef, useState } from "react";

// Custom hook to get mic volume (RMS amplitude, 0.0 to ~1.0)
export function useMicVolume(isActive) {
  const [volume, setVolume] = useState(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!isActive) {
      setVolume(0);
      return;
    }
    let isMounted = true;
    const setup = async () => {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current = audioContextRef.current.createMediaStreamSource(streamRef.current);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);

      const update = () => {
        analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
        let sum = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          const val = (dataArrayRef.current[i] - 128) / 128;
          sum += val * val;
        }
        if (isMounted) setVolume(Math.sqrt(sum / dataArrayRef.current.length));
        animationFrameRef.current = requestAnimationFrame(update);
      };
      update();
    };
    setup();

    return () => {
      isMounted = false;
      if (audioContextRef.current) audioContextRef.current.close();
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isActive]);

  return volume;
}
