export default function LoadingSpinner({ label = 'Loading…', fullPage = false }) {
  return (
    <div className={fullPage ? 'loader loader-page' : 'loader'} role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

