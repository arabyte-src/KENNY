import { GithubIcon, RobotIcon } from '../components/Icons';

const steps = [
  ['Find an ArUco Marker', 'Find the nearest registered KENNY marker inside the laboratory.'],
  ['Scan to Confirm Location', 'Scan the marker to identify your lab zone and exact X/Y coordinates.'],
  ['Request the Robot', 'Tap "Request KENNY" and the robot will navigate directly to your location.'],
  ['Dispose Your Trash', 'When KENNY arrives, toss your trash into it. Then show thumbs up gesture when you are done.'],
];

export default function Info() {
  return <main className="screen info-screen"><header className="page-heading"><h1><b>About KENNY</b></h1><p>How it works and what to know</p></header><section className="intro-card"><RobotIcon size={44} src="/Container.svg" /><div><h2><b>KENNY Robot</b></h2><p>An autonomous trash-collection robot. Scan, request, and dispose.</p></div></section><section className="how-section"><h2>HOW IT WORKS</h2><div className="how-list">{steps.map(([title, description], index) => <div className="how-row" key={title}><span className="how-number">{index + 1}</span><div><strong>{title}</strong><p>{description}</p></div></div>)}</div></section><section className="faq"><h2>Good to know</h2><p><b>Does KENNY use GPS?</b> No. ArUco markers provide registered X/Y coordinates inside the laboratory.</p><p><b>What can I dispose of?</b> General trash only. No liquids or hazardous materials.</p><p><b>Can KENNY leave the lab?</b> No. Its operating area is in NAS Laboratory only.</p></section><footer className="info-credit"><div className="info-credit-project"><div><strong>KENNY v1.1</strong><span>Autonomous waste collection robot</span></div></div><div className="info-credit-team"><span>BUILT BY</span><strong>TEAM EINSTEINIUM</strong></div><div className="info-credit-github"><div className="info-credit-github-heading"><GithubIcon /></div><span>OPEN SOURCE TEAM</span><p>@EruzaDev · @arabyte-src · @jasscs · @patrick1518</p></div></footer></main>;
}