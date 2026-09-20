import { ArrowLeft, Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return <main className="not-found"><div className="brand"><span className="brand-mark"><Sprout /></span><span>NutriTrack</span></div><span className="not-found-code">404</span><h1>This page isn’t on the menu.</h1><p>The address may be incorrect, or the page may have moved.</p><Link to="/" className="button"><ArrowLeft size={17} /> Return home</Link></main>;
}

