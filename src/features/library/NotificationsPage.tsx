import React, { useState } from 'react';
import Icon from '../../components/ui/Icon';
import { Member, Transaction, Reservation } from '../../types';
import { NOTIFICATIONS_LOG } from '../../data/mockData';

interface NotificationsPageProps {
  members: Member[];
  txns: Transaction[];
  reservations: Reservation[];
  addToast: (type: string, msg: string) => void;
  logs: any[];
  setLogs: React.Dispatch<React.SetStateAction<any[]>>;
}

/**
 * NotificationsPage Component
 * An admin-facing dashboard logic module that lets staff send out bulk alerts
 * (e.g. Overdue Reminders, Hold Available, Fine Alerts) and logs system activity.
 */
export default function NotificationsPage({ members, txns, reservations, addToast, logs, setLogs }: NotificationsPageProps) {

  /** 
   * Simulates sending a bulk notification out to members. 
   * Pre-pends the action to the visual system log.
   */
  const snd = (type: string) => {
    addToast("success", `${type} notifications dispatched to relevant members.`);
    const nl = { id: "n" + Date.now(), title: `${type} Alert Sent`, time: "Just now", type: "system", read: false };
    setLogs([nl, ...logs]);
  };

  /** Helper to mark every item in the visual log as 'read' */
  const markR = () => { setLogs(logs.map(l => ({ ...l, read: true }))); };

  return (
    <div>
      <div className="sh">
        <div><div className="st">Notifications & Alerts</div><div className="ss">System alerts and member communications</div></div>
        <button className="btn bs bsm" onClick={markR}><Icon n="check" s={13} /> Mark All Read</button>
      </div>

      <div className="g g3">
        <div className="card sc" style={{ cursor: "pointer" }} onClick={() => snd("Overdue")}>
          <div className="slbl">Overdue Reminders</div><div className="sval" style={{ color: "var(--danger)", fontSize: 22 }}>4 pending</div>
          <div className="sico">⚠️</div><button className="btn bp bsm" style={{ marginTop: 10, width: "100%" }}>Send Now</button>
        </div>
        <div className="card sc" style={{ cursor: "pointer" }} onClick={() => snd("Reservation")}>
          <div className="slbl">Hold Available</div><div className="sval" style={{ color: "var(--accent)", fontSize: 22 }}>2 pending</div>
          <div className="sico">🔖</div><button className="btn bp bsm" style={{ marginTop: 10, width: "100%" }}>Send Now</button>
        </div>
        <div className="card sc" style={{ cursor: "pointer" }} onClick={() => snd("Fine")}>
          <div className="slbl">Fine Alerts</div><div className="sval" style={{ color: "var(--a2)", fontSize: 22 }}>1 pending</div>
          <div className="sico">💰</div><button className="btn bp bsm" style={{ marginTop: 10, width: "100%" }}>Send Now</button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 700, marginBottom: 16 }}>System Log</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {logs.map(l => (
            <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: l.read ? "rgba(255,255,255,.01)" : "rgba(69,201,160,.08)", borderLeft: `3px solid ${l.read ? "transparent" : "var(--a3)"}`, borderRadius: "0 8px 8px 0" }}>
              <div style={{ padding: 8, background: "rgba(255,255,255,.05)", borderRadius: 8, color: "var(--muted)" }}><Icon n={l.type === "warning" ? "alert" : l.type === "success" ? "check" : "sms"} s={16} /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{l.title}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>{l.time}</div>
              </div>
              {!l.read && <div style={{ width: 8, height: 8, borderRadius: 4, background: "var(--a3)" }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
