import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart3, LockKeyhole, Sprout } from 'lucide-react';

export default function AuthLayout({ children, admin = false }) {
  return (
    <main className="auth-page">
      <section className="auth-story">
        <Link to="/" className="brand brand-light"><span className="brand-mark"><Sprout size={22} /></span><span>NutriTrack</span></Link>
        <div className="auth-story-copy">
          <span className="auth-kicker">{admin ? 'Secure administration' : 'A clearer view of your food'}</span>
          <h1>{admin ? 'Manage the system with confidence.' : 'Small records. Better understanding.'}</h1>
          <p>{admin ? 'Review platform activity and manage user access from one protected workspace.' : 'Log meals manually, see accurate totals, and look back at your nutrition patterns over time.'}</p>
          <div className="auth-proof"><span>{admin ? <LockKeyhole /> : <BarChart3 />}</span><div><strong>{admin ? 'Role-protected access' : 'Your data, clearly organized'}</strong><small>{admin ? 'Separate from normal user accounts' : 'Daily, weekly, and monthly views'}</small></div></div>
        </div>
        <p className="auth-disclaimer">NutriTrack supports personal record keeping and does not provide medical advice.</p>
      </section>
      <section className="auth-form-side">
        <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to home</Link>
        <div className="auth-form-card">{children}</div>
      </section>
    </main>
  );
}

