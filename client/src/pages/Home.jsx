import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Check, ChevronRight, ClipboardList, LockKeyhole, PieChart, Salad, ShieldCheck, Sparkles, UtensilsCrossed } from 'lucide-react';
import Navbar from '../components/Navbar';

const features = [
  { icon: ClipboardList, title: 'Log your meals', text: 'Record foods, portions, meal types, and their complete nutrition information.' },
  { icon: PieChart, title: 'Automatic totals', text: 'See calories, protein, carbohydrates, and fat add up as you log your day.' },
  { icon: BarChart3, title: 'Reports that make sense', text: 'Understand your records through daily, weekly, and monthly views.' },
  { icon: LockKeyhole, title: 'Private user accounts', text: 'Your meals belong to your account and remain separate from every other user.' }
];

export default function Home() {
  return (
    <div className="landing-page">
      <Navbar />
      <main>
        <section className="hero container">
          <div className="hero-copy">
            <span className="hero-kicker"><Sparkles size={15} /> Simple nutrition awareness</span>
            <h1>Track what you eat.<br /><em>Understand what it gives you.</em></h1>
            <p>NutriTrack turns everyday meal records into a calm, useful view of your calories and nutrients—without guesswork or medical claims.</p>
            <div className="hero-actions"><Link className="button button-large" to="/signup">Start tracking <ArrowRight size={18} /></Link><a className="button button-secondary button-large" href="#about">Learn more</a></div>
            <div className="hero-trust"><span><Check size={15} /> Manual and transparent</span><span><ShieldCheck size={15} /> Private by design</span></div>
          </div>
          <div className="hero-visual" aria-label="Preview of the NutriTrack dashboard">
            <div className="preview-orbit orbit-one" /><div className="preview-orbit orbit-two" />
            <div className="dashboard-preview">
              <div className="preview-top"><div><span>Today’s nutrition</span><strong>Good afternoon, Mira</strong></div><span className="preview-avatar">M</span></div>
              <div className="preview-calories"><div className="calorie-ring"><div><strong>1,450</strong><span>of 2,000 kcal</span></div></div><div><span className="preview-label">Calories</span><strong>550 kcal left</strong><p>Keep logging to complete your day.</p></div></div>
              <div className="preview-bars">
                <div><span><b>Protein</b><small>70 / 90 g</small></span><i><u style={{ width: '78%' }} /></i></div>
                <div><span><b>Carbs</b><small>180 / 250 g</small></span><i><u style={{ width: '72%' }} /></i></div>
                <div><span><b>Fat</b><small>45 / 65 g</small></span><i><u style={{ width: '69%' }} /></i></div>
              </div>
              <div className="preview-meal"><span><Salad /></span><div><strong>Chicken rice bowl</strong><small>Lunch · 650 kcal</small></div><b>35g <small>protein</small></b></div>
            </div>
            <div className="floating-card floating-week"><BarChart3 /><div><strong>7 day view</strong><small>Patterns, not pressure</small></div></div>
            <div className="floating-card floating-private"><ShieldCheck /><div><strong>Private</strong><small>Your meals, your account</small></div></div>
          </div>
        </section>

        <section className="intro-section" id="about"><div className="container intro-grid"><div><span className="section-kicker">What is NutriTrack?</span><h2>A food diary that gives the numbers context.</h2></div><div><p>NutriTrack is a manual nutrition tracking application. You record what you ate and the nutrition values for that full portion; NutriTrack keeps the history and does the arithmetic.</p><p>It is built for awareness and consistency—not diagnosis, judgement, or automatic food recognition.</p></div></div></section>

        <section className="feature-section container" id="features">
          <div className="section-heading"><span className="section-kicker">Everything in one place</span><h2>Useful tools, without the noise.</h2><p>From your first breakfast entry to a full month of records, every view stays clear and practical.</p></div>
          <div className="feature-grid">{features.map(({ icon: Icon, title, text }, index) => <article className="feature-card" key={title}><span className="feature-number">0{index + 1}</span><div className="feature-icon"><Icon /></div><h3>{title}</h3><p>{text}</p></article>)}</div>
        </section>

        <section className="how-section" id="how-it-works"><div className="container"><div className="section-heading section-heading-light"><span className="section-kicker">How it works</span><h2>Three steps to a clearer record.</h2></div><div className="steps-grid">
          <article><span>01</span><div><h3>Create your account</h3><p>Set up a private profile with starter nutrition goals.</p></div><ChevronRight /></article>
          <article><span>02</span><div><h3>Log your food</h3><p>Enter the meal and the nutrition for the complete portion.</p></div><ChevronRight /></article>
          <article><span>03</span><div><h3>Check your reports</h3><p>Review totals and patterns across days, weeks, and months.</p></div></article>
        </div></div></section>

        <section className="cta-section container"><div className="cta-card"><div><span className="section-kicker">Ready when you are</span><h2>Build a food record you can actually understand.</h2><p>Start with your next meal. NutriTrack will keep the rest organized.</p></div><Link to="/signup" className="button button-light button-large">Create free account <ArrowRight size={18} /></Link><UtensilsCrossed className="cta-decoration" /></div></section>
      </main>
      <footer className="site-footer"><div className="container"><div className="brand brand-light"><span className="brand-mark">N</span><span>NutriTrack</span></div><p>Personal nutrition record keeping, made clearer.</p><div><Link to="/login">User login</Link><Link to="/admin/login">Admin</Link></div></div></footer>
    </div>
  );
}

