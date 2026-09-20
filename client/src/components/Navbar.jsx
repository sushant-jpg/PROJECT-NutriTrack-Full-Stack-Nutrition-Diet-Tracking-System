import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, Sprout, X } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="site-header">
      <nav className="site-nav container" aria-label="Primary navigation">
        <Link to="/" className="brand" onClick={close} aria-label="NutriTrack home">
          <span className="brand-mark"><Sprout size={22} /></span>
          <span>NutriTrack</span>
        </Link>
        <button className="nav-toggle" type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle navigation">
          {open ? <X /> : <Menu />}
        </button>
        <div className={`nav-links ${open ? 'is-open' : ''}`}>
          <NavLink to="/" onClick={close}>Home</NavLink>
          <a href="/#about" onClick={close}>About</a>
          <a href="/#features" onClick={close}>Features</a>
          <a href="/#how-it-works" onClick={close}>How it works</a>
          <Link to="/login" onClick={close}>Log in</Link>
          <Link to="/signup" className="button button-small" onClick={close}>Get started</Link>
        </div>
      </nav>
    </header>
  );
}

