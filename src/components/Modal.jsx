export default function Modal({ onClose, children }) {
  return (
    <div className="auth-modal" onClick={onClose}>
      <div className="auth-card" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose}>
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
