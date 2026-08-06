import React from 'react';

export type ToastMessage = {
  id: string;
  type: "success" | "error" | "info" | "warn";
  msg: string;
};

interface ToastsProps {
  list: ToastMessage[];
}

/**
 * Renders small temporary notifications (like success or error messages) at the bottom right.
 */
export default function Toasts({ list }: ToastsProps) {
  const colors = { success: "var(--a3)", error: "var(--danger)", info: "var(--a2)", warn: "var(--warn)" };
  return (
    <div className="tw2">
      {list.map(t => (
        <div key={t.id} className="toast">
          <span style={{ color: colors[t.type] || "var(--a3)", fontSize: 18 }}>
            {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}
          </span>
          <span style={{ fontSize: 13 }}>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
