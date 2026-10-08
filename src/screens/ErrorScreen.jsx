import { CloseIcon, RobotIcon, ScanIcon } from '../components/Icons';

const errorContent = {
  invalid: {
    title: 'Invalid ArUco Marker',
    message: 'This marker is not registered in the laboratory. Scan one of the KENNY ArUco markers inside the lab.',
    action: 'Try Again',
    icon: ScanIcon,
  },
  unavailable: {
    title: 'Robot Unavailable',
    message: 'KENNY may be offline or have low battery right now.',
    action: 'Try Again Later',
    icon: RobotIcon,
  },
  busy: {
    title: 'Robot Busy',
    message: 'KENNY is completing another collection request.',
    action: 'Check Status',
    icon: RobotIcon,
  },
};

export default function ErrorScreen({ type = 'invalid', onAction, onClose }) {
  const error = errorContent[type];
  const Icon = error.icon;
  return <main className="screen error-screen"><button className="icon-button" onClick={onClose} aria-label="Close error"><CloseIcon /></button><div className="error-icon"><Icon /></div><span className="eyebrow">KENNY NEEDS YOUR ATTENTION</span><h1>{error.title}</h1><p>{error.message}</p><button className="primary-button" onClick={onAction}>{error.action}</button></main>;
}