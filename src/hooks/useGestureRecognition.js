import { useEffect, useState } from 'react';
import { createSimulatedGestureDetector } from '../services/gestureService';

export function useGestureRecognition(active) {
  const [gesture, setGesture] = useState({ status: 'idle', gesture: null, confidence: null, isSimulated: true });

  useEffect(() => {
    if (!active) {
      setGesture({ status: 'idle', gesture: null, confidence: null, isSimulated: true });
      return undefined;
    }
    setGesture({ status: 'waiting', gesture: null, confidence: null, isSimulated: true });
    return createSimulatedGestureDetector((result) => setGesture({ status: 'detected', ...result }));
  }, [active]);

  return gesture;
}