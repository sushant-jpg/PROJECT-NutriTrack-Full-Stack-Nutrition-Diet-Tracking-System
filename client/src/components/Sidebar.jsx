import { LogOut, Menu, Sprout, X } from 'lucide-react';

export default function Sidebar({ items, active, onSelect, onLogout, open, onToggle, label = 'Dashboard navigation' }) {
  return (
    <>
      <button className="mobile-menu-button" type="button" onClick={onToggle} aria-label="Open dashboard menu"><Menu /></button>
      {open && <button type="button" className="sidebar-backdrop" onClick={onToggle} aria-label="Close dashboard menu" />}
      <aside className={`dashboard-sidebar ${open ? 'is-open' : ''}`}>
        <div className="sidebar-top">
          <div className="brand brand-light"><span className="brand-mark"><Sprout size={22} /></span><span>NutriTrack</span></div>
          <button type="button" className="sidebar-close" onClick={onToggle} aria-label="Close dashboard menu"><X /></button>
        </div>
        <nav className="sidebar-nav" aria-label={label}>
          {items.map(({ id, label: itemLabel, icon: Icon }) => (
            <button key={id} type="button" className={active === id ? 'active' : ''} onClick={() => { onSelect(id); if (open) onToggle(); }}>
              <Icon size={19} /><span>{itemLabel}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <p>Track consistently.<br />Understand clearly.</p>
          <button type="button" className="sidebar-logout" onClick={onLogout}><LogOut size={18} /> Log out</button>
        </div>
      </aside>
    </>
  );
}

