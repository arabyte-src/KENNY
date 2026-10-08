import { useEffect, useState } from 'react';
import { createSimulatedNavigation, initialNavigation } from '../services/navigationService';

export function useRobotNavigation(target, active) {
  const [navigation, setNavigation] = useState(initialNavigation);

  useEffect(() => {
    if (!target || !active) {
      setNavigation(initialNavigation);
      return undefined;
    }
    const simulator = createSimulatedNavigation(target);
    setNavigation({ ...initialNavigation, targetPosition: target, status: 'locating' });
    const timer = window.setInterval(() => {
      setNavigation((current) => {
        const next = simulator.next();
        if (next.status === 'arrived') window.clearInterval(timer);
        return next;
      });
    }, 650);
    return () => window.clearInterval(timer);
  }, [target, active]);

  return navigation;
}