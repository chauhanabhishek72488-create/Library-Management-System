import React, { useState } from 'react';
import Icon from '../../components/ui/Icon';
import { User } from '../../types';

interface SettingsProps {
  user: User;
  dark: boolean;
  setDark: (d: boolean) => void;
  addToast: (type: string, msg: string) => void;
}

/**
 * Settings Component
 * Profile and preferences manager for both Users and Admins.
 * Allows toggling notifications and dark mode preference.
 */
export default function Settings({ user, dark, setDark, addToast }: SettingsProps) {
  const [notif, setNotif] = useState(true);
  const [emailD, setEmailD] = useState(true);

  return (
    <div style={{ maxWidth: 600 }}>
      <div className="sh"><div><div className="st">Settings</div><div className="ss">Preferences and account management</div></div></div>
      
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Profile</div>
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 20 }}>
          <div className="av" style={{ width: 64, height: 64, fontSize: 30, background: "linear-gradient(135deg,var(--accent),#9a7438)" }}>{user.avatar}</div>
          <div><div style={{ fontSize: 18, fontWeight: 600 }}>{user.name}</div><div style={{ color: "var(--muted)", fontSize: 13 }}>{user.email} · {user.role === "user" ? "Library Member" : "Administrator"}</div></div>
        </div>
        <button className="btn bs bsm">Edit Profile</button>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Preferences</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
          <div><div style={{ fontWeight: 600 }}>Dark Mode</div><div style={{ fontSize: 12, color: "var(--muted)" }}>Reduce eye strain</div></div>
          <button className={`ibtn ${dark ? "tact" : ""}`} style={{ background: dark ? "var(--accent)" : "var(--surface2)", color: dark ? "#000" : "#fff" }} onClick={() => setDark(!dark)}><Icon n={dark ? "moon" : "sun"} s={16} /></button>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
          <div><div style={{ fontWeight: 600 }}>Push Notifications</div><div style={{ fontSize: 12, color: "var(--muted)" }}>Alerts for due dates</div></div>
          <button className={`ibtn ${notif ? "tact" : ""}`} style={{ background: notif ? "var(--a3)" : "var(--surface2)", color: notif ? "#000" : "#fff" }} onClick={() => setNotif(!notif)}><Icon n={notif ? "bell" : "x"} s={16} /></button>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0" }}>
          <div><div style={{ fontWeight: 600 }}>Email Digests</div><div style={{ fontSize: 12, color: "var(--muted)" }}>Weekly reading summaries</div></div>
          <button className={`ibtn ${emailD ? "tact" : ""}`} style={{ background: emailD ? "var(--a2)" : "var(--surface2)", color: emailD ? "#000" : "#fff" }} onClick={() => setEmailD(!emailD)}><Icon n={emailD ? "mail" : "x"} s={16} /></button>
        </div>
      </div>

      <button className="btn bd" style={{ width: "100%" }} onClick={() => addToast("warning", "Password reset link sent to registered email.")}><Icon n="lock" s={14} /> Reset Password</button>
    </div>
  );
}

