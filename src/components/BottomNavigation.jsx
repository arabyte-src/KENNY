import { HomeIcon, InfoIcon } from './Icons';

export default function BottomNavigation({ active, onChange }) {
  return <nav className="bottom-nav" aria-label="Main navigation">
    <button className={active === 'home' ? 'active' : ''} onClick={() => onChange('home')}><HomeIcon /><span>Home</span></button>
    <button className={active === 'info' ? 'active' : ''} onClick={() => onChange('info')}><InfoIcon /><span>Info</span></button>
  </nav>;
}