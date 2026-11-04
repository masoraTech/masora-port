"use client";
export default function ConfirmButton({ message, label, children }: { message: string; label: string; children: React.ReactNode }) {
  return (
    <button className="ic" aria-label={label} onClick={(e) => { if (!confirm(message)) e.preventDefault(); }}>
      {children}
    </button>
  );
}
