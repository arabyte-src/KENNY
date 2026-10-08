const base = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

export function RobotIcon({ size = 24 }) { return <img className="robot-logo" src="/Container-1.svg" alt="KENNY robot logo" width={size} height={size} />; }
export function ScanIcon() { return <svg {...base}><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" /><path d="M8 8h8v8H8z" /></svg>; }
export function ArrowIcon() { return <svg {...base}><path d="M5 12h14M13 6l6 6-6 6" /></svg>; }
export function MoonIcon() { return <svg {...base}><path d="M20 15.2A8 8 0 0 1 8.8 4 8.5 8.5 0 1 0 20 15.2Z" /></svg>; }
export function SunIcon() { return <svg {...base}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>; }
export function HomeIcon() { return <svg {...base}><path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM9 21v-6h6v6" /></svg>; }
export function InfoIcon() { return <svg {...base}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>; }
export function CloseIcon() { return <svg {...base}><path d="m6 6 12 12M18 6 6 18" /></svg>; }
export function FlashIcon() { return <svg {...base}><path d="m13 2-9 12h7l-1 8 9-12h-7z" /></svg>; }
export function PinIcon() { return <svg {...base}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></svg>; }
export function CheckIcon() { return <svg {...base}><path d="m5 12 4 4L19 6" /></svg>; }