export default function Loading() {
  return (
    <main className="page-loading" aria-busy="true" aria-live="polite">
      <div className="loading-content" role="status">
        <div className="loading-mark" aria-hidden="true">
          <span className="loading-orbit loading-orbit-one" />
          <span className="loading-orbit loading-orbit-two" />
          <span className="loading-node loading-node-one" />
          <span className="loading-node loading-node-two" />
          <img src="/masora_technologies_icon.png" alt="" />
        </div>
        <span className="loading-label">MASORA TECHNOLOGIES</span>
        <p>Préparation de votre expérience numérique</p>
        <div className="loading-track" aria-hidden="true"><span /></div>
      </div>
    </main>
  );
}
