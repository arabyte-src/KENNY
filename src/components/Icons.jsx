const base = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

export function RobotIcon({ size = 24, src = '/Container.svg' }) { return <img className="robot-logo" src={src} alt="KENNY robot logo" width={size} height={size} />; }
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
export function GithubIcon() { return <svg {...base} fill="currentColor" stroke="none"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.61-3.37-1.18-3.37-1.18-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 7.91c.85 0 1.71.12 2.51.36 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .26.18.57.69.47A10 10 0 0 0 12 2Z" /></svg>; }