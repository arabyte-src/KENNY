export function createSimulatedGestureDetector(onDetected) {
  const timer = window.setTimeout(() => onDetected({ gesture: 'thumbs_up', confidence: 0.97, isSimulated: true }), 2800);
  return () => window.clearTimeout(timer);
}